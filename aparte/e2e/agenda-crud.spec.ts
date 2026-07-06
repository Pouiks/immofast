import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Agenda — édition, suppression, navigation", () => {
  test("édite puis supprime une visite ; navigue semaine/mois", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    const nd = new Date();
    const diff = (nd.getDay() + 6) % 7;
    const monday = new Date(nd.getFullYear(), nd.getMonth(), nd.getDate() - diff, 11, 0, 0, 0);

    const { data: v } = await admin
      .from("visits")
      .insert({
        account_id: ACCOUNTS.sandbox2,
        prospect_id: null,
        title: `Agenda ${Date.now()}`,
        starts_at: monday.toISOString(),
      })
      .select()
      .single();

    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Agenda" }).click();

    // Édition
    await page.getByTestId(`aevt-${v!.id}`).click();
    await expect(page.getByText("Modifier la visite")).toBeVisible();
    await page.locator('input[name="title"]').fill("Visite modifiée");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(async () => {
      const { data } = await admin.from("visits").select("title").eq("id", v!.id).single();
      expect(data?.title).toBe("Visite modifiée");
    }).toPass({ timeout: 10_000 });
    await expect(page.getByText("Modifier la visite")).toHaveCount(0, { timeout: 10_000 });

    // Suppression
    await page.getByTestId(`aevt-${v!.id}`).click();
    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(async () => {
      const { count } = await admin
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("id", v!.id);
      expect(count).toBe(0);
    }).toPass({ timeout: 5000 });

    // Navigation semaine
    const label = page.getByText(/Semaine du/);
    const before = await label.textContent();
    await page.getByRole("button", { name: "Suivant" }).click();
    await expect(label).not.toHaveText(before ?? "");

    // Bascule mois (affiche le week-end)
    await page.getByRole("button", { name: "Mois" }).click();
    await expect(page.getByText("Dim", { exact: true })).toBeVisible();
  });
});
