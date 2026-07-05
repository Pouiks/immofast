import { test, expect } from "@playwright/test";
import { login, DEMO } from "./helpers";

test.describe("Authentification", () => {
  test("redirige vers /login quand on n'est pas connecté", async ({ page }) => {
    await page.goto("/prospects");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Connexion à votre espace")).toBeVisible();
  });

  test("connexion réussie → tableau de bord", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Tableau de bord").first()).toBeVisible();
    await expect(page.getByText(DEMO.name)).toBeVisible();
  });

  test("un rôle client ne peut pas accéder à la console admin", async ({ page }) => {
    await login(page);
    await page.goto("/admin");
    // La garde de rôle renvoie le client vers le CRM.
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
