"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { GithubIcon } from "@/components/icons/github";
import { CatalogNav } from "@/components/layout/catalog-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { CATALOG_NAV, DEV_NAV, REPO_URL } from "@/lib/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The one header every page shares. Sticky, turns into a frosted bar once the
 * page scrolls, and highlights the current section from the URL.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/60 bg-background/75 shadow-[0_8px_30px_-18px_color-mix(in_oklch,var(--foreground)_35%,transparent)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex min-w-0 max-w-6xl items-center gap-3 px-4 py-3 md:gap-4 md:px-8">
        <Link
          aria-label="One Piece API — home"
          className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border/80 bg-card/85 py-1.5 pr-3 pl-1.5 shadow-sm backdrop-blur-md transition-[transform,box-shadow] duration-300 hover:-translate-y-px hover:shadow-md"
          href="/"
        >
          <span className="transition-transform duration-500 group-hover:rotate-[-12deg]">
            <LogoMark />
          </span>
          <span className="hidden font-display text-[0.7rem] font-semibold tracking-[0.22em] text-foreground uppercase sm:inline">
            OP<span className="text-primary">·</span>API
          </span>
        </Link>

        <CatalogNav>
          {[...CATALOG_NAV, ...DEV_NAV].map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                href={href}
                key={href}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </CatalogNav>

        <div className="flex shrink-0 items-center gap-1">
          <a
            aria-label="GitHub repository"
            className="hidden size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            href={REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GithubIcon className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
