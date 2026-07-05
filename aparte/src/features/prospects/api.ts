import { createClient } from "@/lib/supabase/client";
import type { ProspectRow, VisitRow, DocumentRow, PropertyRow } from "@/types/database";
import type { ProspectStage, DocumentType } from "@/types/domain";

type ProspectPayload = Omit<ProspectRow, "id" | "account_id" | "created_at">;

/** Liste des prospects de l'espace (RLS applique le filtrage par tenant). */
export async function fetchProspects(): Promise<ProspectRow[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export type ProspectOffer = Pick<
  PropertyRow,
  "id" | "title" | "price_amount" | "contract_step"
>;

export interface ProspectDetail {
  prospect: ProspectRow;
  visits: VisitRow[];
  documents: DocumentRow[];
  offers: ProspectOffer[];
}

/** Fiche complète d'un prospect : coordonnées, visites, GED, offres liées. */
export async function fetchProspectDetail(id: string): Promise<ProspectDetail> {
  const sb = createClient();
  const [prospect, visits, documents, offers] = await Promise.all([
    sb.from("prospects").select("*").eq("id", id).single(),
    sb.from("visits").select("*").eq("prospect_id", id).order("starts_at"),
    sb.from("documents").select("*").eq("prospect_id", id).order("created_at"),
    sb
      .from("properties")
      .select("id, title, price_amount, contract_step")
      .eq("offer_prospect_id", id),
  ]);
  if (prospect.error) throw prospect.error;
  return {
    prospect: prospect.data,
    visits: visits.data ?? [],
    documents: documents.data ?? [],
    offers: offers.data ?? [],
  };
}

export async function createProspect(payload: ProspectPayload): Promise<ProspectRow> {
  const sb = createClient();
  const { data, error } = await sb.from("prospects").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProspect(
  id: string,
  payload: Partial<ProspectPayload>,
): Promise<ProspectRow> {
  const sb = createClient();
  const { data, error } = await sb
    .from("prospects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setProspectStage(id: string, stage: ProspectStage): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("prospects").update({ stage }).eq("id", id);
  if (error) throw error;
}

export async function deleteProspect(id: string): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("prospects").delete().eq("id", id);
  if (error) throw error;
}

const DOCUMENTS_BUCKET = "documents";

/** Téléverse un fichier dans le bucket privé, chemin `<account>/<prospect>/…`. */
export async function uploadDocumentFile(
  accountId: string,
  prospectId: string,
  file: File,
): Promise<string> {
  const sb = createClient();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${accountId}/${prospectId}/${Date.now()}-${safeName}`;
  const { error } = await sb.storage.from(DOCUMENTS_BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

export async function addDocument(input: {
  prospect_id: string;
  name: string;
  doc_type: DocumentType;
  storage_path?: string | null;
}): Promise<void> {
  const sb = createClient();
  const { error } = await sb.from("documents").insert(input);
  if (error) throw error;
}

/** URL signée temporaire pour consulter/télécharger un document privé. */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const sb = createClient();
  const { data, error } = await sb.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(id: string, storagePath?: string | null): Promise<void> {
  const sb = createClient();
  if (storagePath) {
    await sb.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
  }
  const { error } = await sb.from("documents").delete().eq("id", id);
  if (error) throw error;
}
