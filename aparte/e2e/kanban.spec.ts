import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Kanban", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Kanban" }).click();
    await expect(page).toHaveURL(/\/kanban/);
  });

  test("affiche les colonnes du pipeline", async ({ page }) => {
    for (const col of ["Nouveau", "Qualifié", "Visite", "Offre", "Compromis"]) {
      await expect(page.getByText(col, { exact: true })).toBeVisible();
    }
  });

  test("place les prospects dans leur colonne", async ({ page }) => {
    await expect(page.getByText("Marc Dubois")).toBeVisible();
    await expect(page.getByText("Paul Girard")).toBeVisible();
  });

  test("cliquer une carte ouvre la fiche prospect", async ({ page }) => {
    await page.getByText("Marc Dubois").click();
    await expect(page.getByText("Statut · cliquez pour changer")).toBeVisible();
  });
});
