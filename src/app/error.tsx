"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={cn(
        "surface-story relative flex min-h-[calc(100dvh-theme(spacing.14))] flex-col overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 md:px-8">
          <Link
            className="flex items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
            href="/"
          >
            <LogoMark />
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-16 md:px-8">
        <Card className="border-destructive/30 bg-card/90">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error stopped this page from loading. Try again, or
              head back home.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={reset}>
              <RotateCcw data-icon="inline-start" />
              Try again
            </Button>
            <Button
              className="rounded-full"
              variant="outline"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Home
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
