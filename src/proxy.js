import { NextResponse } from 'next/server';

/**
 * Content-Security-Policy is generated per request here rather than in
 * next.config.js, because script-src now carries a nonce.
 *
 * A nonce has to be unpredictable and unique per request, and Next only applies it
 * to its own inline bootstrap scripts while server-rendering. That is what buys the
 * actual XSS backstop: with 'unsafe-inline' gone, an injected <script> is refused by
 * the browser even if every layer of escaping above it fails at once. The price is
 * that pages can no longer be prerendered — see the connection() calls in
 * src/app/page.js and src/app/privacy/page.js.
 */
const CSP_DIRECTIVES = (nonce, isDev) => [
  "default-src 'self'",
  // 'unsafe-inline' deliberately absent. Cloudflare and Vercel hosts stay listed
  // because their scripts are fetched cross-origin, not carried by the nonce.
  `script-src ${[
    "'self'",
    `'nonce-${nonce}'`,
    'https://challenges.cloudflare.com',
    'https://va.vercel-scripts.com',
    // Turbopack's dev overlay needs eval; a production bundle does not.
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(' ')}`,
  // Stays 'unsafe-inline': a nonce covers <style> elements and Next's own style
  // tags, not `style="..."` attributes. Eleven of those are load-bearing — the
  // honeypot is hidden by one, and the hero's animated layers set custom
  // properties through another. Noncing style-src would show the honeypot field
  // and flatten the hero.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://flagcdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://va.vercel-scripts.com",
  "frame-src 'self' https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  'upgrade-insecure-requests',
];

export function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = CSP_DIRECTIVES(nonce, process.env.NODE_ENV === 'development').join('; ');

  // The request copy is what Next reads when it stamps the nonce onto its own
  // inline scripts during server rendering; the response copy is what the browser
  // enforces. Both have to carry the identical string.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    {
      // JSON responses need no document policy, and hashed static chunks are
      // never the thing an HTML injection would land in. favicon.ico is listed even
      // though the favicon is src/app/icon.svg: browsers and bots still request the
      // legacy path, and each 404 would otherwise burn a proxy invocation to mint a
      // nonce nobody reads.
      source: '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|\\.well-known/.*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
