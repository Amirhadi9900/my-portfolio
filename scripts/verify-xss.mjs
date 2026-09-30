#!/usr/bin/env node
/**
 * XSS regression checks for the contact form.
 *
 * Guards the one real HTML sink in the project: the email built in
 * src/app/api/contact/route.js. It loads the validator module and lifts the email
 * template straight out of route.js, so it tests the actual sink rather than a
 * paraphrase that could drift from it.
 *
 * Section 2 is a positive control: the same payloads pushed through an *unescaped*
 * sink must appear verbatim. If that ever stops being true, every "pass" below is
 * meaningless.
 *
 * Run: node scripts/verify-xss.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(REPO, rel), 'utf8');

// contact-security.js is ESM source in a CommonJS package, so Node cannot import it
// by name. Copied verbatim under an .mjs name on every run, so it cannot drift.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xss-check-'));
fs.copyFileSync(path.join(REPO, 'src/lib/contact-security.js'), path.join(tmp, 'cs.mjs'));
const cs = await import(pathToFileURL(path.join(tmp, 'cs.mjs')).href);

// Bind to the real sink; throws rather than quietly testing a paraphrase if the
// template moves. CRLF-tolerant, because the working copy is checked out \r\n.
const routeSrc = read('src/app/api/contact/route.js');
const tpl = routeSrc.match(/html: `([\s\S]*?)`,\r?\n\s*\};/);
if (!tpl) throw new Error('Could not locate the email html template in route.js');
const buildEmail = new Function(
  'safeName', 'safeEmail', 'safeSubject', 'safeMessageHtml', 'consentAt',
  `return \`${tpl[1]}\`;`
);

const BASE = {
  name: 'Test Person',
  email: 'test.person@example.com',
  subject: 'Security probe',
  consent: true,
};

const PAYLOADS = [
  ['classic script tag', '<script>alert(1)</script>'],
  ['img onerror', '<img src=x onerror=alert(1)>'],
  ['svg onload', '<svg/onload=alert(1)>'],
  ['js uri in anchor', "<a href='javascript:alert(1)'>x</a>"],
  ['js uri entity-encoded', '<a href="javascript&#58;alert(1)">x</a>'],
  ['entity-encoded angle', '&#60;script&#62;alert(1)&#60;/script&#62;'],
  ['closing tag breakout', '</p><b>bold</b>'],
  ['base href hijack', '<base href="//evil.example/">'],
  ['meta refresh', '<meta http-equiv="refresh" content="0;url=//evil.example">'],
  ['form for clobbering', '<form name="consent"><input name="consent" value="1"></form>'],
  ['shadow dom attach', '<template shadowrootmode><slot></slot></template>'],
  ['iframe', '<iframe src="//evil.example"></iframe>'],
  ['null byte split', '<scr\x00ipt>alert(1)</scr\x00ipt>'],
  ['newline split attributes', '<IMG\nSRC="x"\nONERROR="alert(1)">'],
  ['every html metacharacter', 'a < b > c "d" \'e\' `f` /g&h;'],
];

const checks = [];
const escapedNotRejected = [];
const check = (group, label, pass, detail) => checks.push({ group, label, pass, detail });

function emittedHtml(data) {
  return buildEmail(
    cs.escapeHtml(data.name),
    cs.escapeHtml(data.email),
    cs.escapeHtml(data.subject),
    cs.formatMessageForHtmlEmail(data.message),
    '2026-09-30T00:00:00.000Z'
  );
}

/** Value of the `<p><strong>Label:</strong> value</p>` line. */
function labelledRegion(html, label) {
  const tag = `<strong>${label}</strong>`;
  const at = html.indexOf(tag);
  if (at < 0) throw new Error(`Template no longer contains "${label}"`);
  const start = at + tag.length;
  return html.slice(start, html.indexOf('</p>', start));
}

/** Content of the paragraph that follows `<h3>Message:</h3>`. */
function messageRegion(html) {
  const open = html.indexOf('<p>', html.indexOf('<h3>Message:</h3>'));
  if (open < 0) throw new Error('Template no longer contains a message paragraph');
  return html.slice(open + 3, html.lastIndexOf('</p>'));
}

