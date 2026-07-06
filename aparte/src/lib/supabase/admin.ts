import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv, requireServiceKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase à privilèges service_role : **contourne la RLS**.
 * Réservé au serveur, pour les opérations d'administration hors session
 * utilisateur (webhooks Stripe, provisioning d'un espace depuis la vitrine).
 * Ne JAMAIS importer dans du code client.
 */
export function createAdminClient() {
  const { url } = requireSupabaseEnv();
  return createClient<Database>(url, requireServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
