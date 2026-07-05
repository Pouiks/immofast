import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Biens", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Biens" }).click();
    await expect(page).toHaveURL(/\/biens/);
  });

  test("affiche les biens de l'espace (données réelles via RLS)", async ({ page }) => {
    await expect(page.getByText("Appartement T3")).toBeVisible();
    await expect(page.getByText("APT-118")).toBeVisible();
    await expect(page.getByText("5 résultat(s)")).toBeVisible();
  });

  test("filtre par publication (brouillon)", async ({ page }) => {
    await page.locator("select").nth(1).selectOption({ label: "Brouillon" });
    await expect(page.getByText("Studio meublé")).toBeVisible();
    await expect(page.getByText("Appartement T3")).toHaveCount(0);
    await expect(page.getByText("2 résultat(s)")).toBeVisible();
  });

  test("ouvre la fiche bien avec ses sections", async ({ page }) => {
    await page.getByText("Appartement T3").click();
    await expect(page.getByText("Caractéristiques")).toBeVisible();
    await expect(page.getByText("Parcours de contractualisation")).toBeVisible();
    await expect(page.getByText("Marge agence")).toBeVisible();
  });
});
