import type { PlaygroundCard } from "@/lib/playground-cards";

export function ResponseCards({ cards }: { cards: PlaygroundCard[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(212px,1fr))] gap-px border border-[var(--pg-hairline)] bg-[var(--pg-hairline)]">
      {cards.map((card) => (
        <article className="flex flex-col bg-[var(--pg-panel)]" key={card.id}>
          {card.imageUrl && (
            <div
              className="aspect-4/3 w-full bg-[var(--pg-sunken-3)] bg-cover bg-top saturate-90"
              style={{ backgroundImage: `url("${card.imageUrl}")` }}
            />
          )}
          <div className="flex flex-col gap-1.5 px-4 pt-3.5 pb-4">
            <span className="text-[9.5px] tracking-[0.18em] text-[var(--pg-muted-2)]">
              {card.index}
            </span>
            <span className="font-display text-[17px] leading-[1.15] font-semibold tracking-[-0.01em]">
              {card.title}
            </span>
            {card.subtitle && (
              <span className="font-display text-[12.5px] leading-[1.5] text-[var(--pg-body)] italic">
                {card.subtitle}
              </span>
            )}
            {card.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {card.badges.map((badge) => (
                  <span
                    className="border border-[var(--pg-hairline-3)] px-1.5 py-0.5 text-[9.5px] tracking-[0.08em] text-[var(--pg-badge-text)]"
                    key={badge.id}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
