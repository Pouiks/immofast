import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Scénario : utilisateur en période d'essai", () => {
  test.beforeAll(async () => {
    // Essai réaliste : se termine dans ~20 h.
    const ends = new Date(Date.now() + 20 * 3_600_000).toISOString();
    await admin.from("accounts").update({ trial_ends_at: ends }).eq("id", ACCOUNTS.trial);
  });

  test("voit son essai, explore, puis est invité à s'abonner", async ({ page }) => {
    await loginAs(page, "trial@aparte.fr");

    // Encart d'essai dans la sidebar (accès autorisé pendant l'essai).
    const aside = page.locator("aside");
    await expect(aside.getByText("Période d'essai")).toBeVisible();
    await expect(aside.getByText(/restantes/)).toBeVisible();

    // Explore le produit (accès complet pendant l'essai).
    await page.getByRole("link", { name: "Biens" }).click();
    await expect(page).toHaveURL(/\/biens/);
    await page.getByRole("link", { name: "Agenda" }).click();
    await expect(page).toHaveURL(/\/agenda/);

    // Le CTA d'essai amène au choix de formule.
    await aside.getByRole("button", { name: "S'abonner" }).click();
    await expect(page.getByRole("button", { name: /Formule mensuelle/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Formule annuelle/ })).toBeVisible();
  });
});
