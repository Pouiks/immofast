import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Biens — cycle de vie complet", () => {
  test("publication, contractualisation, statut, partage, édition, suppression", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    page.on("dialog", (d) => d.accept());
    const title = `CRUD Bien ${Date.now()}`;

    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Biens" }).click();

    // Création
    await page.getByRole("button", { name: "Nouvelle annonce" }).click();
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="price_amount"]').fill("500000");
    await page.locator('textarea[name="description"]').fill("Bien de test, description obligatoire.");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Créer une annonce")).toHaveCount(0);
    await expect(page.getByText(title)).toBeVisible();

    const idOf = async () =>
      (
        await admin
          .from("properties")
          .select("id")
          .eq("account_id", ACCOUNTS.sandbox2)
          .eq("title", title)
          .maybeSingle()
      ).data?.id as string;
    const bienId = await idOf();

    const drawer = page.getByRole("dialog");
    await page.getByText(title).click();

    // Publication
    await drawer.getByText("Non publié").click();
    await page.waitForTimeout(400);
    let { data } = await admin.from("properties").select("published, status, contract_step").eq("id", bienId).single();
    expect(data?.published).toBe(true);

    // Statut du bien
    await drawer.getByRole("button", { name: "Sous offre" }).click();
    await page.waitForTimeout(300);
    // Parcours de contractualisation
    await drawer.getByRole("button", { name: "Offre reçue" }).click();
    await page.waitForTimeout(400);
    ({ data } = await admin.from("properties").select("published, status, contract_step").eq("id", bienId).single());
    expect(data?.status).toBe("sous_offre");
    expect(data?.contract_step).toBe("offre_recue");

    // Partage par mail (la modale s'ouvre)
    await drawer.getByRole("button", { name: "Partager par mail au client" }).click();
    await expect(page.getByText("Partager la fiche par mail")).toBeVisible();
    await page.getByRole("button", { name: "Annuler" }).click();

    // Édition
    const newTitle = `${title} (modifié)`;
    await drawer.getByRole("button", { name: "Modifier" }).click();
    await page.locator('input[name="title"]').fill(newTitle);
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Modifier le bien")).toHaveCount(0);
    await expect(drawer.getByText(newTitle)).toBeVisible();

    // Suppression
    await drawer.getByRole("button", { name: "Supprimer", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const { count } = await admin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("id", bienId);
    expect(count).toBe(0);
  });
});
