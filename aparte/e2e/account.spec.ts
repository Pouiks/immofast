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

  test("abonnement : propose de souscrire (Stripe)", async ({ page }) => {
    await page.getByRole("button", { name: "Abonnement" }).click();
    await expect(page.getByRole("button", { name: /Formule mensuelle/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule annuelle/ })).toBeVisible();
  });

  test("facturation : états vides sans données Stripe", async ({ page }) => {
    await page.getByRole("button", { name: "Facturation" }).click();
    await expect(page.getByText("Aucun moyen de paiement")).toBeVisible();
    await expect(page.getByText("Aucune facture pour le moment.")).toBeVisible();
  });

  test("marque blanche : mise à jour live de la sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Marque blanche" }).click();
    await page.getByLabel("Nom de la marque").fill("Aparté Test");
    // La sidebar reflète le nouveau nom sans rechargement.
    await expect(page.locator("aside").getByText("Aparté Test")).toBeVisible();
  });
});
