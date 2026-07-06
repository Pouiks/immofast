import { test, expect } from "@playwright/test";
import { login, openAccountTab } from "./helpers";
import { clearInvitedMembers, ACCOUNTS } from "./db";

// Série (pas de parallélisme) : les deux tests modifient les membres du même
// espace (camille) — sinon ils se marchent dessus.
test.describe.serial("Collaborateurs (invitations)", () => {
  test.beforeEach(async () => {
    await clearInvitedMembers(ACCOUNTS.camille);
  });
  test.afterAll(async () => {
    await clearInvitedMembers(ACCOUNTS.camille);
  });

  test("le titulaire invite puis retire un collaborateur", async ({ page }) => {
    page.on("dialog", (d) => d.accept()); // confirm() de suppression

    await login(page);
    await openAccountTab(page, "Collaborateurs");

    // Le titulaire est listé (badge exact, pas « Titulaire du compte »).
    await expect(page.getByText("Titulaire", { exact: true })).toBeVisible();
    await expect(page.getByText("0 / 3 place(s) collaborateur utilisée(s)")).toBeVisible();

    // Invitation.
    const email = `collab-${Date.now()}@example.com`;
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Inviter" }).click();

    await expect(page.getByText("Invitation créée")).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("1 / 3 place(s) collaborateur utilisée(s)")).toBeVisible();

    // Suppression.
    await page.getByLabel("Retirer le collaborateur").click();
    await expect(page.getByText(email)).toHaveCount(0);
    await expect(page.getByText("0 / 3 place(s) collaborateur utilisée(s)")).toBeVisible();
  });

  test("respecte la limite de 3 places", async ({ page }) => {
    // Pré-remplit 3 invités via l'admin.
    for (let i = 0; i < 3; i++) {
      await import("./db").then(({ admin }) =>
        admin.auth.admin
          .createUser({ email: `seat${i}-${Date.now()}@example.com`, email_confirm: true })
          .then(({ data }) =>
            data.user
              ? admin.from("profiles").insert({
                  id: data.user.id,
                  account_id: ACCOUNTS.camille,
                  full_name: `Seat ${i}`,
                  email: data.user.email!,
                  role: "invite",
                  onboarding_completed: true,
                })
              : null,
          ),
      );
    }

    await login(page);
    await openAccountTab(page, "Collaborateurs");

    await expect(page.getByText("3 / 3 place(s) collaborateur utilisée(s)")).toBeVisible();
    await expect(page.getByText(/Limite de 3 collaborateurs atteinte/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Inviter" })).toBeDisabled();
  });
});
