import { WantedPosterGridSkeleton } from "@/components/characters/wanted-poster-skeleton";
import { cn } from "@/lib/utils";

export default function CharactersLoading() {
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
        <div className="mb-10 max-w-md space-y-3">
          <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted md:h-11 md:w-56" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
          <div className="h-4 max-w-md w-[85%] animate-pulse rounded bg-muted" />
        </div>
        <WantedPosterGridSkeleton />
      </div>
    </div>
  );
}
