import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSubscription, mapInvoice, mapPaymentMethod } from "./mappers";

/**
 * Synchronise les objets Stripe dans notre base (appelé par les webhooks).
 * Écrit avec le client admin (service_role) → contourne la RLS.
 */

export async function syncSubscription(sub: Parameters<typeof mapSubscription>[0], accountId: string) {
  const admin = createAdminClient();
  const row = mapSubscription(sub, accountId, new Date().toISOString());
  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "account_id" });
  if (error) throw error;
}

export async function deleteSubscription(subId: string) {
  const admin = createAdminClient();
  await admin.from("subscriptions").delete().eq("stripe_subscription_id", subId);
}

export async function syncInvoice(inv: Parameters<typeof mapInvoice>[0], accountId: string) {
  const admin = createAdminClient();
  const row = mapInvoice(inv, accountId);
  const { error } = await admin
    .from("invoices")
    .upsert(row, { onConflict: "stripe_invoice_id" });
  if (error) throw error;
}

export async function syncPaymentMethod(pm: Parameters<typeof mapPaymentMethod>[0], accountId: string) {
  const admin = createAdminClient();
  const row = mapPaymentMethod(pm, accountId);
  // Un seul moyen de paiement par défaut affiché : on remplace.
  await admin.from("payment_methods").delete().eq("account_id", accountId);
  const { error } = await admin.from("payment_methods").insert(row);
  if (error) throw error;
}

/** Idempotence : renvoie true si l'événement a déjà été traité. */
export async function alreadyProcessed(eventId: string, type: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("stripe_events").insert({ id: eventId, type });
  // Conflit de clé primaire = déjà traité.
  return Boolean(error && error.code === "23505");
}
