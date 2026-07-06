import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSubscription, syncInvoice, syncPaymentMethod } from "./sync";
import type { StripeSubLike, StripeInvoiceLike, StripePmLike } from "./mappers";

/**
 * Resynchronise l'état de facturation d'un espace directement depuis Stripe
 * (abonnement, moyen de paiement par défaut, factures récentes).
 *
 * Filet de sécurité appelé au retour de Checkout / Customer Portal : garantit
 * des données à jour même si le webhook est retardé ou (en dev local) absent.
 * Stripe reste la source de vérité — aucune donnée inventée.
 */
export async function reconcileAccountBilling(accountId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("accounts")
    .select("stripe_customer_id")
    .eq("id", accountId)
    .single();
  const customerId = account?.stripe_customer_id;
  if (!customerId) return;

  const stripe = getStripe();

  // ─── Abonnement : le plus récent non résilié, sinon on nettoie ───────────
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.default_payment_method"],
  });
  const active = subs.data.find((s) => s.status !== "canceled") ?? null;
  if (active) {
    await syncSubscription(active as unknown as StripeSubLike, accountId);
  } else {
    await admin.from("subscriptions").delete().eq("account_id", accountId);
  }

  // ─── Moyen de paiement : sub → client → 1re carte attachée ───────────────
  const customer = (await stripe.customers.retrieve(customerId, {
    expand: ["invoice_settings.default_payment_method"],
  })) as Stripe.Customer | Stripe.DeletedCustomer;

  const asObject = (
    pm: string | Stripe.PaymentMethod | null | undefined,
  ): Stripe.PaymentMethod | null => (pm && typeof pm !== "string" ? pm : null);

  let paymentMethod =
    asObject(active?.default_payment_method) ??
    (customer.deleted ? null : asObject(customer.invoice_settings?.default_payment_method));
  if (!paymentMethod) {
    // Tous types (card, link, wallets…) — le premier disponible.
    const pms = await stripe.paymentMethods.list({ customer: customerId, limit: 3 });
    paymentMethod = pms.data[0] ?? null;
  }
  if (paymentMethod) {
    await syncPaymentMethod(paymentMethod as unknown as StripePmLike, accountId);
  } else {
    // Aucun moyen de paiement côté Stripe → refléter fidèlement (pas d'info erronée).
    await admin.from("payment_methods").delete().eq("account_id", accountId);
  }

  // ─── Factures récentes ───────────────────────────────────────────────────
  const invoices = await stripe.invoices.list({ customer: customerId, limit: 12 });
  for (const inv of invoices.data) {
    await syncInvoice(inv as unknown as StripeInvoiceLike, accountId);
  }
}
