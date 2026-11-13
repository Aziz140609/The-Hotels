import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const devConnectSources = isDev
  ? ' ws: wss: https://*.ngrok-free.dev wss://*.ngrok-free.dev https://*.ngrok.io wss://*.ngrok.io'
  : '';

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://app.sandbox.midtrans.com https://app.midtrans.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://*.midtrans.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://*.midtrans.com${devConnectSources}`,
  "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: csp },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '*.ngrok-free.dev',
    '*.ngrok.io',
    '*.ngrok.app',
    'mooing-awoke-chili.ngrok-free.dev',
  ],
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
