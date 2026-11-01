import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Gauge,
  KeyRound,
  Scale,
  Terminal,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

import { WantedPoster } from "@/components/characters/wanted-poster";
import { BlurText } from "@/components/fx/blur-text";
import { CountUp } from "@/components/fx/count-up";
import { InteractiveCard } from "@/components/fx/interactive-card";
import { Marquee } from "@/components/fx/marquee";
import { Reveal } from "@/components/fx/reveal";
import { HeroTerminal } from "@/components/home/hero-terminal";
import { GithubIcon } from "@/components/icons/github";
import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { displayCharacterName } from "@/lib/character-name";
import { getMostWanted, getSiteStats } from "@/lib/data";
import { CATALOG_NAV, REPO_URL } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "REST API for One Piece characters, images, and canonical series data.";

export const metadata: Metadata = {
  title: "One Piece API",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "One Piece API",
    title: "One Piece API",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "One Piece API",
    description: DESCRIPTION,
  },
};

type Stats = Awaited<ReturnType<typeof getSiteStats>>;
type Wanted = Awaited<ReturnType<typeof getMostWanted>>;

/** Homepage data is decoration: if the database hiccups, render without it. */
async function loadHomeData(): Promise<{
  stats: Stats | null;
  wanted: Wanted;
}> {
  const [stats, wanted] = await Promise.allSettled([
    getSiteStats(),
    getMostWanted(14),
  ]);
  return {
    stats: stats.status === "fulfilled" ? stats.value : null,
    wanted: wanted.status === "fulfilled" ? wanted.value : [],
  };
}

const STAT_FOR_HREF: Record<string, keyof Stats> = {
  "/characters": "characters",
  "/devil-fruits": "devil_fruits",
  "/bounties": "bounties",
  "/ships": "ships",
  "/islands": "islands",
  "/affiliations": "affiliations",
};

const FEATURES = [
  {
    icon: KeyRound,
    title: "No keys, no sign-up",
    body: "Every endpoint is public. Paste a URL in the browser and you already have JSON.",
  },
  {
    icon: Gauge,
    title: "Cached at the edge",
    body: "Responses ship with Cache-Control headers, so repeat calls are fast and cheap.",
  },
  {
    icon: Scale,
    title: "Open source, MIT",
    body: "Read the code, file an issue, or send a PR — the dataset grows with the crew.",
  },
];

