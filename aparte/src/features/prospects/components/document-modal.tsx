"use client";

import { useState, type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useAddDocument } from "../hooks";
import { uploadDocumentFile } from "../api";
import { useAccount } from "@/features/account/account-context";
import { Modal, Field, Input, Select, Button } from "@/components/ui";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, type DocumentType } from "@/types/domain";

/**
 * Ajout d'un document à la GED d'un prospect : téléverse le fichier dans
 * Supabase Storage (bucket privé, isolé par tenant), puis enregistre la
 * métadonnée (type, nom, chemin). Le fichier est facultatif.
 */
export function DocumentModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { account } = useAccount();
  const addDocument = useAddDocument();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (modal?.type !== "document" || !modal.entityId) return null;
  const prospectId = modal.entityId;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const doc_type = (form.get("doc_type") as DocumentType) ?? "autre";
    const file = form.get("file") as File | null;
    const hasFile = file && file.size > 0;
    const name =
      String(form.get("name") ?? "").trim() ||
      (hasFile ? file!.name : `${DOCUMENT_TYPE_LABELS[doc_type]}.pdf`);

    try {
      setBusy(true);
      const storage_path = hasFile
        ? await uploadDocumentFile(account.id, prospectId, file!)
        : null;
      addDocument.mutate(
        { prospect_id: prospectId, name, doc_type, storage_path },
        { onSuccess: closeModal, onError: () => setError("Échec de l'enregistrement.") },
      );
    } catch {
      setError("Échec du téléversement du fichier.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      title="Ajouter un document"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button type="submit" disabled={busy || addDocument.isPending}>
            {busy ? "Téléversement…" : "Ajouter"}
          </Button>
        </>
      }
    >
      <Field label="Type de document">
        <Select name="doc_type" defaultValue="piece_identite">
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Nom du document (optionnel)">
        <Input name="name" placeholder="ex. CNI recto-verso" />
      </Field>
      <div className="rounded-[11px] border-[1.5px] border-dashed border-[#d8d6e0] bg-soft p-4 text-center">
        <div className="mb-2.5 text-xs font-bold text-[#8a8a9a]">
          Déposez un fichier (PDF, image…) ou parcourez
        </div>
        <input type="file" name="file" className="text-xs font-semibold" />
      </div>
      {error && <p className="text-xs font-bold text-danger">{error}</p>}
    </Modal>
  );
}
