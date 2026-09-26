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

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

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
 */
function getClientIp(request) {
  const chain = request.headers.get('x-forwarded-for');
  if (chain) {
    const hops = chain.split(',').map((hop) => hop.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1].slice(0, 64);
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim().slice(0, 64);

  return 'unknown';
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
        '',
        'Message:',
        safeMessageText,
      ].join('\n'),
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
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
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
