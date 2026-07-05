"use client";

import { type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useAddDocument } from "../hooks";
import { Modal, Field, Input, Select, Button } from "@/components/ui";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, type DocumentType } from "@/types/domain";

/**
 * Ajout d'un document à la GED d'un prospect (métadonnées : type + nom).
 * Le dépôt de fichier réel (Supabase Storage) sera branché ensuite.
 */
export function DocumentModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const addDocument = useAddDocument();

  if (modal?.type !== "document" || !modal.entityId) return null;
  const prospectId = modal.entityId;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const doc_type = (form.get("doc_type") as DocumentType) ?? "autre";
    const name = String(form.get("name") ?? "").trim() || `${DOCUMENT_TYPE_LABELS[doc_type]}.pdf`;
    addDocument.mutate({ prospect_id: prospectId, name, doc_type }, { onSuccess: closeModal });
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
          <Button type="submit" disabled={addDocument.isPending}>
            {addDocument.isPending ? "Ajout…" : "Ajouter"}
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
    </Modal>
  );
}
