import { test, expect } from "@playwright/test";
import { loginAs, html5Drag } from "./helpers";
import { admin, ACCOUNTS } from "./db";

test.describe("Glisser-déposer", () => {
  test("Kanban : déplacer une carte change le statut du prospect", async ({ page }) => {
    const name = `KDnD ${Date.now()}`;
    const { data: p } = await admin
      .from("prospects")
      .insert({ account_id: ACCOUNTS.sandbox2, full_name: name, stage: "nouveau" })
      .select()
      .single();

    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Kanban" }).click();

    const card = page.getByTestId(`kcard-${p!.id}`);
    await expect(card).toBeVisible();
    await html5Drag(page, card, page.getByTestId("kcol-qualifie"));

    await expect(async () => {
      const { data } = await admin.from("prospects").select("stage").eq("id", p!.id).single();
      expect(data?.stage).toBe("qualifie");
    }).toPass({ timeout: 5000 });

    await admin.from("prospects").delete().eq("id", p!.id);
  });

  test("Agenda : déplacer une visite change son créneau", async ({ page }) => {
    // Visite le lundi de la semaine courante à 10:00 (visible en vue semaine).
    const nd = new Date();
    const diff = (nd.getDay() + 6) % 7;
    const monday = new Date(nd.getFullYear(), nd.getMonth(), nd.getDate() - diff, 10, 0, 0, 0);
    const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

    const { data: v } = await admin
      .from("visits")
      .insert({
        account_id: ACCOUNTS.sandbox2,
        prospect_id: null,
        title: `VDnD ${Date.now()}`,
        starts_at: monday.toISOString(),
      })
      .select()
      .single();

    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Agenda" }).click();

    const event = page.getByTestId(`aevt-${v!.id}`);
    await expect(event).toBeVisible();
    await html5Drag(page, event, page.getByTestId(`acell-${mondayStr}-14`));

    await expect(async () => {
      const { data } = await admin.from("visits").select("starts_at").eq("id", v!.id).single();
      expect(new Date(data!.starts_at).getHours()).toBe(14);
    }).toPass({ timeout: 5000 });

    await admin.from("visits").delete().eq("id", v!.id);
  });
});
