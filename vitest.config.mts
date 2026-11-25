import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["tests/setup/unit.ts"],
          // Route tests flip process.env (tracking flags); keep files isolated.
          restoreMocks: true,
          unstubEnvs: true,
          unstubGlobals: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "e2e",
          environment: "node",
          include: ["tests/e2e/**/*.test.ts"],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: [
        "src/app/api/**/*.ts",
        "src/app/openapi.json/route.ts",
        "src/proxy.ts",
        "src/lib/api-*.ts",
        "src/lib/data.ts",
        "src/lib/uuid.ts",
        "src/lib/link-header.ts",
        "src/lib/openapi.ts",
        "src/lib/characters-catalog-url.ts",
        "src/lib/bounties-catalog-url.ts",
        "src/lib/playground-endpoints.ts",
      ],
      reporter: ["text-summary", "text"],
      // The API surface is fully covered; keep it that way.
      thresholds: { statements: 100, lines: 100, functions: 100, branches: 95 },
    },
  },
});
