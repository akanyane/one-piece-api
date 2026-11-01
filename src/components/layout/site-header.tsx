"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { GithubIcon } from "@/components/icons/github";
import { SearchDialog } from "@/components/layout/search-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/logo";
import { CATALOG_NAV, DEV_NAV, type NavItem, REPO_URL } from "@/lib/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop pill nav: the active pill and the hover highlight both slide between items. */
function PillNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <ul
      className="flex items-center gap-0.5"
      onPointerLeave={() => setHovered(null)}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-200",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              href={href}
              onFocus={() => setHovered(href)}
              onPointerEnter={() => setHovered(href)}
            >
              {hovered === href && !active ? (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  layoutId="nav-hover"
                  transition={spring}
                />
              ) : null}
              {active ? (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
                  layoutId="nav-active"
                  transition={spring}
                />
              ) : null}
              <Icon aria-hidden className="size-3.5" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Full-screen sheet for small screens, links stagger in. */
function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label="Site menu"
          aria-modal="true"
          className="fixed inset-0 top-[60px] z-50 overflow-y-auto bg-background/95 backdrop-blur-xl xl:hidden"
          exit={{ opacity: 0 }}
          id="mobile-menu"
          initial={{ opacity: 0 }}
          role="dialog"
          transition={{ duration: 0.2 }}
        >
          <nav className="mx-auto flex max-w-lg flex-col px-4 py-6">
            {[
              { title: "Catalog", items: CATALOG_NAV },
              { title: "Developers", items: DEV_NAV },
            ].map((group, g) => (
              <div className="mb-6" key={group.title}>
                <p className="mb-2 px-3 text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  {group.title}
                </p>
                <ul className="flex flex-col">
                  {group.items.map(({ href, label, icon: Icon, blurb }, i) => {
                    const active = isActive(pathname, href);
                    return (
                      <motion.li
                        animate={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -16 }}
                        key={href}
                        transition={{
                          delay: (g * CATALOG_NAV.length + i) * 0.035,
                          ease: [0.22, 1, 0.36, 1],
                          duration: 0.4,
                        }}
                      >
                        <Link
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors",
                            active ? "bg-primary/10" : "hover:bg-accent",
                          )}
                          href={href}
                          onClick={onClose}
                        >
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-primary",
                            )}
                          >
                            <Icon aria-hidden className="size-4.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-xl font-medium">
                              {label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {blurb}
                            </span>
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <a
              className="mx-3 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-medium"
              href={REPO_URL}
              rel="noreferrer"
              target="_blank"
            >
              <GithubIcon className="size-4" />
              View on GitHub
            </a>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * The one header every page shares: sticky, frosted once the page scrolls,
 * a reading-progress hairline, sliding active pill, ⌘K search and a
 * full-screen menu on small screens.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet whenever the route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
          solid
            ? "border-border/60 bg-background/80 shadow-[0_8px_30px_-18px_color-mix(in_oklch,var(--foreground)_35%,transparent)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[60px] min-w-0 max-w-6xl items-center gap-3 px-4 md:px-8">
          <Link
            aria-label="One Piece API — home"
            className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border/80 bg-card/85 py-1 pr-3.5 pl-1 shadow-sm backdrop-blur-md transition-[transform,box-shadow] duration-300 hover:-translate-y-px hover:shadow-md"
            href="/"
          >
            <span className="transition-transform duration-500 group-hover:-rotate-12">
              <LogoMark />
            </span>
            <span className="font-display text-[0.75rem] font-semibold tracking-[0.2em] text-foreground uppercase">
              OP<span className="text-primary">·</span>API
            </span>
          </Link>

          <nav
            aria-label="Site sections"
            className="mx-auto hidden items-center rounded-full border border-border/80 bg-card/85 p-1 shadow-sm backdrop-blur-md xl:flex"
          >
            <PillNav items={CATALOG_NAV} pathname={pathname} />
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
            <PillNav items={DEV_NAV} pathname={pathname} />
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-0">
            <button
              aria-label="Search characters"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border/80 bg-card/85 px-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground sm:pr-1.5 sm:pl-3"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search aria-hidden className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 font-mono text-[0.65rem] sm:inline">
                ⌘K
              </kbd>
            </button>
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
            <button
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-card/85 shadow-sm xl:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              type="button"
            >
              {menuOpen ? (
                <X aria-hidden className="size-4" />
              ) : (
                <Menu aria-hidden className="size-4" />
              )}
            </button>
          </div>
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-linear-to-r from-primary via-[oklch(0.75_0.14_80)] to-[oklch(0.58_0.2_25)]"
          style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
        />
      </header>
      <MobileMenu
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
        pathname={pathname}
      />
      <SearchDialog onOpenChange={setSearchOpen} open={searchOpen} />
    </>
  );
}
