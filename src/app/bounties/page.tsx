import type { Metadata } from "next";
import Link from "next/link";

import {
  BountiesPagination,
  BountyFilterTabs,
  BountySortTabs,
} from "@/components/bounties/bounties-pagination";
import {
  type ApiBountyRow,
  BountyCard,
} from "@/components/bounties/bounty-card";
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
import {
  type BountyFilter,
  type BountySort,
  buildBountiesListHref,
  parseBountyFilter,
  parseBountySort,
} from "@/lib/bounties-catalog-url";
import { displayCharacterName } from "@/lib/character-name";
import { getBounties } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const TITLE = "Bounties";
const DESCRIPTION = "Browse bounties from the One Piece API.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/bounties" },
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

async function fetchBounties(
  page: number,
  limit: number,
  filter: BountyFilter,
  sort: BountySort,
): Promise<
  { ok: true; data: ApiBountyRow[]; count: number | null } | { ok: false }
> {
  const isActive =
    filter === "active" ? true : filter === "inactive" ? false : undefined;
  try {
    const { data, count } = await getBounties({ page, limit, isActive, sort });
    return { ok: true, data: data as ApiBountyRow[], count };
  } catch {
    return { ok: false };
  }
}

export default async function BountiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    isActive?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.floor(Number(sp.page) || 1));
  const rawLimit = Number(sp.limit);
  const limit = LIMIT_OPTIONS.has(rawLimit) ? rawLimit : 12;
  const filter = parseBountyFilter(sp.isActive);
  const sort = parseBountySort(sp.sort);

  const result = await fetchBounties(page, limit, filter, sort);

  const retryHref = buildBountiesListHref({
    page: 1,
    limit,
    filter,
    sort,
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
        <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
              Grand Line · Rewards
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
              Bounties
            </h1>
            <p className="text-pretty text-sm/relaxed text-muted-foreground md:text-base/relaxed">
              Filter by status, sort by amount or date, and paginate through the
              dataset.
            </p>
          </div>
          <div className="flex w-full max-w-xl flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <BountySortTabs filter={filter} limit={limit} sort={sort} />
            <BountyFilterTabs filter={filter} limit={limit} sort={sort} />
          </div>
        </div>

        {!result.ok ? (
          <Card className="border-destructive/30 bg-card/90">
            <CardHeader>
              <CardTitle>Could not load bounties</CardTitle>
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
              <CardTitle>No bounties here</CardTitle>
              <CardDescription>
                Try another filter or go back to the first page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                className="rounded-full px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3"
                nativeButton={false}
                render={
                  <Link
                    href={buildBountiesListHref({
                      page: 1,
                      limit: 12,
                      filter: "all",
                      sort: "newest",
                    })}
                  />
                }
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
                      href={buildBountiesListHref({
                        page: page - 1,
                        limit,
                        filter,
                        sort,
                      })}
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
                itemListElement: result.data.map((bounty, index) => ({
                  "@type": "ListItem",
                  position: (page - 1) * limit + index + 1,
                  ...(bounty.character_id
                    ? { url: `${SITE_URL}/characters/${bounty.character_id}` }
                    : {}),
                  name: `${
                    bounty.characters?.name
                      ? displayCharacterName(bounty.characters.name)
                      : "Unknown"
                  } · ฿${bounty.amount?.toLocaleString("en-US") ?? "?"}`,
                })),
              }}
            />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
              {result.data.map((bounty, i) => (
                <li key={bounty.id}>
                  <Reveal className="h-full" index={i}>
                    <BountyCard bounty={bounty} index={i} priority={i < 4} />
                  </Reveal>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <BountiesPagination
                count={result.count}
                filter={filter}
                limit={limit}
                page={page}
                resultCount={result.data.length}
                sort={sort}
              />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
