import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageBackdrop } from "@/components/layout/page-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Page chrome shared by every detail page: backdrop, header, breadcrumb, footer. */
export function DetailShell({
  parent,
  current,
  children,
}: {
  parent: { href: string; label: string };
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="surface-story relative min-h-dvh overflow-x-clip bg-background text-foreground [--font-heading:var(--font-display)]">
      <PageBackdrop />
      <SiteHeader />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-20 md:px-8 md:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="home-animate-fade mb-8 flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground"
        >
          <Link className="hover:text-foreground" href={parent.href}>
            {parent.label}
          </Link>
          <ChevronRight aria-hidden className="size-3.5 opacity-60" />
          <span aria-current="page" className="truncate text-foreground">
            {current}
          </span>
        </nav>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
