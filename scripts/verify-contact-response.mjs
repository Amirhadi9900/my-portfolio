#!/usr/bin/env node
/**
 * Contract tests for interpretContactResponse().
 *
 * This is the response handling the browser cannot guard: CI has no browser, so the
 * component that renders these verdicts is untested by every other script here. The
 * bug it exists to prevent was a visitor reading
 * "Unexpected token '<', \"<!DOCTYPE\"... is not valid JSON" as the explanation for
 * why their message failed, because the firewall's HTML challenge page was parsed as
 * JSON and the thrown SyntaxError's message was shown verbatim.
 *
 * Run: node scripts/verify-contact-response.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// contact-response.js is ESM source in a CommonJS package, so Node cannot import it
// by name. Copied verbatim under an .mjs name each run, so it cannot drift.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'contact-response-'));
fs.copyFileSync(path.join(REPO, 'src/lib/contact-response.js'), path.join(tmp, 'cr.mjs'));
const { interpretContactResponse } = await import(pathToFileURL(path.join(tmp, 'cr.mjs')).href);

const SECURITY = 'A security check interrupted the send. Please try again in a minute.';
const UNEXPECTED = 'The server sent an unexpected response. Please try again.';
const GENERIC = 'Something went wrong. Please try again.';

// Vercel's real challenge body starts like this; abbreviated to the parts that matter.
const CHALLENGE_HTML = '<!DOCTYPE html><html lang="en"><head><title>Vercel Security Checkpoint</title></head><body>verify</body></html>';

const checks = [];
const check = (label, pass, detail) => checks.push({ label, pass, detail });

function expect(label, response, want) {
  const got = interpretContactResponse(response);
  const problems = [];
  if (got.outcome !== want.outcome) problems.push(`outcome ${got.outcome} != ${want.outcome}`);
  if (want.message !== undefined && got.message !== want.message) {
    problems.push(`message ${JSON.stringify(got.message)} != ${JSON.stringify(want.message)}`);
  }
  if (want.field !== undefined && got.field !== want.field) problems.push(`field ${got.field} != ${want.field}`);
  check(label, problems.length === 0, problems.length ? problems.join('; ') : `${got.outcome}${got.message ? `: ${got.message}` : ''}`);
  return got;
}

// --- 1. Control: prove the old approach really did throw on the real body --------
let controlThrew = false;
try { JSON.parse(CHALLENGE_HTML); } catch { controlThrew = true; }
check('control: challenge HTML is not valid JSON', controlThrew,
  controlThrew ? 'a naive response.json() would throw here' : 'CONTROL BROKEN: nothing to guard');

// --- 2. Non-JSON bodies must never leak a parser error ---------------------------
expect('HTML 429 from the edge challenge', { status: 429, ok: false, body: CHALLENGE_HTML },
  { outcome: 'error', message: SECURITY });
expect('HTML 200 from a captive portal or proxy', { status: 200, ok: true, body: '<html>nope</html>' },
  { outcome: 'error', message: UNEXPECTED });
expect('empty body at 504', { status: 504, ok: false, body: '' },
  { outcome: 'error', message: UNEXPECTED });
expect('JSON literal null', { status: 200, ok: true, body: 'null' },
  { outcome: 'error', message: UNEXPECTED });
expect('bare JSON string is not an envelope', { status: 200, ok: true, body: '"ok"' },
  { outcome: 'error', message: UNEXPECTED });
expect('JSON array is not an envelope', { status: 500, ok: false, body: '[{"error":"x"}]' },
  { outcome: 'error', message: UNEXPECTED });
// A 200 with nothing readable in it must not be reported as delivered.
expect('200 with an unparseable body is not success', { status: 200, ok: true, body: CHALLENGE_HTML },
  { outcome: 'error', message: UNEXPECTED });

// --- 3. The app's own JSON answers keep their own words -------------------------
// This is the regression that matters most: a genuine rate limit is also a 429, and
// it must not be re-labelled as a security check.
expect('JSON 429 from the app limiter', { status: 429, ok: false, body: JSON.stringify({ error: 'Too many requests. Please wait a minute before trying again.' }) },
  { outcome: 'error', message: 'Too many requests. Please wait a minute before trying again.' });
expect('JSON 400 field error', { status: 400, ok: false, body: JSON.stringify({ error: 'Message contains unsupported or unsafe content.', field: 'message' }) },
  { outcome: 'field', field: 'message', message: 'Message contains unsupported or unsafe content.' });
expect('JSON 400 field error without text', { status: 400, ok: false, body: JSON.stringify({ field: 'consent' }) },
  { outcome: 'field', field: 'consent', message: GENERIC });
expect('JSON 403 captcha_missing', { status: 403, ok: false, body: JSON.stringify({ error: 'Please complete the security check before sending.', code: 'captcha_missing' }) },
  { outcome: 'captcha', message: 'Please complete the security check before sending.' });
expect('JSON 403 captcha_not_configured without text', { status: 403, ok: false, body: JSON.stringify({ code: 'captcha_not_configured' }) },
  { outcome: 'captcha', message: 'Security check failed. Please try again.' });
expect('JSON 403 non-captcha code is not a captcha verdict', { status: 403, ok: false, body: JSON.stringify({ code: 'invalid_origin', error: 'Invalid request origin' }) },
  { outcome: 'error', message: 'Invalid request origin' });
expect('JSON 500 with server text', { status: 500, ok: false, body: JSON.stringify({ error: 'Failed to send message. Please try again later.' }) },
  { outcome: 'error', message: 'Failed to send message. Please try again later.' });
expect('JSON 500 with no text falls back', { status: 500, ok: false, body: '{}' },
  { outcome: 'error', message: GENERIC });
// Captured verbatim from the live edge rate limiter (Vercel, x-vercel-mitigated: deny).
// Its "error" is an object, which is the shape that produced "[object Object]" in the
// alert before readableText() existed. This is a real response, not a hypothetical one.
expect('edge 429 whose error is a nested object', { status: 429, ok: false, body: '{"error":{"code":"429","message":"Too Many Requests","id":"arn1::vlgz5-1790792106957-27ebc3957963"}}\n' },
  { outcome: 'error', message: 'Too many requests. Please wait a minute before trying again.' });
expect('403 with a nested object error is not read as captcha text', { status: 403, ok: false, body: JSON.stringify({ code: 'captcha_failed', error: { message: 'nope' } }) },
  { outcome: 'captcha', message: 'Security check failed. Please try again.' });
expect('400 with a whitespace-only error falls back', { status: 400, ok: false, body: JSON.stringify({ field: 'email', error: '   ' }) },
  { outcome: 'field', field: 'email', message: GENERIC });
expect('500 with an array error falls back', { status: 500, ok: false, body: JSON.stringify({ error: ['boom'] }) },
  { outcome: 'error', message: GENERIC });
expect('500 with a numeric error falls back', { status: 500, ok: false, body: JSON.stringify({ error: 500 }) },
  { outcome: 'error', message: GENERIC });
expect('JSON 200 success', { status: 200, ok: true, body: JSON.stringify({ success: true, message: 'Your message has been sent successfully!' }) },
  { outcome: 'success' });

// --- 4. Invariants over every verdict -------------------------------------------
const allBodies = [
  CHALLENGE_HTML, '', 'null', '"ok"', '[]', '{}',
  JSON.stringify({ error: 'Too many requests.', field: 'name', code: 'captcha_failed' }),
  JSON.stringify({ error: { code: '429', message: 'Too Many Requests' } }),
  JSON.stringify({ error: {} }),
  JSON.stringify({ error: null, field: 'x' }),
  JSON.stringify({ error: 42, code: 'captcha_expired' }),
  JSON.stringify({ message: 'no error key at all' }),
];
const leakedHtml = [];
const leakedUndefined = [];
const leakedNonString = [];
for (const status of [200, 400, 403, 429, 500]) {
  for (const ok of [true, false]) {
    for (const body of allBodies) {
      const v = interpretContactResponse({ status, ok, body });
      if (!['success', 'captcha', 'field', 'error'].includes(v.outcome)) leakedUndefined.push(`${status}/${v.outcome}`);
      if (v.outcome === 'success') continue;
      // Every non-success verdict must hand the component a sentence it can render.
      if (typeof v.message !== 'string' || v.message.trim().length === 0) {
        leakedNonString.push(`${status}:${body.slice(0, 24)} -> ${JSON.stringify(v.message)}`);
      } else if (/[<>]|\[object /.test(v.message)) {
        leakedHtml.push(`${status}:${body.slice(0, 24)} -> ${v.message.slice(0, 40)}`);
      }
    }
  }
}
check('no verdict ever carries raw markup or [object Object] to the alert', leakedHtml.length === 0,
  leakedHtml.length ? leakedHtml.join(' | ') : `${5 * 2 * allBodies.length} combinations clean`);
check('every non-success verdict carries a renderable string', leakedNonString.length === 0,
  leakedNonString.join(' | ') || 'all messages are non-empty strings');
check('every verdict has a known outcome', leakedUndefined.length === 0, leakedUndefined.join(' | ') || 'all known');

// The field name is passed through untouched: rejecting unknown fields is the
// component's job (it gates focus on its own validator keys), and this records that
// the split is deliberate rather than an oversight in either place.
const hostile = expect('field name is passed through for the component to gate',
  { status: 400, ok: false, body: JSON.stringify({ field: '"][onfocus="alert(1)]', error: 'x' }) },
  { outcome: 'field' });
check('hostile field reaches the component verbatim', hostile.field === '"][onfocus="alert(1)]', JSON.stringify(hostile.field));

fs.rmSync(tmp, { recursive: true, force: true });

const failures = checks.filter((c) => !c.pass);
if (failures.length) {
  console.error(`Contact-response checks: ${checks.length - failures.length}/${checks.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  process.exit(1);
}
console.log(`Contact-response checks: all ${checks.length} passed.`);
