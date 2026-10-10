const path = require('path');

/** @type {import('next').NextConfig} */
// CSP is NOT set here: it carries a per-request nonce, so it lives in src/proxy.js.
// Every other header below is static and stays.
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: path.join(__dirname),
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // interest-cohort was dropped with FLOC, so listing it only revokes a
            // permission no browser still recognises.
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
      {
        // Google documents X-Robots-Tag as valid on image files, and this is the only
        // instruction that travels with the photo itself rather than with a page. The path
        // is deliberately NOT disallowed in robots.txt: a blocked URL is never fetched, so
        // the crawler would never see this header, and Google cannot honour noindex on a
        // file it has not read.
        source: '/image/borjian.jpg',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, noimageindex' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
