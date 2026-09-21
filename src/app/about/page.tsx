import {
  ArrowLeft,
  Cherry,
  Coins,
  Flag,
  Info,
  MapPin,
  Sailboat,
  Terminal,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TITLE = "About";
const DESCRIPTION = "About the One Piece API project and licensing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "One Piece API",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
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
        className="pointer-events-none absolute right-0 bottom-0 size-[min(80vw,420px)] translate-x-1/4 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,oklch(0.55_0.12_220)_22%,transparent),transparent_70%)] blur-3xl"
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
              render={<Link href="/ships" />}
            >
              <Sailboat data-icon="inline-start" />
              Ships
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/islands" />}
            >
              <MapPin data-icon="inline-start" />
              Islands
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/affiliations" />}
            >
              <Flag data-icon="inline-start" />
              Affiliations
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/playground" />}
            >
              <Terminal data-icon="inline-start" />
              Playground
            </Button>
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={<Link href="/about" />}
            >
              <Info data-icon="inline-start" />
              About
            </Button>
          </CatalogNav>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-3">
          <p className="font-display text-[0.7rem] font-medium tracking-[0.28em] text-primary uppercase">
            Grand Line · About
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            About
          </h1>
          <p className="max-w-2xl text-pretty text-sm/relaxed text-muted-foreground md:text-base/relaxed">
            Context, licensing, and how this project relates to the One Piece
            series.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
            <CardDescription>
              Educational and non-commercial API
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-muted-foreground">
            <p>
              One Piece API is a REST interface focused on the manga and anime
              series One Piece. It is meant for learning and community use, not
              for commercial products.
            </p>
            <p>
              See also{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="/documentation"
              >
                documentation
              </Link>{" "}
              for endpoints and usage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical details</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              The app is deployed on Vercel and built with Node.js and Next.js.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              You can contribute or report issues on{" "}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="https://github.com/akanyane/one-piece-api"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Copyright</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-muted-foreground">
            <p>
              One Piece is created by Eiichiro Oda. Data and images are used
              without claiming ownership; rights belong to their respective
              owners.
            </p>
            <p>
              Some material may reference community sources such as the{" "}
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href="https://onepiece.fandom.com/wiki/One_Piece_Wiki"
                rel="noreferrer"
                target="_blank"
              >
                One Piece Wiki
              </a>{" "}
              (Fandom), under applicable licenses where noted.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>This project is open source under the MIT license.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
