import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CharacterNotFound() {
  return (
    <div
      className={cn(
        "surface-story relative flex min-h-[calc(100dvh-theme(spacing.14))] flex-col overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link
            className="flex items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
            href="/"
          >
            <LogoMark />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            <Users data-icon="inline-start" />
            Characters
          </Button>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center md:px-8">
        <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
          Catalog
        </p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Character not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This id is not in the database, or the link may be wrong.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            <Users data-icon="inline-start" />
            All characters
          </Button>
          <Button
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
          >
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>
        </div>
      </main>
    </div>
  );
}
