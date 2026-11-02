import type { Metadata } from "next";
import Link from "next/link";

import {
  type ApiCharacter,
  CharacterCard,
} from "@/components/characters/character-card";
import { CharactersCatalogToolbar } from "@/components/characters/characters-catalog-toolbar";
import { CharactersPagination } from "@/components/characters/characters-pagination";
import { Reveal } from "@/components/fx/reveal";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayCharacterName } from "@/lib/character-name";
import {
  type AgeBand,
  buildCharactersListHref,
  parseAgeBand,
  parseNameQuery,
} from "@/lib/characters-catalog-url";
import { getCharacters } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const TITLE = "Characters";
const DESCRIPTION = "Browse characters from the One Piece API.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/characters" },
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

const LIMIT_OPTIONS = new Set([12, 24, 36]);

async function fetchCharacters(
  page: number,
  limit: number,
  q: string,
  ageBand: AgeBand,
): Promise<
  { ok: true; data: ApiCharacter[]; count: number | null } | { ok: false }
> {
  try {
    const { data, count } = await getCharacters({
      page,
      limit,
      q,
      ageBand,
      portraitsFirst: true,
    });
    return { ok: true, data: data as ApiCharacter[], count };
  } catch {
    return { ok: false };
  }
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
      <PageBackdrop />

      <SiteHeader />

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
                className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
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
                className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
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
                  className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
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
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: result.data.map((character, index) => ({
                  "@type": "ListItem",
                  position: (page - 1) * limit + index + 1,
                  url: `${SITE_URL}/characters/${character.id}`,
                  name: displayCharacterName(character.name),
                })),
              }}
            />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
              {result.data.map((character, i) => (
                <li key={character.id}>
                  <Reveal className="h-full" index={i}>
                    <CharacterCard
                      character={character}
                      index={i}
                      priority={i < 4}
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <CharactersPagination
                ageBand={ageBand}
                count={result.count}
                limit={limit}
                page={page}
                q={q}
                resultCount={result.data.length}
              />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
