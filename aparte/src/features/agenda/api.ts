import { createClient } from "@/lib/supabase/client";
import type { VisitRow } from "@/types/database";

export type VisitPayload = {
  prospect_id: string | null;
  title: string;
  starts_at: string; // ISO
};

/** Toutes les visites de l'espace (RLS filtre par tenant). */
export async function fetchVisits(): Promise<VisitRow[]> {
  const sb = createClient();
  const { data, error } = await sb.from("visits").select("*").order("starts_at");
  if (error) throw error;
  return data;
}

export async function createVisit(payload: VisitPayload): Promise<VisitRow> {
  const sb = createClient();
  const { data, error } = await sb.from("visits").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateVisit(
  id: string,
  patch: Partial<VisitPayload>,
): Promise<VisitRow> {
  const sb = createClient();
  const { data, error } = await sb.from("visits").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVisit(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("visits").delete().eq("id", id);
  if (error) throw error;
}
