import { createClient } from "@/lib/supabase/client";
import type { AccountRow } from "@/types/database";
import type { Plan, AccountStatus } from "@/types/domain";

/** Tous les espaces clients (RLS : réservé au rôle admin). */
export async function fetchAccounts(): Promise<AccountRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAccount(input: {
  agency_name: string;
  email: string;
  plan: Plan;
  status: AccountStatus;
}): Promise<AccountRow> {
  const sb = createClient();
  const { data, error } = await sb
    .from("accounts")
    .insert({
      agency_name: input.agency_name,
      brand_name: input.agency_name,
      email: input.email,
      plan: input.plan,
      status: input.status,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setAccountStatus(id: string, status: AccountStatus): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("accounts").update({ status }).eq("id", id);
  if (error) throw error;
}
