import "server-only";
import Stripe from "stripe";
import { requireStripeSecret } from "@/lib/env";

let cached: Stripe | null = null;

/** Client Stripe côté serveur (lazy — n'exige la clé qu'à la première utilisation). */
export function getStripe(): Stripe {
  if (!cached) cached = new Stripe(requireStripeSecret());
  return cached;
}
