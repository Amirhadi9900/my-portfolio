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
  if (['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ESOCKET', 'ECONNCLOSED'].includes(nodeCode)) {
    return 'network';
  }
  if (nodeCode === 'EPROTO' || nodeCode === 'SELF_SIGNED_CERT_IN_CHAIN' || nodeCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    return 'tls';
  }
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
