import { test, expect } from "@playwright/test";

/**
 * Gating : un espace dont l'essai est terminé et sans abonnement actif est
 * verrouillé — le CRM redirige vers le paywall /subscribe.
 * Fixture : locked@aparte.fr (essai expiré en 2020, aucun abonnement).
 */
test.describe("Gating (paywall)", () => {
  test("essai expiré sans abonnement → redirigé vers /subscribe", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("locked@aparte.fr");
    await page.locator('input[name="password"]').fill("demodemo");
    await page.getByRole("button", { name: "Se connecter" }).click();

    // Après connexion, le CRM est verrouillé → paywall.
    await page.waitForURL("**/subscribe");
    await expect(page.getByText("Votre essai gratuit est terminé")).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule annuelle/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule mensuelle/ })).toBeVisible();
  });

  test("un accès direct au CRM verrouillé renvoie au paywall", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("locked@aparte.fr");
    await page.locator('input[name="password"]').fill("demodemo");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL("**/subscribe");

    await page.goto("/prospects");
    await expect(page).toHaveURL(/\/subscribe/);
  });
});
