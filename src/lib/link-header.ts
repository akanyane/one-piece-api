export type PageRel = "first" | "prev" | "next" | "last";

/**
 * Page number per rel from an RFC 8288 `Link` header, as sent by the list
 * endpoints, e.g. `<…/api/ships?page=2&limit=20>; rel="next"`.
 * Unknown rels and links without a positive `page` are ignored.
 */
export function parseLinkPages(
  header: string | null,
): Partial<Record<PageRel, number>> {
  const pages: Partial<Record<PageRel, number>> = {};
  for (const [, url, rel] of (header ?? "").matchAll(
    /<([^>]+)>;\s*rel="(first|prev|next|last)"/g,
  )) {
    const page = Number(
      new URL(url, "http://localhost").searchParams.get("page"),
    );
    if (Number.isInteger(page) && page > 0) pages[rel as PageRel] = page;
  }
  return pages;
}
