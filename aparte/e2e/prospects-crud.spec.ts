import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Prospects — cycle de vie complet", () => {
  test("statut (drawer), édition, GED (upload réel) et suppression", async ({ page }) => {
    test.setTimeout(90_000);
    page.on("dialog", (d) => d.accept());
    const name = `CRUD Prospect ${Date.now()}`;

    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Prospects" }).click();

    // Création
    await page.getByRole("button", { name: "Nouveau prospect" }).click();
    await page.locator('input[name="full_name"]').fill(name);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Créer un prospect")).toHaveCount(0);
    await expect(page.getByText(name)).toBeVisible();

    // Changement de statut via les pastilles du drawer
    await page.getByText(name).click();
    const drawer = page.getByRole("dialog");
    await drawer.getByRole("button", { name: "Qualifié" }).click();
    await page.waitForTimeout(500);
    const { data: p } = await admin
      .from("prospects")
      .select("id, stage")
      .eq("account_id", ACCOUNTS.sandbox2)
      .eq("full_name", name)
      .maybeSingle();
    expect(p?.stage).toBe("qualifie");

    // GED : upload d'un vrai fichier
    await drawer.getByRole("button", { name: "+ Ajouter" }).click();
    await page.locator('input[name="file"]').setInputFiles({
      name: "piece-identite.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 test"),
    });
    await page.getByRole("button", { name: "Ajouter", exact: true }).click();
    await expect(page.getByText("Ajouter un document")).toHaveCount(0);
    await expect(drawer.getByText("piece-identite.pdf")).toBeVisible();

    // Édition de la fiche
    const newName = `${name} (modifié)`;
    await drawer.getByRole("button", { name: "Modifier la fiche" }).click();
    await page.locator('input[name="full_name"]').fill(newName);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Modifier le prospect")).toHaveCount(0);
    await expect(drawer.getByText(newName)).toBeVisible();

    // Suppression
    await drawer.getByRole("button", { name: "Supprimer", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const { count } = await admin
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .eq("id", p!.id);
    expect(count).toBe(0);
  });
});
