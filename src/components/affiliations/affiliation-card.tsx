import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  displayCharacterName,
  subtitleCharacterName,
} from "@/lib/character-name";
import { cn } from "@/lib/utils";
import type { Tables } from "@/supabase/database.types";

export type ApiAffiliationRow = Tables<"affiliations"> & {
  memberCount: number;
};

export function AffiliationCard({
  affiliation,
  className,
}: {
  affiliation: ApiAffiliationRow;
  className?: string;
}) {
  const title = displayCharacterName(affiliation.name);
  const nameSubtitle = subtitleCharacterName(affiliation.name, title);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/10",
        className,
      )}
    >
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-linear-to-br from-primary/15 via-card to-accent/25">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grain-overlay opacity-50 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklch,var(--color-primary)_25%,transparent),transparent_55%)]" />
        <div className="flex size-[3.75rem] items-center justify-center rounded-full border border-primary/25 bg-background/50 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
          <Flag
            aria-hidden
            className="size-7 text-primary/45"
            strokeWidth={1.35}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border/60 p-4 md:p-5">
        <div className="space-y-1">
          <h2 className="font-display text-xl leading-tight font-medium tracking-tight text-balance text-foreground md:text-[1.35rem]">
            {title}
          </h2>
          {nameSubtitle ? (
            <p className="text-sm text-muted-foreground">{nameSubtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            className="rounded-full border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
            variant="outline"
          >
            {affiliation.memberCount}{" "}
            {affiliation.memberCount === 1 ? "member" : "members"}
          </Badge>
        </div>
      </div>
    </article>
  );
}
