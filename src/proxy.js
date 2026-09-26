import { NextResponse } from 'next/server'

// Generates a per-request nonce so script-src can drop 'unsafe-inline'.
// Next.js reads the nonce out of the CSP header during SSR and applies it to the
// framework's own inline bootstrap scripts, which is why app/page.js is forced
// dynamic — a statically prerendered page has no request to take a nonce from.
export function proxy(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  // 'strict-dynamic' lets the allowlisted Turnstile script inject its own children,
  // which a plain nonce list would block.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://images.unsplash.com https://cdn.simpleicons.org https://flagcdn.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://challenges.cloudflare.com;
    frame-src 'self' https://challenges.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    worker-src 'self';
    manifest-src 'self';
    media-src 'self';
    upgrade-insecure-requests;
  `

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
