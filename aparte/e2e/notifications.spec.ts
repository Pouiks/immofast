import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Notifications", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Notifications" }).click();
  });

  test("la cloche ouvre le panneau avec les notifications", async ({ page }) => {
    await expect(page.getByText("Tout marquer lu")).toBeVisible();
    await expect(page.getByText("Nouveau prospect")).toBeVisible();
    await expect(page.getByText("Offre acceptée")).toBeVisible();
  });

  test("clic sur une notif prospect → écran Prospects + fiche ouverte", async ({ page }) => {
    await page.getByText("Nouveau prospect").click();
    await expect(page).toHaveURL(/\/prospects/);
    // Le drawer du prospect ciblé (Léa Moreau) est ouvert.
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByText("Léa Moreau")).toBeVisible();
    await expect(drawer.getByText("Statut · cliquez pour changer")).toBeVisible();
  });

  test("clic sur une notif offre → écran Biens + fiche bien ouverte", async ({ page }) => {
    await page.getByText("Offre acceptée").click();
    await expect(page).toHaveURL(/\/biens/);
    // Le drawer du bien ciblé (Maison · Clichy, réf MAI-204) est ouvert.
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByText("MAI-204")).toBeVisible();
    await expect(drawer.getByText("Parcours de contractualisation")).toBeVisible();
  });
});
