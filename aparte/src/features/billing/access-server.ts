import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveAccess, type AccessState } from "./access";
import type { CurrentUser } from "@/features/auth/current-user";

/**
 * Calcule l'état d'accès d'un espace côté serveur : combine le statut du
 * compte, la fin d'essai et l'abonnement Stripe (miroir). Mémoïsé par requête.
 */
export const getAccessState = cache(async (user: CurrentUser): Promise<AccessState> => {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("account_id", user.account.id)
    .maybeSingle();

  return resolveAccess({
    accountStatus: user.account.status,
    trialEndsAt: user.account.trialEndsAt,
    subscriptionStatus: sub?.status ?? null,
    currentPeriodEnd: sub?.current_period_end ?? null,
  });
});
