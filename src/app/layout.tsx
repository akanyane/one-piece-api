import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "./globals.css";

import { Fraunces, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const DESCRIPTION =
  "REST API for One Piece characters, images, and canonical series data.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "One Piece API", template: "%s · One Piece API" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "One Piece API",
    title: "One Piece API",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "One Piece API",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans", outfit.variable, fraunces.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="box-border min-h-dvh">{children}</div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
