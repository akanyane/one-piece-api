import { ArrowLeft, BookOpen, Cherry, Coins, Users } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import {
  type ApiCharacter,
  CharacterCard,
} from "@/components/characters/character-card";
import { CharactersCatalogToolbar } from "@/components/characters/characters-catalog-toolbar";
import { CharactersPagination } from "@/components/characters/characters-pagination";
import { CatalogNav } from "@/components/layout/catalog-nav";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AgeBand,
  buildCharactersListHref,
  parseAgeBand,
  parseNameQuery,
} from "@/lib/characters-catalog-url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Characters",
  description: "Browse characters from the One Piece API.",
};

const LIMIT_OPTIONS = new Set([12, 24, 36]);

async function fetchCharacters(
  page: number,
  limit: number,
  q: string,
  ageBand: AgeBand,
): Promise<{ ok: true; data: ApiCharacter[] } | { ok: false }> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set("q", q);
  if (ageBand !== "all") params.set("ageBand", ageBand);
  const url = `${proto}://${host}/api/characters?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { ok: false };
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return { ok: false };
  return { ok: true, data: data as ApiCharacter[] };
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    ageBand?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  const rawLimit = Number(sp.limit);
  const limit = LIMIT_OPTIONS.has(rawLimit) ? rawLimit : 12;
  const q = parseNameQuery(sp.q);
  const ageBand = parseAgeBand(sp.ageBand);

  const result = await fetchCharacters(page, limit, q, ageBand);

  const retryHref = buildCharactersListHref({
    page: 1,
    limit,
    q,
    ageBand,
  });

  const firstPageHref = buildCharactersListHref({
    page: 1,
    limit: 12,
    q,
    ageBand,
  });

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
        className="pointer-events-none absolute right-0 bottom-0 size-[min(80vw,420px)] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.55_0.12_220)_22%,transparent),transparent_70%)] blur-3xl"
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
              variant="default"
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
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-8 max-w-2xl space-y-3 md:mb-10">
          <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
            Grand Line · Catalog
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            Characters
          </h1>
          <p className="text-pretty text-sm/relaxed text-muted-foreground md:text-base/relaxed">
            Filter by age, search localized names, and paginate. URLs keep your
            filters so you can share a view.
          </p>
        </div>

        <CharactersCatalogToolbar ageBand={ageBand} limit={limit} q={q} />

        {!result.ok ? (
          <Card className="border-destructive/30 bg-card/90">
            <CardHeader>
              <CardTitle>Could not load characters</CardTitle>
              <CardDescription>
                The API did not return data. Try again in a moment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="rounded-full"
                variant="outline"
                nativeButton={false}
                render={<Link href={retryHref} />}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : result.data.length === 0 ? (
          <Card className="bg-card/90">
            <CardHeader>
              <CardTitle>No characters match</CardTitle>
              <CardDescription>
                Try another search, age range, or go back to the full list.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                nativeButton={false}
                render={
                  <Link
                    href={buildCharactersListHref({
                      page: 1,
                      limit: 12,
                      q: "",
                      ageBand: "all",
                    })}
                  />
                }
              >
                Clear filters
              </Button>
              {page > 1 ? (
                <Button
                  className="rounded-full"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={firstPageHref} />}
                >
                  First page
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.data.map((character) => (
                <li key={character.id}>
                  <CharacterCard character={character} className="h-full" />
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CharactersPagination
                ageBand={ageBand}
                limit={limit}
                page={page}
                q={q}
                resultCount={result.data.length}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