// A '<' is allowed only as the <br> this module inserts for line breaks: anything
// else means the payload arrived as markup rather than as text.
function isInert(region) {
  return !/<(?!br>)/.test(region) && !/["'`]/.test(region);
}

/**
 * Guards against a vacuous pass: an extraction bug that returned an empty string
 * would look perfectly inert. The payload has to be observably present in the
 * region being judged.
 */
function payloadLandedIn(region, payload) {
  const token = payload.match(/[A-Za-z0-9]{4,}/);
  return region.length > 0 && (!token || region.includes(token[0]));
}

// --- 1. The free-text field, which is deliberately not a strict allowlist -------
for (const [label, payload] of PAYLOADS) {
  const parsed = cs.parseContactRequest({ ...BASE, message: payload });
  if (!parsed.ok) {
    check('message', label, true, `rejected: ${parsed.error}`);
    continue;
  }
  const region = messageRegion(emittedHtml(parsed.data));
  const inert = isInert(region) && payloadLandedIn(region, payload);
  if (inert) escapedNotRejected.push(`message/${label}`);
  check('message', label, inert, inert ? 'accepted, then escaped' : 'SURVIVED AS MARKUP');
}

// --- 2. Positive control: an unescaped sink must leak ---------------------------
for (const [label, payload] of PAYLOADS.slice(0, 6)) {
  const leaky = buildEmail('N', 'e@x.example', 's', payload, 'now');
  check('control', label, leaky.includes(payload),
    leaky.includes(payload) ? 'detector sees raw interpolation' : 'CONTROL BROKEN: detector is blind');
}
// Stronger still: escaping must be what flips the verdict. Each payload that fails
// the inert test raw must pass it once escaped, in the very same template slot.
for (const [label, payload] of PAYLOADS.slice(0, 5)) {
  const escaped = messageRegion(buildEmail('N', 'e@x.example', 's', cs.formatMessageForHtmlEmail(payload), 'now'));
  check('control', `escape flips: ${label}`, !isInert(payload) && isInert(escaped),
    `raw inert=${isInert(payload)}, escaped inert=${isInert(escaped)}`);
}

// --- 3. name and subject: same guarantee, reached differently -------------------
// The subject allowlist admits '&' and '#', so a character reference can pass
// validation. That is not the failure; reaching the sink as markup is.
for (const [label, payload] of PAYLOADS) {
  for (const field of ['name', 'subject']) {
    const parsed = cs.parseContactRequest({ ...BASE, [field]: payload, message: 'Normal message.' });
    if (!parsed.ok) {
      check(field, label, true, 'rejected by the allowlist');
      continue;
    }
    const region = labelledRegion(
      emittedHtml(parsed.data),
      `${field[0].toUpperCase()}${field.slice(1)}:`
    );
    const inert = isInert(region) && payloadLandedIn(region, payload);
    if (inert) escapedNotRejected.push(`${field}/${label}`);
    check(field, label, inert, inert ? 'accepted, then escaped' : 'SURVIVED AS MARKUP');
  }
}

// --- 4. SMTP header injection ---------------------------------------------------
const BREAKS = [
  ['crlf bcc', 'Hi\r\nBcc: evil@example.com'],
  ['lf only', 'Hi\nBcc: evil@example.com'],
  ['cr only', 'Hi\rBcc: evil@example.com'],
  ['u2028', 'Hi\u2028Bcc: evil@example.com'],
  ['u2029', 'Hi\u2029Bcc: evil@example.com'],
];
for (const [label, value] of BREAKS) {
  for (const field of ['name', 'subject', 'email']) {
    const parsed = cs.parseContactRequest({ ...BASE, [field]: value, message: 'Normal message.' });
    const clean = !parsed.ok || !/[\r\n\u2028\u2029]/.test(parsed.data[field]);
    check(`header-${field}`, label, clean,
      parsed.ok ? 'accepted, emitted value has no line break' : 'rejected');
  }
}
// \v and \f satisfy \s in the name allowlist but are still control characters.
for (const [label, ch] of [['vertical tab', '\u000b'], ['form feed', '\u000c']]) {
  const parsed = cs.parseContactRequest({ ...BASE, name: `A${ch}B`, message: 'Normal message.' });
  check('header-name', label, !parsed.ok || !parsed.data.name.includes(ch),
    parsed.ok ? `stripped to ${JSON.stringify(parsed.data.name)}` : 'rejected');
}

// --- 5. Structural abuse, fed as JSON exactly as the route receives it ---------
const STRUCTURE = [
  ['proto pollution', '{"__proto__":{"polluted":true},"name":"A","email":"a@b.co","subject":"S","message":"M","consent":true}'],
  ['constructor key', '{"constructor":{"prototype":{"polluted":true}}}'],
  ['prototype key', '{"prototype":{},"name":"A","email":"a@b.co","subject":"S","message":"M","consent":true}'],
  ['unknown field', '{"name":"A","email":"a@b.co","subject":"S","message":"M","consent":true,"role":"admin"}'],
  ['object in name', '{"name":{"x":1},"email":"a@b.co","subject":"S","message":"M","consent":true}'],
  ['array in message', '{"name":"A","email":"a@b.co","subject":"S","message":["<script>"],"consent":true}'],
  ['array body', '["a","b"]'],
  ['string body', '"plain string"'],
  ['consent absent', '{"name":"A","email":"a@b.co","subject":"S","message":"M"}'],
  ['consent as string', '{"name":"A","email":"a@b.co","subject":"S","message":"M","consent":"yes"}'],
  ['field flood', JSON.stringify(Object.fromEntries([...Array(40)].map((_, i) => [`k${i}`, 'v'])))],
];
for (const [label, raw] of STRUCTURE) {
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    check('structure', label, true, 'unparseable json');
    continue;
  }
  const parsed = cs.parseContactRequest(body);
  check('structure', label, !parsed.ok, parsed.ok ? 'ACCEPTED' : `rejected: ${parsed.error}`);
}
check('structure', 'Object.prototype untouched', !({}).polluted, 'prototype pollution leaked');

