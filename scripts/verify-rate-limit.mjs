// Proves the contact API keys its rate limit on the trusted hop and on nothing the
// client controls. Fails if getClientIp() ever goes back to reading the leftmost
// X-Forwarded-For entry or trusts X-Real-IP, either of which would silently allow
// unlimited mail.
//
// Usage: node scripts/verify-rate-limit.mjs [baseUrl]
// Requires a running server. Nothing here sends email: every request is rejected
// by validation or captcha checks long before the mailer is reached.
// The rate-limit windows last 60s, so a second run inside that period passes for
// the wrong reason; CI runs it once against a fresh server.

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const MAX_REQUESTS = 3;
const TRUSTED_HOP = '198.51.100.7';

const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures.push(name);
};

async function submit({ xff, realIp, origin = true }) {
  const res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: BASE } : {}),
      ...(xff ? { 'X-Forwarded-For': xff } : {}),
      ...(realIp ? { 'X-Real-IP': realIp } : {}),
    },
    body: JSON.stringify({ name: '', email: '', subject: '', message: '', turnstileToken: 'invalid' }),
  });
  let error = '';
  let code = '';
  try {
    const body = await res.json();
    error = body.error || '';
    code = body.code || '';
  } catch {
    /* non-JSON response, fine */
  }
  return { status: res.status, code, error };
}

// 1. Rotating the leftmost hop must NOT dodge the limit. This is the F-01 regression.
const statuses = [];
for (let i = 1; i <= MAX_REQUESTS + 2; i++) {
  const { status } = await submit({ xff: `203.0.113.${i}, ${TRUSTED_HOP}` });
  statuses.push(status);
}
const limited = statuses.includes(429);
check(
  'rate limit survives a rotating leftmost X-Forwarded-For hop',
  limited,
  `statuses: ${statuses.join(', ')}`
);

// 2. A client-supplied X-Real-IP must not buy a fresh bucket either. Same shape of
//    bypass as #1: without a reverse proxy in front, that header is whatever the
//    caller says it is, so all of these land in one shared bucket and get throttled.
const realIpStatuses = [];
for (let i = 1; i <= MAX_REQUESTS + 2; i++) {
  const { status } = await submit({ realIp: `203.0.113.${i}` });
  realIpStatuses.push(status);
}
check(
  'rate limit survives a rotating X-Real-IP header',
  realIpStatuses.includes(429),
  `statuses: ${realIpStatuses.join(', ')}`
);

// 3. No Origin/Referer means no verifiable browser origin, so the API declines the
//    request. This is a rejection-path assertion, not proof of CSRF immunity: with
//    CONTACT_ALLOWED_ORIGINS unset the allowlist falls back to the request's own
//    Host header, which only a real browser cannot forge.
const noOrigin = await submit({ xff: `203.0.113.90, ${TRUSTED_HOP}`, origin: false });
check(
  'request with no verifiable browser origin is refused',
  noOrigin.status === 403 && /origin/i.test(noOrigin.error),
  `status ${noOrigin.status}, error "${noOrigin.error}"`
);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll rate-limit invariants hold.');
