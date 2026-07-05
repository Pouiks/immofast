import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Compte", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Ouvre le panneau Compte depuis le bloc profil de la sidebar.
    await page.locator("aside").getByText("Camille Mercier").click();
  });

  test("affiche les onglets du titulaire", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Abonnement" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Facturation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Marque blanche" })).toBeVisible();
  });

  test("facturation : moyen de paiement et factures", async ({ page }) => {
    await page.getByRole("button", { name: "Facturation" }).click();
    await expect(page.getByText("•••• 4242")).toBeVisible();
    await expect(page.getByText("Juillet 2026")).toBeVisible();
  });

  test("marque blanche : mise à jour live de la sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Marque blanche" }).click();
    await page.getByLabel("Nom de la marque").fill("Aparté Test");
    // La sidebar reflète le nouveau nom sans rechargement.
    await expect(page.locator("aside").getByText("Aparté Test")).toBeVisible();
  });
});
