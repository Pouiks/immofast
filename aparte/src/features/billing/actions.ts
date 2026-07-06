"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";
import { getCurrentUser } from "@/features/auth/current-user";
import { getOrCreateStripeCustomer } from "./stripe-customer";
import type { Plan } from "@/types/domain";

async function requireClient() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "client") {
    throw new Error("Seul le titulaire du compte gère l'abonnement.");
  }
  return user;
}

/** Ouvre Stripe Checkout pour souscrire (ou re-souscrire) à un plan. */
export async function startCheckout(formData: FormData) {
  const plan = (String(formData.get("plan")) as Plan) || "mensuel";
  const user = await requireClient();
  const customer = await getOrCreateStripeCustomer(user.account.id);
  const price = plan === "annuel" ? env.stripePriceAnnuel : env.stripePriceMensuel;
  if (!price) throw new Error("Prix Stripe non configuré.");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.appUrl}/api/stripe/return?to=/dashboard`,
    cancel_url: `${env.appUrl}/dashboard`,
    subscription_data: { metadata: { account_id: user.account.id } },
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error("Impossible de créer la session de paiement.");
  redirect(session.url);
}

/**
 * Ouvre le Stripe Customer Portal : changement de carte (autofill navigateur),
 * factures, changement de formule (prorata natif) et résiliation.
 */
export async function openBillingPortal() {
  const user = await requireClient();
  const customer = await getOrCreateStripeCustomer(user.account.id);
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${env.appUrl}/api/stripe/return?to=/dashboard`,
  });
  redirect(session.url);
}
