import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Agenda", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Agenda" }).click();
    await expect(page).toHaveURL(/\/agenda/);
  });

  test("vue semaine : créneaux horaires", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Semaine" })).toBeVisible();
    await expect(page.getByText("08:00")).toBeVisible();
    await expect(page.getByText("20:00")).toBeVisible();
  });

  test("bascule vers la vue mois", async ({ page }) => {
    await page.getByRole("button", { name: "Mois" }).click();
    // La vue mois affiche le week-end (absent de la vue semaine ouvrée).
    await expect(page.getByText("Dim", { exact: true })).toBeVisible();
  });

  test("connexion Google Agenda (simulée)", async ({ page }) => {
    await page.getByRole("button", { name: "Connecter Google Agenda" }).click();
    await expect(page.getByText("camille.mercier@gmail.com")).toBeVisible();
  });
});
