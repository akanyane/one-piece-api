import {
  BookOpen,
  Cherry,
  Coins,
  Flag,
  type LucideIcon,
  MapPin,
  Sailboat,
  Terminal,
  Users,
} from "lucide-react";

export const REPO_URL = "https://github.com/akanyane/one-piece-api";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** One-liner used by the homepage's section grid. */
  blurb: string;
};

/** Catalog sections — one per API resource with a browsable page. */
export const CATALOG_NAV: NavItem[] = [
  {
    href: "/characters",
    label: "Characters",
    icon: Users,
    blurb: "Pirates, marines and everyone in between, with portraits.",
  },
  {
    href: "/devil-fruits",
    label: "Devil fruits",
    icon: Cherry,
    blurb: "Paramecia, Zoan and Logia — names, models and art.",
  },
  {
    href: "/bounties",
    label: "Bounties",
    icon: Coins,
    blurb: "Every price on every head, sortable by Berries.",
  },
  {
    href: "/ships",
    label: "Ships",
    icon: Sailboat,
    blurb: "From the Going Merry to the Moby Dick.",
  },
  {
    href: "/islands",
    label: "Islands",
    icon: MapPin,
    blurb: "Ports of call across the four Blues and the Grand Line.",
  },
  {
    href: "/affiliations",
    label: "Affiliations",
    icon: Flag,
    blurb: "Crews, fleets and factions, ranked by member count.",
  },
];

/** Developer-facing pages. */
export const DEV_NAV: NavItem[] = [
  {
    href: "/documentation",
    label: "Docs",
    icon: BookOpen,
    blurb: "Routes, parameters and response shapes.",
  },
  {
    href: "/playground",
    label: "Playground",
    icon: Terminal,
    blurb: "Fire live requests from the browser.",
  },
];
