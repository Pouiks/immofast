import { createClient } from "@/lib/supabase/client";
import type { SubscriptionRow } from "@/types/database";

/** Abonnement de l'espace courant (RLS : lecture membre). null si aucun. */
export async function fetchSubscription(): Promise<SubscriptionRow | null> {
  const sb = createClient();
  const { data, error } = await sb.from("subscriptions").select("*").maybeSingle();
  if (error) throw error;
  return data;
}
