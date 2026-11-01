import { ArrowRight, Cherry, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { DetailShell } from "@/components/detail/detail-shell";
import { MemberGrid, toMembers } from "@/components/detail/member-grid";
import { BlurText } from "@/components/fx/blur-text";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { Reveal } from "@/components/fx/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import {
  displayCharacterName,
  displayFruitName,
  subtitleFruitName,
} from "@/lib/character-name";
import { getDevilFruitProfile, getRelatedFruits } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { cn, isUuid } from "@/lib/utils";

/** One fetch per request, shared by metadata and the page. */
const loadFruit = cache(async (id: string) => {
  try {
    return { ok: true as const, fruit: await getDevilFruitProfile(id) };
  } catch {
    return { ok: false as const };
  }
});

const TYPE_LORE: Record<string, string> = {
  Paramecia:
    "The most common class. Paramecia fruits grant a superhuman ability that alters the user's body, manipulates the environment, or produces a substance.",
  Zoan: "Zoan fruits let the user transform into an animal — or a hybrid of human and beast — boosting strength, durability and recovery.",
  Logia:
    "The rarest class. Logia users can create, control and become an element of nature, letting most physical attacks pass straight through them.",
};

const TYPE_ACCENT: Record<string, string> = {
  Paramecia: "from-[#c05cc4] via-[#e88a6b] to-[#f2c14e]",
  Zoan: "from-[#4f8a3a] via-[#b9a23c] to-[#d9a441]",
  Logia: "from-[#2f7fd1] via-[#3fb6c2] to-[#f07b3f]",
};

