import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import { SITE_URL } from "@/lib/site";
import { PlaygroundClient } from "./playground-client";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-pg-mono",
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
