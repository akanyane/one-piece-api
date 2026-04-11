export type AgeBand = "all" | "0-12" | "13-17" | "18-29" | "30-59" | "60+";

const AGE_BANDS = new Set<AgeBand>([
  "all",
  "0-12",
  "13-17",
  "18-29",
  "30-59",
  "60+",
]);

export function parseAgeBand(raw: string | string[] | undefined): AgeBand {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && AGE_BANDS.has(v as AgeBand)) return v as AgeBand;
  return "all";
}

const MAX_Q = 120;

export function parseNameQuery(raw: string | string[] | undefined): string {
  const v = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  return v.trim().slice(0, MAX_Q).replace(/,/g, " ");
}

export function buildCharactersListHref(opts: {
  page: number;
  limit: number;
  q: string;
  ageBand: AgeBand;
}): string {
  const params = new URLSearchParams({
    page: String(opts.page),
    limit: String(opts.limit),
  });
  if (opts.q) params.set("q", opts.q);
  if (opts.ageBand !== "all") params.set("ageBand", opts.ageBand);
  return `/characters?${params.toString()}`;
}

export function ageRangeForBand(band: AgeBand): {
  min: number | null;
  max: number | null;
} {
  switch (band) {
    case "0-12":
      return { min: 0, max: 12 };
    case "13-17":
      return { min: 13, max: 17 };
    case "18-29":
      return { min: 18, max: 29 };
    case "30-59":
      return { min: 30, max: 59 };
    case "60+":
      return { min: 60, max: null };
    default:
      return { min: null, max: null };
  }
}
