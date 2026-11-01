import { ArrowLeft, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Character not found",
};

export default function CharacterNotFound() {
  return (
    <div
      className={cn(
        "surface-story relative flex min-h-[calc(100dvh-theme(spacing.14))] flex-col overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <SiteHeader />
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
            className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            <Users data-icon="inline-start" />
            All characters
          </Button>
          <Button
            className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
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
