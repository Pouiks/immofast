import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Role, Plan, AccountStatus } from "@/types/domain";

export interface CurrentAccount {
  id: string;
  agencyName: string;
  brandName: string;
  accent: [string, string];
  plan: Plan;
  status: AccountStatus;
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  account: CurrentAccount;
}

/**
 * Utilisateur démo utilisé tant que Supabase n'est pas branché (dev UI-first).
 * À RETIRER une fois l'auth cloud connectée : getCurrentUser lira alors les
 * vraies tables `profiles` + `accounts`.
 */
const DEMO_USER: CurrentUser = {
  id: "demo-user",
  fullName: "Camille Mercier",
  email: "camille@agence.fr",
  phone: "06 24 11 88 30",
  role: "client",
  account: {
    id: "demo-account",
    agencyName: "Aparté",
    brandName: "Aparté",
    accent: ["#2563eb", "#38bdf8"],
    plan: "mensuel",
    status: "active",
  },
};

/**
 * Récupère l'utilisateur connecté (mémoïsé par requête).
 * Retourne `null` si non authentifié quand Supabase est actif.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseEnv) return DEMO_USER;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", profile.account_id)
    .single();
  if (!account) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    account: {
      id: account.id,
      agencyName: account.agency_name,
      brandName: account.brand_name,
      accent: (account.accent as [string, string]) ?? ["#2563eb", "#38bdf8"],
      plan: account.plan,
      status: account.status,
    },
  };
});
