import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/fx/copy-button";
import { GithubIcon } from "@/components/icons/github";
import { LogoMark } from "@/components/logo";
import { CATALOG_NAV, DEV_NAV, REPO_URL } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";
import pkg from "../../../package.json";

const CURL = `curl ${SITE_URL}/api/characters?limit=1`;

/** Layered sea swell that sits on top of the footer. */
function Waves() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -top-[calc(theme(spacing.16)-1px)] left-0 h-16 w-[calc(100%+80px)] max-w-none text-card"
      preserveAspectRatio="none"
      viewBox="0 0 1440 80"
    >
      <path
        className="footer-wave fill-current opacity-40"
        d="M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,80 L0,80 Z"
      />
      <path
        className="footer-wave footer-wave-slow fill-current opacity-70"
        d="M0,52 C200,28 420,76 720,50 C1000,26 1220,72 1440,50 L1440,80 L0,80 Z"
      />
      <path
        className="fill-current"
        d="M0,64 C260,48 520,80 760,62 C1000,46 1240,76 1440,62 L1440,80 L0,80 Z"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 bg-card">
      <Waves />

      <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
        {/* CTA */}
        <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-background/60 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="font-display text-2xl font-medium tracking-tight md:text-3xl">
              Ready to set sail?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No key, no sign-up. Copy this and you have data.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#17120d] py-1.5 pr-1.5 pl-4 text-[#e9dfc9] shadow-lg md:max-w-md">
            <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[0.8rem] whitespace-nowrap">
              <span className="text-[#28c840]">$</span> {CURL}
            </code>
            <CopyButton label="Copy curl command" value={CURL} />
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link className="inline-flex items-center gap-2.5" href="/">
              <LogoMark />
              <span className="font-display text-lg font-medium">
                One Piece API
              </span>
            </Link>
            <p className="mt-3 text-sm/relaxed text-muted-foreground">
              A free, open-source REST API for the world of One Piece — built by
              fans, for developers.
            </p>
            <a
              className="group mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/40"
              href={REPO_URL}
              rel="noreferrer"
              target="_blank"
            >
              <GithubIcon className="size-4" />
              Star on GitHub
              <ArrowUpRight
                aria-hidden
                className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>

          <FooterColumn
            links={CATALOG_NAV.map(({ href, label }) => ({ href, label }))}
            title="Catalog"
          />
          <FooterColumn
            links={[
              ...DEV_NAV.map(({ href, label }) => ({ href, label })),
              { href: "/api", label: "API index" },
              { href: "/llms.txt", label: "llms.txt" },
            ]}
            title="Developers"
          />
          <FooterColumn
            links={[
              { href: "/about", label: "About" },
              { href: `${REPO_URL}/issues`, label: "Report an issue" },
              { href: `${REPO_URL}/blob/main/LICENSE`, label: "MIT license" },
              { href: `${REPO_URL}/releases`, label: "Changelog" },
            ]}
            title="Project"
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border/70 py-6 text-[0.75rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            One Piece is the work of Eiichiro Oda. Data and images are used
            without claiming ownership.
          </p>
          <p className="flex items-center gap-2 font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500" />v
            {pkg.version} · MIT
          </p>
        </div>
      </div>

      {/* Oversized watermark that bleeds off the bottom edge. */}
      <div aria-hidden className="overflow-hidden">
        <p className="pointer-events-none -mb-[0.22em] text-center font-wanted text-[clamp(4rem,17vw,15rem)] leading-none tracking-[0.04em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_color-mix(in_oklch,var(--foreground)_14%,transparent)]">
          ONE PIECE
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        {links.map(({ href, label }) => {
          const external = href.startsWith("http");
          const className =
            "inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-primary";
          return (
            <li key={href}>
              {external ? (
                <a
                  className={className}
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {label}
                  <ArrowUpRight aria-hidden className="size-3 opacity-50" />
                </a>
              ) : (
                <Link className={className} href={href}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
