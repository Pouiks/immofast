"use client";

import { type FormEvent } from "react";
import { format } from "date-fns";
import { useUIStore } from "@/stores/ui-store";
import { useVisits, useCreateVisit, useUpdateVisit, useDeleteVisit } from "../hooks";
import { useProspects } from "@/features/prospects/hooks";
import { Modal, Field, Input, Select, Button } from "@/components/ui";

/** Création / édition d'une visite (liée à un prospect) + suppression. */
export function VisitModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { data: prospects = [] } = useProspects();
  const { data: visits = [] } = useVisits();
  const create = useCreateVisit();
  const update = useUpdateVisit();
  const del = useDeleteVisit();

  if (modal?.type !== "visite") return null;
  const isEdit = modal.mode === "edit";
  const current = isEdit ? visits.find((v) => v.id === modal.entityId) : undefined;
  const start = current ? new Date(current.starts_at) : new Date();
  // En création depuis une fiche prospect, entityId = prospectId à présélectionner.
  const defaultProspect = isEdit
    ? current?.prospect_id ?? ""
    : (modal.entityId && prospects.some((p) => p.id === modal.entityId) ? modal.entityId : prospects[0]?.id) ?? "";
  const pending = create.isPending || update.isPending;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date") ?? "");
    const time = String(f.get("time") ?? "09:00");
    const payload = {
      prospect_id: String(f.get("prospect_id") ?? "") || null,
      title: String(f.get("title") ?? "").trim() || "Visite",
      starts_at: new Date(`${date}T${time}`).toISOString(),
    };
    if (isEdit && current) update.mutate({ id: current.id, patch: payload }, { onSuccess: closeModal });
    else create.mutate(payload, { onSuccess: closeModal });
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      title={isEdit ? "Modifier la visite" : "Planifier une visite"}
      footer={
        <div className="flex w-full items-center">
          {isEdit && current && (
            <button
              type="button"
              onClick={() => del.mutate(current.id, { onSuccess: closeModal })}
              className="text-[13px] font-bold text-danger"
            >
              Supprimer
            </button>
          )}
          <div className="ml-auto flex gap-2.5">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Planifier"}
            </Button>
          </div>
        </div>
      }
    >
      <Field label="Prospect">
        <Select name="prospect_id" defaultValue={defaultProspect}>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Bien / objet">
        <Input name="title" defaultValue={current?.title ?? ""} placeholder="ex. Visite T3 Rue de la Paix" />
      </Field>
      <div className="flex gap-3">
        <Field label="Jour" className="flex-1">
          <Input name="date" type="date" defaultValue={format(start, "yyyy-MM-dd")} />
        </Field>
        <Field label="Heure" className="flex-1">
          <Input name="time" type="time" defaultValue={format(start, "HH:mm")} />
        </Field>
      </div>
    </Modal>
  );
}
