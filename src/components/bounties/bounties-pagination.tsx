import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  type BountyFilter,
  type BountySort,
  buildBountiesListHref,
} from "@/lib/bounties-catalog-url";

const LIMIT_OPTIONS = [12, 24, 36] as const;

export type { BountyFilter, BountySort };

export function BountiesPagination({
  page,
  limit,
  resultCount,
  filter,
  sort,
}: {
  page: number;
  limit: number;
  resultCount: number;
  filter: BountyFilter;
  sort: BountySort;
}) {
  const hasPrev = page > 1;
  const hasNext = resultCount >= limit;
  const href = (p: number, l = limit, f = filter, s = sort) =>
    buildBountiesListHref({ page: p, limit: l, filter: f, sort: s });

  return (
    <nav
      aria-label="Bounty list pagination"
      className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:p-5"
    >
      <p className="text-center text-sm text-muted-foreground md:text-left">
        <span className="font-medium text-foreground">Page {page}</span>
        {resultCount > 0 ? (
          <>
            {" "}
            · showing{" "}
            <span className="font-medium text-foreground">{resultCount}</span>{" "}
            {resultCount === 1 ? "bounty" : "bounties"}
          </>
        ) : (
          <> · no results</>
        )}
      </p>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="sr-only">Results per page</span>
          {LIMIT_OPTIONS.map((l) => (
            <Button
              key={l}
              className="rounded-full"
              nativeButton={false}
              render={<Link href={href(1, l)} />}
              size="sm"
              variant={l === limit ? "default" : "outline"}
            >
              {l} per page
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {hasPrev ? (
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href={href(page - 1)} />}
              size="sm"
              variant="outline"
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
          ) : (
            <Button
              className="rounded-full"
              disabled
              size="sm"
              variant="outline"
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
          )}
          {hasNext ? (
            <Button
              className="rounded-full"
              nativeButton={false}
              render={<Link href={href(page + 1)} />}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              className="rounded-full"
              disabled
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export function BountyFilterTabs({
  filter,
  limit,
  sort,
}: {
  filter: BountyFilter;
  limit: number;
  sort: BountySort;
}) {
  const tabs: { key: BountyFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  return (
    <div
      aria-label="Filter bounties by status"
      className="flex flex-wrap gap-1.5 rounded-full border border-border/80 bg-card/85 p-1 shadow-sm backdrop-blur-md"
      role="tablist"
    >
      {tabs.map(({ key, label }) => (
        <Button
          key={key}
          className="rounded-full"
          nativeButton={false}
          render={
            <Link
              href={buildBountiesListHref({
                page: 1,
                limit,
                filter: key,
                sort,
              })}
              role="tab"
            />
          }
          size="sm"
          variant={filter === key ? "default" : "ghost"}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

export function BountySortTabs({
  sort,
  limit,
  filter,
}: {
  sort: BountySort;
  limit: number;
  filter: BountyFilter;
}) {
  const tabs: { key: BountySort; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "high", label: "Highest" },
    { key: "low", label: "Lowest" },
  ];

  return (
    <div
      aria-label="Sort bounties"
      className="flex flex-wrap gap-1.5 rounded-full border border-border/80 bg-card/85 p-1 shadow-sm backdrop-blur-md"
      role="tablist"
    >
      {tabs.map(({ key, label }) => (
        <Button
          key={key}
          className="rounded-full"
          nativeButton={false}
          render={
            <Link
              href={buildBountiesListHref({
                page: 1,
                limit,
                filter,
                sort: key,
              })}
              role="tab"
            />
          }
          size="sm"
          variant={sort === key ? "default" : "ghost"}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
