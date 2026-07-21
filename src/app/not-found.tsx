import { ArrowLeft, BookOpen, Cherry, Coins, Users } from "lucide-react";
import Link from "next/link";

import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "surface-story relative flex min-h-[calc(100dvh-theme(spacing.14))] flex-col overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 grain-overlay opacity-60 mix-blend-multiply"
      />
      <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-4 md:gap-4 md:px-8">
          <Link
            className="flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
            href="/"
          >
            <LogoMark />
            <span className="hidden font-display text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              API
            </span>
          </Link>
          <CatalogNav>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/characters" />}
            >
              <Users data-icon="inline-start" />
              Characters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/devil-fruits" />}
            >
              <Cherry data-icon="inline-start" />
              Devil fruits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/bounties" />}
            >
              <Coins data-icon="inline-start" />
              Bounties
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/documentation" />}
            >
              <BookOpen data-icon="inline-start" />
              Docs
            </Button>
          </CatalogNav>
          <ThemeToggle />
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center md:px-8">
        <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page doesn&apos;t exist, or the link may be wrong.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button
            className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>
          <Button
            className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
            nativeButton={false}
            render={<Link href="/characters" />}
            variant="outline"
          >
            <Users data-icon="inline-start" />
            Characters
          </Button>
        </div>
      </main>
    </div>
  );
}
