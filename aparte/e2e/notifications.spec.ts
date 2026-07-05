import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Notifications", () => {
  test("la cloche ouvre le panneau avec les notifications", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByText("Tout marquer lu")).toBeVisible();
    await expect(page.getByText("Nouveau prospect")).toBeVisible();
    await expect(page.getByText("Offre acceptée")).toBeVisible();
  });
});
