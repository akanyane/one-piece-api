import type { MetadataRoute } from "next";

import {
  getAllAffiliationIds,
  getAllCharacterIds,
  getAllDevilFruitIds,
} from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/characters`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/devil-fruits`, changeFrequency: "daily", priority: 0.8 },
  { url: `${SITE_URL}/bounties`, changeFrequency: "daily", priority: 0.8 },
  { url: `${SITE_URL}/ships`, changeFrequency: "daily", priority: 0.7 },
  { url: `${SITE_URL}/islands`, changeFrequency: "daily", priority: 0.7 },
  {
    url: `${SITE_URL}/affiliations`,
    changeFrequency: "daily",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/documentation`,
    changeFrequency: "monthly",
    priority: 0.6,
  },
  { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, fruits, affiliations] = await Promise.all([
    getAllCharacterIds(),
    getAllDevilFruitIds(),
    getAllAffiliationIds(),
  ]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    ...route,
    lastModified: now,
  }));

  const characterRoutes: MetadataRoute.Sitemap = characters.map((c) => ({
    url: `${SITE_URL}/characters/${c.id}`,
    lastModified: c.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const detailRoutes = (
    rows: { id: string; created_at: string }[],
    base: string,
  ): MetadataRoute.Sitemap =>
    rows.map((r) => ({
      url: `${SITE_URL}/${base}/${r.id}`,
      lastModified: r.created_at,
      changeFrequency: "monthly",
      priority: 0.4,
    }));

  return [
    ...staticRoutes,
    ...characterRoutes,
    ...detailRoutes(fruits, "devil-fruits"),
    ...detailRoutes(affiliations, "affiliations"),
  ];
}
