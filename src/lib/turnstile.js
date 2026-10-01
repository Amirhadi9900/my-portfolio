// Extension carried deliberately. The test harness loads this file by copying src/lib
// into a temp directory and importing it with plain Node, which requires an explicit
// specifier; webpack would have resolved it either way.
import { describeRequestFailure, describeHttpResponse, boundedList, boundedToken } from './contact-diagnostics.js';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_TOKEN_LENGTH = 2048;
const EXPECTED_ACTION = 'contact_submit';
// Cloudflare's public always-pass test secret. Its canned siteverify response
// carries no `action`, so holding it to the action contract below would lock local
// development out of the form entirely. Named here because it is the only case in
// which the contract loosens, and it is a published constant, not a real credential.
const CLOUDFLARE_TEST_SECRET = '1x0000000000000000000000000000000AA';

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
    // Bounded: the fetch error is not ours to shape, and the request body it failed
    // with carries the Turnstile secret. Nothing here echoes any of it.
    console.error('[turnstile] siteverify unreachable', describeRequestFailure(error));
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
    // A SyntaxError's message quotes the text it failed to parse, which is whoever
    // answered siteverify — often an HTML error page from an intermediary. Status only.
    console.error('[turnstile] siteverify response was not JSON', describeHttpResponse(response));
    return {
      ok: false,
      error: 'Security verification failed. Please try again.',
      code: 'captcha_invalid_response',
    };
  }

  if (!result.success) {
    console.warn('[turnstile] verification rejected', { codes: boundedList(result['error-codes']) });
    return {
      ok: false,
      error: 'Security check failed. Please try again.',
      code: 'captcha_failed',
      codes: result['error-codes'] ?? [],
    };
  }

  // Fail closed. A widget rendered without an action produces a perfectly valid
  // token whose siteverify result simply omits the field, so `result.action &&`
  // would treat that absence as a match and let any Turnstile widget on this site
  // key authorise a contact submission. The widget in TurnstileField always sets
  // this action; if Cloudflare ever stops echoing it, the form fails loudly and
  // this check is the first thing to revisit.
  if (result.action !== EXPECTED_ACTION) {
    if (secret !== CLOUDFLARE_TEST_SECRET) {
      console.warn('[turnstile] action mismatch', { action: boundedToken(result.action) });
      return {
        ok: false,
        error: 'Security verification mismatch. Please refresh and try again.',
        code: 'captcha_action_mismatch',
      };
    }
    // Only the published test pair loosens this, and it says so on every request.
    console.warn('Turnstile action check skipped because the Cloudflare test secret is in use.');
  }

  const expectedHost = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  // Comparing directly also rejects an absent hostname, which previously
  // short-circuited the check and let any site's token through.
  if (expectedHost && result.hostname !== expectedHost) {
    return {
      ok: false,
      error: 'Security verification failed for this site.',
      code: 'captcha_hostname_mismatch',
    };
  }

  return { ok: true };
}
