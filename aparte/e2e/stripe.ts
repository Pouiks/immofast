import { readFileSync } from "node:fs";
import Stripe from "stripe";

/** Client Stripe + IDs de prix pour les scénarios de facturation E2E. */
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
export const PRICE_MENSUEL = env.STRIPE_PRICE_MENSUEL;
export const PRICE_ANNUEL = env.STRIPE_PRICE_ANNUEL;
