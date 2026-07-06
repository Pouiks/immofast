import { type Page, type Locator } from "@playwright/test";

/**
 * Simule un glisser-déposer HTML5 (draggable) en dispatchant les événements
 * natifs (dragstart/dragover/drop) — la méthode souris de Playwright ne
 * déclenche pas la DnD HTML5.
 */
export async function html5Drag(page: Page, source: Locator, target: Locator) {
  const s = await source.elementHandle();
  const t = await target.elementHandle();
  if (!s || !t) throw new Error("html5Drag : source ou cible introuvable");
  await page.evaluate(
    ([src, tgt]) => {
      const dt = new DataTransfer();
      const fire = (el: Element, type: string) =>
        el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt }));
      fire(src as Element, "dragstart");
      fire(tgt as Element, "dragenter");
      fire(tgt as Element, "dragover");
      fire(tgt as Element, "drop");
      fire(src as Element, "dragend");
    },
    [s, t] as const,
  );
}

/** Identifiants de démonstration (seed Supabase). */
export const DEMO = {
  email: "camille@agence.fr",
  password: "demodemo",
  name: "Camille Mercier",
};

export const DEMO_ADMIN = { email: "admin@aparte.fr", password: "demodemo" };

async function submitLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

/** Connecte l'utilisateur client de démo et attend le tableau de bord. */
export async function login(page: Page) {
  await submitLogin(page, DEMO.email, DEMO.password);
  await page.waitForURL("**/dashboard");
}

/** Connecte un compte fixture par email (mot de passe demodemo) → dashboard. */
export async function loginAs(page: Page, email: string, password = "demodemo") {
  await submitLogin(page, email, password);
  await page.waitForURL("**/dashboard");
}

/** Ouvre le panneau Compte (bloc profil de la sidebar) sur un onglet donné. */
export async function openAccountTab(page: Page, tabLabel: string) {
  await page.locator('[data-tour="sidebar-profile"]').click();
  await page.getByRole("button", { name: tabLabel }).click();
}

/** Connecte l'admin SaaS et attend la console (garde de rôle → /admin). */
export async function loginAdmin(page: Page) {
  await submitLogin(page, DEMO_ADMIN.email, DEMO_ADMIN.password);
  await page.waitForURL("**/admin");
}
