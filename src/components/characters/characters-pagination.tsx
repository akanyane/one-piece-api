import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  type AgeBand,
  buildCharactersListHref,
} from "@/lib/characters-catalog-url";

const LIMIT_OPTIONS = [12, 24, 36] as const;

export function CharactersPagination({
  page,
  limit,
  resultCount,
  count,
  q,
  ageBand,
}: {
  page: number;
  limit: number;
  resultCount: number;
  count: number | null;
  q: string;
  ageBand: AgeBand;
}) {
  const totalPages =
    count !== null ? Math.max(1, Math.ceil(count / limit)) : null;
  const hasPrev = page > 1;
  const hasNext =
    totalPages !== null ? page < totalPages : resultCount >= limit;

  const href = (p: number, l = limit) =>
    buildCharactersListHref({ page: p, limit: l, q, ageBand });

  return (
    <nav
      aria-label="Character list pagination"
      className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between md:p-5"
    >
      <p className="text-center text-sm text-muted-foreground md:text-left">
        <span className="font-medium text-foreground">
          Page {page}
          {totalPages !== null ? ` of ${totalPages}` : ""}
        </span>
        {resultCount > 0 ? (
          <>
            {" "}
            · showing{" "}
            <span className="font-medium text-foreground">{resultCount}</span>{" "}
            {resultCount === 1 ? "character" : "characters"}
            {count !== null ? (
              <>
                {" "}
                of <span className="font-medium text-foreground">{count}</span>
              </>
            ) : null}
          </>
        ) : (
          <> · no results</>
        )}
      </p>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span
            aria-hidden
            className="hidden text-xs font-medium text-muted-foreground sm:inline"
          >
            Show
          </span>
          <span className="sr-only">Results per page</span>
          {LIMIT_OPTIONS.map((l) => (
            <Button
              key={l}
              className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
              nativeButton={false}
              render={<Link href={href(1, l)} />}
              size="sm"
              variant={l === limit ? "default" : "outline"}
            >
              {l} per page
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
          {hasPrev ? (
            <Button
              className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
              nativeButton={false}
              render={<Link href={href(page - 1, limit)} />}
              size="sm"
              variant="outline"
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
          ) : (
            <Button
              className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
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
              className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
              nativeButton={false}
              render={<Link href={href(page + 1, limit)} />}
              size="sm"
              variant="outline"
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
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
