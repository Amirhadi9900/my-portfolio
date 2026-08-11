const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;
const EXPECTED_ACTION = 'contact_submit';

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Tokens are single-use and short-lived (~5 minutes).
 */
export async function verifyTurnstileToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return {
      ok: false,
      error: 'Security verification is unavailable. Please try again later.',
      code: 'captcha_not_configured',
    };
  }

  if (typeof token !== 'string' || !token.trim()) {
    return {
      ok: false,
      error: 'Please complete the security check before sending.',
      code: 'captcha_missing',
    };
  }

  if (token.length > MAX_TOKEN_LENGTH) {
    return {
      ok: false,
      error: 'Invalid security verification token.',
      code: 'captcha_invalid',
    };
  }

  const payload = new URLSearchParams();
  payload.append('secret', secret);
  payload.append('response', token.trim());

  if (remoteIp && remoteIp !== 'unknown') {
    payload.append('remoteip', remoteIp);
  }

  let response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Turnstile siteverify request failed:', error);
    return {
      ok: false,
      error: 'Security verification failed. Please try again.',
      code: 'captcha_unreachable',
    };
  }

  let result;
  try {
    result = await response.json();
  } catch (error) {
    console.error('Turnstile siteverify response parse failed:', error);
    return {
      ok: false,
      error: 'Security verification failed. Please try again.',
      code: 'captcha_invalid_response',
    };
  }

  if (!result.success) {
    console.warn('Turnstile verification rejected:', result['error-codes']);
    return {
      ok: false,
      error: 'Security check failed. Please try again.',
      code: 'captcha_failed',
      codes: result['error-codes'] ?? [],
    };
  }

  if (result.action && result.action !== EXPECTED_ACTION) {
    return {
      ok: false,
      error: 'Security verification mismatch. Please refresh and try again.',
      code: 'captcha_action_mismatch',
    };
  }

  const expectedHost = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  if (expectedHost && result.hostname && result.hostname !== expectedHost) {
    return {
      ok: false,
      error: 'Security verification failed for this site.',
      code: 'captcha_hostname_mismatch',
    };
  }

  return { ok: true };
}
