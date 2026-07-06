import { env } from "@/lib/env";
import type { Plan } from "@/types/domain";

/**
 * Mappings purs Stripe → lignes de notre base. Isolés ici pour être testables
 * sans réseau. Accès défensif aux champs (l'API Stripe évolue).
 */

/** Déduit le plan (mensuel/annuel) à partir de l'id de prix Stripe. */
export function planForPrice(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === env.stripePriceAnnuel) return "annuel";
  if (priceId === env.stripePriceMensuel) return "mensuel";
  return null;
}

const toIso = (unix: number | null | undefined): string | null =>
  typeof unix === "number" ? new Date(unix * 1000).toISOString() : null;

export interface StripeSubLike {
  id: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number | null;
  trial_end?: number | null;
  items?: { data?: { price?: { id?: string }; current_period_end?: number | null }[] };
}

export interface SubscriptionUpsert {
  account_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  plan: Plan | null;
  status: string;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
}

export function mapSubscription(
  sub: StripeSubLike,
  accountId: string,
  nowIso: string,
): SubscriptionUpsert {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  // current_period_end : sur la sub (anciennes API) ou sur l'item (récentes).
  const periodEnd = sub.current_period_end ?? item?.current_period_end ?? null;
  return {
    account_id: accountId,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    plan: planForPrice(priceId),
    status: sub.status,
    current_period_end: toIso(periodEnd),
    trial_end: toIso(sub.trial_end),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    updated_at: nowIso,
  };
}

export interface StripeInvoiceLike {
  id: string;
  status?: string | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  created?: number | null;
  period_start?: number | null;
}

export interface InvoiceUpsert {
  account_id: string;
  stripe_invoice_id: string;
  period: string;
  amount_cents: number;
  status: string | null;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
}

export function mapInvoice(inv: StripeInvoiceLike, accountId: string): InvoiceUpsert {
  const ts = (inv.period_start ?? inv.created ?? 0) * 1000;
  const d = new Date(ts);
  const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return {
    account_id: accountId,
    stripe_invoice_id: inv.id,
    period,
    amount_cents: inv.amount_paid ?? inv.amount_due ?? 0,
    status: inv.status ?? null,
    hosted_invoice_url: inv.hosted_invoice_url ?? null,
    pdf_url: inv.invoice_pdf ?? null,
  };
}

export interface StripePmLike {
  id: string;
  type?: string;
  card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number } | null;
}

export interface PaymentMethodUpsert {
  account_id: string;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export function mapPaymentMethod(pm: StripePmLike, accountId: string): PaymentMethodUpsert {
  const card = pm.card;
  // Link / Apple Pay / wallets n'ont pas toujours de carte exposée → on garde
  // un libellé de type plutôt qu'un faux numéro. last4 vide = pas de « •••• ».
  const brand = card?.brand ?? (pm.type === "link" ? "Link" : pm.type ?? "carte");
  return {
    account_id: accountId,
    stripe_payment_method_id: pm.id,
    brand,
    last4: card?.last4 ?? "",
    exp_month: card?.exp_month ?? 0,
    exp_year: card?.exp_year ?? 0,
    is_default: true,
  };
}
