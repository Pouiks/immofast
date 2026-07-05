import { type Page } from "@playwright/test";

/** Identifiants de démonstration (seed Supabase). */
export const DEMO = {
  email: "camille@agence.fr",
  password: "demodemo",
  name: "Camille Mercier",
};

export const DEMO_ADMIN = { email: "admin@aparte.fr", password: "demodemo" };

async function submitLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

/** Connecte l'utilisateur client de démo et attend le tableau de bord. */
export async function login(page: Page) {
  await submitLogin(page, DEMO.email, DEMO.password);
  await page.waitForURL("**/dashboard");
}

/** Connecte l'admin SaaS et attend la console (garde de rôle → /admin). */
export async function loginAdmin(page: Page) {
  await submitLogin(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
  await page.waitForURL("**/admin");
}
