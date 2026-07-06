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

  test("abonnement : affiche l'état de facturation", async ({ page }) => {
    await page.getByRole("button", { name: "Abonnement" }).click();
    // Tolérant à l'état réel : « Formule actuelle » (abonné) ou « Formule mensuelle » (offre).
    await expect(page.getByText(/Formule/).first()).toBeVisible();
  });

  test("facturation : section factures + moyen de paiement", async ({ page }) => {
    await page.getByRole("button", { name: "Facturation" }).click();
    await expect(page.getByText("Factures")).toBeVisible();
    await expect(page.getByRole("button", { name: /Modifier|Ajouter/ })).toBeVisible();
  });

  test("marque blanche : mise à jour live de la sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Marque blanche" }).click();
    await page.getByLabel("Nom de la marque").fill("Aparté Test");
    // La sidebar reflète le nouveau nom sans rechargement.
    await expect(page.locator("aside").getByText("Aparté Test")).toBeVisible();
  });
});
