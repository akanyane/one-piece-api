import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
