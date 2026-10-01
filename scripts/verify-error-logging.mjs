#!/usr/bin/env node
/**
 * Proves the contact route's failure log cannot carry visitor content.
 *
 * The bug this guards: the catch block in route.js wraps the entire handler, and it
 * used to call console.error('Error sending email:', error). Whatever nodemailer or
 * Gmail's reply put in that object went into the platform's retained function logs,
 * inside a scope holding the visitor's name, address, subject and message. That is a
 * leak nobody could bound, and /privacy says nothing you type is stored on this site.
 *
 * Two things make this test worth trusting:
 *  - a positive control. It asserts util.inspect() of the fabricated error DOES contain
 *    the canaries, so the old code demonstrably leaked and the new assertions are not
 *    passing because the fixtures were toothless.
 *  - it checks the call site as well as the helper, so reverting to logging the raw
 *    object fails even though describeSendFailure() itself would still pass.
 *
 * Run: node scripts/verify-error-logging.mjs   (no server needed)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspect } from 'node:util';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// contact-diagnostics.js is ESM source in a CommonJS package. Copy the whole src/lib
// into the temp directory and declare it ESM there, so relative imports inside it
// resolve and adding one later does not break this harness.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'contact-diag-'));
fs.cpSync(path.join(REPO, 'src/lib'), tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ type: 'module' }));
const { describeSendFailure, describeRequestFailure, describeHttpResponse, boundedToken, boundedList } =
  await import(pathToFileURL(path.join(tmp, 'contact-diagnostics.js')).href);

const CANARY = {
  name: 'Zoltan Peczely',
  email: 'canary-visitor@example.test',
  subject: 'CANARY-SUBJECT-9e1f',
  message: 'CANARY-BODY-4a7c forward my credentials',
  secret: 'CANARY-SMTP-PASSWORD-77',
  // The command field is normalised to upper case before the shape test runs, so a
  // mixed-case canary there would be mutated out of existence and a leak would pass
  // unnoticed. This one survives upper-casing unchanged.
  command: 'CANARY-COMMAND-LEAK-7Z',
};
const CANARIES = Object.values(CANARY);

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

function smtpRejectionError() {
  // The worst realistic case: Gmail quoting an address in free-text reply, a server
  // reply attached, plus enumerable baggage from the transport.
  const error = new Error(`550 5.1.1 ${CANARY.email}: Recipient address rejected. ${CANARY.message}`);
  error.response = `550-5.7.1 ${CANARY.subject} flagged as spam`;
  error.responseCode = 550;
  error.command = 'RCPT';
  error.data = { to: CANARY.email, from: CANARY.secret };
  error.user = CANARY.secret;
  return error;
}

const leakFree = (value) => {
  const rendered = `${inspect(value, { depth: 6 })}\n${JSON.stringify(value)}`;
  return CANARIES.filter((c) => rendered.includes(c));
};

// ---------------------------------------------------------- positive control
const raw = smtpRejectionError();
const leaked = CANARIES.filter((c) => inspect(raw, { depth: 6 }).includes(c));
check('CONTROL: the fabricated error really does carry visitor content', leaked.length >= 3,
  `inspect(error) exposes ${leaked.length} of ${CANARIES.length} canaries`);
check('CONTROL: old-style logging would have written it to the platform log',
  inspect({ label: 'Error sending email:', error: raw }).includes(CANARY.email),
  'simulated console.error("...", error) output');

// ------------------------------------------------------------- the new shape
const summary = describeSendFailure(raw);
check('the summary carries none of the canaries', leakFree(summary).length === 0,
  leakFree(summary).join(', ') || inspect(summary));
check('a 550 rejection still reports what a human needs',
  summary.reason === 'rejected' && summary.smtpCode === 550 && summary.command === 'RCPT' && summary.sawServerReply === true,
  inspect(summary));
check('the reply text itself is not among the returned keys',
  !('response' in summary) && !('message' in summary) && !('stack' in summary) && !('data' in summary) && !('user' in summary),
  Object.keys(summary).join(', '));
check('return shape is exactly the five documented fields',
  JSON.stringify(Object.keys(summary).sort()) === JSON.stringify(['command', 'nodeCode', 'reason', 'sawServerReply', 'smtpCode']),
  Object.keys(summary).join(', '));

// ------------------------------------------------------------ classification
const classifyCases = [
  ['EAUTH is reported as auth', { code: 'EAUTH' }, 'auth'],
  ['535 is reported as auth', { responseCode: 535 }, 'auth'],
  ['ETIMEDOUT is reported as network', { code: 'ETIMEDOUT' }, 'network'],
  ['ECONNRESET is reported as network', { code: 'ECONNRESET' }, 'network'],
  ['EPROTO is reported as tls', { code: 'EPROTO' }, 'tls'],
  ['a plain TypeError is reported as unknown', new TypeError('x is not a function'), 'unknown'],
  ['an unclassified SMTP code is reported as rejected', { responseCode: 554 }, 'rejected'],
];
for (const [label, value, want] of classifyCases) {
  const got = describeSendFailure(value);
  check(label, got.reason === want, `reason ${got.reason} != ${want} (${inspect(got)})`);
}

// ------------------------------------------- bounded, non-truncating coercion
// Payload is upper case so the shape test would let it through: only the length guard
// stands between a 5KB echoed value and the log.
const huge = { code: `${'A'.repeat(5000)}${CANARY.command}` };
check('an over-long code is dropped rather than truncated', describeSendFailure(huge).nodeCode === null,
  inspect(describeSendFailure(huge)));
check('a code holding an address fails the shape test and is dropped',
  describeSendFailure({ code: `EAUTH <${CANARY.email}>` }).nodeCode === null, 'leaked via nodeCode');
const commandLeak = describeSendFailure({ command: `DATA ${CANARY.command}` });
check('a command holding visitor content is dropped, even after upper-casing',
  commandLeak.command === null && leakFree(commandLeak).length === 0, inspect(commandLeak));
check('a lowercase code is dropped rather than guessed at', describeSendFailure({ code: 'eauth' }).nodeCode === null,
  inspect(describeSendFailure({ code: 'eauth' })));
check('a legitimate multi-word SMTP verb survives', describeSendFailure({ command: 'mail from' }).command === 'MAIL FROM',
  inspect(describeSendFailure({ command: 'mail from' })));
check('a numeric-string response code is accepted', describeSendFailure({ responseCode: '552' }).smtpCode === 552,
  inspect(describeSendFailure({ responseCode: '552' })));
check('a non-numeric response code is refused', describeSendFailure({ responseCode: '550 bad' }).smtpCode === null,
  inspect(describeSendFailure({ responseCode: '550 bad' })));
for (const [value, label] of [[200, 'success code'], [600, 'out-of-range high'], [-1, 'negative'], [true, 'boolean'], [null, 'null']]) {
  check(`${label} is refused as an smtpCode`, describeSendFailure({ responseCode: value }).smtpCode === null,
    inspect(describeSendFailure({ responseCode: value })));
}
check('sawServerReply is false for whitespace-only reply text',
  describeSendFailure({ response: '   ' }).sawServerReply === false, 'reported a reply that was not there');

// ------------------------------------------------------------- hostile inputs
const hostile = [
  ['null', null],
  ['undefined', undefined],
  ['a string', 'boom'],
  ['a number', 42],
  ['an array', [CANARY.message]],
  ['a bare object', {}],
  ['an error with canary-only fields', Object.assign(new Error(CANARY.message), { note: CANARY.secret })],
];
for (const [label, value] of hostile) {
  let got = null;
  let threw = null;
  try {
    got = describeSendFailure(value);
  } catch (error) {
    threw = error;
  }
  check(`never throws and never echoes: ${label}`,
    !threw && got && leakFree(got).length === 0 && typeof got.reason === 'string',
    threw ? `threw ${threw.message}` : inspect(got));
}

const evil = {
  get code() { throw new Error(CANARY.message); },
  get responseCode() { throw new Error(CANARY.secret); },
  get command() { throw new Error(CANARY.email); },
  get response() { throw new Error(CANARY.subject); },
};
let evilSummary = null;
let evilThrew = null;
try {
  evilSummary = describeSendFailure(evil);
} catch (error) {
  evilThrew = error;
}
check('an object whose getters all throw is handled', !evilThrew && evilSummary.reason === 'unknown',
  evilThrew ? `threw: ${evilThrew.message}` : inspect(evilSummary));

// ------------------------------------------- the Turnstile-side summarisers
for (const [label, input, want] of [
  ['a documented error code survives', 'invalid-input-response', 'invalid-input-response'],
  ['an action name survives', 'contact_submit', 'contact_submit'],
  ['an email address is refused', 'someone@example.test', null],
  ['markup is refused', '<script>alert(1)</script>', null],
  ['a URL is refused', 'https://example.test/a?b=c', null],
  ['prose is refused', 'rejected for spam reasons', null],
  ['whitespace is refused', '   ', null],
  ['a 400-character value is refused', 'a'.repeat(400), null],
  ['a number is refused', 42, null],
  ['undefined is refused', undefined, null],
]) {
  check(`boundedToken: ${label}`, boundedToken(input) === want, `got ${inspect(boundedToken(input))}`);
}

check('boundedList: a list holding an address yields nothing',
  boundedList(['invalid-input-response', 'spam@visitor.example.test']).join() === 'invalid-input-response',
  inspect(boundedList(['invalid-input-response', 'spam@visitor.example.test'])));
check('boundedList: length is capped', boundedList(Array.from({ length: 200 }, (_, i) => `code-${i}`).concat([CANARY.email])).length <= 8,
  `got ${boundedList(Array.from({ length: 200 }, (_, i) => `code-${i}`)).length}`);
for (const [label, value] of [['null', null], ['a string', 'boom'], ['an object', {}], ['undefined', undefined]]) {
  check(`boundedList: non-array ${label} becomes empty rather than throwing`,
    Array.isArray(boundedList(value)) && boundedList(value).length === 0, inspect(boundedList(value)));
}

const wrapped = Object.assign(new TypeError('fetch failed'), {
  cause: Object.assign(new Error(`connect ECONNREFUSED ${CANARY.email}`), { code: 'ECONNREFUSED' }),
});
const requestSummary = describeRequestFailure(wrapped);
check('CONTROL: a real fetch failure does carry the address in its cause',
  inspect(wrapped).includes(CANARY.email), 'fixture is too weak to prove anything');
check('describeRequestFailure lifts the code without the message',
  requestSummary.nodeCode === 'ECONNREFUSED' && requestSummary.reason === 'network' && leakFree(requestSummary).length === 0,
  inspect(requestSummary));
check('describeRequestFailure classifies a TLS failure',
  describeRequestFailure({ cause: { code: 'CERT_HAS_EXPIRED' } }).reason === 'tls',
  inspect(describeRequestFailure({ cause: { code: 'CERT_HAS_EXPIRED' } })));
for (const [label, value] of [['null', null], ['a string', 'nope'], ['an empty object', {}], ['a number', 7]]) {
  let got = null;
  let threw = null;
  try { got = describeRequestFailure(value); } catch (error) { threw = error; }
  check(`describeRequestFailure is safe on ${label}`,
    !threw && got.reason === 'unknown' && got.nodeCode === null, threw ? `threw ${threw.message}` : inspect(got));
}
const evilCause = { get cause() { throw new Error(CANARY.message); } };
let causeThrew = null;
let causeSummary = null;
try { causeSummary = describeRequestFailure(evilCause); } catch (error) { causeThrew = error; }
check('a throwing cause getter is handled', !causeThrew && causeSummary.nodeCode === null,
  causeThrew ? `threw ${causeThrew.message}` : inspect(causeSummary));

check('describeHttpResponse lifts an integer status', describeHttpResponse({ status: 502 }).status === 502,
  inspect(describeHttpResponse({ status: 502 })));
for (const [label, value] of [
  ['a string status', { status: '502' }],
  ['an out-of-range high status', { status: 999 }],
  ['an out-of-range low status', { status: 99 }],
  ['a response with no status', {}],
  ['an undefined response', undefined],
  ['a null response', null],
]) {
  check(`describeHttpResponse refuses ${label}`, describeHttpResponse(value).status === null,
    inspect(describeHttpResponse(value)));
}
check('describeHttpResponse survives a throwing status getter',
  describeHttpResponse({ get status() { throw new Error(CANARY.message); } }).status === null, 'leaked or threw');

// ----------------------------------------------------------- the call sites
const route = fs.readFileSync(path.join(REPO, 'src/app/api/contact/route.js'), 'utf8');
const turnstile = fs.readFileSync(path.join(REPO, 'src/lib/turnstile.js'), 'utf8');
const catchBlock = route.match(/catch \(error\) \{[\s\S]*?\n {2}\}/)?.[0] ?? '';
check('the contact route catch block was located', catchBlock.length > 0, 'regex found no catch(error) block');
check('the call site logs the bounded summary, not the error', catchBlock.includes('describeSendFailure(error)'),
  catchBlock.split('\n').filter((l) => l.includes('console.')).join(' | ') || 'no console call found');

for (const [label, src] of [['route.js', route], ['turnstile.js', turnstile]]) {
  check(`${label}: no console call passes a raw error object`,
    !/console\.\w+\([^)]*,\s*error\s*\)/.test(src) && !/console\.\w+\(\s*error\s*\)/.test(src),
    src.split('\n').filter((l) => /console\.\w+\([^)]*,\s*error\s*\)/.test(l)).join(' | ') || 'matched something unexpected');
}

check('turnstile.js logs the bounded request summary', turnstile.includes('describeRequestFailure(error)'),
  'call site no longer uses the helper');
check('turnstile.js logs the bounded response summary', turnstile.includes('describeHttpResponse(response)'),
  'call site no longer uses the helper');
check('turnstile.js bounds the Cloudflare error codes it logs', turnstile.includes("boundedList(result['error-codes'])"),
  'call site no longer uses the helper');
check('turnstile.js bounds the action name it logs', turnstile.includes('boundedToken(result.action)'),
  'call site no longer uses the helper');

// The catch wraps the whole handler, so the log has to say which part threw.
check('the contact route records which stage was running',
  /let stage = 'validate';/.test(route) && /stage = 'compose';/.test(route) && /stage = 'send';/.test(route),
  'one or more stage assignments are missing');
check('the failure log carries the stage alongside the summary',
  catchBlock.includes('{ stage, ...describeSendFailure(error) }'),
  catchBlock.split('\n').filter((l) => l.includes('console.')).join(' | '));

// ------------------------------------------------------------- summary
fs.rmSync(tmp, { recursive: true, force: true });
const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.error(`Error-logging checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  process.exit(1);
}
console.log(`Error-logging checks: all ${results.length} passed.`);
