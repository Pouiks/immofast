import "server-only";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Retourne l'id client Stripe de l'espace, en le créant au besoin.
 * Utilise le client admin (service_role) : hors session, écrit stripe_customer_id.
 */
export async function getOrCreateStripeCustomer(accountId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: account, error } = await admin
    .from("accounts")
    .select("id, email, agency_name, stripe_customer_id")
    .eq("id", accountId)
    .single();
  if (error || !account) throw new Error("Espace introuvable pour la facturation.");
  if (account.stripe_customer_id) return account.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: account.email ?? undefined,
    name: account.agency_name,
    metadata: { account_id: accountId },
  });
  await admin.from("accounts").update({ stripe_customer_id: customer.id }).eq("id", accountId);
  return customer.id;
}

/** Retrouve l'espace à partir d'un id client Stripe (webhooks). */
export async function accountIdForCustomer(customerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}
