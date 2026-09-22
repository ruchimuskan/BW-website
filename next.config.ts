import type { NextConfig } from "next";

const PRODUCTION_BACKEND_URL = "https://api.bullwaverides.com";

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  PRODUCTION_BACKEND_URL;

let backendHostname = "api.bullwaverides.com";
let apiOrigin = "https://api.bullwaverides.com";
let apiWsOrigin = "wss://api.bullwaverides.com";
try {
  const parsed = new URL(backendUrl);
  backendHostname = parsed.hostname;
  apiOrigin = parsed.origin;
  apiWsOrigin = `${parsed.protocol === "https:" ? "wss:" : "ws:"}//${parsed.host}`;
} catch {
  // Keep default hostname if BACKEND_URL is malformed.
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https: http://127.0.0.1:8000 http://localhost:8000",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
  `connect-src 'self' ${apiOrigin} ${apiWsOrigin} http://127.0.0.1:8000 http://localhost:8000 ws://127.0.0.1:8000 ws://localhost:8000 https://*.razorpay.com https://*.amazonaws.com https://images.unsplash.com`,
  "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(self), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async headers() {
    const longCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
    ];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Fast image delivery for every public asset folder shipped in the zip.
      { source: "/images/:path*", headers: longCache },
      { source: "/gallery/:path*", headers: longCache },
      { source: "/landing/:path*", headers: longCache },
      { source: "/brand/:path*", headers: longCache },
      { source: "/icons/:path*", headers: longCache },
      { source: "/media/:path*", headers: longCache },
      { source: "/assets/:path*", headers: longCache },
      { source: "/static/:path*", headers: longCache },
      {
        source:
          "/:file(favicon.png|icon.png|icon-192.png|icon-512.png|apple-touch-icon.png|bwride.png)",
        headers: longCache,
      },
    ];
  },
  images: {
    // Serve public assets as static files. The /_next/image optimizer 404s on
    // many hosts and is why photos look fine locally but vanish in production.
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 70, 75, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: "https",
        hostname: backendHostname,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.bullwaverides.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${backendUrl}/api/v1/common/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
