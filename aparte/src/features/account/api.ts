import { createClient } from "@/lib/supabase/client";
import type { InvoiceRow, PaymentMethodRow } from "@/types/database";
import type { Plan } from "@/types/domain";

export async function updateProfile(
  id: string,
  patch: { full_name?: string; phone?: string | null },
): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateAccount(
  id: string,
  patch: { brand_name?: string; plan?: Plan; accent?: [string, string] },
): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("accounts").update(patch).eq("id", id);
  if (error) throw error;
}

export async function fetchInvoices(): Promise<InvoiceRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("invoices")
    .select("*")
    .order("period", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPaymentMethod(): Promise<PaymentMethodRow | null> {
  const sb = createClient();
  const { data, error } = await sb.from("payment_methods").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}
