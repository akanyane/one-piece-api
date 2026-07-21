import {
  BookOpen,
  Cherry,
  Coins,
  ExternalLink,
  Heart,
  Scale,
  Server,
  Users,
} from "lucide-react";
import Link from "next/link";

import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Logo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const REPO = "https://github.com/akanyane/one-piece-api";

function WaveDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("w-full text-card", className)}
      preserveAspectRatio="none"
      role="presentation"
      viewBox="0 0 1440 120"
    >
      <title>Decorative wave</title>
      <path
        className="fill-current"
        d="M0,64 C180,20 360,100 540,56 C720,12 900,92 1080,48 C1260,4 1380,44 1440,28 L1440,120 L0,120 Z"
      />
      <path
        className="fill-current opacity-50"
        d="M0,88 C200,40 400,110 600,64 C800,18 1000,96 1200,52 C1320,28 1400,56 1440,44 L1440,120 L0,120 Z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div
      className={cn(
        "surface-story relative min-h-[calc(100dvh-theme(spacing.14))] overflow-x-clip bg-background text-foreground",
        "[--font-heading:var(--font-display)]",
      )}
    >
      {/* Ambient: soft organic light + grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 grain-overlay opacity-70 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[min(120vw,720px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-primary)_22%,transparent),transparent_75%)] blur-3xl home-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38%] -right-32 size-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.72_0.14_85)_35%,transparent),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[15%] -left-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.55_0.12_220)_28%,transparent),transparent_72%)] blur-2xl"
      />

      <header className="relative z-20 px-4 pt-6 md:px-8">
        <div className="mx-auto flex min-w-0 max-w-5xl items-center gap-3 md:gap-4">
          <div className="home-animate-fade flex shrink-0 items-center gap-3 rounded-full border border-border/80 bg-card/85 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md">
            <Logo />
            <span className="hidden font-display text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              API
            </span>
          </div>
          <CatalogNav className="home-animate-fade home-delay-1">
            <Button
              variant="ghost"
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
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={REPO} rel="noreferrer" target="_blank" />}
            >
              <ExternalLink data-icon="inline-start" />
              GitHub
            </Button>
          </CatalogNav>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative mx-auto max-w-5xl px-4 pt-10 pb-0 md:px-8 md:pt-14">
          <p className="home-animate-rise font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
            Grand Line · REST
          </p>
          <h1 className="home-animate-rise home-delay-1 mt-4 max-w-[18ch] font-display text-[clamp(2.75rem,8vw,4.25rem)] leading-[0.95] font-medium tracking-[-0.03em] text-balance text-foreground">
            One Piece
            <span className="mt-1 block text-[0.42em] font-normal tracking-[0.02em] text-muted-foreground">
              API
            </span>
          </h1>
          <p className="home-animate-rise home-delay-2 mt-8 max-w-xl text-pretty text-base/relaxed text-muted-foreground md:text-lg/relaxed">
            Character and world data from the series, in an API built for
            developers and fans alike — clear, open, and straightforward to
            integrate.
          </p>
          <div className="home-animate-rise home-delay-3 mt-6 flex flex-wrap gap-2">
            <Badge
              className="rounded-full border-primary/25 bg-primary/10 px-3 py-0.5 font-medium text-primary"
              variant="outline"
            >
              REST
            </Badge>
            <Badge
              className="rounded-full border-border/80 px-3 py-0.5"
              variant="outline"
            >
              MIT
            </Badge>
          </div>
          <div className="home-animate-rise home-delay-4 mt-10 flex flex-wrap gap-3">
            <Button
              className="rounded-full px-5 shadow-md shadow-primary/15"
              nativeButton={false}
              render={<Link href="/documentation" />}
            >
              <BookOpen data-icon="inline-start" />
              Documentation
            </Button>
          </div>
        </section>

        <div className="relative -mb-px mt-14 md:mt-20">
          <WaveDivider />
        </div>

        {/* Content */}
        <section className="relative bg-card pb-16 pt-2 md:pb-24">
          <div className="mx-auto max-w-5xl px-4 md:px-8">
            <div className="home-animate-rise home-delay-5 flex flex-col gap-2 border-b border-border/70 pb-10">
              <h2 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
                About the project
              </h2>
              <p className="max-w-2xl text-sm/relaxed text-muted-foreground md:text-base/relaxed">
                Essentials, licensing, and how to get involved — in one place,
                written to be easy to read.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
              <Card className="md:col-span-2 md:flex md:flex-row md:overflow-hidden md:rounded-2xl">
                <div className="hidden w-1 shrink-0 bg-linear-to-b from-primary/50 via-primary/30 to-accent/40 md:block" />
                <div className="min-w-0 flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-lg md:text-xl">
                      Overview
                    </CardTitle>
                    <CardDescription className="text-[0.8125rem]">
                      What this API offers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-muted-foreground">
                    <p>
                      A REST interface focused on the series, with characters
                      and images aligned to reference material.
                    </p>
                    <p>
                      The docs cover routes, parameters, and response formats so
                      you can integrate without friction.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-border/60 pt-4">
                    <Button
                      className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
                      size="sm"
                      variant="secondary"
                      nativeButton={false}
                      render={<Link href="/documentation" />}
                    >
                      <BookOpen data-icon="inline-start" />
                      Open documentation
                    </Button>
                  </CardFooter>
                </div>
              </Card>

              <Card className="rounded-2xl md:rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Heart aria-hidden className="size-4" />
                    </span>
                    Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    A project born from love for the story and a desire to give
                    something useful back to the community as open source.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Server aria-hidden className="size-4" />
                    </span>
                    Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Hosted on Vercel, with Node.js and Next.js serving both the
                    API and the site.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-lg md:text-xl">
                    Contributing
                  </CardTitle>
                  <CardDescription>
                    Issues, pull requests, and ideas are welcome
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Sharing the repo or opening discussions helps other
                    developers discover the project.
                  </p>
                </CardContent>
                <CardFooter className="border-t border-border/60">
                  <Button
                    className="rounded-full px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5"
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<a href={REPO} rel="noreferrer" target="_blank" />}
                  >
                    <ExternalLink data-icon="inline-start" />
                    Repository on GitHub
                  </Button>
                </CardFooter>
              </Card>

              <Card className="rounded-2xl md:rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Copyright
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    One Piece is the work of Eiichiro Oda. Data and images are
                    used without claiming ownership; rights remain with their
                    respective owners.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-lg">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Scale aria-hidden className="size-4" />
                    </span>
                    License
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>Open source under the MIT license.</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="mt-14 bg-border/80" />

            <p className="mt-8 text-center text-[0.7rem] tracking-wide text-muted-foreground">
              Made with care · Data inspired by the work of Eiichiro Oda
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
