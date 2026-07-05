import { createClient } from "@/lib/supabase/client";
import type { PropertyRow } from "@/types/database";
import type { PropertyStatus, ContractStep } from "@/types/domain";

export type PropertyPayload = Omit<PropertyRow, "id" | "account_id" | "created_at" | "ref">;

/** Liste des biens de l'espace (RLS filtre par tenant). */
export async function fetchProperties(): Promise<PropertyRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchProperty(id: string): Promise<PropertyRow> {
  const sb = createClient();
  const { data, error } = await sb.from("properties").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/** Référence auto à la création (ex. « REF-4821 »). */
function generateRef(): string {
  return `REF-${String(Date.now()).slice(-4)}`;
}

export async function createProperty(payload: PropertyPayload): Promise<PropertyRow> {
  const sb = createClient();
  const { data, error } = await sb
    .from("properties")
    .insert({ ...payload, ref: generateRef() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(
  id: string,
  payload: Partial<PropertyPayload>,
): Promise<PropertyRow> {
  const sb = createClient();
  const { data, error } = await sb
    .from("properties")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setPropertyStatus(id: string, status: PropertyStatus): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("properties").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function setContractStep(id: string, step: ContractStep | null): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("properties").update({ contract_step: step }).eq("id", id);
  if (error) throw error;
}

export async function togglePublished(id: string, published: boolean): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("properties").update({ published }).eq("id", id);
  if (error) throw error;
}

export async function linkOffer(id: string, prospectId: string | null): Promise<void> {
  const sb = createClient();
  const { error } = await sb
    .from("properties")
    .update({ offer_prospect_id: prospectId })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProperty(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("properties").delete().eq("id", id);
  if (error) throw error;
}
