// Runs once when the server boots. A missing variable here currently only surfaces as
// a generic 500 on a real submission, which is the worst time to discover it.
export function register() {
  if (process.env.NODE_ENV === 'test') return;

  const required = [
    'EMAIL_USER',
    'EMAIL_PASS',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'TURNSTILE_SECRET_KEY',
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    console.error(
      `[config] Missing required environment variables: ${missing.join(', ')}. ` +
        'The contact form cannot send until these are set.'
    );
  }

  if (process.env.NODE_ENV !== 'production') return;

  if (!process.env.CONTACT_ALLOWED_ORIGINS) {
    console.warn(
      '[config] CONTACT_ALLOWED_ORIGINS is unset, so the contact API trusts the request ' +
        'Host header as its origin allowlist. Set it to your deployment origin for strict checking.'
    );
  }

  if (!process.env.TURNSTILE_EXPECTED_HOSTNAME) {
    console.warn(
      '[config] TURNSTILE_EXPECTED_HOSTNAME is unset, so verified Turnstile tokens are not ' +
        'bound to your domain.'
    );
  }
}
