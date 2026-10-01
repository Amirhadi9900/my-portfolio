#!/usr/bin/env node
/**
 * Turnstile verification contract checks. No network: fetch is stubbed, so every
 * branch of verifyTurnstileToken is exercised deterministically.
 *
 * The invariant being guarded is fail-closed behaviour. A CAPTCHA check that skips
 * a verification step when the field is merely absent trusts the absence, and a
 * token can always be minted by a widget configured without that field.
 *
 * Run: node scripts/verify-captcha.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// turnstile.js is ESM source in a CommonJS package. Copy the whole src/lib into the
// temp directory and declare it ESM there, so relative imports inside it resolve and
// adding one later does not break this harness. Copied every run so it cannot drift.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'captcha-check-'));
fs.cpSync(path.join(REPO, 'src/lib'), tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ type: 'module' }));

process.env.TURNSTILE_SECRET_KEY = 'test-secret';
process.env.TURNSTILE_EXPECTED_HOSTNAME = 'portfolio.example';
const EXPECTED_ACTION = 'contact_submit';

const { verifyTurnstileToken } = await import(pathToFileURL(path.join(tmp, 'turnstile.js')).href);

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

/** Install a stub siteverify response and return what the verifier decided. */
async function withResponse(payload) {
  const original = globalThis.fetch;
  let sent = null;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: init.body };
    return { json: async () => payload };
  };
  try {
    const outcome = await verifyTurnstileToken('a-real-looking-token', '203.0.113.7');
    return { outcome, sent };
  } finally {
    globalThis.fetch = original;
  }
}

const ok = (o) => o.ok === true;

// --- The fail-closed contract ----------------------------------------------------
const good = { success: true, action: EXPECTED_ACTION, hostname: 'portfolio.example' };

let r = await withResponse(good);
check('valid token with matching action and hostname is accepted', ok(r.outcome), JSON.stringify(r.outcome));
check('siteverify is called with the secret and the response token',
  /secret=test-secret/.test(r.sent.body) && /response=a-real-looking-token/.test(r.sent.body), r.sent.body.slice(0, 80));
check('remoteip is forwarded so Cloudflare can bind the token to the client',
  /remoteip=203\.0\.113\.7/.test(r.sent.body), r.sent.body.slice(0, 80));

r = await withResponse({ success: false, 'error-codes': ['bad-request'] });
check('rejected token is refused', !ok(r.outcome), JSON.stringify(r.outcome));

// The bypass this file exists to prevent: a widget rendered WITHOUT an action yields
// a valid token whose siteverify result simply has no action field.
r = await withResponse({ success: true, hostname: 'portfolio.example' });
check('token with NO action field is refused', !ok(r.outcome),
  ok(r.outcome) ? 'ACCEPTED: action check is skipped when the field is absent' : JSON.stringify(r.outcome));

r = await withResponse({ success: true, action: 'some_other_form', hostname: 'portfolio.example' });
check('token with a different action is refused', !ok(r.outcome), JSON.stringify(r.outcome));

r = await withResponse({ success: true, action: EXPECTED_ACTION });
check('token with NO hostname is refused', !ok(r.outcome),
  ok(r.outcome) ? 'ACCEPTED: hostname binding skipped' : JSON.stringify(r.outcome));

r = await withResponse({ success: true, action: EXPECTED_ACTION, hostname: 'other-site.example' });
check('token minted for another hostname is refused', !ok(r.outcome), JSON.stringify(r.outcome));

// --- The one loosening, and its exact boundary ----------------------------------
// Cloudflare's canned test-key response has no `action`, so the check above must
// relax for that pair or local development cannot submit at all. It must relax for
// nothing else: not for a wrong action under a real secret, and never `success:false`.
const CF_TEST_SECRET = '1x0000000000000000000000000000000AA';
process.env.TURNSTILE_SECRET_KEY = CF_TEST_SECRET;

r = await withResponse({ success: true, hostname: 'portfolio.example' });
check('test secret still verifies so local development works', ok(r.outcome),
  ok(r.outcome) ? 'accepted' : JSON.stringify(r.outcome));

r = await withResponse({ success: false, 'error-codes': ['invalid-input-secret'] });
check('test secret does not rubber-stamp a rejected token', !ok(r.outcome), JSON.stringify(r.outcome));

process.env.TURNSTILE_SECRET_KEY = 'test-secret';
r = await withResponse({ success: true, action: 'other', hostname: 'portfolio.example' });
check('a real secret never loosens for a wrong action', !ok(r.outcome), JSON.stringify(r.outcome));

// --- Input hygiene ---------------------------------------------------------------
process.env.TURNSTILE_SECRET_KEY = '';
r = await withResponse(good);
check('missing secret fails closed instead of skipping verification', !ok(r.outcome),
  JSON.stringify(r.outcome));
process.env.TURNSTILE_SECRET_KEY = 'test-secret';

const emptyish = await Promise.all([
  verifyTurnstileToken(undefined, '1.2.3.4'),
  verifyTurnstileToken('', '1.2.3.4'),
  verifyTurnstileToken('   ', '1.2.3.4'),
  verifyTurnstileToken({ token: 'x' }, '1.2.3.4'),
  verifyTurnstileToken('x'.repeat(4000), '1.2.3.4'),
]);
check('absent, blank, non-string and oversized tokens are all refused',
  emptyish.every((o) => !ok(o)), JSON.stringify(emptyish.map((o) => o.code)));

fs.rmSync(tmp, { recursive: true, force: true });

const failures = results.filter((c) => !c.pass);
if (failures.length) {
  console.error(`Turnstile checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  process.exit(1);
}
console.log(`Turnstile checks: all ${results.length} passed.`);
