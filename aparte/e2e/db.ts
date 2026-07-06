import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Accès admin (service_role) pour les tests E2E : préparer / nettoyer les
 * données des comptes fixtures. Lit les clés depuis .env.local.
 */
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
export const PROVISION_SECRET = env.PROVISION_SECRET ?? "";
export const admin: SupabaseClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } },
);

/** Comptes fixtures (voir supabase/seed.sql). */
export const ACCOUNTS = {
  camille: "11111111-1111-1111-1111-111111111111",
  sandbox: "77777777-7777-7777-7777-777777777777",
  sandbox2: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  trial: "99999999-9999-9999-9999-999999999999",
} as const;

/** Vide toutes les données CRM d'un espace (ordre respectant les FK). */
export async function clearAccountData(accountId: string): Promise<void> {
  await admin.from("visits").delete().eq("account_id", accountId);
  await admin.from("documents").delete().eq("account_id", accountId);
  await admin.from("properties").delete().eq("account_id", accountId);
  await admin.from("prospects").delete().eq("account_id", accountId);
}

/** Supprime les collaborateurs invités d'un espace (profil + utilisateur). */
export async function clearInvitedMembers(accountId: string): Promise<void> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("account_id", accountId)
    .eq("role", "invite");
  for (const m of data ?? []) {
    await admin.auth.admin.deleteUser(m.id).catch(() => {});
  }
  await admin.from("profiles").delete().eq("account_id", accountId).eq("role", "invite");
}

export function countRows(table: string, accountId: string) {
  return admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .then((r) => r.count ?? 0);
}
