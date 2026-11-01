const IDS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

/** Blank parchment posters, matching the catalog grid while data loads. */
export function WantedPosterGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
      {IDS.map((id) => (
        <li key={id}>
          <div className="wanted-poster flex flex-col items-center gap-2 p-4 opacity-70">
            <div className="h-7 w-3/4 animate-pulse rounded-sm bg-[#2a1a0e]/15" />
            <div className="aspect-[4/5] w-full animate-pulse border-2 border-[#2a1a0e]/30 bg-[#e9d8b4]" />
            <div className="h-3 w-1/3 animate-pulse rounded-sm bg-[#2a1a0e]/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-[#2a1a0e]/15" />
            <div className="h-5 w-1/2 animate-pulse rounded-sm bg-[#2a1a0e]/15" />
          </div>
        </li>
      ))}
    </ul>
  );
}
