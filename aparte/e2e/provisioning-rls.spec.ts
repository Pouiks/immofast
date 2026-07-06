import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { admin, PROVISION_SECRET } from "./db";

test.describe("Provisioning & isolation des données", () => {
  test("API de provisioning : crée un espace + essai 24 h (401 sans secret)", async ({
    request,
  }) => {
    const email = `prov-${Date.now()}@example.com`;

    const unauthorized = await request.post("/api/provision", { data: { email } });
    expect(unauthorized.status()).toBe(401);

    const res = await request.post("/api/provision", {
      headers: { "x-provision-secret": PROVISION_SECRET },
      data: { email, agencyName: "Prov Test" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.accountId).toBeTruthy();

    const { data: acc } = await admin
      .from("accounts")
      .select("trial_ends_at")
      .eq("id", body.accountId)
      .single();
    const hours = (new Date(acc!.trial_ends_at!).getTime() - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(23);
    expect(hours).toBeLessThan(25);

    await admin.auth.admin.deleteUser(body.userId).catch(() => {});
    await admin.from("accounts").delete().eq("id", body.accountId);
  });

  test("RLS : un espace ne voit pas les prospects d'un autre", async ({ page }) => {
    await loginAs(page, "crud@aparte.fr");
    await page.getByRole("link", { name: "Prospects" }).click();
    await expect(page.getByText(/résultat/)).toBeVisible(); // liste chargée
    // « Marc Dubois » appartient à l'espace de camille, pas à sandbox2.
    await expect(page.getByText("Marc Dubois")).toHaveCount(0);
  });
});
