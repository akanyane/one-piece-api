/** Pretty-prints arbitrary JSON into colored, line-oriented tokens for the playground's response viewer. */

export type JsonToken = { id: number; text: string; color: string };
export type JsonLine = { id: number; indent: number; parts: JsonToken[] };

const COLOR = {
  key: "var(--pg-json-key)",
  str: "var(--pg-json-str)",
  num: "var(--pg-json-num)",
  bool: "var(--pg-json-bool)",
  punc: "var(--pg-json-punc)",
} as const;

type TokenInput = { text: string; color: string };

function literal(value: unknown, tail: string): TokenInput {
  if (value === null || value === undefined)
    return { text: `null${tail}`, color: COLOR.punc };
  if (typeof value === "string")
    return { text: `"${value}"${tail}`, color: COLOR.str };
  if (typeof value === "number")
    return { text: `${value}${tail}`, color: COLOR.num };
  if (typeof value === "boolean")
    return { text: `${value}${tail}`, color: COLOR.bool };
  return { text: `${String(value)}${tail}`, color: COLOR.punc };
}

/** Pushes a line, stamping each token with a stable id (its position in this line). */
function pushLine(out: JsonLine[], indent: number, parts: TokenInput[]): void {
  out.push({
    id: out.length,
    indent,
    parts: parts.map((part, id) => ({ id, ...part })),
  });
}

export function tokenizeJson(
  value: unknown,
  out: JsonLine[] = [],
  indent = 0,
  trailingComma = false,
): JsonLine[] {
  const tail = trailingComma ? "," : "";

  if (value !== null && Array.isArray(value)) {
    if (value.length === 0) {
      pushLine(out, indent, [{ text: `[]${tail}`, color: COLOR.punc }]);
      return out;
    }
    pushLine(out, indent, [{ text: "[", color: COLOR.punc }]);
    value.forEach((item, i) => {
      tokenizeJson(item, out, indent + 1, i < value.length - 1);
    });
    pushLine(out, indent, [{ text: `]${tail}`, color: COLOR.punc }]);
    return out;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      pushLine(out, indent, [{ text: `{}${tail}`, color: COLOR.punc }]);
      return out;
    }
    pushLine(out, indent, [{ text: "{", color: COLOR.punc }]);
    entries.forEach(([key, v], i) => {
      const isLast = i === entries.length - 1;
      if (v !== null && typeof v === "object") {
        const sub: JsonLine[] = [];
        tokenizeJson(v, sub, indent + 1, !isLast);
        const [first, ...rest] = sub;
        out.push({
          id: out.length,
          indent: first.indent,
          parts: [
            { id: 0, text: `"${key}"`, color: COLOR.key },
            { id: 1, text: ": ", color: COLOR.punc },
            ...first.parts.map((part, n) => ({ ...part, id: n + 2 })),
          ],
        });
        for (const line of rest) out.push({ ...line, id: out.length });
      } else {
        pushLine(out, indent + 1, [
          { text: `"${key}"`, color: COLOR.key },
          { text: ": ", color: COLOR.punc },
          literal(v, isLast ? "" : ","),
        ]);
      }
    });
    pushLine(out, indent, [{ text: `}${tail}`, color: COLOR.punc }]);
    return out;
  }

  pushLine(out, indent, [literal(value, tail)]);
  return out;
}
