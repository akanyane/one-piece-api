// Purge the API's data cache after editing rows directly in Supabase.
// Usage: pnpm revalidate [tag,tag]   (no tag = every resource)
// Needs REVALIDATE_SECRET; API_BASE_URL defaults to production.
const base = process.env.API_BASE_URL ?? "https://www.onepieceapi.com";
const secret = process.env.REVALIDATE_SECRET;
if (!secret) {
  console.error("REVALIDATE_SECRET is not set (add it to .env).");
  process.exit(1);
}

const url = new URL("/internal/revalidate", base);
const tags = process.argv[2];
if (tags) url.searchParams.set("tag", tags);

const res = await fetch(url, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}` },
});
console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);
