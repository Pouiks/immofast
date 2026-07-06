import { test, expect } from "@playwright/test";
import { login } from "./helpers";
import { admin, ACCOUNTS } from "./db";

// Série : les deux tests modifient l'état « lu » des notifications de camille.
test.describe.serial("Notifications — actions", () => {
  test("« Tout marquer lu » vide le badge", async ({ page }) => {
    await admin.from("notifications").update({ read: false }).eq("account_id", ACCOUNTS.camille);

    await login(page);
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByTestId("notif-badge")).toBeVisible();
    await page.getByText("Tout marquer lu").click();

    await expect(async () => {
      const { count } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("account_id", ACCOUNTS.camille)
        .eq("read", false);
      expect(count).toBe(0);
    }).toPass({ timeout: 5000 });
    await expect(page.getByTestId("notif-badge")).toHaveCount(0);
  });

  test("deep-link d'une notif visite ouvre l'agenda + la visite", async ({ page }) => {
    await admin
      .from("notifications")
      .update({ read: false })
      .eq("account_id", ACCOUNTS.camille)
      .eq("kind", "visite");

    await login(page);
    await page.getByRole("button", { name: "Notifications" }).click();
    await page.getByText("Visite dans 1 h").click();
    await expect(page).toHaveURL(/\/agenda/);
    await expect(page.getByText("Modifier la visite")).toBeVisible();
  });
});
