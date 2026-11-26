import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/internal/revalidate/route";
import { isAuthorized, parseTags } from "@/lib/api-revalidate";
import { CACHE_TAGS } from "@/lib/data";

const SECRET = "s3cret-value";
const URL_BASE = "https://www.onepieceapi.com/internal/revalidate";

function post(query = "", auth: string | null = `Bearer ${SECRET}`) {
  const headers = new Headers();
  if (auth !== null) headers.set("authorization", auth);
  return POST(new Request(`${URL_BASE}${query}`, { method: "POST", headers }));
}

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
  vi.stubEnv("REVALIDATE_SECRET", SECRET);
});

describe("POST /internal/revalidate", () => {
  it("purges every tag by default, without stale reads", async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.revalidated).toEqual([...CACHE_TAGS]);
    expect(typeof body.now).toBe("number");
    expect(vi.mocked(revalidateTag).mock.calls).toEqual(
      CACHE_TAGS.map((t) => [t, { expire: 0 }]),
    );
  });

  it.each([
    ["?tag=islands", ["islands"]],
    ["?tag=characters,ships", ["characters", "ships"]],
    ["?tag=%20ships%20,,ships", ["ships"]],
    ["?tag=", [...CACHE_TAGS]],
  ])("%s purges only the requested tags", async (query, expected) => {
    const res = await post(query);
    expect(res.status).toBe(200);
    expect((await res.json()).revalidated).toEqual(expected);
    expect(vi.mocked(revalidateTag).mock.calls.map(([t]) => t)).toEqual(
      expected,
    );
  });

  it("rejects unknown tags with 400 and lists the valid ones", async () => {
    const res = await post("?tag=islands,pirates,navy");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Unknown tag: pirates, navy",
      validTags: [...CACHE_TAGS],
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it.each([
    ["no header", null],
    ["wrong secret", "Bearer nope"],
    ["secret as a prefix", `Bearer ${SECRET}x`],
    ["no scheme", SECRET],
    ["empty bearer", "Bearer "],
  ])("answers 401 on %s", async (_, auth) => {
    const res = await post("", auth);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("answers 503 when no secret is configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await post();
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

describe("isAuthorized / parseTags", () => {
  it("accepts any casing of the Bearer scheme", () => {
    expect(isAuthorized(`bearer ${SECRET}`, SECRET)).toBe(true);
    expect(isAuthorized(`BEARER   ${SECRET}`, SECRET)).toBe(true);
  });

  it("parses null as every tag", () => {
    expect(parseTags(null)).toEqual({ tags: [...CACHE_TAGS] });
  });
});