// --- 6. Size limits -------------------------------------------------------------
check('limits', 'name over 100', !cs.parseContactRequest({ ...BASE, name: 'A'.repeat(101), message: 'M' }).ok, 'must reject');
check('limits', 'message over 5000', !cs.parseContactRequest({ ...BASE, message: 'M'.repeat(5001) }).ok, 'must reject');

// --- 7. Invisible-only content must not pass as a real message ------------------
const INVISIBLE = [
  ['zero width spaces only', '\u200B\u200B\u200B\u200B\u200B'],
  ['word joiner + BOM + soft hyphen', '\u2060\uFEFF\u00AD'],
  ['non-breaking spaces only', '\u00A0\u00A0\u00A0'],
  ['newlines and tabs only', '\n\n\t \n'],
];
for (const [label, value] of INVISIBLE) {
  const parsed = cs.parseContactRequest({ ...BASE, message: value });
  check('invisible', label, !parsed.ok, parsed.ok ? 'ACCEPTED: email would arrive blank' : 'rejected');
}
// The opposite direction: real text that merely *contains* an invisible character
// must still be accepted, or this fix would become a false-positive machine.
const mixed = cs.parseContactRequest({ ...BASE, message: 'Hello\u200B there, I need a quote.' });
check('invisible', 'text containing a zero-width space is still accepted', mixed.ok,
  mixed.ok ? 'accepted' : `rejected: ${mixed.error}`);
for (const [label, value] of INVISIBLE.slice(0, 2)) {
  check('invisible', `name: ${label}`, !cs.parseContactRequest({ ...BASE, name: value, message: 'M' }).ok, 'must reject');
  check('invisible', `subject: ${label}`, !cs.parseContactRequest({ ...BASE, subject: value, message: 'M' }).ok, 'must reject');
}

fs.rmSync(tmp, { recursive: true, force: true });

const failures = checks.filter((c) => !c.pass);
if (failures.length) {
  console.error(`XSS checks: ${checks.length - failures.length}/${checks.length} passed`);
  for (const f of failures) console.error(`  FAIL [${f.group}] ${f.label} -> ${f.detail}`);
  process.exit(1);
}
console.log(`XSS checks: all ${checks.length} passed.`);
console.log(`Relying on escaping rather than rejection (${escapedNotRejected.length}): ${escapedNotRejected.join(', ')}`);
