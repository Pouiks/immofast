"use client";

import { useState, type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useProperties, useProperty, useCreateProperty, useUpdateProperty } from "../hooks";
import { propertyFormSchema, toPropertyPayload } from "../schema";
import { useProspects } from "@/features/prospects/hooks";
import { Modal, Field, Input, Select, Textarea, Button } from "@/components/ui";
import {
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  CONTRACT_STEPS,
  CONTRACT_STEP_LABELS,
  DPE_CLASSES,
} from "@/types/domain";

const PROPERTY_TYPES = ["Appartement", "Maison", "Studio", "Terrain", "Autre"];

export function PropertyModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { data: properties = [] } = useProperties();
  const { data: prospects = [] } = useProspects();
  const create = useCreateProperty();
  const update = useUpdateProperty();
  const [error, setError] = useState<string | null>(null);

  const isEdit = modal?.type === "bien" && modal.mode === "edit";
  // En édition on lit la fiche fraîche (contient description, offre, etc.).
  const { data: fetched } = useProperty(isEdit ? (modal?.entityId ?? null) : null);
  if (modal?.type !== "bien") return null;

  const current = fetched ?? properties.find((b) => b.id === modal.entityId);
  const pending = create.isPending || update.isPending;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const parsed = propertyFormSchema.safeParse({
      title: f.get("title"),
      city: f.get("city"),
      property_type: f.get("property_type"),
      price_amount: f.get("price_amount"),
      surface_m2: f.get("surface_m2"),
      rooms: f.get("rooms"),
      bedrooms: f.get("bedrooms"),
      bathrooms: f.get("bathrooms"),
      floor_label: f.get("floor_label"),
      dpe: f.get("dpe"),
      margin_pct: f.get("margin_pct"),
      status: f.get("status"),
      description: f.get("description"),
      offer_prospect_id: f.get("offer_prospect_id"),
      contract_step: f.get("contract_step"),
      published: f.get("published") === "on",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    const payload = toPropertyPayload(parsed.data);
    if (isEdit && current) update.mutate({ id: current.id, payload }, { onSuccess: closeModal });
    else create.mutate(payload, { onSuccess: closeModal });
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      width={680}
      title={isEdit ? "Modifier le bien" : "Créer une annonce"}
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Titre du bien" required className="col-span-2">
          <Input name="title" defaultValue={current?.title ?? ""} placeholder="ex. Appartement T3" />
        </Field>
        <Field label="Prix (€)">
          <Input name="price_amount" type="number" min={0} step={1000} defaultValue={current?.price_amount ?? ""} placeholder="520000" />
        </Field>
        <Field label="Ville">
          <Input name="city" defaultValue={current?.city ?? ""} placeholder="Paris 8e" />
        </Field>
        <Field label="Type de bien">
          <Select name="property_type" defaultValue={current?.property_type ?? "Appartement"}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Surface (m²)">
          <Input name="surface_m2" type="number" min={0} step="any" defaultValue={current?.surface_m2 ?? ""} placeholder="68" />
        </Field>
        <Field label="Pièces">
          <Input name="rooms" type="number" min={0} defaultValue={current?.rooms ?? ""} placeholder="3" />
        </Field>
        <Field label="Chambres">
          <Input name="bedrooms" type="number" min={0} defaultValue={current?.bedrooms ?? ""} placeholder="2" />
        </Field>
        <Field label="Salles de bain">
          <Input name="bathrooms" type="number" min={0} defaultValue={current?.bathrooms ?? ""} placeholder="1" />
        </Field>
        <Field label="Étage">
          <Input name="floor_label" defaultValue={current?.floor_label ?? ""} placeholder="4e étage" />
        </Field>
        <Field label="DPE">
          <Select name="dpe" defaultValue={current?.dpe ?? "D"}>
            {DPE_CLASSES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Marge agence (%)">
          <Input name="margin_pct" type="number" min={0} step="any" defaultValue={current?.margin_pct ?? ""} placeholder="4.2" />
        </Field>
        <Field label="Statut du bien">
          <Select name="status" defaultValue={current?.status ?? "disponible"}>
            {PROPERTY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROPERTY_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description" required className="col-span-2">
          <Textarea name="description" rows={3} defaultValue={current?.description ?? ""} placeholder="Décrivez le bien : atouts, environnement, prestations…" />
        </Field>
        <Field label="Prospect lié (offre)">
          <Select name="offer_prospect_id" defaultValue={current?.offer_prospect_id ?? ""}>
            <option value="">Aucun</option>
            {prospects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Étape de contractualisation">
          <Select name="contract_step" defaultValue={current?.contract_step ?? ""}>
            <option value="">Aucune</option>
            {CONTRACT_STEPS.map((s) => (
              <option key={s} value={s}>
                {CONTRACT_STEP_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <label className="col-span-2 flex cursor-pointer items-center gap-2.5 rounded-[11px] bg-app p-3 text-[13px] font-bold">
          <input type="checkbox" name="published" defaultChecked={current?.published ?? false} className="size-[18px] accent-accent" />
          Publier sur le site web (visible par les clients)
        </label>
      </div>
      {error && <p className="text-xs font-bold text-danger">{error}</p>}
    </Modal>
  );
}
