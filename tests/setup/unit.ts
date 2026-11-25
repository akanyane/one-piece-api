import { afterEach, vi } from "vitest";

import { resetSupabaseMock } from "../helpers/supabase-mock";

// Never touch the real database in unit tests.
vi.mock("@/supabase/client", () => import("../helpers/supabase-mock"));
// `unstable_cache` needs the Next.js runtime; outside it, call through.
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

afterEach(() => {
  resetSupabaseMock();
});
