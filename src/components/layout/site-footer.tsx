import Link from "next/link";

import { GithubIcon } from "@/components/icons/github";
import { LogoMark } from "@/components/logo";
import { CATALOG_NAV, DEV_NAV, REPO_URL } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/70 bg-card/60 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div className="max-w-sm">
          <Link className="inline-flex items-center gap-2.5" href="/">
            <LogoMark />
            <span className="font-display text-lg font-medium">
              One Piece API
            </span>
          </Link>
          <p className="mt-3 text-sm/relaxed text-muted-foreground">
            An open-source fan project. One Piece is the work of Eiichiro Oda;
            data and images are used without claiming ownership — rights remain
            with their respective owners.
          </p>
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GithubIcon className="size-4" />
            akanyane/one-piece-api
          </a>
        </div>
        <nav aria-label="Catalog">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Catalog
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {CATALOG_NAV.map(({ href, label }) => (
              <li key={href}>
                <Link className="hover:text-primary" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Project">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Project
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {DEV_NAV.map(({ href, label }) => (
              <li key={href}>
                <Link className="hover:text-primary" href={href}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:text-primary" href="/about">
                About
              </Link>
            </li>
            <li>
              <a className="hover:text-primary" href="/llms.txt">
                llms.txt
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-5 text-[0.75rem] text-muted-foreground md:px-8">
          MIT licensed · Made with care for the crew
        </p>
      </div>
    </footer>
  );
}
