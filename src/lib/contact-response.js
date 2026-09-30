/**
 * Decide what the contact API's reply means, without assuming it is JSON.
 *
 * Vercel's firewall answers a request it cannot trust with an HTML challenge page at
 * 429. A caller that runs response.json() over that throws a SyntaxError whose
 * message — "Unexpected token '<'..." — is then shown to a visitor as the explanation
 * for why their message did not send. Keeping the whole decision here, as a pure
 * function over strings, means Node can test every shape; the component that renders
 * it needs a browser, and CI does not have one.
 */

const SECURITY_CHECK_MESSAGE = 'A security check interrupted the send. Please try again in a minute.';
const UNEXPECTED_RESPONSE_MESSAGE = 'The server sent an unexpected response. Please try again.';
const CAPTCHA_FALLBACK_MESSAGE = 'Security check failed. Please try again.';
const GENERIC_FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
// Same words the function itself uses for its own 429, because to the visitor the two
// mean exactly the same thing.
const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a minute before trying again.';

/**
 * Only ever hand the visitor a plain string. Vercel's rate-limit reply nests its text
 * inside an object under "error" — {"error":{"code":"429","message":"Too Many
 * Requests"}} — and a truthy non-string there survives a `||` fallback and turns into
 * "[object Object]" once Error() stringifies it.
 */
function readableText(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * @param {{ status: number, ok: boolean, body: string }} response
 * @returns {{ outcome: 'success' }
 *          | { outcome: 'captcha', message: string }
 *          | { outcome: 'field', field: string, message: string }
 *          | { outcome: 'error', message: string }}
 */
export function interpretContactResponse({ status, ok, body }) {
  let data = null;
  try {
    const parsed = JSON.parse(body);
    // An array or a bare string/number is valid JSON but not a response envelope.
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed;
  } catch {
    // A body that is not JSON is an expected outcome here, not an exceptional one.
  }

  if (!data) {
    return {
      outcome: 'error',
      message: status === 429 ? SECURITY_CHECK_MESSAGE : UNEXPECTED_RESPONSE_MESSAGE,
    };
  }

  if (!ok) {
    const serverText = readableText(data.error);
    if (typeof data.code === 'string' && data.code.startsWith('captcha_')) {
      return { outcome: 'captcha', message: serverText || CAPTCHA_FALLBACK_MESSAGE };
    }
    if (typeof data.field === 'string' && data.field.length > 0) {
      return { outcome: 'field', field: data.field, message: serverText || GENERIC_FALLBACK_MESSAGE };
    }
    return {
      outcome: 'error',
      message: serverText || (status === 429 ? RATE_LIMIT_MESSAGE : GENERIC_FALLBACK_MESSAGE),
    };
  }

  return { outcome: 'success' };
}
