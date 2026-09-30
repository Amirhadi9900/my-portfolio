#!/usr/bin/env node
/**
 * CSP regression checks against a running server.
 *
 * script-src drops 'unsafe-inline' in favour of a per-request nonce, which means a
 * single malformed directive blocks Next's entire inline bootstrap and the site
 * silently stops hydrating. That is a build-green, deploy-broken class of failure,
 * so it is asserted here rather than trusted to review.
 *
 * Run against a server: node scripts/verify-csp.mjs http://127.0.0.1:3000
 */
const BASE = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');

const results = [];
const check = (label, pass, detail) => results.push({ label, pass, detail });

async function head(pathname) {
  const res = await fetch(BASE + pathname, { redirect: 'manual' });
  return { res, text: await res.text() };
}

/** Pull one directive's full text out of a policy string. */
function directive(csp, name) {
  const found = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' '));
  return found || null;
}

const { res, text } = await head('/');
const csp = res.headers.get('content-security-policy');

check('home page sends a CSP header', Boolean(csp), csp ? 'present' : 'MISSING entirely');

if (csp) {
  const scriptSrc = directive(csp, 'script-src');
  const styleSrc = directive(csp, 'style-src');
  const nonce = scriptSrc && (scriptSrc.match(/nonce-([A-Za-z0-9=+/]+)/) || [])[1];

  check('script-src is its own directive', Boolean(scriptSrc),
    scriptSrc ? scriptSrc.slice(0, 70) + '…' : 'ABSENT: the browser would fall back to default-src and block every inline script');
  check("script-src has no 'unsafe-inline'", scriptSrc ? !/unsafe-inline/.test(scriptSrc) : false,
    !scriptSrc ? 'cannot judge: no script-src directive exists'
      : /unsafe-inline/.test(scriptSrc) ? 'regressed: F-01 is open again' : 'clean');
  check('script-src carries a nonce', Boolean(nonce), nonce ? nonce.slice(0, 12) + '…' : 'none');

  // The whole point: every inline script must arrive pre-nonce or it will not run.
  const inline = [...text.matchAll(/<script([^>]*)>/g)].filter((m) => !/\bsrc=/.test(m[1]));
  const nonced = inline.filter((m) => /nonce="([^"]+)"/.test(m[1]));
  const allMatch = inline.length > 0 && nonced.length === inline.length &&
    nonced.every((m) => m[1].match(/nonce="([^"]+)"/)[1] === nonce);
  check('every inline script carries the header nonce', allMatch,
    `${nonced.length}/${inline.length} nonced` + (allMatch ? '' : ' -> the site would render but never hydrate'));

  // style-src keeps 'unsafe-inline' on purpose: the honeypot and the hero layers are
  // hidden/positioned by style attributes, which a nonce does not cover.
  check("style-src still allows style attributes", styleSrc ? /unsafe-inline/.test(styleSrc) : false,
    styleSrc || 'ABSENT: the honeypot field would become visible');

  for (const required of ['frame-ancestors', 'base-uri', 'object-src', 'form-action', 'frame-src']) {
    check(`${required} still enforced`, Boolean(directive(csp, required)), directive(csp, required) || 'MISSING');
  }
  check("'self' still covers the vercel analytics chunk", /connect-src[^;]*'self'/.test(csp),
    directive(csp, 'connect-src') || 'MISSING');

  const second = await head('/');
  const nonce2 = (directive(second.res.headers.get('content-security-policy') || '', 'script-src') || '')
    .match(/nonce-([A-Za-z0-9=+/]+)/)?.[1];
  check('nonce changes per request', Boolean(nonce && nonce2 && nonce !== nonce2),
    nonce === nonce2 ? 'IDENTICAL across requests: predictable, so worthless' : 'unique');
}

// JSON has no document to protect, and routing it through the proxy would spend
// serverless invocations on the one endpoint that must stay cheap.
const api = await head('/api/contact');
check('api route is exempt from the document policy', !api.res.headers.get('content-security-policy'),
  api.res.headers.get('content-security-policy') ? 'CSP set on JSON' : 'excluded by the matcher');
check('api route keeps nosniff', api.res.headers.get('x-content-type-options') === 'nosniff',
  api.res.headers.get('x-content-type-options') || 'MISSING');

// /privacy got its own connection() call; if that is ever dropped the page ships
// unnonced inline scripts and dies exactly like the home page would have.
const privacy = await head('/privacy');
const pCsp = privacy.res.headers.get('content-security-policy') || '';
const pNonce = (directive(pCsp, 'script-src') || '').match(/nonce-([A-Za-z0-9=+/]+)/)?.[1];
const pInline = [...privacy.text.matchAll(/<script([^>]*)>/g)].filter((m) => !/\bsrc=/.test(m[1]));
const pNonced = pInline.filter((m) => m[1].includes(`nonce="${pNonce}"`));
check('privacy page nonces its inline scripts', Boolean(pNonce) && pInline.length > 0 && pNonced.length === pInline.length,
  `${pNonced.length}/${pInline.length} nonced`);

const failures = results.filter((r) => !r.pass);
if (failures.length) {
  console.error(`CSP checks: ${results.length - failures.length}/${results.length} passed`);
  for (const f of failures) console.error(`  FAIL ${f.label} -> ${f.detail}`);
  process.exit(1);
}
console.log(`CSP checks: all ${results.length} passed.`);
