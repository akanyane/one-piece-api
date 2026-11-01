import type { Metadata } from "next";
import Link from "next/link";

import {
  type ApiDevilFruitRow,
  DevilFruitCard,
} from "@/components/devil-fruits/devil-fruit-card";
import { DevilFruitsPagination } from "@/components/devil-fruits/devil-fruits-pagination";
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
import { getDevilFruits } from "@/lib/data";
import { cn } from "@/lib/utils";

const TITLE = "Devil fruits";
const DESCRIPTION = "Browse devil fruits from the One Piece API.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/devil-fruits" },
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
      <PageBackdrop />

      <SiteHeader />

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
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "ItemList",
                itemListElement: result.data.map((fruit, index) => ({
                  "@type": "ListItem",
                  position: (page - 1) * limit + index + 1,
                  item: {
                    "@type": "Thing",
                    name: displayCharacterName(fruit.name),
                  },
                })),
              }}
            />
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {result.data.map((fruit, i) => (
                <li key={fruit.id}>
                  <Reveal className="h-full" index={i}>
                    <DevilFruitCard fruit={fruit} />
                  </Reveal>
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
      <SiteFooter />
    </div>
  );
}
