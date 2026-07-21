import type { MetadataRoute } from "next";

import { getAllCharacterIds } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/characters`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/devil-fruits`, changeFrequency: "daily", priority: 0.8 },
  { url: `${SITE_URL}/bounties`, changeFrequency: "daily", priority: 0.8 },
  {
    url: `${SITE_URL}/documentation`,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const characters = await getAllCharacterIds();

  const characterRoutes: MetadataRoute.Sitemap = characters.map((c) => ({
    url: `${SITE_URL}/characters/${c.id}`,
    lastModified: c.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...STATIC_ROUTES, ...characterRoutes];
}
