import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Prospects", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Prospects" }).click();
    await expect(page).toHaveURL(/\/prospects/);
  });

  test("affiche les prospects de l'espace (données réelles via RLS)", async ({ page }) => {
    await expect(page.getByText("Marc Dubois")).toBeVisible();
    await expect(page.getByText("Sophie Leroy")).toBeVisible();
    await expect(page.getByText("6 résultat(s)")).toBeVisible();
  });

  test("filtre par statut", async ({ page }) => {
    await page.locator("select").first().selectOption({ label: "Compromis" });
    await expect(page.getByText("Paul Girard")).toBeVisible();
    await expect(page.getByText("Marc Dubois")).toHaveCount(0);
    await expect(page.getByText("1 résultat(s)")).toBeVisible();
  });

  test("recherche par nom", async ({ page }) => {
    await page.getByPlaceholder("Rechercher un prospect…").fill("Sophie");
    await expect(page.getByText("Sophie Leroy")).toBeVisible();
    await expect(page.getByText("Marc Dubois")).toHaveCount(0);
  });

  test("ouvre la fiche détaillée avec coordonnées et GED", async ({ page }) => {
    await page.getByText("Marc Dubois").click();
    // Drawer : coordonnées + document seedé.
    await expect(page.getByText("06 12 34 56 78")).toBeVisible();
    await expect(page.getByText("CNI_Marc_Dubois.pdf")).toBeVisible();
    await expect(page.getByText("Statut · cliquez pour changer")).toBeVisible();
  });
});
