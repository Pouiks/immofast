"use client";

import { useState, type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useProspects, useCreateProspect, useUpdateProspect } from "../hooks";
import { prospectFormSchema, toProspectPayload } from "../schema";
import { Modal, Field, Input, Select, Button } from "@/components/ui";
import { PROSPECT_STAGES, PROSPECT_STAGE_LABELS } from "@/types/domain";

/**
 * Modale de création / édition d'un prospect. S'affiche quand la modale active
 * du store est de type « prospect » (déclenchée par « + Créer » ou « Modifier »).
 */
export function ProspectModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { data: prospects = [] } = useProspects();
  const create = useCreateProspect();
  const update = useUpdateProspect();
  const [error, setError] = useState<string | null>(null);

  if (modal?.type !== "prospect") return null;
  const isEdit = modal.mode === "edit";
  const current = isEdit ? prospects.find((p) => p.id === modal.entityId) : undefined;
  const pending = create.isPending || update.isPending;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = prospectFormSchema.safeParse({
      full_name: form.get("full_name"),
      phone: form.get("phone"),
      email: form.get("email"),
      address: form.get("address"),
      budget_amount: form.get("budget_amount"),
      search_label: form.get("search_label"),
      stage: form.get("stage"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    const payload = toProspectPayload(parsed.data);
    if (isEdit && current) {
      update.mutate({ id: current.id, payload }, { onSuccess: closeModal });
    } else {
      create.mutate(payload, { onSuccess: closeModal });
    }
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      title={isEdit ? "Modifier le prospect" : "Créer un prospect"}
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <Field label="Nom complet" required>
        <Input name="full_name" defaultValue={current?.full_name ?? ""} placeholder="ex. Camille Petit" />
      </Field>
      <div className="flex gap-3">
        <Field label="Téléphone" className="flex-1">
          <Input name="phone" defaultValue={current?.phone ?? ""} placeholder="06 12 34 56 78" />
        </Field>
        <Field label="Email" className="flex-1">
          <Input name="email" type="email" defaultValue={current?.email ?? ""} placeholder="nom@email.fr" />
        </Field>
      </div>
      <Field label="Adresse">
        <Input name="address" defaultValue={current?.address ?? ""} placeholder="12 rue de Rivoli, Paris" />
      </Field>
      <div className="flex gap-3">
        <Field label="Budget (€)" className="flex-1">
          <Input name="budget_amount" type="number" min={0} step={1000} defaultValue={current?.budget_amount ?? ""} placeholder="450000" />
        </Field>
        <Field label="Statut" className="flex-1">
          <Select name="stage" defaultValue={current?.stage ?? "nouveau"}>
            {PROSPECT_STAGES.map((s) => (
              <option key={s} value={s}>
                {PROSPECT_STAGE_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Recherche">
        <Input name="search_label" defaultValue={current?.search_label ?? ""} placeholder="ex. T3, Paris 11e" />
      </Field>
      {error && <p className="text-xs font-bold text-danger">{error}</p>}
    </Modal>
  );
}
