import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "@/proxy";

/** Captures what the proxy hands to `waitUntil` and lets tests await it. */
function fakeEvent() {
  const pending: Promise<unknown>[] = [];
  return {
    event: { waitUntil: (p: Promise<unknown>) => pending.push(p) } as never,
    settled: () => Promise.all(pending),
    count: () => pending.length,
  };
}

const fetchMock = vi.fn<typeof fetch>();

function request(
  path: string,
  init: { method?: string; headers?: Record<string, string> } = {},
) {
  return new NextRequest(`https://www.onepieceapi.com${path}`, init);
}

function rpcBody(i = 0) {
  const [, init] = fetchMock.mock.calls[i];
  return JSON.parse(String(init?.body));
}

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("TRACK_API_USAGE", "");
});

describe("proxy matcher", () => {
  it("only runs on the public API and the spec", () => {
    expect(config.matcher).toEqual(["/api/:path*", "/openapi.json"]);
  });
});

describe("proxy tracking", () => {
  it("lets the request through and records one anonymous hit", async () => {
    const { event, settled } = fakeEvent();
    const res = proxy(
      request("/api/characters/637dd95f-248c-42a8-9dc3-9ad4531c1801?q=luffy", {
        headers: {
          "user-agent": "python-requests/2.32",
          "x-vercel-ip-country": "BR",
          origin: "https://Example.dev:8443",
          "x-forwarded-for": "203.0.113.9",
        },
      }),
      event,
    );
    expect(res.headers.get("x-middleware-next")).toBe("1");
    await settled();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.supabase.co/rest/v1/rpc/track_api_hit");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      apikey: "sb_secret_test",
      "Content-Type": "application/json",
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(rpcBody()).toEqual({
      p_path: "/api/characters/{id}",
      p_client: "python",
      p_country: "BR",
      p_origin: "example.dev:8443",
      p_agent: "",
      p_visitor: expect.stringMatching(/^[0-9a-f]{16}$/),
      // Params are only recorded for list endpoints.
      p_params: [],
    });
    // Never the IP, the query string or the raw user agent.
    expect(String(init?.body)).not.toMatch(/203\.0\.113|luffy|requests\/2/);
  });

  it.each(["GET", "HEAD"])("counts %s", async (method) => {
    const { event, count } = fakeEvent();
    proxy(request("/api/ships", { method }), event);
    expect(count()).toBe(1);
  });

  it.each(["OPTIONS", "POST", "PUT", "DELETE"])(
    "ignores %s",
    async (method) => {
      const { event, count } = fakeEvent();
      proxy(request("/api/ships", { method }), event);
      expect(count()).toBe(0);
    },
  );

  it.each([
    ["preview", "", 0],
    ["development", "", 0],
    ["", "", 0],
    ["preview", "1", 1],
    ["", "1", 1],
    ["production", "", 1],
  ])("VERCEL_ENV=%j TRACK_API_USAGE=%j → %i hits", (env, flag, hits) => {
    vi.stubEnv("VERCEL_ENV", env);
    vi.stubEnv("TRACK_API_USAGE", flag);
    const { event, count } = fakeEvent();
    proxy(request("/api/ships"), event);
    expect(count()).toBe(hits);
  });

  it("skips the e2e test suite's own traffic", () => {
    const { event, count } = fakeEvent();
    proxy(
      request("/api/ships", {
        headers: { "user-agent": "one-piece-api-e2e/1.0" },
      }),
      event,
    );
    expect(count()).toBe(0);
  });

  it("sends empty strings when country and origin are missing", async () => {
    const { event, settled } = fakeEvent();
    proxy(request("/openapi.json"), event);
    await settled();
    expect(rpcBody()).toEqual({
      p_path: "/openapi.json",
      p_client: "none",
      p_country: "",
      p_origin: "",
      p_agent: "",
      p_visitor: "",
      p_params: [],
    });
  });

  it("records the agent name, bucketed params and a hashed visitor on list calls", async () => {
    const { event, settled } = fakeEvent();
    proxy(
      request(
        "/api/characters?q=%20Monkey%20D.%20Luffy%20&page=3&limit=500&status=alive",
        {
          headers: {
            "user-agent": "Dataview/2.1 (+https://dataview.example)",
            "x-real-ip": "198.51.100.7",
          },
        },
      ),
      event,
    );
    await settled();
    const body = rpcBody();
    expect(body).toMatchObject({
      p_path: "/api/characters",
      p_client: "other",
      p_agent: "Dataview",
      p_params: [
        { param: "page", value: "2-5" },
        { param: "limit", value: ">100" },
        { param: "q", value: "monkey d. luffy" },
        { param: "other", value: "status" },
      ],
    });
    expect(body.p_visitor).toMatch(/^[0-9a-f]{16}$/);
    expect(JSON.stringify(body)).not.toMatch(/198\.51\.100/);
  });

  it("gives the same IP the same visitor id within a day, and a different one to other IPs", async () => {
    const visit = async (ip: string) => {
      fetchMock.mockClear();
      const { event, settled } = fakeEvent();
      proxy(request("/api/ships", { headers: { "x-real-ip": ip } }), event);
      await settled();
      return rpcBody().p_visitor;
    };
    const a = await visit("192.0.2.1");
    expect(await visit("192.0.2.1")).toBe(a);
    expect(await visit("192.0.2.2")).not.toBe(a);
  });

  it("never throws when the database call fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("network down"));
    const { event, settled } = fakeEvent();
    proxy(request("/api/ships"), event);
    await expect(settled()).resolves.toBeDefined();
    expect(log).toHaveBeenCalled();
  });

  it("logs non-2xx answers from the RPC", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response("nope", { status: 401 }));
    const { event, settled } = fakeEvent();
    proxy(request("/api/ships"), event);
    await settled();
    expect(log).toHaveBeenCalledWith("api usage: track failed", 401);
  });

  it("does nothing without Supabase credentials", async () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    const { event, settled } = fakeEvent();
    proxy(request("/api/ships"), event);
    await settled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
