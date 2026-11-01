/**
 * Ambient layers every page sits on: paper grain, two slow-drifting light
 * blobs (sea teal + gold) and a faint compass-rose sweep. Purely decorative.
 */
export function PageBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 grain-overlay opacity-60 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen"
      />
      <div
        aria-hidden
        className="home-blob pointer-events-none absolute -top-40 left-1/2 z-0 size-[min(120vw,820px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-primary)_24%,transparent),transparent_75%)] blur-3xl"
      />
      <div
        aria-hidden
        className="home-blob pointer-events-none absolute top-[28rem] -right-40 z-0 size-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.75_0.14_80)_30%,transparent),transparent_70%)] blur-3xl [animation-delay:-9s]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[6%] z-0 hidden size-[30rem] rounded-full opacity-[0.07] [background:repeating-conic-gradient(from_0deg,currentColor_0deg_0.4deg,transparent_0.4deg_11.25deg)] [mask-image:radial-gradient(circle,black,transparent_70%)] lg:block"
      />
    </>
  );
}
