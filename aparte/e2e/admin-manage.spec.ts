import { test, expect } from "@playwright/test";
import { loginAdmin } from "./helpers";
import { admin } from "./db";

test.describe("Console admin — gestion des espaces", () => {
  const email = `newclient-${Date.now()}@example.com`;

  test.afterAll(async () => {
    await admin.from("accounts").delete().eq("email", email);
  });

  test("autorise un nouveau client, le suspend puis le réactive", async ({ page }) => {
    await loginAdmin(page);
    const agency = `Agence ${Date.now()}`;

    await page.getByRole("button", { name: "+ Autoriser un nouveau client" }).click();
    await page.locator('input[name="agency"]').fill(agency);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="paid"]').check();
    await page.getByRole("button", { name: "Créer l'espace" }).click();

    const row = page.getByTestId(`account-${email}`);
    await expect(row.getByText(agency)).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText("Actif")).toBeVisible();

    await row.getByRole("button", { name: "Suspendre" }).click();
    await expect(row.getByText("Suspendu")).toBeVisible();

    await row.getByRole("button", { name: "Activer" }).click();
    await expect(row.getByText("Actif")).toBeVisible();
  });
});
