import { WantedPosterGridSkeleton } from "@/components/characters/wanted-poster-skeleton";
import { cn } from "@/lib/utils";

export default function BountiesLoading() {
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
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md space-y-3">
            <div className="h-3 w-36 animate-pulse rounded-full bg-muted" />
            <div className="h-9 w-40 animate-pulse rounded-lg bg-muted md:h-11" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
        </div>
        <WantedPosterGridSkeleton />
      </div>
    </div>
  );
}
