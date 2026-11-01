import type { Metadata } from "next";
import localFont from "next/font/local";

import { SITE_URL } from "@/lib/site";
import { PlaygroundClient } from "./playground-client";

// Self-hosted (latin, variable 400–700): fetching it through next/font/google
// broke Vercel's Turbopack build ("next/font/google queries have exactly one entry").
const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 700",
  variable: "--font-pg-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const TITLE = "Playground";
const DESCRIPTION =
  "Send live requests to the One Piece API endpoints and inspect the response, right in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/playground" },
  openGraph: {
    type: "website",
    siteName: "One Piece API",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PlaygroundPage() {
  return (
    <div className={`pg-surface min-h-dvh ${jetbrainsMono.variable}`}>
      <div className="grain-overlay pointer-events-none fixed inset-0 z-20 opacity-50" />
      <PlaygroundClient siteUrl={SITE_URL} />
    </div>
  );
}
