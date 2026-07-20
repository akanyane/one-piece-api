import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  type AgeBand,
  buildCharactersListHref,
} from "@/lib/characters-catalog-url";
import { cn } from "@/lib/utils";

const AGE_OPTIONS: { band: AgeBand; label: string }[] = [
  { band: "all", label: "All ages" },
  { band: "0-12", label: "0–12" },
  { band: "13-17", label: "13–17" },
  { band: "18-29", label: "18–29" },
  { band: "30-59", label: "30–59" },
  { band: "60+", label: "60+" },
];

export function CharactersCatalogToolbar({
  q,
  ageBand,
  limit,
}: {
  q: string;
  ageBand: AgeBand;
  limit: number;
}) {
  const hasFilters = Boolean(q) || ageBand !== "all";
  const clearHref = buildCharactersListHref({
    page: 1,
    limit,
    q: "",
    ageBand: "all",
  });

  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10">
      <search>
        <form
          action="/characters"
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
          method="get"
        >
          <input name="page" type="hidden" value="1" />
          <input name="limit" type="hidden" value={limit} />
          {ageBand !== "all" ? (
            <input name="ageBand" type="hidden" value={ageBand} />
          ) : null}
          <div className="relative min-w-0 flex-1">
            <label className="sr-only" htmlFor="character-search">
              Search by name
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className={cn(
                "h-10 w-full rounded-full border border-border/80 bg-card/90 py-2 pr-3 pl-10 text-sm shadow-sm backdrop-blur-md",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
              )}
              defaultValue={q}
              enterKeyHint="search"
              id="character-search"
              maxLength={120}
              name="q"
              placeholder="Search by name (en / jp / romaji)…"
              type="search"
            />
          </div>
          <Button
            className="h-10 shrink-0 rounded-full px-5 sm:w-auto"
            type="submit"
            variant="secondary"
          >
            Search
          </Button>
        </form>
      </search>

      <div className="flex flex-col gap-2">
        <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Age
        </p>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {AGE_OPTIONS.map(({ band, label }) => {
            const active = ageBand === band;
            const href = buildCharactersListHref({
              page: 1,
              limit,
              q,
              ageBand: band,
            });
            return (
              <Button
                key={band}
                className="shrink-0 rounded-full"
                nativeButton={false}
                render={<Link href={href} scroll={false} />}
                size="sm"
                variant={active ? "default" : "outline"}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {hasFilters ? (
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          <Button
            className="h-auto rounded-full px-3 py-1 text-[0.8125rem] font-normal"
            nativeButton={false}
            render={<Link href={clearHref} />}
            variant="link"
          >
            Clear filters
          </Button>
        </p>
      ) : null}
    </div>
  );
}
