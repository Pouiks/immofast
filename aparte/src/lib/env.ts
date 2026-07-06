/**
 * Accès centralisé et typé aux variables d'environnement.
 * Les clés Supabase peuvent être absentes tant que le projet cloud n'est pas
 * branché : `hasSupabaseEnv` permet à l'app de démarrer (écran de connexion)
 * sans planter, et aux couches serveur de lever une erreur explicite au besoin.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Supporte l'ancienne clé anon ET la nouvelle clé publishable (sb_publishable_…).
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Clé secrète serveur (sb_secret_… ou service_role) — opérations admin.
  supabaseServiceKey:
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  // Stripe (serveur uniquement).
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceMensuel: process.env.STRIPE_PRICE_MENSUEL,
  stripePriceAnnuel: process.env.STRIPE_PRICE_ANNUEL,
} as const;

export const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasStripeEnv = Boolean(env.stripeSecretKey);

export function requireServiceKey(): string {
  if (!env.supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY manquant (Project Settings → API → clé service_role / sb_secret_…).",
    );
  }
  return env.supabaseServiceKey;
}

export function requireStripeSecret(): string {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY manquant dans .env.local.");
  }
  return env.stripeSecretKey;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase non configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local.",
    );
  }
  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey };
}