export default async function Home() {
  const { stats, wanted } = await loadHomeData();
  const featured = wanted[0];
  const sample = featured
    ? {
        id: featured.id,
        name: featured.name,
        status: featured.status,
        bounty: featured.amount,
        image_url: featured.image_url,
      }
    : { id: "…", name: { en: "Monkey D. Luffy" }, status: "Alive" };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "One Piece API",
          url: SITE_URL,
          description: DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/characters?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <div
        className={cn(
          "surface-story relative min-h-dvh overflow-x-clip bg-background text-foreground",
          "[--font-heading:var(--font-display)]",
        )}
      >
        <PageBackdrop />
        <SiteHeader />

        <main className="relative z-10">
          {/* ---------- Hero ---------- */}
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 md:px-8 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-24">
            <div>
              <Link
                className="home-animate-fade group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 py-1 pr-3 pl-1 text-[0.75rem] shadow-sm backdrop-blur-md transition-colors hover:border-primary/40"
                href="/playground"
              >
                <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-primary-foreground uppercase">
                  New
                </span>
                <span className="shiny-text font-medium text-muted-foreground">
                  Try the interactive playground
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.035em] text-balance text-foreground">
                <BlurText text="Every pirate, fruit and bounty," />{" "}
                <BlurText
                  className="text-primary italic"
                  delay={0.35}
                  text="one request away."
                />
              </h1>

              <p className="home-animate-rise home-delay-4 mt-6 max-w-xl text-pretty text-base/relaxed text-muted-foreground md:text-lg/relaxed">
                A free, open REST API for the world of One Piece — characters
                with portraits, devil fruits, bounties, ships, islands and
                crews. Built for developers and fans alike.
              </p>

              <div className="home-animate-rise home-delay-5 mt-8 flex flex-wrap gap-3">
                <Button
                  className="h-10 rounded-full px-5 shadow-lg shadow-primary/20"
                  nativeButton={false}
                  render={<Link href="/characters" />}
                >
                  <Users data-icon="inline-start" />
                  Explore characters
                </Button>
                <Button
                  className="h-10 rounded-full bg-card/80 px-5 backdrop-blur-md"
                  nativeButton={false}
                  render={<Link href="/documentation" />}
                  variant="outline"
                >
                  <BookOpen data-icon="inline-start" />
                  Read the docs
                </Button>
              </div>

              <p className="home-animate-fade home-delay-5 mt-6 font-mono text-[0.75rem] text-muted-foreground">
                <span className="text-primary">GET</span> {SITE_URL}
                /api/characters
              </p>
            </div>

            <div className="home-animate-rise home-delay-3 min-w-0">
              <HeroTerminal
                command={`curl ${SITE_URL.replace("https://", "")}/api/characters/${featured ? `${featured.id.slice(0, 8)}…` : "{id}"}`}
                response={sample}
              />
            </div>
          </section>

          {/* ---------- Stats ---------- */}
          {stats ? (
            <section
              aria-label="Dataset size"
              className="mx-auto max-w-6xl px-4 md:px-8"
            >
              <Reveal>
                <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border/80 bg-border/80 shadow-sm sm:grid-cols-3 lg:grid-cols-6 [&>div]:bg-card/90">
                  {CATALOG_NAV.map(({ href, label, icon: Icon }) => (
                    <div
                      className="flex flex-col gap-1 p-5 backdrop-blur-md"
                      key={href}
                    >
                      <dt className="flex items-center gap-1.5 text-[0.7rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                        <Icon aria-hidden className="size-3.5" />
                        {label}
                      </dt>
                      <dd className="font-display text-3xl font-medium tracking-tight text-foreground">
                        <CountUp to={stats[STAT_FOR_HREF[href]]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </section>
          ) : null}

          {/* ---------- Most wanted ---------- */}
          {wanted.length > 0 ? (
            <section className="mt-20 md:mt-28">
              <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 md:px-8">
                <Reveal>
                  <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                    Grand Line · Most wanted
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
                    The highest prices on the sea
                  </h2>
                </Reveal>
                <Link
                  className="group inline-flex items-center gap-1 text-sm font-medium text-primary"
                  href="/bounties?sort=high"
                >
                  All bounties
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              <Marquee className="mt-4" duration={70}>
                {wanted.map((c, i) => (
                  <Link
                    className="group block w-[11.5rem] shrink-0 transition-[rotate] duration-500 [rotate:var(--rest)] hover:[rotate:0deg]"
                    href={`/characters/${c.id}`}
                    key={c.id}
                    style={
                      { "--rest": `${i % 2 ? 1.2 : -1.2}deg` } as CSSProperties
                    }
                  >
                    <InteractiveCard spotlight={false} tilt={9}>
                      <WantedPoster
                        bounty={c.amount}
                        imageUrl={c.image_url}
                        name={displayCharacterName(c.name)}
                        size="sm"
                        status={c.status}
                      />
                    </InteractiveCard>
                  </Link>
                ))}
              </Marquee>
            </section>
          ) : null}

          {/* ---------- Sections ---------- */}
          <section className="mx-auto mt-16 max-w-6xl px-4 md:mt-24 md:px-8">
            <Reveal>
              <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                Grand Line · Catalog
              </p>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
                Six resources, all browsable right here
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATALOG_NAV.map(({ href, label, icon: Icon, blurb }, i) => (
                <li key={href}>
                  <Reveal className="h-full" index={i}>
                    <InteractiveCard className="rounded-2xl" tilt={4}>
                      <Link
                        className="group flex h-full flex-col gap-6 overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-foreground/10"
                        href={href}
                      >
                        <div className="flex items-start justify-between">
                          <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                            <Icon aria-hidden className="size-5" />
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="size-5 text-muted-foreground transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                          />
                        </div>
                        <div className="mt-auto">
                          <p className="font-mono text-[0.7rem] text-muted-foreground">
                            /api{href}
                            {stats ? (
                              <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[0.65rem] text-secondary-foreground">
                                {stats[STAT_FOR_HREF[href]].toLocaleString(
                                  "en-US",
                                )}
                              </span>
                            ) : null}
                          </p>
                          <h3 className="mt-1.5 font-display text-2xl font-medium tracking-tight">
                            {label}
                          </h3>
                          <p className="mt-1.5 text-sm/relaxed text-muted-foreground">
                            {blurb}
                          </p>
                        </div>
                      </Link>
                    </InteractiveCard>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- Developers ---------- */}
          <section className="mx-auto mt-20 max-w-6xl px-4 pb-24 md:mt-28 md:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <Reveal>
                <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
                  Grand Line · Developers
                </p>
                <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-balance md:text-4xl">
                  Set sail in three lines of code
                </h2>
                <ul className="mt-8 flex flex-col gap-5">
                  {FEATURES.map(({ icon: Icon, title, body }) => (
                    <li className="flex gap-4" key={title}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{title}</p>
                        <p className="mt-0.5 text-sm/relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="rounded-full px-4"
                    nativeButton={false}
                    render={<Link href="/playground" />}
                  >
                    <Terminal data-icon="inline-start" />
                    Open playground
                  </Button>
                  <Button
                    className="rounded-full px-4"
                    nativeButton={false}
                    render={
                      <a href={REPO_URL} rel="noreferrer" target="_blank" />
                    }
                    variant="outline"
                  >
                    <GithubIcon className="size-4" data-icon="inline-start" />
                    Star on GitHub
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <InteractiveCard className="rounded-2xl" tilt={3}>
                  <figure className="overflow-hidden rounded-2xl border border-border/80 bg-[#17120d] text-[#e9dfc9] shadow-xl">
                    <figcaption className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 font-mono text-[0.7rem] text-[#8d8170]">
                      <span>crew.ts</span>
                      <span>TypeScript</span>
                    </figcaption>
                    <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-relaxed">
                      <code>
                        <span className="text-[#d7a6ff]">const</span> res ={" "}
                        <span className="text-[#d7a6ff]">await</span>{" "}
                        <span className="text-[#7fd3dc]">fetch</span>({"\n  "}
                        <span className="text-[#c9e59a]">
                          &quot;{SITE_URL}/api/characters?q=luffy&quot;
                        </span>
                        {"\n"});{"\n"}
                        <span className="text-[#d7a6ff]">const</span> [luffy] ={" "}
                        <span className="text-[#d7a6ff]">await</span> res.
                        <span className="text-[#7fd3dc]">json</span>();{"\n\n"}
                        luffy.bounties
                        {"\n  "}.<span className="text-[#7fd3dc]">filter</span>
                        ((b) =&gt; b.is_active){"\n  "}.
                        <span className="text-[#7fd3dc]">map</span>((b) =&gt;
                        b.amount);{" "}
                        <span className="text-[#8d8170]">
                          {"// "}[3000000000]
                        </span>
                      </code>
                    </pre>
                  </figure>
                </InteractiveCard>
              </Reveal>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
