import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  CONTACT_LIMITS,
  escapeHtml,
  formatMessageForHtmlEmail,
  parseContactRequest,
} from '../../../lib/contact-security';
import { verifyTurnstileToken } from '../../../lib/turnstile';

const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 3;

const rateLimitStore = new Map();

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
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > CONTACT_LIMITS.body) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
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
      to: 'amirhadib79@gmail.com',
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
