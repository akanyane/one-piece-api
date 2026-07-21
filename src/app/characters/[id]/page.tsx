import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Cherry,
  Coins,
  Droplets,
  Fingerprint,
  Ruler,
  UserRound,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { ApiBounty } from "@/components/characters/character-card";
import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCharacterDetail } from "@/lib/character-detail";
import {
  displayCharacterName,
  subtitleCharacterName,
} from "@/lib/character-name";
import { formatBirthday } from "@/lib/format-birthday";
import { cn } from "@/lib/utils";

function nameParts(name: unknown): { key: string; value: string }[] {
  if (!name || typeof name !== "object" || Array.isArray(name)) return [];
  const o = name as Record<string, unknown>;
  const keys = ["en", "jp", "romaji"] as const;
  const out: { key: string; value: string }[] = [];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim())
      out.push({ key: k, value: v.trim() });
  }
  return out;
}

function formatBerry(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  return `฿ ${n.toLocaleString("en-US")}`;
}

function sortBounties(b: ApiBounty[]): ApiBounty[] {
  return [...b].sort(
    (a, b2) =>
      new Date(b2.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getCharacterDetail(id);
  if (!result.ok) {
    return result.notFound
      ? { title: "Character not found" }
      : { title: "Character" };
  }
  const title = displayCharacterName(result.data.name);
  return {
    title,
    description: `Stats, profile, and bounties for ${title}.`,
  };
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCharacterDetail(id);

  if (!result.ok) {
    if (result.notFound) notFound();
    return (
      <div
        className={cn(
          "surface-story relative min-h-[calc(100dvh-theme(spacing.14))] overflow-x-clip bg-background text-foreground",
          "[--font-heading:var(--font-display)]",
        )}
      >
        <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
          <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-4 md:gap-4 md:px-8">
            <Link
              className="flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
              href="/"
            >
              <LogoMark />
            </Link>
            <CatalogNav>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/characters" />}
              >
                <Users data-icon="inline-start" />
                Characters
              </Button>
            </CatalogNav>
            <ThemeToggle />
          </div>
        </header>
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
                className="rounded-full"
                nativeButton={false}
                render={<Link href={`/characters/${id}`} />}
              >
                Retry
              </Button>
              <Button
                className="rounded-full"
                variant="outline"
                nativeButton={false}
                render={<Link href="/characters" />}
              >
                All characters
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const character = result.data;
  const title = displayCharacterName(character.name);
  const nameSubtitle = subtitleCharacterName(character.name, title);
  const variants = nameParts(character.name);
  const birthdayLine = formatBirthday(character.birthday);
  const bounties = sortBounties(character.bounties ?? []);
  const createdLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(character.created_at));

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
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 size-[min(100vw,640px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-primary)_20%,transparent),transparent_72%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[min(80vw,420px)] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.55_0.12_220)_22%,transparent),transparent_70%)] blur-3xl"
      />

      <header className="relative z-10 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-4 md:gap-4 md:px-8">
          <Link
            className="flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md transition-opacity hover:opacity-90"
            href="/"
          >
            <LogoMark />
            <span className="hidden font-display text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              API
            </span>
          </Link>
          <CatalogNav>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Home
            </Button>
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={<Link href="/characters" />}
            >
              <Users data-icon="inline-start" />
              Characters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/devil-fruits" />}
            >
              <Cherry data-icon="inline-start" />
              Devil fruits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/bounties" />}
            >
              <Coins data-icon="inline-start" />
              Bounties
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/documentation" />}
            >
              <BookOpen data-icon="inline-start" />
              Docs
            </Button>
          </CatalogNav>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 rounded-full text-muted-foreground hover:text-foreground"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to characters
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-12">
          <aside className="lg:sticky lg:top-20">
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-md",
                "aspect-[4/5] max-w-md lg:mx-0",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/18 via-card to-accent/22"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 grain-overlay opacity-45 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,color-mix(in_oklch,var(--color-primary)_28%,transparent),transparent_58%)]" />
              {character.image_url ? (
                <Image
                  alt=""
                  className="object-cover object-top"
                  fill
                  src={character.image_url}
                  unoptimized
                />
              ) : null}
              {!character.image_url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="flex size-24 items-center justify-center rounded-full border border-primary/30 bg-background/55 shadow-inner backdrop-blur-sm">
                    <UserRound
                      aria-hidden
                      className="size-14 text-primary/40"
                      strokeWidth={1.2}
                    />
                  </div>
                  <p className="max-w-[14rem] text-[0.65rem] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    Portrait coming soon
                  </p>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            <header className="space-y-3">
              <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                Character profile
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl lg:text-[2.35rem]">
                {title}
              </h1>
              {nameSubtitle ? (
                <p className="max-w-2xl text-lg text-muted-foreground">
                  {nameSubtitle}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  className="rounded-full border-primary/25 bg-primary/10 px-3 py-0.5 font-medium text-primary"
                  variant="outline"
                >
                  {character.status || "—"}
                </Badge>
                {character.blood_type ? (
                  <Badge
                    className="rounded-full px-3 py-0.5"
                    variant="secondary"
                  >
                    <Droplets
                      aria-hidden
                      className="size-3.5 opacity-70"
                      data-icon="inline-start"
                    />
                    {character.blood_type}
                  </Badge>
                ) : null}
              </div>
            </header>

            {variants.length > 1 ? (
              <section
                aria-labelledby="names-heading"
                className="rounded-2xl border border-border/70 bg-card/55 p-5 backdrop-blur-sm md:p-6"
              >
                <h2
                  id="names-heading"
                  className="mb-4 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
                >
                  Localized names
                </h2>
                <dl className="grid gap-4 sm:grid-cols-3">
                  {variants.map(({ key, value }) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                        {key}
                      </dt>
                      <dd className="text-sm font-medium leading-snug text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section
              aria-labelledby="details-heading"
              className="rounded-2xl border border-border/70 bg-card/55 p-5 backdrop-blur-sm md:p-6"
            >
              <h2
                id="details-heading"
                className="mb-5 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
              >
                Details
              </h2>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="flex items-center gap-2 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    <Calendar aria-hidden className="size-3.5 opacity-60" />
                    Age
                  </dt>
                  <dd className="text-lg font-medium tabular-nums text-foreground">
                    {character.age != null ? character.age : "—"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="flex items-center gap-2 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    <Ruler aria-hidden className="size-3.5 opacity-60" />
                    Height
                  </dt>
                  <dd className="text-lg font-medium tabular-nums text-foreground">
                    {character.height != null ? `${character.height} cm` : "—"}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    Birthday
                  </dt>
                  <dd className="text-base font-medium text-foreground">
                    {birthdayLine ?? "—"}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    Record added
                  </dt>
                  <dd className="text-base text-foreground/90">
                    {createdLabel}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
                    <Fingerprint aria-hidden className="size-3.5 opacity-60" />
                    Id
                  </dt>
                  <dd className="break-all font-mono text-sm text-foreground/85">
                    {character.id}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="bounties-heading" className="space-y-4">
              <h2
                id="bounties-heading"
                className="font-display text-lg font-medium tracking-tight text-foreground"
              >
                Bounties
              </h2>
              {bounties.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-8 text-center text-sm text-muted-foreground">
                  No bounty entries for this character yet.
                </p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {bounties.map((b) => {
                    const posted = new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(b.created_at));
                    return (
                      <li key={b.id}>
                        <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-sm transition-colors hover:border-border">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-mono text-xl font-semibold tracking-tight text-foreground">
                              {formatBerry(b.amount)}
                            </p>
                            <Badge
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem]",
                                b.is_active
                                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                                  : "opacity-80",
                              )}
                              variant="outline"
                            >
                              {b.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
                            <Coins
                              aria-hidden
                              className="size-3.5 opacity-60"
                            />
                            <span>Posted {posted}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
