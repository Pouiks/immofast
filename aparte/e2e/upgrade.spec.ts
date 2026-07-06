import { test, expect } from "@playwright/test";
import { loginAs, openAccountTab } from "./helpers";
import { admin, ACCOUNTS } from "./db";
import { stripe, PRICE_MENSUEL, PRICE_ANNUEL } from "./stripe";

const UPGRADE_ACCOUNT = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

let customerId = "";
let subId = "";
let itemId = "";

const toIso = (u: number | null | undefined) =>
  typeof u === "number" ? new Date(u * 1000).toISOString() : new Date().toISOString();

test.describe("Scénario : passage mensuel → annuel (Stripe test)", () => {
  test.beforeAll(async () => {
    // Client Stripe + carte test + abonnement MENSUEL, synchronisé en base
    // (donne l'accès à l'espace avant la connexion).
    const customer = await stripe.customers.create({
      email: "upgrade@aparte.fr",
      metadata: { account_id: UPGRADE_ACCOUNT },
    });
    customerId = customer.id;
    const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    });
    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PRICE_MENSUEL }],
      default_payment_method: pm.id,
      metadata: { account_id: UPGRADE_ACCOUNT },
    });
    subId = sub.id;
    itemId = sub.items.data[0].id;

    await admin.from("accounts").update({ stripe_customer_id: customer.id }).eq("id", UPGRADE_ACCOUNT);
    await admin.from("subscriptions").upsert(
      {
        account_id: UPGRADE_ACCOUNT,
        stripe_subscription_id: sub.id,
        stripe_price_id: PRICE_MENSUEL,
        plan: "mensuel",
        status: "active",
        current_period_end: toIso(
          (sub as unknown as { current_period_end?: number }).current_period_end ??
            (sub.items.data[0] as unknown as { current_period_end?: number }).current_period_end,
        ),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" },
    );
  });

  test.afterAll(async () => {
    if (customerId) await stripe.customers.del(customerId).catch(() => {});
    await admin.from("subscriptions").delete().eq("account_id", UPGRADE_ACCOUNT);
    await admin.from("accounts").update({ stripe_customer_id: null }).eq("id", UPGRADE_ACCOUNT);
  });

  test("l'utilisateur passe de mensuel à annuel et l'app se met à jour", async ({ page }) => {
    await loginAs(page, "upgrade@aparte.fr");

    // État initial : mensuel.
    await openAccountTab(page, "Abonnement");
    await expect(page.getByText("Pro · Mensuel")).toBeVisible();

    // Changement de formule côté Stripe (comme le ferait le Customer Portal).
    await stripe.subscriptions.update(subId, {
      items: [{ id: itemId, price: PRICE_ANNUEL }],
      proration_behavior: "none",
    });

    // Retour depuis Stripe → réconciliation → l'app reflète l'annuel.
    await page.goto("/api/stripe/return?to=/dashboard");
    await page.waitForURL("**/dashboard");

    await openAccountTab(page, "Abonnement");
    await expect(page.getByText("Pro · Annuel")).toBeVisible();
  });
});
