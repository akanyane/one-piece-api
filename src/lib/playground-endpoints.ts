import {
  AFFILIATION_FIELDS,
  type ApiFieldRow,
  BOUNTY_FIELDS,
  CHARACTER_FIELDS,
  DEVIL_FRUIT_FIELDS,
  ISLAND_FIELDS,
  SHIP_FIELDS,
} from "@/lib/api-fields";

export type PlaygroundParam = {
  name: string;
  placeholder: string;
  hint: string;
};

export type PlaygroundEndpoint = {
  id: string;
  label: string;
  path: string;
  title: string;
  figure: string;
  description: string;
  params: PlaygroundParam[];
  fields: ApiFieldRow[];
};

const INDEX_FIELDS: ApiFieldRow[] = [
  {
    field: "characters",
    type: "string",
    notes: "URL of the characters collection",
  },
  {
    field: "devilFruits",
    type: "string",
    notes: "URL of the devil fruits collection",
  },
  {
    field: "bounties",
    type: "string",
    notes: "URL of the bounties collection",
  },
  { field: "ships", type: "string", notes: "URL of the ships collection" },
  { field: "islands", type: "string", notes: "URL of the islands collection" },
  {
    field: "affiliations",
    type: "string",
    notes: "URL of the affiliations collection",
  },
];

const PAGINATION_PARAMS: PlaygroundParam[] = [
  { name: "page", placeholder: "1", hint: "1-based" },
  { name: "limit", placeholder: "20", hint: "max 100" },
];

export const PLAYGROUND_ENDPOINTS: PlaygroundEndpoint[] = [
  {
    id: "index",
    label: "/api",
    path: "/api",
    title: "API index",
    figure: "00",
    description:
      "A map of every available endpoint URL. Useful as a discovery call.",
    params: [],
    fields: INDEX_FIELDS,
  },
  {
    id: "characters",
    label: "/api/characters",
    path: "/api/characters",
    title: "Characters",
    figure: "01",
    description:
      "Paginated list of characters with localized names, images, canonical stats, and embedded bounties.",
    params: [
      ...PAGINATION_PARAMS,
      { name: "q", placeholder: "luffy", hint: "name search" },
      {
        name: "ageBand",
        placeholder: "18-29",
        hint: "0-12, 13-17, 18-29, 30-59, 60+",
      },
    ],
    fields: [
      ...CHARACTER_FIELDS,
      {
        field: "bounties",
        type: "array",
        notes:
          "Embedded bounty objects (same shape as GET /api/bounties items)",
      },
    ],
  },
  {
    id: "character",
    label: "/api/characters/{id}",
    path: "/api/characters/{id}",
    title: "Character detail",
    figure: "02",
    description: "A single character by id, including embedded bounties.",
    params: [
      {
        name: "id",
        placeholder: "uuid, from /api/characters",
        hint: "path param",
      },
    ],
    fields: [
      ...CHARACTER_FIELDS,
      { field: "bounties", type: "array", notes: "Embedded bounty objects" },
    ],
  },
  {
    id: "devil-fruits",
    label: "/api/devil-fruits",
    path: "/api/devil-fruits",
    title: "Devil fruits",
    figure: "03",
    description: "Paginated list of devil fruits by class and model.",
    params: PAGINATION_PARAMS,
    fields: DEVIL_FRUIT_FIELDS,
  },
  {
    id: "bounties",
    label: "/api/bounties",
    path: "/api/bounties",
    title: "Bounties",
    figure: "04",
    description:
      "Paginated bounty records, with optional status filter and sort order.",
    params: [
      ...PAGINATION_PARAMS,
      { name: "isActive", placeholder: "true", hint: "true or false" },
      { name: "sort", placeholder: "high", hint: "high, low or newest" },
    ],
    fields: BOUNTY_FIELDS,
  },
  {
    id: "ships",
    label: "/api/ships",
    path: "/api/ships",
    title: "Ships",
    figure: "05",
    description: "Paginated list of ships and their fate in the series.",
    params: PAGINATION_PARAMS,
    fields: SHIP_FIELDS,
  },
  {
    id: "islands",
    label: "/api/islands",
    path: "/api/islands",
    title: "Islands",
    figure: "06",
    description: "Paginated list of islands grouped by sea.",
    params: PAGINATION_PARAMS,
    fields: ISLAND_FIELDS,
  },
  {
    id: "affiliations",
    label: "/api/affiliations",
    path: "/api/affiliations",
    title: "Affiliations",
    figure: "07",
    description:
      "Paginated list of factions, biggest first, with the number of linked characters.",
    params: PAGINATION_PARAMS,
    fields: AFFILIATION_FIELDS,
  },
];

export const PLAYGROUND_DEFAULT_VALUES: Record<
  string,
  Record<string, string>
> = {
  characters: { limit: "12" },
};

export function endpointById(id: string): PlaygroundEndpoint {
  return (
    PLAYGROUND_ENDPOINTS.find((endpoint) => endpoint.id === id) ??
    PLAYGROUND_ENDPOINTS[0]
  );
}

/** Composes the request URL: substitutes `{id}` in the path, appends non-empty query params. */
export function buildRequestUrl(
  base: string,
  endpoint: PlaygroundEndpoint,
  values: Record<string, string>,
): string {
  let path = endpoint.path;
  if (path.includes("{id}")) {
    path = path.replace("{id}", encodeURIComponent((values.id ?? "").trim()));
  }
  const query = endpoint.params
    .filter((p) => p.name !== "id" && (values[p.name] ?? "").trim() !== "")
    .map(
      (p) =>
        `${encodeURIComponent(p.name)}=${encodeURIComponent(values[p.name].trim())}`,
    )
    .join("&");
  return `${base}${path}${query ? `?${query}` : ""}`;
}
