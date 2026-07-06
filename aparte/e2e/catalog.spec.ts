import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, clearAccountData, countRows, ACCOUNTS } from "./db";

const N = (i: number) => String(i + 1).padStart(2, "0");

async function createProspect(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("button", { name: "Nouveau prospect" }).click();
  await page.locator('input[name="full_name"]').fill(name);
  await page.locator('input[name="budget_amount"]').fill("300000");
  await page.locator('input[name="search_label"]').fill("T3, Paris");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Créer un prospect")).toHaveCount(0);
}

async function createProperty(page: import("@playwright/test").Page, title: string) {
  await page.getByRole("button", { name: "Nouvelle annonce" }).click();
  await page.locator('input[name="title"]').fill(title);
  await page.locator('input[name="price_amount"]').fill("450000");
  await page.locator('input[name="city"]').fill("Paris");
  await page
    .locator('textarea[name="description"]')
    .fill("Bel appartement lumineux, proche commerces et transports.");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Créer une annonce")).toHaveCount(0);
}

async function createVisit(page: import("@playwright/test").Page, title: string) {
  await page.getByRole("button", { name: "Nouvelle visite" }).click();
  await page.locator('input[name="title"]').fill(title);
  await page.getByRole("button", { name: "Planifier" }).click();
  await expect(page.getByText("Planifier une visite")).toHaveCount(0);
}

test.describe("Scénario complet : construction d'un catalogue", () => {
  test.beforeAll(async () => {
    await clearAccountData(ACCOUNTS.sandbox);
  });

  test("un utilisateur crée 10 prospects, 10 biens, des visites et des liaisons", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await loginAs(page, "sandbox@aparte.fr");

    // ── 10 prospects ──
    await page.getByRole("link", { name: "Prospects" }).click();
    await expect(page).toHaveURL(/\/prospects/);
    for (let i = 0; i < 10; i++) await createProspect(page, `Prospect ${N(i)}`);
    await expect(page.getByText("10 résultat(s)")).toBeVisible();

    // ── 10 biens ──
    await page.getByRole("link", { name: "Biens" }).click();
    await expect(page).toHaveURL(/\/biens/);
    for (let i = 0; i < 10; i++) await createProperty(page, `Bien ${N(i)}`);
    await expect(page.getByText("10 résultat(s)")).toBeVisible();

    // ── Changement de statut + liaison à un prospect ──
    await page.getByText("Bien 01", { exact: true }).click();
    const drawer = page.getByRole("dialog");
    await drawer.getByRole("button", { name: "Sous offre" }).click();
    await drawer.locator("select").selectOption({ label: "Prospect 01" });
    await page.waitForTimeout(400); // laisse les mutations se propager
    await drawer.getByRole("button", { name: "Fermer" }).click();

    // ── 2 visites planifiées ──
    await page.getByRole("link", { name: "Agenda" }).click();
    await expect(page).toHaveURL(/\/agenda/);
    await createVisit(page, "Visite T3 Paris");
    await createVisit(page, "Visite Studio");

    // ── Vérifications en base (source de vérité) ──
    expect(await countRows("prospects", ACCOUNTS.sandbox)).toBe(10);
    expect(await countRows("properties", ACCOUNTS.sandbox)).toBe(10);
    expect(await countRows("visits", ACCOUNTS.sandbox)).toBe(2);

    const { data: sousOffre } = await admin
      .from("properties")
      .select("id, offer_prospect_id, status")
      .eq("account_id", ACCOUNTS.sandbox)
      .eq("status", "sous_offre");
    expect(sousOffre?.length ?? 0).toBeGreaterThanOrEqual(1);
    expect(sousOffre?.[0]?.offer_prospect_id).toBeTruthy();
  });
});
