/**
 * In-memory stand-in for `@/supabase/client`. Every `supabase.from(table)`
 * chain is recorded (method + args, in call order) and resolves to whatever
 * the test's responder returns, so route tests can assert the exact
 * PostgREST query built for each combination of request params.
 */

export type Op = { method: string; args: unknown[] };
export type RecordedQuery = { table: string; ops: Op[] };
export type MockError = { code?: string; message?: string; details?: string };
export type MockResult = {
  data?: unknown;
  error?: MockError | null;
  count?: number | null;
};
type Responder = (query: RecordedQuery) => MockResult;

const defaultResponder: Responder = () => ({ data: [], error: null, count: 0 });

export const recorded: RecordedQuery[] = [];
let responder: Responder = defaultResponder;

export function respond(fn: Responder): void {
  responder = fn;
}

export function resetSupabaseMock(): void {
  recorded.length = 0;
  responder = defaultResponder;
}

/** All calls of one method in a recorded chain, e.g. every `.order(...)`. */
export function calls(query: RecordedQuery, method: string): unknown[][] {
  return query.ops.filter((o) => o.method === method).map((o) => o.args);
}

/** The single call of `method`, failing loudly if there isn't exactly one. */
export function call(query: RecordedQuery, method: string): unknown[] {
  const found = calls(query, method);
  if (found.length !== 1) {
    throw new Error(
      `expected exactly one .${method}() on ${query.table}, got ${found.length}: ${JSON.stringify(query.ops)}`,
    );
  }
  return found[0];
}

/** True when the chain was a count-only `select(..., { head: true })`. */
export function isHeadQuery(query: RecordedQuery): boolean {
  const select = calls(query, "select")[0];
  return (select?.[1] as { head?: boolean } | undefined)?.head === true;
}

function chain(query: RecordedQuery): unknown {
  const proxy: unknown = new Proxy(() => {}, {
    get(_target, prop) {
      if (typeof prop === "symbol") return undefined;
      if (prop === "then") {
        return (
          onFulfilled: (v: unknown) => unknown,
          onRejected: (e: unknown) => unknown,
        ) =>
          Promise.resolve()
            .then(() => {
              const r = responder(query);
              return {
                data: r.data ?? null,
                error: r.error ?? null,
                count: r.count ?? null,
              };
            })
            .then(onFulfilled, onRejected);
      }
      return (...args: unknown[]) => {
        query.ops.push({ method: prop, args });
        return proxy;
      };
    },
  });
  return proxy;
}

export const supabase = {
  from(table: string) {
    const query: RecordedQuery = { table, ops: [] };
    recorded.push(query);
    return chain(query);
  },
};
