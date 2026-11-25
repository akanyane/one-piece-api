/** Cartesian product of named value lists: every combination, as objects. */
export function combinations<T extends Record<string, readonly unknown[]>>(
  axes: T,
): { [K in keyof T]: T[K][number] }[] {
  let out: Record<string, unknown>[] = [{}];
  for (const [key, values] of Object.entries(axes)) {
    out = out.flatMap((combo) => values.map((v) => ({ ...combo, [key]: v })));
  }
  return out as { [K in keyof T]: T[K][number] }[];
}

/** Builds a request URL, skipping params whose value is `undefined`. */
export function apiUrl(
  path: string,
  params: Record<string, string | undefined> = {},
): string {
  const url = new URL(path, "https://www.onepieceapi.com");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  return url.toString();
}

/** Human-readable label for a combo, for test names. */
export function label(params: Record<string, unknown>): string {
  return (
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(" ") || "(no params)"
  );
}
