import { test, expect } from "@playwright/test";
import { loginAs, openAccountTab } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Compte — persistance des enregistrements", () => {
  test.afterAll(async () => {
    await admin.from("profiles").update({ full_name: "Sandbox CRUD" }).eq("account_id", ACCOUNTS.sandbox2);
    await admin.from("accounts").update({ brand_name: "Sandbox CRUD" }).eq("id", ACCOUNTS.sandbox2);
  });

  test("le profil et la marque blanche sont persistés après rechargement", async ({ page }) => {
    test.setTimeout(90_000);
    await loginAs(page, "crud@aparte.fr");

    // Profil — on attend la persistance en base avant de recharger.
    const newName = `Sandbox ${Date.now()}`;
    await openAccountTab(page, "Profil");
    await page.getByLabel("Nom complet").fill(newName);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(async () => {
      const { data } = await admin
        .from("profiles")
        .select("full_name")
        .eq("account_id", ACCOUNTS.sandbox2)
        .single();
      expect(data?.full_name).toBe(newName);
    }).toPass({ timeout: 10_000 });
    await page.reload();
    await openAccountTab(page, "Profil");
    await expect(page.getByLabel("Nom complet")).toHaveValue(newName);

    // Marque blanche (le panneau Compte est déjà ouvert → on change juste d'onglet)
    const brand = `Marque ${Date.now()}`;
    await page.getByRole("button", { name: "Marque blanche" }).click();
    await page.getByLabel("Nom de la marque").fill(brand);
    await page.getByRole("button", { name: "Enregistrer la marque" }).click();
    await expect(async () => {
      const { data } = await admin
        .from("accounts")
        .select("brand_name")
        .eq("id", ACCOUNTS.sandbox2)
        .single();
      expect(data?.brand_name).toBe(brand);
    }).toPass({ timeout: 10_000 });
    await page.reload();
    await expect(page.locator("aside").getByText(brand)).toBeVisible();
  });
});
