export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
  body: 10_000,
};

const ALLOWED_FIELDS = new Set(['name', 'email', 'subject', 'message', 'website', 'turnstileToken']);
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** RFC 5321-style mailbox: local@domain with no display name or whitespace. */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const NAME_REGEX = /^[\p{L}\p{M}\s'.,-]+$/u;

const SUBJECT_REGEX = /^[\p{L}\p{M}\p{N}\p{P}\p{Zs}]+$/u;

const SUSPICIOUS_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i,
  /<\?php/i,
  /<%/,
];

/**
 * Normalize Unicode to NFC so visually identical inputs compare consistently.
 */
export function normalizeUnicode(value) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC');
}

/**
 * Reject CR/LF and Unicode line/paragraph separators used in header-splitting attacks.
 */
export function hasHeaderInjection(value) {
  return /[\r\n\u2028\u2029]/.test(value);
}

export function stripControlCharacters(value, { allowNewlines = false } = {}) {
  if (typeof value !== 'string') return '';

  let result = '';
  for (const char of value) {
    const code = char.charCodeAt(0);

    if (code === 0) continue;

    if (allowNewlines && (char === '\n' || char === '\r' || char === '\t')) {
      result += char;
      continue;
    }

    if (code < 32 || code === 127) continue;

    result += char;
  }

  return result;
}

export function containsSuspiciousContent(value) {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(value));
}

export function escapeHtml(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\0/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

export function formatMessageForHtmlEmail(message) {
  return escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>');
}

export function isValidName(value) {
  const normalized = normalizeUnicode(value).trim();
  if (!normalized) return false;
  if (normalized.length > CONTACT_LIMITS.name) return false;
  if (hasHeaderInjection(normalized)) return false;
  if (containsSuspiciousContent(normalized)) return false;
  return NAME_REGEX.test(normalized);
}

export function isValidEmail(value) {
  const normalized = normalizeUnicode(value).trim();
  if (!normalized) return false;
  if (normalized.length > CONTACT_LIMITS.email) return false;
  if (hasHeaderInjection(normalized)) return false;
  if (/\s/.test(normalized)) return false;
  if (normalized.includes('..')) return false;
  return EMAIL_REGEX.test(normalized);
}

export function isValidSubject(value) {
  const normalized = normalizeUnicode(value).trim();
  if (!normalized) return false;
  if (normalized.length > CONTACT_LIMITS.subject) return false;
  if (hasHeaderInjection(normalized)) return false;
  if (containsSuspiciousContent(normalized)) return false;
  return SUBJECT_REGEX.test(normalized);
}

export function isValidMessage(value) {
  const normalized = normalizeUnicode(value).trim();
  if (!normalized) return false;
  if (normalized.length > CONTACT_LIMITS.message) return false;
  if (containsSuspiciousContent(normalized)) return false;

  const cleaned = stripControlCharacters(normalized, { allowNewlines: true });
  return cleaned.trim().length > 0;
}

export function validateContactField(field, value) {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Name is required.';
      if (!isValidName(value)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
      }
      return '';
    case 'email':
      if (!value.trim()) return 'Email is required.';
      if (!isValidEmail(value)) return 'Please enter a valid email address.';
      return '';
    case 'subject':
      if (!value.trim()) return 'Subject is required.';
      if (value.length > CONTACT_LIMITS.subject) {
        return `Subject must be ${CONTACT_LIMITS.subject} characters or fewer.`;
      }
      if (!isValidSubject(value)) {
        return 'Subject contains unsupported or unsafe characters.';
      }
      return '';
    case 'message':
      if (!value.trim()) return 'Message is required.';
      if (value.length > CONTACT_LIMITS.message) {
        return `Message must be ${CONTACT_LIMITS.message.toLocaleString()} characters or fewer.`;
      }
      if (!isValidMessage(value)) {
        return 'Message contains unsupported or unsafe content.';
      }
      return '';
    default:
      return '';
  }
}

/**
 * Parse and validate an incoming contact payload.
 * Returns sanitized strings safe for HTML email rendering and SMTP headers.
 */
export function parseContactRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'Invalid request body' };
  }

  const bodyKeys = Object.keys(body);
  if (
    bodyKeys.length > ALLOWED_FIELDS.size ||
    bodyKeys.some((key) => FORBIDDEN_KEYS.has(key) || !ALLOWED_FIELDS.has(key))
  ) {
    return { ok: false, status: 400, error: 'Unexpected fields in request' };
  }

  const { name, email, subject, message, website, turnstileToken: _turnstileToken } = body;

  if (website) {
    return { ok: false, status: 200, honeypot: true };
  }

  if (!name || !email || !subject || !message) {
    return { ok: false, status: 400, error: 'All fields are required.' };
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string'
  ) {
    return { ok: false, status: 400, error: 'Invalid input types' };
  }

  const fields = { name, email, subject, message };
  for (const [field, value] of Object.entries(fields)) {
    const error = validateContactField(field, value);
    if (error) {
      return { ok: false, status: 400, error, field };
    }
  }

  const sanitized = {
    name: stripControlCharacters(normalizeUnicode(name).trim()),
    email: normalizeUnicode(email).trim().toLowerCase(),
    subject: stripControlCharacters(normalizeUnicode(subject).trim()),
    message: stripControlCharacters(normalizeUnicode(message).trim(), { allowNewlines: true }),
  };

  return { ok: true, data: sanitized };
}