function jpName(name: unknown) {
  if (!name || typeof name !== "object") return null;
  const jp = (name as Record<string, unknown>).jp;
  return typeof jp === "string" && jp.trim() ? jp : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Not found" };
  const res = await loadFruit(id);
  if (!res.ok || !res.fruit) return { title: "Devil fruit" };
  const title = displayFruitName(res.fruit.name);
  const description = `${title}${res.fruit.type ? `, a ${res.fruit.type} devil fruit` : ""} — users, model and art from the One Piece API.`;
  const images = res.fruit.image_url ? [res.fruit.image_url] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/devil-fruits/${id}` },
    openGraph: { siteName: "One Piece API", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function DevilFruitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const res = await loadFruit(id);
  if (res.ok && !res.fruit) notFound();
  if (!res.ok || !res.fruit) throw new Error("Could not load devil fruit");

  const fruit = res.fruit;
  const title = displayFruitName(fruit.name);
  const subtitle = subtitleFruitName(fruit.name, title);
  const jp = jpName(fruit.name);
  const type = fruit.type && fruit.type !== "Unknown" ? fruit.type : null;
  const model =
    fruit.model && typeof fruit.model === "object"
      ? displayCharacterName(fruit.model)
      : null;
  const members = toMembers(fruit.character_devil_fruits);
  const current = members.filter((m) => m.isActive);
  const former = members.filter((m) => !m.isActive);

  let related: Awaited<ReturnType<typeof getRelatedFruits>> = [];
  if (type) {
    try {
      related = await getRelatedFruits(type, fruit.id);
    } catch {
      related = [];
    }
  }

  const facts = [
    { label: "Type", value: type },
    { label: "Sub-type", value: fruit.sub_type },
    { label: "Model", value: model },
    {
      label: "Known users",
      value: members.length ? String(members.length) : null,
    },
  ];

  return (
    <DetailShell
      current={title}
      parent={{ href: "/devil-fruits", label: "Devil fruits" }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Thing",
          name: title,
          ...(subtitle ? { alternateName: subtitle } : {}),
          url: `${SITE_URL}/devil-fruits/${fruit.id}`,
          ...(fruit.image_url ? { image: fruit.image_url } : {}),
        }}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14">
        {/* ---------- Art ---------- */}
        <div className="home-animate-rise relative mx-auto w-full max-w-[420px] self-start lg:sticky lg:top-24">
          <div
            aria-hidden
            className={cn(
              "fruit-halo absolute -inset-6 rounded-[2.5rem] bg-conic opacity-40 blur-2xl",
              TYPE_ACCENT[type ?? ""] ?? "from-primary via-accent to-primary",
            )}
          />
          <InteractiveCard className="rounded-[2rem]" tilt={8}>
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-2xl">
              {fruit.image_url ? (
                <Image
                  alt={title}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, 92vw"
                  src={fruit.image_url}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Cherry
                    aria-hidden
                    className="size-24 text-primary/30"
                    strokeWidth={1}
                  />
                </div>
              )}
              {/* Foil sheen that follows the cursor. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[calc(var(--h,0)*0.6)] mix-blend-overlay transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 20%, rgba(255,255,255,.7) var(--mx,50%), transparent 80%)",
                }}
              />
            </div>
          </InteractiveCard>
        </div>

        {/* ---------- Profile ---------- */}
        <div className="min-w-0">
          <p className="home-animate-rise flex items-center gap-2 font-display text-[0.75rem] font-medium tracking-[0.28em] text-primary uppercase">
            <Sparkles aria-hidden className="size-3.5" />
            Devil fruit{type ? ` · ${type}` : ""}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.98] font-medium tracking-[-0.03em] text-balance">
            <BlurText delay={0.1} text={title} />
          </h1>
          <p className="home-animate-rise home-delay-3 mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {subtitle ? (
              <span className="text-lg text-muted-foreground italic">
                {subtitle}
              </span>
            ) : null}
            {jp ? (
              <span className="font-kana text-xl text-foreground/80">{jp}</span>
            ) : null}
          </p>

          <Reveal className="mt-8">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 sm:grid-cols-4 [&>div]:bg-card/90">
              {facts.map(({ label, value }) => (
                <div className="p-4 backdrop-blur-md" key={label}>
                  <dt className="text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-1.5 font-display text-xl font-medium",
                      !value && "text-muted-foreground/60",
                    )}
                  >
                    {value ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {type && TYPE_LORE[type] ? (
            <Reveal className="mt-4">
              <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-5 backdrop-blur-md">
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 w-1 bg-linear-to-b",
                    TYPE_ACCENT[type],
                  )}
                />
                <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  About {type} fruits
                </p>
                <p className="mt-2 text-sm/relaxed text-foreground/85">
                  {TYPE_LORE[type]}
                </p>
              </div>
            </Reveal>
          ) : null}

          <Reveal className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
              <Users aria-hidden className="size-3.5" />
              {current.length === 1 ? "Current user" : "Current users"}
            </h2>
            {current.length ? (
              <MemberGrid members={current} narrow />
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                No current user on record — this fruit may still be out there.
              </p>
            )}
          </Reveal>

          {former.length ? (
            <Reveal className="mt-10">
              <h2 className="mb-4 font-display text-[0.7rem] font-medium tracking-[0.28em] text-muted-foreground uppercase">
                Former users
              </h2>
              <MemberGrid members={former} narrow />
            </Reveal>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                More {type} fruits
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">
                Keep exploring
              </h2>
            </div>
            <Link
              className="group inline-flex items-center gap-1 text-sm font-medium text-primary"
              href="/devil-fruits"
            >
              All devil fruits
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r, i) => {
              const name = displayFruitName(r.name);
              return (
                <li key={r.id}>
                  <Reveal className="h-full" index={i}>
                    <InteractiveCard className="rounded-2xl" tilt={6}>
                      <Link
                        className="group block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-colors hover:border-primary/40"
                        href={`/devil-fruits/${r.id}`}
                      >
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {r.image_url ? (
                            <Image
                              alt={name}
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                              fill
                              sizes="(min-width: 768px) 25vw, 50vw"
                              src={r.image_url}
                            />
                          ) : null}
                        </div>
                        <p className="truncate px-4 py-3 font-display text-base font-medium">
                          {name}
                        </p>
                      </Link>
                    </InteractiveCard>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </DetailShell>
  );
}
