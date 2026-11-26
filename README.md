# One Piece API

[![Release](https://img.shields.io/github/v/release/akanyane/one-piece-api)](https://github.com/akanyane/one-piece-api/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-6BA539)](https://www.onepieceapi.com/openapi.json)

A free REST API for the **One Piece** manga and anime: characters, devil fruits, bounties, ships, islands and affiliations, with names in English, Japanese and romaji, plus images.

- **No API key, no sign-up.** Just send a `GET`.
- **CORS enabled.** Call it straight from a browser app.
- **OpenAPI 3.1 spec.** Import it into Postman or Insomnia, or generate a client.

**Base URL:** `https://www.onepieceapi.com`

[Website](https://www.onepieceapi.com) · [Documentation](https://www.onepieceapi.com/documentation) · [Playground](https://www.onepieceapi.com/playground) · [OpenAPI spec](https://www.onepieceapi.com/openapi.json)

---

## Quick start

```bash
curl "https://www.onepieceapi.com/api/characters?q=luffy&limit=1"
```

**JavaScript**

```js
const res = await fetch("https://www.onepieceapi.com/api/bounties?sort=high&isActive=true&limit=5");
const bounties = await res.json();
console.log(bounties.map((b) => `${b.characters.name.en}: ฿${b.amount.toLocaleString()}`));
```

**Python**

```python
import requests

fruits = requests.get("https://www.onepieceapi.com/api/devil-fruits", params={"limit": 10}).json()
for fruit in fruits:
    print(fruit["name"]["en"], "-", fruit["type"])
```

## Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `GET` | [`/api`](https://www.onepieceapi.com/api) | Map of every endpoint URL |
| `GET` | [`/api/characters`](https://www.onepieceapi.com/api/characters) | Characters, newest first, each with their bounties, devil fruits and affiliations |
| `GET` | [`/api/devil-fruits`](https://www.onepieceapi.com/api/devil-fruits) | Devil fruits: Paramecia, Zoan and Logia, with Zoan models and who ate each one (`users`) |
| `GET` | [`/api/bounties`](https://www.onepieceapi.com/api/bounties) | Bounties, each with a summary of its character |
| `GET` | [`/api/ships`](https://www.onepieceapi.com/api/ships) | Ships: type, status and affiliation |
| `GET` | [`/api/islands`](https://www.onepieceapi.com/api/islands) | Islands and the sea they belong to |
| `GET` | [`/api/affiliations`](https://www.onepieceapi.com/api/affiliations) | Crews and organizations, biggest first. `/api/affiliations/{id}` adds every `members` entry |
| `GET` | `/api/{resource}/{id}` | One item by UUID, for any resource above (e.g. `/api/ships/{id}`) |
| `GET` | [`/openapi.json`](https://www.onepieceapi.com/openapi.json) | OpenAPI 3.1 description of all of the above |

### Query parameters

Every list endpoint accepts:

| Param | Default | Description |
|:--|:--|:--|
| `page` | `1` | 1-based page number. A page past the end returns `[]`. |
| `limit` | `20` | Items per page, up to `100`. |
| `q` | | Case-insensitive name search across English, Japanese and romaji. On `/api/devil-fruits` it also matches the Zoan model, and on `/api/bounties` the bounty holder's name. |

List responses stay plain JSON arrays. The pagination info is in the response headers:

```http
X-Total-Count: 50
Link: <https://www.onepieceapi.com/api/ships?page=1&limit=20>; rel="first", <https://www.onepieceapi.com/api/ships?page=2&limit=20>; rel="next", <https://www.onepieceapi.com/api/ships?page=3&limit=20>; rel="last"
```

`X-Total-Count` is the number of matching items across all pages. `Link` has `first`, `prev`, `next` and `last` URLs that keep your other params. Both headers are readable from browser code.

Some endpoints take extra filters:

| Endpoint | Param | Values |
|:--|:--|:--|
| `/api/characters` | `ageBand` | `all`, `0-12`, `13-17`, `18-29`, `30-59`, `60+` |
| `/api/bounties` | `isActive` | `true` (current bounties only) or `false` (superseded only) |
| `/api/bounties` | `sort` | `newest` (default), `high`, `low` |

### Example response

`GET /api/ships?limit=1`

```json
[
  {
    "id": "637dd95f-248c-42a8-9dc3-9ad4531c1801",
    "name": { "en": "Great Eirik", "jp": "グレート・エイリーク号", "romaji": "Gurēto Eirīku-gō" },
    "type": "Longboat",
    "status": "Destroyed",
    "image_url": "https://hlryizauzapedkefdviw.supabase.co/storage/v1/object/public/ships/great-eirik.webp",
    "extra_data": {
      "affiliation": "Giant Warrior Pirates",
      "first_appearance": "Chapter 129; Episode 78",
      "height": null,
      "length": null
    },
    "created_at": "2026-09-12T20:16:15.872901+00:00"
  }
]
```

Every field is described in the [documentation](https://www.onepieceapi.com/documentation) and the [OpenAPI spec](https://www.onepieceapi.com/openapi.json).

### Good to know

- **Responses are plain JSON arrays**, or a single object for detail routes (`/api/{resource}/{id}`), with the same shape as a list item (affiliations also add `members`). Errors look like `{ "error": "Not found" }`: `400` for an id that isn't a UUID, `404` when it doesn't exist, `500` otherwise.
- **Relations come embedded.** Each character has `devil_fruits` and `affiliations`, each devil fruit has `users`, and `/api/affiliations/{id}` has `members`. Every link has `is_active` (`false` = former user or member), and current ones come first.
- **Names are localized objects.** `name.en`, `name.jp` and `name.romaji`. Any key may be missing.
- **Responses are cached at the edge** for about a minute. The data only changes when the dataset is updated.
- **Fair use: 3,000 requests per minute per IP.** Above that, requests get `429 Too Many Requests` until the minute resets. Paging through a whole resource at `limit=100` takes about 15 requests, so cache what you fetch instead of polling in a loop.
- **Usage is counted anonymously**: endpoint, client type (browser, Node, Python…), country, calling site, which query params are used, and a count of distinct callers per day. IPs and full user agents are never stored. Distinct callers are counted with a hash of the IP that changes every day and can't be reversed.
- **Use the `www` host.** `onepieceapi.com` redirects to `www.onepieceapi.com`, and that redirect does not carry CORS headers.
- **Some fields are often empty** (`null` or `"Unknown"`), because the series never revealed them. Blood types and heights are the usual cases.

## The website

The same data powers a browsable catalog at [onepieceapi.com](https://www.onepieceapi.com):

- [Characters](https://www.onepieceapi.com/characters)
- [Devil Fruits](https://www.onepieceapi.com/devil-fruits)
- [Bounties](https://www.onepieceapi.com/bounties)
- [Ships](https://www.onepieceapi.com/ships)
- [Islands](https://www.onepieceapi.com/islands)
- [Affiliations](https://www.onepieceapi.com/affiliations)

There is also an interactive [Playground](https://www.onepieceapi.com/playground). Pick an endpoint, tweak the params and copy ready-made cURL, JavaScript or Python snippets. For AI tools, a summary of the API lives at [`/llms.txt`](https://www.onepieceapi.com/llms.txt).

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, React Compiler) on [Vercel](https://vercel.com)
- [Supabase](https://supabase.com) (Postgres with Row Level Security, plus Storage for images)
- [Tailwind CSS](https://tailwindcss.com) 4 and [shadcn/ui](https://ui.shadcn.com)
- [Vitest](https://vitest.dev) for unit and end-to-end tests
- [Biome](https://biomejs.dev) for linting and formatting, [Conventional Commits](https://www.conventionalcommits.org) with commitlint, and [release-please](https://github.com/googleapis/release-please) for releases

## Running locally

You need Node.js 20.9+, [pnpm](https://pnpm.io) and a Supabase project. The tables and columns the app expects are typed in [`src/supabase/database.types.ts`](src/supabase/database.types.ts).

```bash
git clone https://github.com/akanyane/one-piece-api.git
cd one-piece-api
pnpm install
cp .env.example .env   # then fill in the values below
pnpm dev               # http://localhost:3000
```

| Variable | Description |
|:--|:--|
| `SUPABASE_URL` | Your project URL, e.g. `https://<ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | A **secret** key, used on the server only. Never expose it to the browser. |
| `REVALIDATE_SECRET` | Optional. Bearer token for `POST /internal/revalidate` (see below). Without it, the route answers 503. |

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint` and `pnpm typecheck`.

### Purging the cache after a data fix

Responses are cached for 60 seconds, but after a quiet period the first request can still get the old cached copy while a fresh one loads in the background. After you edit rows directly in Supabase, purge the cache:

```bash
pnpm revalidate                    # every resource
pnpm revalidate islands            # or only some: characters, devil-fruits, bounties, ships, islands, affiliations
```

This calls `POST /internal/revalidate` with `Authorization: Bearer $REVALIDATE_SECRET` (it targets production unless `API_BASE_URL` is set). Each cache entry is tagged with every table it reads, so purging `devil-fruits` also refreshes the characters that embed them. The CDN can keep serving its copy for up to another 60 seconds.

## Tests

| Command | What it runs |
|:--|:--|
| `pnpm test` | Unit tests ([Vitest](https://vitest.dev)), ~22k cases in a few seconds |
| `pnpm test:coverage` | The same, with coverage. CI fails below 100% lines/functions on the API code |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm test:e2e` | Contract tests against a live deployment (needs `API_BASE_URL`) |

**Unit tests** (`tests/unit`) call every route handler directly, with Supabase replaced by an in-memory mock that records the exact query built (filters, ordering, range). Each list endpoint runs every combination of its params, valid and invalid: `page` × `limit` × `q`, plus `ageBand` for characters and `isActive` × `sort` for bounties. The tests check the query, the body, `X-Total-Count` and every `Link` URL. Detail routes, errors (400/404/500), the usage-tracking proxy, the parsers and the OpenAPI spec are covered too. They also check that the spec documents exactly the routes that exist.

**End-to-end tests** (`tests/e2e`) hit a real deployment and validate every response against the schemas in `/openapi.json`. They also check that filters really filter: names match `q`, ages fall in the `ageBand`, bounties come back in `sort` order, and following `Link: rel="next"` visits every item exactly once.

```bash
pnpm build && pnpm start                         # in one terminal
API_BASE_URL=http://localhost:3000 pnpm test:e2e # in another
```

CI runs lint, typecheck and the unit tests on every pull request. The e2e suite runs against production after each deploy, or manually from the *e2e* workflow.

## Contributing

Issues and pull requests are welcome, whether it's a bug, a data correction or a feature idea.

- Branch off `main`. `main` is protected, so all changes go through a pull request.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, …) and are checked by commitlint.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before opening a PR. New routes or params need tests, and the coverage threshold enforces it.
- Versions and the [CHANGELOG](CHANGELOG.md) are generated automatically by release-please.

Found wrong or missing data? [Open an issue](https://github.com/akanyane/one-piece-api/issues) and include the character or item and a source.

## Credits & disclaimer

This is an unofficial fan project, not affiliated with or endorsed by Eiichiro Oda, Shueisha or Toei Animation. *One Piece* and all related names and images belong to their respective owners.

Data is sourced mainly from the [One Piece Wiki](https://onepiece.fandom.com/wiki/One_Piece_Wiki) (text under [CC BY-SA](https://www.fandom.com/licensing)), with some portraits from [AniList](https://anilist.co).

## License

The source code is released under the [MIT License](LICENSE).
