import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Navigation CRM", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  const screens = [
    { link: "Prospects", url: /\/prospects/ },
    { link: "Biens", url: /\/biens/ },
    { link: "Kanban", url: /\/kanban/ },
    { link: "Agenda", url: /\/agenda/ },
    { link: "Tableau de bord", url: /\/dashboard/ },
  ];

  for (const { link, url } of screens) {
    test(`navigue vers ${link}`, async ({ page }) => {
      await page.getByRole("link", { name: link }).click();
      await expect(page).toHaveURL(url);
      // Le titre de l'écran (topbar) reflète la navigation.
      await expect(page.locator("header").getByText(link)).toBeVisible();
    });
  }
});
