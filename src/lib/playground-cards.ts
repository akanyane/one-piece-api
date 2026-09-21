import { displayCharacterName, displayFruitName } from "@/lib/character-name";

export type PlaygroundCard = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  badges: { id: number; text: string }[];
  imageUrl: string | null;
};

function formatBerry(amount: unknown): string {
  return typeof amount === "number"
    ? `฿ ${amount.toLocaleString("en-US")}`
    : "";
}

function titleFor(endpointId: string, item: Record<string, unknown>): string {
  const name = item.name;
  if (typeof name === "string" && name.trim()) return name;
  if (name && typeof name === "object") {
    return endpointId === "devil-fruits"
      ? displayFruitName(name)
      : displayCharacterName(name);
  }
  if (item.id !== undefined && item.id !== null) return `#${item.id}`;
  return "Item";
}

/** Maps raw API records onto the playground's preview-card fields; endpoint-specific subtitle/badges. */
export function cardsFor(
  endpointId: string,
  items: unknown[],
): PlaygroundCard[] {
  return items.slice(0, 48).map((raw, i) => {
    const it = (raw && typeof raw === "object" ? raw : {}) as Record<
      string,
      unknown
    >;
    const badges: { id: number; text: string }[] = [];
    const add = (value: unknown) => {
      if (value !== undefined && value !== null && value !== "") {
        badges.push({ id: badges.length, text: String(value) });
      }
    };

    let subtitle = "";
    if (endpointId === "characters" || endpointId === "character") {
      const extra = (
        it.extra_data && typeof it.extra_data === "object" ? it.extra_data : {}
      ) as Record<string, unknown>;
      subtitle =
        (extra.epithet as string) || (extra.occupation as string) || "";
      add(it.status);
      add(typeof it.age === "number" ? `${it.age} yrs` : "");
      add(extra.affiliation);
    } else if (endpointId === "devil-fruits") {
      const model = it.model;
      subtitle =
        typeof model === "string"
          ? model
          : model && typeof model === "object"
            ? displayFruitName(model)
            : "";
      add(it.type);
      add(it.sub_type);
    } else if (endpointId === "bounties") {
      const embeddedCharacter = it.characters as { name?: unknown } | undefined;
      subtitle = embeddedCharacter?.name
        ? displayCharacterName(embeddedCharacter.name)
        : it.character_id
          ? `character_id ${it.character_id}`
          : "";
      add(formatBerry(it.amount));
      add(it.is_active ? "active" : "former");
    } else if (endpointId === "ships") {
      subtitle = typeof it.type === "string" ? it.type : "";
      add(it.status);
    } else if (endpointId === "islands") {
      subtitle = typeof it.sea === "string" ? it.sea : "";
    } else if (endpointId === "affiliations") {
      subtitle =
        typeof it.memberCount === "number"
          ? `${it.memberCount} characters`
          : "";
    }
    add(it.id !== undefined && it.id !== null ? `id ${it.id}` : "");

    const index = String(i + 1).padStart(2, "0");
    return {
      id: it.id !== undefined && it.id !== null ? String(it.id) : index,
      index,
      title: titleFor(endpointId, it),
      subtitle,
      badges,
      imageUrl:
        typeof it.image_url === "string" && it.image_url ? it.image_url : null,
    };
  });
}

/** Normalizes a parsed response body into a record list for both viewers. */
export function listFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
}
