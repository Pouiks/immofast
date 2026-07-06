import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Onboarding", () => {
  test("le guide d'accueil se lance, se parcourt et se ferme", async ({ page }) => {
    await login(page);
    // Ouvre le panneau Compte puis relance le guide (déclenchement déterministe).
    await page.locator("aside").getByText("Camille Mercier").click();
    await page.getByRole("button", { name: "Revoir le guide d'accueil" }).click();

    const tour = page.getByRole("dialog", { name: "Guide d'accueil" });
    await expect(tour.getByText("Bienvenue sur votre espace")).toBeVisible();
    await expect(tour.getByText("Étape 1 sur 8")).toBeVisible();

    // Navigation avant.
    await tour.getByRole("button", { name: "Suivant" }).click();
    await expect(tour.getByText("Vos modules, à portée de clic")).toBeVisible();

    // Navigation arrière.
    await tour.getByRole("button", { name: "Précédent" }).click();
    await expect(tour.getByText("Bienvenue sur votre espace")).toBeVisible();

    // Passer ferme le guide.
    await tour.getByRole("button", { name: "Passer" }).click();
    await expect(page.getByRole("dialog", { name: "Guide d'accueil" })).toHaveCount(0);
  });
});
