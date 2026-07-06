"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/features/auth/current-user";
import { env } from "@/lib/env";
import { SEAT_LIMIT } from "./config";

export interface InviteResult {
  error?: string;
  actionLink?: string;
}

async function requireTitulaire() {
  const user = await getCurrentUser();
  if (!user || user.role !== "client") {
    throw new Error("Seul le titulaire du compte peut gérer les collaborateurs.");
  }
  return user;
}

/**
 * Invite un collaborateur (rôle « invité ») dans la licence du titulaire.
 * Respecte la limite de places ; renvoie le lien d'invitation à transmettre.
 */
export async function inviteMember(formData: FormData): Promise<InviteResult> {
  const user = await requireTitulaire();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim() || email.split("@")[0];
  if (!email || !email.includes("@")) return { error: "Email invalide." };

  const admin = createAdminClient();

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("account_id", user.account.id)
    .eq("role", "invite");
  if ((count ?? 0) >= SEAT_LIMIT) {
    return { error: `Limite atteinte : ${SEAT_LIMIT} collaborateurs maximum sur cette licence.` };
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { error: "Cet email est déjà associé à un compte." };

  const { data: link, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { full_name: fullName }, redirectTo: `${env.appUrl}/login` },
  });
  if (error || !link.user) return { error: "Échec de l'invitation." };

  const { error: profErr } = await admin.from("profiles").insert({
    id: link.user.id,
    account_id: user.account.id,
    full_name: fullName,
    email,
    role: "invite",
    onboarding_completed: false,
  });
  if (profErr) {
    await admin.auth.admin.deleteUser(link.user.id);
    return { error: "Création du collaborateur échouée." };
  }

  return { actionLink: link.properties?.action_link };
}

/** Retire un collaborateur (invité) de la licence. Réservé au titulaire. */
export async function removeMember(memberId: string): Promise<void> {
  const user = await requireTitulaire();
  if (memberId === user.id) throw new Error("Le titulaire ne peut pas se retirer.");

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("profiles")
    .select("account_id, role")
    .eq("id", memberId)
    .maybeSingle();
  if (!member || member.account_id !== user.account.id || member.role !== "invite") {
    throw new Error("Collaborateur introuvable.");
  }

  await admin.from("profiles").delete().eq("id", memberId);
  await admin.auth.admin.deleteUser(memberId);
}
