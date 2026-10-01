/**
 * A loggable summary of a contact-form failure.
 *
 * The catch block in the contact route wraps everything from body parsing through
 * transporter.sendMail(), so the scope around it holds the visitor's name, email
 * address, subject and message. What lands in that catch is whatever nodemailer or
 * the SMTP server produced, and neither is ours to bound: Gmail's reply text is
 * copied into error.response and error.message verbatim and can quote an address,
 * and console.error(obj) serialises every own enumerable property into the platform's
 * retained function logs. So the old one-line log wrote content we had not read,
 * could not predict, and had told visitors was not stored anywhere.
 *
 * Nothing here is taken from error.message or error.response. Three fixed fields are
 * lifted, each coerced to a bounded shape, plus a reason bucket computed rather than
 * echoed, and a boolean recording that a server reply existed without logging its text.
 *
 * Deliberate choice, not an oversight: over-long or oddly-shaped values are dropped
 * rather than truncated. Truncating a 10KB string that happens to be an SMTP reply
 * still keeps its first 40 characters, which is exactly the part that would name an
 * address. A null costs a diagnostic; a leak costs the promise on /privacy.
 */

const MAX_CODE_LENGTH = 40;
// Node/system codes are [A-Z_]+ and SMTP verbs are [A-Z ]+; anything carrying an
// address, a URL or markup fails these and is dropped whole.
const CODE_SHAPE = /^[A-Z][A-Z0-9_. -]*$/;
const COMMAND_SHAPE = /^[A-Z][A-Z. -]*$/;
// Cloudflare-supplied identifiers (an action name, a siteverify error code) arrive in
// lower case and carry no spaces, so the shape is tighter than the one above: it cannot
// express an email address, a URL or a tag, which is the whole point.
const TOKEN_SHAPE = /^[A-Za-z0-9._-]{1,40}$/;
const MAX_LIST_ITEMS = 8;

const NETWORK_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ESOCKET', 'ECONNCLOSED']);
const TLS_CODES = new Set(['EPROTO', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT']);

function boundedCode(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_CODE_LENGTH) return null;
  return CODE_SHAPE.test(trimmed) ? trimmed : null;
}

function boundedCommand(value) {
  if (typeof value !== 'string') return null;
  const upper = value.trim().toUpperCase();
  if (upper.length === 0 || upper.length > MAX_CODE_LENGTH) return null;
  return COMMAND_SHAPE.test(upper) ? upper : null;
}

// Accepted as a number or a numeric string because SMTP libraries disagree about
// which they emit; either way it must be a plausible reply code, not arbitrary text.
function boundedSmtpCode(value) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (typeof value === 'boolean' || !Number.isInteger(numeric)) return null;
  return numeric >= 400 && numeric <= 599 ? numeric : null;
}

function classify(smtpCode, nodeCode) {
  if (nodeCode === 'EAUTH' || smtpCode === 535) return 'auth';
  if (NETWORK_CODES.has(nodeCode)) return 'network';
  if (TLS_CODES.has(nodeCode)) return 'tls';
  if (smtpCode !== null) return 'rejected';
  return 'unknown';
}

/**
 * Reduce an unknown thrown value to a fixed, non-echoing shape. Safe to call with
 * anything: null, a string, a number, or an object with throwing getters.
 */
export function describeSendFailure(error) {
  let nodeCode = null;
  let smtpCode = null;
  let command = null;
  let sawServerReply = false;

  if (error && typeof error === 'object') {
    try {
      nodeCode = boundedCode(error.code);
      smtpCode = boundedSmtpCode(error.responseCode);
      command = boundedCommand(error.command);
      sawServerReply = typeof error.response === 'string' && error.response.trim().length > 0;
    } catch {
      // A getter that throws is a reason to log less, not to fail the response.
      return { reason: 'unknown', nodeCode: null, smtpCode: null, command: null, sawServerReply: false };
    }
  }

  return {
    reason: classify(smtpCode, nodeCode),
    nodeCode,
    smtpCode,
    command,
    sawServerReply,
  };
}

/**
 * A bounded token from a third party's response — a Turnstile action name or one of
 * Cloudflare's siteverify error codes. Their documented values all fit this shape;
 * anything that does not is dropped rather than shortened, because the part that does
 * not fit is exactly the part worth reading.
 */
export function boundedToken(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && TOKEN_SHAPE.test(trimmed) ? trimmed : null;
}

/** A bounded list of bounded tokens. Non-arrays become empty rather than throwing. */
export function boundedList(value, max = MAX_LIST_ITEMS) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map(boundedToken).filter(Boolean);
}

/**
 * Summarise a failed outbound request (fetch to siteverify). undici wraps the system
 * error one level down in `cause`, which is where the useful code lives.
 */
export function describeRequestFailure(error) {
  let nodeCode = null;
  if (error && typeof error === 'object') {
    try {
      nodeCode = boundedCode(error.code) ?? boundedCode(error.cause?.code);
    } catch {
      nodeCode = null;
    }
  }
  const reason = NETWORK_CODES.has(nodeCode) ? 'network' : TLS_CODES.has(nodeCode) ? 'tls' : 'unknown';
  return { reason, nodeCode };
}

/**
 * Summarise an HTTP response when its body could not be parsed. Only the status is
 * lifted: headers and body text belong to whoever answered, and a proxy error page is
 * not something to write into a retained log.
 */
export function describeHttpResponse(response) {
  let status = null;
  try {
    const raw = response?.status;
    if (Number.isInteger(raw) && raw >= 100 && raw <= 599) status = raw;
  } catch {
    status = null;
  }
  return { status };
}
