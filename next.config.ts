import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Vercel injects its toolbar (vercel.live) into preview deployments only.
const toolbar = process.env.VERCEL_ENV === "preview";

// No nonces: keeps pages static/cacheable. React needs 'unsafe-eval' only in dev.
// Vercel Analytics / Speed Insights load and report via same-origin /_vercel/*.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${toolbar ? " https://vercel.live" : ""}`,
  `style-src 'self' 'unsafe-inline'${toolbar ? " https://vercel.live" : ""}`,
  `img-src 'self' blob: data: https://hlryizauzapedkefdviw.supabase.co${toolbar ? " https://vercel.live https://vercel.com" : ""}`,
  `font-src 'self'${toolbar ? " https://vercel.live https://assets.vercel.com" : ""}`,
  `connect-src 'self'${toolbar ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  `frame-src 'self'${toolbar ? " https://vercel.live" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    // Images are already webp on Supabase's CDN. Vercel's optimizer quota ran
    // out (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED), which broke every
    // portrait on the site, so serve the stored files as-is.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hlryizauzapedkefdviw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // Public, read-only, unauthenticated data: any site may call it from the browser.
    const cors = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, HEAD, OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type" },
      { key: "Access-Control-Max-Age", value: "86400" },
    ];
    return [
      { source: "/api/:path*", headers: cors },
      { source: "/openapi.json", headers: cors },
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
