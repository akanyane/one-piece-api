import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "./globals.css";

import { Fraunces, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "One Piece API",
  description:
    "REST API for One Piece characters, images, and canonical series data.",
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
          <div
            role="status"
            aria-live="polite"
            className="fixed top-0 right-0 left-0 z-10000 border-b border-amber-400/80 bg-amber-100 px-4 py-2 text-center text-[0.8125rem] leading-snug text-amber-950 shadow-[0_1px_0_oklch(0.75_0.12_75/0.5)] dark:border-amber-700 dark:bg-amber-950 dark:text-amber-50 dark:shadow-none"
          >
            <span className="font-semibold">In development</span>
            <span className="text-amber-900/90 dark:text-amber-100/90">
              {" "}
              — not finished yet; the API and site are coming soon.
            </span>
          </div>
          {/* pt-14 = spacing for fixed banner; min-h-dvh on this box (border-box) = one viewport tall incl. padding */}
          <div className="box-border min-h-dvh pt-14">{children}</div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
