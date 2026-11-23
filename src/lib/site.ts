/**
 * Canonical production origin. Used for metadata, sitemap, robots.txt and API links.
 * `www` is the host Vercel serves; the apex 308-redirects to it, and that redirect
 * carries no CORS headers, so browser `fetch` calls must target `www` directly.
 */
export const SITE_URL = "https://www.onepieceapi.com";
