import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type { Plan } from "@/types/domain";

export interface ProvisionInput {
  email: string;
  agencyName?: string;
  plan?: Plan;
  stripeCustomerId?: string | null;
  /** Durée de l'essai gratuit en heures (défaut 24). */
  trialHours?: number;
}

export interface ProvisionResult {
  accountId: string;
  userId: string;
  created: boolean;
  /** Lien d'invitation (définition du mot de passe) à envoyer au client. */
  actionLink?: string;
}

/**
 * Crée un espace client complet : compte (essai 24 h), utilisateur d'auth
 * (invitation) et profil titulaire (onboarding à faire). Idempotent : si un
 * profil existe déjà pour cet email, renvoie l'espace existant sans rien créer.
 * Utilise le client service_role (hors session).
 */
export async function provisionAccount(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();
  const agencyName = input.agencyName?.trim() || email.split("@")[0];

  // Idempotence : espace déjà provisionné pour cet email ?
  const { data: existing } = await admin
    .from("profiles")
    .select("id, account_id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return { accountId: existing.account_id, userId: existing.id, created: false };
  }

  // 1) Compte avec essai gratuit
  const trialEndsAt = new Date(
    Date.now() + (input.trialHours ?? 24) * 3_600_000,
  ).toISOString();
  const { data: account, error: accErr } = await admin
    .from("accounts")
    .insert({
      agency_name: agencyName,
      brand_name: agencyName,
      email,
      plan: input.plan ?? "mensuel",
      status: "active",
      trial_ends_at: trialEndsAt,
      stripe_customer_id: input.stripeCustomerId ?? null,
    })
    .select()
    .single();
  if (accErr || !account) throw new Error(`Création du compte échouée : ${accErr?.message}`);

  // 2) Utilisateur d'auth + lien d'invitation (définition du mot de passe)
  const redirectTo = `${env.appUrl}/login`;
  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { full_name: agencyName }, redirectTo },
  });
  if (linkErr || !link.user) {
    // Rollback du compte pour ne pas laisser d'orphelin.
    await admin.from("accounts").delete().eq("id", account.id);
    throw new Error(`Invitation échouée : ${linkErr?.message}`);
  }

  // 3) Profil titulaire (onboarding à faire)
  const { error: profErr } = await admin.from("profiles").insert({
    id: link.user.id,
    account_id: account.id,
    full_name: agencyName,
    email,
    role: "client",
    onboarding_completed: false,
  });
  if (profErr) {
    await admin.auth.admin.deleteUser(link.user.id);
    await admin.from("accounts").delete().eq("id", account.id);
    throw new Error(`Création du profil échouée : ${profErr.message}`);
  }

  return {
    accountId: account.id,
    userId: link.user.id,
    created: true,
    actionLink: link.properties?.action_link,
  };
}
