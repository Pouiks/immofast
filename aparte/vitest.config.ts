import { defineConfig } from "vitest/config";

/** Tests unitaires (logique métier pure). Le rendu UI est couvert par Playwright. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
