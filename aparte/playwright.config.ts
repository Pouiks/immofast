import { defineConfig, devices } from "@playwright/test";

/**
 * Tests E2E anti-régression. Le serveur de dev est lancé automatiquement
 * (webServer) et charge .env.local → l'auth s'exécute contre le vrai Supabase.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Serveur dev unique : on limite le parallélisme pour ne pas le saturer
  // (mutations lentes → timeouts) sur les scénarios lourds en écritures.
  workers: process.env.CI ? 1 : 4,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
