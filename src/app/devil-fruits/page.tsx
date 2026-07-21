import { ArrowLeft, BookOpen, Cherry, Coins, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  type ApiDevilFruitRow,
  DevilFruitCard,
} from "@/components/devil-fruits/devil-fruit-card";
import { DevilFruitsPagination } from "@/components/devil-fruits/devil-fruits-pagination";
import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDevilFruits } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Devil fruits",
  description: "Browse devil fruits from the One Piece API.",
  alternates: { canonical: "/devil-fruits" },
};

const LIMIT_OPTIONS = new Set([12, 24, 36]);

async function fetchDevilFruits(
  page: number,
  limit: number,
): Promise<
  { ok: true; data: ApiDevilFruitRow[]; count: number | null } | { ok: false }
> {
  try {
    const { data, count } = await getDevilFruits({ page, limit });
    return { ok: true, data: data as ApiDevilFruitRow[], count };
  } catch {
    return { ok: false };
  }
}

export default async function DevilFruitsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  const rawLimit = Number(sp.limit);
  const limit = LIMIT_OPTIONS.has(rawLimit) ? rawLimit : 12;

  const result = await fetchDevilFruits(page, limit);

  return (
    <div
      className={cn(
        "surface-story relative min-h-[calc(100dvh-theme(spacing.14))] overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 grain-overlay opacity-60 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 size-[min(100vw,640px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-primary)_20%,transparent),transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[min(80vw,420px)] translate-x-1/4 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.62_0.14_145)_22%,transparent),transparent_70%)] blur-3xl"
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
              variant="default"
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

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
            Grand Line · Powers
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            Devil fruits
          </h1>
          <p className="text-pretty text-sm/relaxed text-muted-foreground md:text-base/relaxed">
            Names and models use the same localized JSON shape everywhere:{" "}
            <span className="font-mono text-[0.8125rem] text-foreground/90">
              en
            </span>
            ,{" "}
            <span className="font-mono text-[0.8125rem] text-foreground/90">
              jp
            </span>
            ,{" "}
            <span className="font-mono text-[0.8125rem] text-foreground/90">
              romaji
            </span>
            .
          </p>
        </div>

        {!result.ok ? (
          <Card className="border-destructive/30 bg-card/90">
            <CardHeader>
              <CardTitle>Could not load devil fruits</CardTitle>
              <CardDescription>
                The API did not return data. Try again in a moment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/devil-fruits?page=1&limit=${limit}`} />}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : result.data.length === 0 ? (
          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle>No devil fruits here</CardTitle>
              <CardDescription>
                This page is empty. Go back to the first page or change how many
                results you show per page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
                nativeButton={false}
                render={<Link href="/devil-fruits?page=1&limit=12" />}
              >
                First page
              </Button>
              {page > 1 ? (
                <Button
                  className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/devil-fruits?page=${page - 1}&limit=${limit}`}
                    />
                  }
                >
                  Previous page
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.data.map((fruit) => (
                <li key={fruit.id}>
                  <DevilFruitCard fruit={fruit} />
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <DevilFruitsPagination
                count={result.count}
                limit={limit}
                page={page}
                resultCount={result.data.length}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
