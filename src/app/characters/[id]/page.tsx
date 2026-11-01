import {
  ArrowRight,
  Braces,
  Cake,
  ChevronRight,
  Droplets,
  Flag,
  Ruler,
  Terminal,
  Timer,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { headlineBounty } from "@/components/characters/character-card";
import { WantedPoster } from "@/components/characters/wanted-poster";
import { BlurText } from "@/components/fx/blur-text";
import { CopyButton } from "@/components/fx/copy-button";
import { CountUp } from "@/components/fx/count-up";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { Reveal } from "@/components/fx/reveal";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type CharacterProfile,
  characterDossier,
  characterEpithet,
  getCharacterDetail,
} from "@/lib/character-detail";
import {
  displayCharacterName,
  displayFruitName,
  subtitleFruitName,
} from "@/lib/character-name";
import { getCrewmates } from "@/lib/data";
import { formatBirthday } from "@/lib/format-birthday";
import { SITE_URL } from "@/lib/site";
import { cn, isUuid } from "@/lib/utils";

function nameField(name: unknown, key: "en" | "jp" | "romaji") {
  if (!name || typeof name !== "object" || Array.isArray(name)) return null;
  const v = (name as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

const STATUS_STYLE: Record<string, string> = {
  alive:
    "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  deceased: "border-red-600/30 bg-red-500/10 text-red-800 dark:text-red-200",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
      {children}
    </h2>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Character not found" };
  const result = await getCharacterDetail(id);
  if (!result.ok) {
    return result.notFound
      ? { title: "Character not found" }
      : { title: "Character" };
  }
  const title = displayCharacterName(result.data.name);
  const epithet = characterEpithet(result.data.extra_data);
  const description = `${epithet ? `“${epithet}” — ` : ""}Stats, profile, devil fruit, affiliations and bounties for ${title}.`;
  const images = result.data.image_url ? [result.data.image_url] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/characters/${id}` },
    openGraph: {
      type: "profile",
      siteName: "One Piece API",
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

function ErrorState({ id }: { id: string }) {
  return (
    <div className="surface-story relative min-h-dvh overflow-x-clip bg-background text-foreground [--font-heading:var(--font-display)]">
      <PageBackdrop />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-12 md:px-8">
        <Card className="border-destructive/30 bg-card/90">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We could not load this character. Try again shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              className="rounded-full px-3.5"
              nativeButton={false}
              render={<Link href={`/characters/${id}`} />}
            >
              Retry
            </Button>
            <Button
              className="rounded-full px-3.5"
              nativeButton={false}
              render={<Link href="/characters" />}
              variant="outline"
            >
              All characters
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Crewmates of the first active affiliation; decoration, so failures render nothing. */
async function loadCrew(character: CharacterProfile) {
  const links = character.character_affiliations ?? [];
  const primary =
    links.find((l) => l.is_active && l.affiliations) ??
    links.find((l) => l.affiliations);
  if (!primary?.affiliations) return null;
  try {
    const members = await getCrewmates(primary.affiliations.id, character.id);
    return members.length
      ? {
          id: primary.affiliations.id,
          name: displayCharacterName(primary.affiliations.name),
          members,
        }
      : null;
  } catch {
    return null;
  }
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const result = await getCharacterDetail(id);

  if (!result.ok) {
    if (result.notFound) notFound();
    return <ErrorState id={id} />;
  }

  const character = result.data;
  const crew = await loadCrew(character);

  const title = displayCharacterName(character.name);
  const jp = nameField(character.name, "jp");
  const romaji = nameField(character.name, "romaji");
  const epithet = characterEpithet(character.extra_data);
  const dossier = characterDossier(character.extra_data);
  const birthday = formatBirthday(character.birthday);
  const bounty = headlineBounty(character.bounties);
  const status = character.status?.trim() || "Unknown";

  // Bounties carry no in-story date, so show them as a progression by amount.
  const bountyHistory = (character.bounties ?? [])
    .filter((b) => b.amount != null)
    .sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0));
  const maxBounty = Math.max(1, ...bountyHistory.map((b) => b.amount ?? 0));

  const fruits = (character.character_devil_fruits ?? []).flatMap((l) =>
    l.devil_fruits ? [{ ...l.devil_fruits, isActive: l.is_active }] : [],
  );
  const affiliations = (character.character_affiliations ?? [])
    .flatMap((l) =>
      l.affiliations ? [{ ...l.affiliations, isActive: l.is_active }] : [],
    )
    .sort((a, b) => Number(b.isActive) - Number(a.isActive));

  const facts = [
    {
      icon: Timer,
      label: "Age",
      value: character.age != null ? `${character.age}` : null,
    },
    {
      icon: Ruler,
      label: "Height",
      value: character.height != null ? `${character.height} cm` : null,
    },
    {
      icon: Droplets,
      label: "Blood type",
      value:
        character.blood_type && character.blood_type.toLowerCase() !== "unknown"
          ? character.blood_type
          : null,
    },
    { icon: Cake, label: "Birthday", value: birthday },
  ];

  const detailUrl = `${SITE_URL}/characters/${character.id}`;
  const apiPath = `/api/characters/${character.id}`;
  const curl = `curl ${SITE_URL}${apiPath}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Characters",
              item: `${SITE_URL}/characters`,
            },
            { "@type": "ListItem", position: 3, name: title, item: detailUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: title,
          ...(jp ? { alternateName: jp } : {}),
          url: detailUrl,
          ...(character.image_url ? { image: character.image_url } : {}),
          description: `${title}: One Piece character profile with stats and bounties.`,
        }}
      />
      <div className="surface-story relative min-h-dvh overflow-x-clip bg-background text-foreground [--font-heading:var(--font-display)]">
        <PageBackdrop />
        <SiteHeader />

        <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-20 md:px-8 md:pt-10">
          <nav
            aria-label="Breadcrumb"
            className="home-animate-fade mb-8 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground"
          >
            <Link className="hover:text-foreground" href="/characters">
              Characters
            </Link>
            <ChevronRight aria-hidden className="size-3.5 opacity-60" />
            <span aria-current="page" className="truncate text-foreground">
              {title}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-14">
            {/* ---------- Poster ---------- */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="home-animate-rise mx-auto max-w-[340px] [rotate:-1.2deg] lg:mx-0">
                <InteractiveCard spotlight={false} tilt={9}>
                  <WantedPoster
                    bounty={bounty}
                    imageUrl={character.image_url}
                    name={title}
                    nameJp={jp ?? undefined}
                    priority
                    status={character.status}
                  />
                </InteractiveCard>
              </div>
              <div className="home-animate-fade home-delay-3 mx-auto mt-8 flex max-w-[340px] flex-wrap gap-2 lg:mx-0">
                <Button
                  className="flex-1 rounded-full"
                  nativeButton={false}
                  render={<a href={apiPath} rel="noreferrer" target="_blank" />}
                  variant="outline"
                >
                  <Braces data-icon="inline-start" />
                  Raw JSON
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  nativeButton={false}
                  render={<Link href="/playground" />}
                >
                  <Terminal data-icon="inline-start" />
                  Playground
                </Button>
              </div>
            </aside>

            {/* ---------- Profile ---------- */}
            <div className="min-w-0">
              <header>
                <p className="home-animate-rise font-display text-[0.75rem] font-medium tracking-[0.28em] text-primary uppercase">
                  {epithet ? `“${epithet}”` : "Character profile"}
                </p>
                <h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.98] font-medium tracking-[-0.03em] text-balance">
                  <BlurText delay={0.1} text={title} />
                </h1>
                {jp || romaji ? (
                  <p className="home-animate-rise home-delay-3 mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-muted-foreground">
                    {jp ? (
                      <span className="font-kana text-xl text-foreground/80">
                        {jp}
                      </span>
                    ) : null}
                    {romaji && romaji !== title ? (
                      <span className="text-sm italic">{romaji}</span>
                    ) : null}
                  </p>
                ) : null}
                <div className="home-animate-rise home-delay-4 mt-5 flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                      STATUS_STYLE[status.toLowerCase()] ??
                        "border-border bg-secondary text-secondary-foreground",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {status}
                  </span>
                  {affiliations
                    .filter((a) => a.isActive)
                    .slice(0, 2)
                    .map((a) => (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium"
                        key={a.id}
                      >
                        <Flag aria-hidden className="size-3 text-primary" />
                        {displayCharacterName(a.name)}
                      </span>
                    ))}
                </div>
              </header>

              {/* Bounty highlight */}
              <Reveal className="mt-10">
                <div className="relative overflow-hidden rounded-2xl border border-[#2a1a0e]/15 bg-[linear-gradient(120deg,#f3e5c4,#e3cc9b)] p-6 text-[#2a1a0e] shadow-sm md:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(120,72,30,0.35)]"
                  />
                  <p className="font-wanted text-xs tracking-[0.3em] text-[#5e4630]">
                    {bounty === null ? "BOUNTY" : "CURRENT BOUNTY"}
                  </p>
                  {bounty === null ? (
                    <p className="font-wanted mt-2 text-2xl">
                      No bounty on record
                    </p>
                  ) : (
                    <p className="font-wanted mt-2 text-[clamp(2rem,5vw,3.2rem)] leading-none">
                      <CountUp duration={2} prefix="฿ " to={bounty} />
                    </p>
                  )}
                </div>
              </Reveal>

              {/* Facts */}
              <Reveal className="mt-4">
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 sm:grid-cols-4 [&>div]:bg-card/90">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div className="p-4 backdrop-blur-md" key={label}>
                      <dt className="flex items-center gap-1.5 text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        <Icon aria-hidden className="size-3.5" />
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

              {dossier.length > 0 ? (
                <Reveal className="mt-12">
                  <SectionTitle>Dossier</SectionTitle>
                  <dl className="divide-y divide-border/70 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md">
                    {dossier.map(({ label, value }) => (
                      <div
                        className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
                        key={label}
                      >
                        <dt className="text-sm text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="text-sm/relaxed font-medium">
                          {value.split("; ").join(" · ")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              ) : null}

              {fruits.length > 0 ? (
                <Reveal className="mt-12">
                  <SectionTitle>Devil fruit</SectionTitle>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {fruits.map((fruit) => {
                      const fruitName = displayFruitName(fruit.name);
                      const fruitSub = subtitleFruitName(fruit.name, fruitName);
                      return (
                        <li key={fruit.id}>
                          <InteractiveCard className="rounded-2xl" tilt={5}>
                            <Link
                              className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-3 pr-5 shadow-sm transition-colors hover:border-primary/40"
                              href={`/devil-fruits/${fruit.id}`}
                            >
                              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                                {fruit.image_url ? (
                                  <Image
                                    alt={fruitName}
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    fill
                                    sizes="80px"
                                    src={fruit.image_url}
                                  />
                                ) : null}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-display text-lg font-medium">
                                  {fruitName}
                                </p>
                                {fruitSub ? (
                                  <p className="truncate text-sm text-muted-foreground">
                                    {fruitSub}
                                  </p>
                                ) : null}
                                <p className="mt-1.5 flex flex-wrap gap-1.5">
                                  {[fruit.type, fruit.sub_type]
                                    .filter(Boolean)
                                    .map((t) => (
                                      <span
                                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary"
                                        key={t}
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  {!fruit.isActive ? (
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                                      Former
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </Link>
                          </InteractiveCard>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              ) : null}

              {affiliations.length > 0 ? (
                <Reveal className="mt-12">
                  <SectionTitle>Affiliations</SectionTitle>
                  <ul className="flex flex-wrap gap-2">
                    {affiliations.map((a) => (
                      <li key={a.id}>
                        <Link
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                            a.isActive
                              ? "border-primary/30 bg-primary/10 font-medium text-primary hover:bg-primary/15"
                              : "border-border bg-card/70 text-muted-foreground line-through decoration-muted-foreground/40 hover:text-foreground",
                          )}
                          href={`/affiliations/${a.id}`}
                          title={a.isActive ? "Current" : "Former"}
                        >
                          {displayCharacterName(a.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {bountyHistory.length > 1 ? (
                <Reveal className="mt-12">
                  <SectionTitle>Bounty history</SectionTitle>
                  <ol className="flex flex-col gap-3">
                    {bountyHistory.map((b) => (
                      <li
                        className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5"
                        key={b.id}
                      >
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              b.is_active
                                ? "bg-linear-to-r from-[#d9a441] to-[#b3261e]"
                                : "bg-foreground/25",
                            )}
                            style={{
                              width: `${Math.max(2, ((b.amount ?? 0) / maxBounty) * 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-mono text-sm tabular-nums",
                            b.is_active
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          ฿ {(b.amount ?? 0).toLocaleString("en-US")}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              ) : null}

              <Reveal className="mt-12">
                <SectionTitle>Use it in your app</SectionTitle>
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-[#17120d] text-[#e9dfc9] shadow-lg">
                  <div className="flex items-center gap-3 py-2 pr-2 pl-4">
                    <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[0.8rem] whitespace-nowrap">
                      <span className="text-[#28c840]">$</span>{" "}
                      <span className="text-[#7fd3dc]">curl</span>{" "}
                      <span className="text-[#c9e59a]">
                        {SITE_URL}
                        {apiPath}
                      </span>
                    </code>
                    <CopyButton label="Copy curl command" value={curl} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ---------- Crewmates ---------- */}
          {crew ? (
            <section className="mt-24">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                    Also sailing with
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">
                    {crew.name}
                  </h2>
                </div>
                <Link
                  className="group inline-flex items-center gap-1 text-sm font-medium text-primary"
                  href={`/affiliations/${crew.id}`}
                >
                  All members
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Reveal>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4">
                {crew.members.map((m, i) => (
                  <li key={m.id}>
                    <Reveal className="h-full" index={i}>
                      <Link
                        className="group block h-full transition-[rotate] duration-500 [rotate:var(--rest)] hover:[rotate:0deg]"
                        href={`/characters/${m.id}`}
                        style={
                          {
                            "--rest": `${i % 2 ? 0.9 : -0.9}deg`,
                          } as CSSProperties
                        }
                      >
                        <InteractiveCard spotlight={false} tilt={7}>
                          <WantedPoster
                            bounty={headlineBounty(m.bounties)}
                            imageUrl={m.image_url}
                            name={displayCharacterName(m.name)}
                            size="sm"
                            status={m.status}
                          />
                        </InteractiveCard>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
