"use server";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** Marque l'onboarding comme terminé pour l'utilisateur courant. */
export async function completeOnboarding(): Promise<void> {
  if (!hasSupabaseEnv) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
}
