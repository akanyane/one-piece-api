import { Compass } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  displayCharacterName,
  subtitleCharacterName,
} from "@/lib/character-name";
import { cn } from "@/lib/utils";
import type { Tables } from "@/supabase/database.types";

export type ApiIslandRow = Tables<"islands">;

function extraDataField(extraData: unknown, key: string): string | null {
  if (!extraData || typeof extraData !== "object") return null;
  const v = (extraData as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v : null;
}

export function IslandCard({
  island,
  className,
}: {
  island: ApiIslandRow;
  className?: string;
}) {
  const title = displayCharacterName(island.name);
  const nameSubtitle = subtitleCharacterName(island.name, title);
  const affiliation = extraDataField(island.extra_data, "affiliation");

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/10",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-primary/15 via-card to-accent/25">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grain-overlay opacity-50 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklch,var(--color-primary)_25%,transparent),transparent_55%)]" />
        {island.image_url ? (
          <Image
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
            src={island.image_url}
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {!island.image_url ? (
            <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-primary/25 bg-background/50 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <Compass
                aria-hidden
                className="size-9 text-primary/45"
                strokeWidth={1.35}
              />
            </div>
          ) : null}
          {!island.image_url ? (
            <p className="max-w-[12rem] text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Art coming soon
            </p>
          ) : null}
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

        {island.sea ? (
          <div className="flex flex-wrap gap-1.5">
            <Badge
              className="rounded-full border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
              variant="outline"
            >
              {island.sea}
            </Badge>
          </div>
        ) : null}

        {affiliation ? (
          <div className="border-t border-border/50 pt-3 text-[0.8125rem]">
            <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
              Affiliation
            </span>
            <p className="mt-1 font-medium text-foreground">{affiliation}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
