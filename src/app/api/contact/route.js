import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  CONTACT_LIMITS,
  escapeHtml,
  formatMessageForHtmlEmail,
  isValidEmail,
  parseContactRequest,
} from '../../../lib/contact-security';
import { verifyTurnstileToken } from '../../../lib/turnstile';
import { describeSendFailure } from '../../../lib/contact-diagnostics';

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

/**
 * Per-instance only: on serverless each cold instance keeps its own Map, so an
 * attacker spreading across enough concurrent invocations multiplies the budget.
 * It stays anyway, because it is the only layer that can answer with a real 429,
 * a Retry-After header and a JSON body this form knows how to render.
 *
 * In front of it, verified against the deployed site: Vercel's Attack Challenge Mode
 * intercepts clients it cannot recognise on /api/contact before the function runs at
 * all, answering HTML at 429 — which is why the client parses the response
 * defensively rather than assuming JSON. A WAF rate-limit rule would add a coarse
 * per-region ceiling ahead of both; a shared store such as Upstash is the only exact
 * fix, and is not warranted at this traffic level against an endpoint already gated
 * by Turnstile (fail-closed on action), an origin check and the edge challenge.
 */
const rateLimitStore = new Map();

function buildConfiguredOrigins() {
  const hosts = new Set();
  for (const entry of (process.env.CONTACT_ALLOWED_ORIGINS || '').split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      hosts.add(new URL(trimmed).host.toLowerCase());
    } catch {
      console.warn('Ignoring malformed CONTACT_ALLOWED_ORIGINS entry:', trimmed);
    }
  }
  return hosts;
}

const CONFIGURED_ORIGINS = buildConfiguredOrigins();

/**
 * When an allowlist is configured it becomes the only trust anchor. Seeding it from
 * the request's own Host header made the check self-referential, since both headers
 * are attacker-supplied in a raw request. With nothing configured we still fall back
 * to Host so local development works.
 */
function getAllowedHosts(request) {
  if (CONFIGURED_ORIGINS.size) return CONFIGURED_ORIGINS;

  const hosts = new Set();
  const requestHost = request.headers.get('host');
  if (requestHost) hosts.add(requestHost.toLowerCase());
  return hosts;
}

function isTrustedBrowserOrigin(request) {
  const allowedHosts = getAllowedHosts(request);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  for (const value of [origin, referer]) {
    if (!value) continue;
    try {
      if (allowedHosts.has(new URL(value).host.toLowerCase())) return true;
    } catch {
      // Ignore malformed headers.
    }
  }

  return false;
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

/**
 * The leftmost X-Forwarded-For entry is written by the client, so reading it first
 * lets an attacker rotate the header and dodge the limiter. Our edge always appends
 * the true peer address as the last hop, so take that one instead.
 *
 * X-Real-IP is deliberately not consulted: with no reverse proxy in front of the
 * process it is 100% client-supplied, so honouring it would reintroduce the same
 * bypass. Collapsing unidentified clients onto one shared bucket is the safe
 * direction to fail — Vercel always sets X-Forwarded-For, so it never happens here.
 */
function getClientIp(request) {
  const chain = request.headers.get('x-forwarded-for');
  const hops = chain ? chain.split(',').map((hop) => hop.trim()).filter(Boolean) : [];
  return (hops.at(-1) || 'unknown').slice(0, 64);
}

function getContactRecipient() {
  const recipient = (process.env.EMAIL_TO || process.env.EMAIL_USER || '').trim();
  if (!isValidEmail(recipient)) return null;
  return recipient;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimitStore.set(ip, { start: now, count: 1 });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

if (typeof globalThis.__rateLimitCleanup === 'undefined') {
  globalThis.__rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore) {
      if (now - entry.start > RATE_WINDOW_MS) rateLimitStore.delete(ip);
    }
  }, RATE_WINDOW_MS * 2);
}

export async function GET() {
  return methodNotAllowed();
}

export async function HEAD() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return methodNotAllowed();
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.toLowerCase().includes('multipart/')) {
      return NextResponse.json({ error: 'File uploads are not allowed' }, { status: 415 });
    }
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    if (!isTrustedBrowserOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > CONTACT_LIMITS.body) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    const ip = getClientIp(request);

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    let body;
    try {
      const rawText = await request.text();
      if (rawText.length > CONTACT_LIMITS.body) {
        return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
      }
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const captcha = await verifyTurnstileToken(body.turnstileToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.error, code: captcha.code },
        { status: 403 }
      );
    }

    const parsed = parseContactRequest(body);

    if (!parsed.ok) {
      if (parsed.honeypot) {
        return NextResponse.json(
          { success: true, message: 'Your message has been sent successfully!' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: parsed.error, ...(parsed.field ? { field: parsed.field } : {}) },
        { status: parsed.status }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const recipient = getContactRecipient();
    if (!recipient || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Contact mail is not configured.');
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessageHtml = formatMessageForHtmlEmail(message);
    const safeMessageText = message.replace(/\r\n/g, '\n');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Recorded in the message itself: Article 7(1) puts the burden of proving
    // consent on the controller, and a line in the email is the only record a
    // solo inbox with no database can realistically keep.
    const consentAt = new Date().toISOString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: [
        'New message from your portfolio',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        `Consent to store and reply: given (${consentAt})`,
        '',
        'Message:',
        safeMessageText,
      ].join('\n'),
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Consent to store and reply:</strong> given (${consentAt})</p>
        <hr/>
        <h3>Message:</h3>
        <p>${safeMessageHtml}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    // This catch wraps the whole handler, so `error` may come from nodemailer, from
    // the SMTP server's reply text, or from a bug in the code above — and the scope
    // it is thrown in holds the visitor's name, address, subject and message. Logged
    // as an object that reaches the platform's retained function logs verbatim, so
    // only the bounded summary from describeSendFailure() is passed. See that file
    // for why over-long values are dropped rather than truncated.
    console.error('[contact] handler failed', describeSendFailure(error));
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
