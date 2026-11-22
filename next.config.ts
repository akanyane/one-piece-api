import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No nonces: keeps pages static/cacheable. React needs 'unsafe-eval' only in dev.
// Vercel Analytics / Speed Insights load and report via same-origin /_vercel/*.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://hlryizauzapedkefdviw.supabase.co",
  "font-src 'self'",
  "connect-src 'self'",
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
    return [
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
