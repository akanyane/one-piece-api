import { tokenizeJson } from "@/lib/json-tokens";

const LINE_CAP = 600;

export function JsonViewer({ data }: { data: unknown }) {
  const allLines =
    data === null || data === undefined ? [] : tokenizeJson(data);
  const lines = allLines.slice(0, LINE_CAP);
  const truncatedCount = allLines.length - lines.length;

  return (
    <div className="overflow-auto border border-[var(--pg-hairline)] bg-[var(--pg-panel)] py-4 font-mono text-[12.5px]">
      {lines.map((line, i) => (
        <div className="flex min-h-[21px] items-baseline" key={line.id}>
          <span className="w-[52px] flex-none border-r border-[var(--pg-sunken-2)] pr-3.5 text-right text-[10.5px] text-[var(--pg-muted-4)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="w-4 flex-none" />
          <div className="flex" style={{ paddingLeft: line.indent * 16 }}>
            {line.parts.map((part) => (
              <span
                className="whitespace-pre"
                key={part.id}
                style={{ color: part.color }}
              >
                {part.text}
              </span>
            ))}
          </div>
        </div>
      ))}
      {truncatedCount > 0 && (
        <div className="pt-3 pl-[68px] text-[11.5px] text-[var(--pg-muted-2)]">
          {truncatedCount} more lines — use Copy response for the full payload
        </div>
      )}
    </div>
  );
}
