import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { env } from "@/lib/env";
import { accountIdForCustomer } from "@/features/billing/stripe-customer";
import { reconcileAccountBilling } from "@/features/billing/reconcile";
import { provisionAccount } from "@/features/provisioning/provision";
import {
  syncSubscription,
  deleteSubscription,
  syncInvoice,
  syncPaymentMethod,
  alreadyProcessed,
} from "@/features/billing/sync";
import type {
  StripeSubLike,
  StripeInvoiceLike,
  StripePmLike,
} from "@/features/billing/mappers";

/** Endpoint webhook Stripe : synchronise abonnements, factures et moyens de paiement. */
export async function POST(req: NextRequest) {
  if (!env.stripeWebhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "signature absente" }, { status: 400 });

  const body = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "signature invalide" }, { status: 400 });
  }

  // Idempotence : un même événement n'est traité qu'une fois.
  if (await alreadyProcessed(event.id, event.type)) {
    return NextResponse.json({ received: true, deduped: true });
  }

  const customerId = (obj: { customer?: unknown }) =>
    typeof obj.customer === "string" ? obj.customer : null;

  try {
    switch (event.type) {
      // Paiement finalisé sur le site vitrine → provisionner un espace + essai
      // si le client n'en a pas déjà un, puis synchroniser son abonnement.
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const linked = customerId ? await accountIdForCustomer(customerId) : null;
        if (!linked && email) {
          const { accountId } = await provisionAccount({
            email,
            agencyName: session.customer_details?.name ?? undefined,
            stripeCustomerId: customerId ?? undefined,
          });
          // L'abonnement a pu arriver avant le provisioning → on réconcilie.
          await reconcileAccountBilling(accountId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const accountId =
          sub.metadata?.account_id ?? (customerId(sub) ? await accountIdForCustomer(customerId(sub)!) : null);
        if (accountId) await syncSubscription(sub as unknown as StripeSubLike, accountId);
        break;
      }
      case "customer.subscription.deleted": {
        await deleteSubscription((event.data.object as Stripe.Subscription).id);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed":
      case "invoice.finalized": {
        const inv = event.data.object as Stripe.Invoice;
        const cid = customerId(inv);
        const accountId = cid ? await accountIdForCustomer(cid) : null;
        if (accountId) await syncInvoice(inv as unknown as StripeInvoiceLike, accountId);
        break;
      }
      case "payment_method.attached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        const cid = customerId(pm);
        const accountId = cid ? await accountIdForCustomer(cid) : null;
        if (accountId) await syncPaymentMethod(pm as unknown as StripePmLike, accountId);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] erreur de traitement", event.type, err);
    return NextResponse.json({ error: "traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
