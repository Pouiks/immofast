import { test, expect } from "@playwright/test";

/**
 * Gating : un espace dont l'essai est terminé et sans abonnement actif voit le
 * CRM (flouté) sous un paywall, quel que soit l'écran.
 * Fixture : locked@aparte.fr (essai expiré en 2020, aucun abonnement).
 */
async function loginLocked(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("locked@aparte.fr");
  await page.locator('input[name="password"]').fill("demodemo");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe("Gating (paywall)", () => {
  test("essai expiré sans abonnement → paywall par-dessus le CRM", async ({ page }) => {
    await loginLocked(page);
    await expect(page.getByText("Votre essai gratuit est terminé")).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule annuelle/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule mensuelle/ })).toBeVisible();
  });

  test("le paywall reste présent sur les autres écrans", async ({ page }) => {
    await loginLocked(page);
    await page.goto("/prospects");
    await expect(page).toHaveURL(/\/prospects/);
    await expect(page.getByText("Votre essai gratuit est terminé")).toBeVisible();
  });
});
