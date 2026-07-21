import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "About the One Piece API project and licensing.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <div className="min-h-[calc(100dvh-theme(spacing.14))] bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Logo />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            About
          </h1>
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground md:text-base/relaxed">
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
