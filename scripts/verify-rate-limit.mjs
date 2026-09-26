// Proves the contact API keys its rate limit on the trusted hop, not the
// client-supplied one. Fails if getClientIp() ever goes back to reading the
// leftmost X-Forwarded-For entry, which would silently allow unlimited mail.
//
// Usage: node scripts/verify-rate-limit.mjs [baseUrl]
// Requires a running server. Nothing here sends email: every request is rejected
// by validation or captcha checks long before the mailer is reached.

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const MAX_REQUESTS = 3;
const TRUSTED_HOP = '198.51.100.7';

const failures = [];
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures.push(name);
};

async function submit({ xff, origin = true }) {
  const res = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: BASE } : {}),
      ...(xff ? { 'X-Forwarded-For': xff } : {}),
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

// 2. A request with no Origin header is rejected outright.
const noOrigin = await submit({ xff: `203.0.113.90, ${TRUSTED_HOP}`, origin: false });
check(
  'request without an Origin header is refused',
  noOrigin.status === 403 && /origin/i.test(noOrigin.error),
  `status ${noOrigin.status}, error "${noOrigin.error}"`
);

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll rate-limit invariants hold.');
