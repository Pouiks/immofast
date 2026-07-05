import { test, expect } from "@playwright/test";
import { loginAdmin } from "./helpers";

test.describe("Console admin SaaS", () => {
  test("l'admin arrive sur la console (pas le CRM)", async ({ page }) => {
    await loginAdmin(page);
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText("Console SaaS")).toBeVisible();
    await expect(page.getByText("MRR estimé")).toBeVisible();
  });

  test("liste les espaces clients gérés", async ({ page }) => {
    await loginAdmin(page);
    await expect(page.getByText("Agence Horizon")).toBeVisible();
    await expect(page.getByText("Studio Nord")).toBeVisible();
    await expect(page.getByText("Prestige Immobilier")).toBeVisible();
  });
});
