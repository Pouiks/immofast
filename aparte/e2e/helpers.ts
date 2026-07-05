import { type Page } from "@playwright/test";

/** Identifiants de démonstration (seed Supabase). */
export const DEMO = {
  email: "camille@agence.fr",
  password: "demodemo",
  name: "Camille Mercier",
};

/** Connecte l'utilisateur de démo et attend l'arrivée sur le tableau de bord. */
export async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(DEMO.email);
  await page.locator('input[name="password"]').fill(DEMO.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/dashboard");
}
