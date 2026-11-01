import type { Metadata } from "next";
import Link from "next/link";

import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
      <PageBackdrop />

      <SiteHeader />

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
      <SiteFooter />
    </div>
  );
}
