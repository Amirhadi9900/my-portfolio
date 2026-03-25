import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
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

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_EMAIL;
}

function isValidName(name) {
  return /^[\p{L}\p{M}\s'.,-]+$/u.test(name);
}

function hasHeaderInjection(str) {
  return /[\r\n]/.test(str);
}

export async function POST(request) {
  try {
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
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, email, subject, message, website } = body;

    if (website) {
      return NextResponse.json(
        { success: true, message: 'Your message has been sent successfully!' },
        { status: 200 }
      );
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid input types' }, { status: 400 });
    }

    if (
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      subject.length > MAX_SUBJECT ||
      message.length > MAX_MESSAGE
    ) {
      return NextResponse.json(
        { error: 'Input exceeds maximum allowed length' },
        { status: 400 }
      );
    }

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: 'Name can only contain letters, spaces, hyphens, and apostrophes', field: 'name' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address', field: 'email' },
        { status: 400 }
      );
    }

    if (hasHeaderInjection(name) || hasHeaderInjection(email) || hasHeaderInjection(subject)) {
      return NextResponse.json({ error: 'Invalid characters detected' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

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
      subject: `Portfolio Contact: ${safeSubject}`,
      html: `
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr/>
        <h3>Message:</h3>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
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
