import { MAX_LIMIT, MAX_PAGE } from "@/lib/api-params";
import { SITE_URL } from "@/lib/site";

/**
 * OpenAPI 3.1 description of the public API, served at `/openapi.json`.
 * Keep in sync with the route handlers under `src/app/api` and the selects in `lib/data.ts`.
 */

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const nullable = (type: string, extra: object = {}) => ({
  type: [type, "null"],
  ...extra,
});

const pageParams = [
  { $ref: "#/components/parameters/page" },
  { $ref: "#/components/parameters/limit" },
];

function listOperation(opts: {
  operationId: string;
  summary: string;
  description: string;
  tag: string;
  schema: string;
  extraParams?: object[];
}) {
  return {
    get: {
      operationId: opts.operationId,
      summary: opts.summary,
      description: opts.description,
      tags: [opts.tag],
      parameters: [...pageParams, ...(opts.extraParams ?? [])],
      responses: {
        "200": {
          description:
            "One page of results. A page past the end returns an empty array.",
          headers: {
            "X-Total-Count": { $ref: "#/components/headers/X-Total-Count" },
            Link: { $ref: "#/components/headers/Link" },
          },
          content: {
            "application/json": {
              schema: { type: "array", items: ref(opts.schema) },
            },
          },
        },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  };
}

/** `q` name search, shared by every list endpoint. */
function searchParam(description: string, example: string) {
  return {
    name: "q",
    in: "query",
    description: `${description} Case-insensitive substring match, max 120 characters.`,
    schema: { type: "string", maxLength: 120 },
    example,
  };
}

function detailOperation(opts: {
  operationId: string;
  summary: string;
  description: string;
  tag: string;
  schema: string;
}) {
  return {
    get: {
      operationId: opts.operationId,
      summary: opts.summary,
      description: opts.description,
      tags: [opts.tag],
      parameters: [{ $ref: "#/components/parameters/id" }],
      responses: {
        "200": {
          description: "The resource.",
          content: { "application/json": { schema: ref(opts.schema) } },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/ServerError" },
      },
    },
  };
}

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "One Piece API",
    version: "1.0.0",
    description:
      "Free, read-only REST API for the One Piece manga/anime: characters, devil fruits, bounties, ships, islands and affiliations. No API key or authentication. CORS is enabled for every origin, so it can be called straight from the browser. List endpoints return a plain JSON array; pagination metadata is in the `X-Total-Count` and `Link` response headers.",
    license: {
      name: "MIT",
      url: "https://github.com/akanyane/one-piece-api/blob/main/LICENSE",
    },
  },
  externalDocs: {
    description: "Human-readable documentation",
    url: `${SITE_URL}/documentation`,
  },
  servers: [{ url: SITE_URL }],
  // No authentication: every endpoint is public.
  security: [],
  tags: [
    { name: "Characters", description: "Named characters and their bounties." },
    { name: "Devil Fruits", description: "Devil fruits and their models." },
    { name: "Bounties", description: "Bounties issued on characters." },
    { name: "Ships", description: "Pirate, Marine and other vessels." },
    { name: "Islands", description: "Islands, kingdoms and locations." },
    { name: "Affiliations", description: "Crews and organizations." },
    { name: "Meta", description: "Discovery endpoints." },
  ],
  paths: {
    "/api": {
      get: {
        operationId: "getIndex",
        summary: "Endpoint map",
        description: "Absolute URLs of every resource endpoint.",
        tags: ["Meta"],
        responses: {
          "200": {
            description: "Map of resource name to endpoint URL.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
      },
    },
    "/api/characters": listOperation({
      operationId: "listCharacters",
      summary: "List characters",
      description:
        "Characters, newest first, each with their bounties. Filter by name with `q` and by age with `ageBand`.",
      tag: "Characters",
      schema: "Character",
      extraParams: [
        searchParam("Filter by English, Japanese or romaji name.", "luffy"),
        {
          name: "ageBand",
          in: "query",
          description:
            "Only characters whose known age falls in this band. Characters with an unknown age are excluded unless `all`.",
          schema: {
            type: "string",
            enum: ["all", "0-12", "13-17", "18-29", "30-59", "60+"],
            default: "all",
          },
        },
      ],
    }),
    "/api/characters/{id}": detailOperation({
      operationId: "getCharacter",
      summary: "Get a character",
      description: "A single character with their bounties.",
      tag: "Characters",
      schema: "Character",
    }),
    "/api/devil-fruits": listOperation({
      operationId: "listDevilFruits",
      summary: "List devil fruits",
      description:
        "Devil fruits, newest first. Search by name or Zoan model with `q`.",
      tag: "Devil Fruits",
      schema: "DevilFruit",
      extraParams: [
        searchParam("Filter by fruit name or Zoan model name.", "nika"),
      ],
    }),
    "/api/devil-fruits/{id}": detailOperation({
      operationId: "getDevilFruit",
      summary: "Get a devil fruit",
      description: "A single devil fruit, same shape as a list item.",
      tag: "Devil Fruits",
      schema: "DevilFruit",
    }),
    "/api/bounties": listOperation({
      operationId: "listBounties",
      summary: "List bounties",
      description:
        "Bounties with a summary of the character they belong to. A character can have several bounties; superseded ones have `is_active: false`.",
      tag: "Bounties",
      schema: "Bounty",
      extraParams: [
        searchParam("Filter by the bounty holder's name.", "luffy"),
        {
          name: "isActive",
          in: "query",
          description:
            "`true` for current bounties only, `false` for superseded ones only. Omit for both.",
          schema: { type: "boolean" },
        },
        {
          name: "sort",
          in: "query",
          description:
            "`high` = largest amount first, `low` = smallest first, `newest` = most recently added.",
          schema: {
            type: "string",
            enum: ["newest", "high", "low"],
            default: "newest",
          },
        },
      ],
    }),
    "/api/bounties/{id}": detailOperation({
      operationId: "getBounty",
      summary: "Get a bounty",
      description: "A single bounty, same shape as a list item.",
      tag: "Bounties",
      schema: "Bounty",
    }),
    "/api/ships": listOperation({
      operationId: "listShips",
      summary: "List ships",
      description: "Ships, newest first.",
      tag: "Ships",
      schema: "Ship",
      extraParams: [searchParam("Filter by ship name.", "sunny")],
    }),
    "/api/ships/{id}": detailOperation({
      operationId: "getShip",
      summary: "Get a ship",
      description: "A single ship, same shape as a list item.",
      tag: "Ships",
      schema: "Ship",
    }),
    "/api/islands": listOperation({
      operationId: "listIslands",
      summary: "List islands",
      description: "Islands, newest first.",
      tag: "Islands",
      schema: "Island",
      extraParams: [searchParam("Filter by island name.", "wano")],
    }),
    "/api/islands/{id}": detailOperation({
      operationId: "getIsland",
      summary: "Get an island",
      description: "A single island, same shape as a list item.",
      tag: "Islands",
      schema: "Island",
    }),
    "/api/affiliations": listOperation({
      operationId: "listAffiliations",
      summary: "List affiliations",
      description:
        "Crews and organizations, biggest first (by number of linked characters).",
      tag: "Affiliations",
      schema: "Affiliation",
      extraParams: [
        searchParam("Filter by crew or organization name.", "straw hat"),
      ],
    }),
    "/api/affiliations/{id}": detailOperation({
      operationId: "getAffiliation",
      summary: "Get an affiliation",
      description:
        "A single affiliation with its `memberCount`, same shape as a list item.",
      tag: "Affiliations",
      schema: "Affiliation",
    }),
  },
  components: {
    headers: {
      "X-Total-Count": {
        description:
          "Total number of items matching the query, across all pages.",
        schema: { type: "integer", minimum: 0 },
        example: 50,
      },
      Link: {
        description:
          'RFC 8288 pagination links: `first` and `last` always, `prev` and `next` when they exist. Other query params are kept, e.g. `<https://www.onepieceapi.com/api/ships?page=2&limit=20>; rel="next"`.',
        schema: { type: "string" },
      },
    },
    parameters: {
      id: {
        name: "id",
        in: "path",
        required: true,
        description: "UUID of the resource, from a list response.",
        schema: { type: "string", format: "uuid" },
      },
      page: {
        name: "page",
        in: "query",
        description: "1-based page number.",
        schema: { type: "integer", minimum: 1, maximum: MAX_PAGE, default: 1 },
      },
      limit: {
        name: "limit",
        in: "query",
        description: "Items per page.",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: MAX_LIMIT,
          default: 20,
        },
      },
    },
    responses: {
      BadRequest: {
        description:
          'Malformed input, e.g. an id that is not a UUID (`{ "error": "Invalid id" }`).',
        content: { "application/json": { schema: ref("Error") } },
      },
      NotFound: {
        description: "No resource with that id.",
        content: { "application/json": { schema: ref("Error") } },
      },
      ServerError: {
        description: "Unexpected server error.",
        content: { "application/json": { schema: ref("Error") } },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
      LocalizedName: {
        type: "object",
        description:
          "Name in English, Japanese and romaji. Any key may be missing.",
        properties: {
          en: nullable("string", { example: "Monkey D. Luffy" }),
          jp: nullable("string", { example: "モンキー・D・ルフィ" }),
          romaji: nullable("string", { example: "Monkī Dī Rufi" }),
        },
      },
      Birthday: {
        type: "object",
        properties: {
          day: { type: "integer", minimum: 1, maximum: 31 },
          month: { type: "integer", minimum: 1, maximum: 12 },
          label: {
            type: "object",
            properties: { en: { type: "string", example: "May 5th" } },
          },
          trivia: {},
        },
      },
      CharacterBounty: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          amount: nullable("integer", { description: "In berries." }),
          is_active: { type: "boolean" },
          character_id: nullable("string", { format: "uuid" }),
          created_at: { type: "string", format: "date-time" },
        },
      },
      Character: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          name: ref("LocalizedName"),
          age: nullable("integer"),
          status: { type: "string", enum: ["Alive", "Deceased", "Unknown"] },
          height: nullable("integer", { description: "In centimeters." }),
          blood_type: {
            type: "string",
            description: "World Government blood type, or `Unknown`.",
            example: "F",
          },
          birthday: { oneOf: [ref("Birthday"), { type: "null" }] },
          image_url: nullable("string", { format: "uri" }),
          extra_data: {
            type: ["object", "null"],
            properties: {
              origin: nullable("string"),
              epithet: nullable("string"),
              occupation: nullable("string"),
              affiliation: nullable("string"),
              first_appearance: nullable("string"),
            },
          },
          bounties: { type: "array", items: ref("CharacterBounty") },
        },
      },
      DevilFruit: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          name: ref("LocalizedName"),
          model: {
            oneOf: [ref("LocalizedName"), { type: "null" }],
            description: "Zoan model, when the fruit has one.",
          },
          type: nullable("string", {
            enum: ["Paramecia", "Zoan", "Logia", "Unknown", null],
          }),
          sub_type: nullable("string", { example: "Mythical" }),
          image_url: nullable("string", { format: "uri" }),
        },
      },
      Bounty: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          amount: nullable("integer", { description: "In berries." }),
          is_active: { type: "boolean" },
          character_id: nullable("string", { format: "uuid" }),
          characters: {
            type: ["object", "null"],
            properties: {
              name: ref("LocalizedName"),
              status: { type: "string" },
              image_url: nullable("string", { format: "uri" }),
            },
          },
        },
      },
      Ship: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          name: ref("LocalizedName"),
          type: nullable("string", { example: "Brigantine" }),
          status: { type: "string", enum: ["Active", "Destroyed", "Unknown"] },
          image_url: nullable("string", { format: "uri" }),
          extra_data: {
            type: ["object", "null"],
            properties: {
              affiliation: nullable("string"),
              first_appearance: nullable("string"),
              height: nullable("string"),
              length: nullable("string"),
            },
          },
        },
      },
      Island: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          name: ref("LocalizedName"),
          sea: nullable("string", { example: "Grand Line" }),
          image_url: nullable("string", { format: "uri" }),
          extra_data: {
            type: ["object", "null"],
            properties: {
              type: nullable("string"),
              population: nullable("string"),
              affiliation: nullable("string"),
              first_appearance: nullable("string"),
            },
          },
        },
      },
      Affiliation: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          created_at: { type: "string", format: "date-time" },
          updated_at: nullable("string", { format: "date-time" }),
          name: ref("LocalizedName"),
          memberCount: {
            type: "integer",
            description: "Number of characters linked to this affiliation.",
          },
        },
      },
    },
  },
} as const;
