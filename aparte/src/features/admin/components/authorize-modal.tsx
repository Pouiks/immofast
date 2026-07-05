"use client";

import { type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useCreateAccount } from "../hooks";
import { Modal, Field, Input, Select, Button } from "@/components/ui";
import type { Plan } from "@/types/domain";

/** Autorise un nouvel espace client (marque blanche) depuis la console admin. */
export function AuthorizeModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const create = useCreateAccount();

  if (modal?.type !== "client") return null;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const paid = f.get("paid") === "on";
    create.mutate(
      {
        agency_name: String(f.get("agency") ?? "").trim() || "Nouvel espace",
        email: String(f.get("email") ?? "").trim(),
        plan: (String(f.get("plan")) as Plan) || "mensuel",
        status: paid ? "active" : "pending_payment",
      },
      { onSuccess: closeModal },
    );
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      title="Autoriser un nouveau client"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Création…" : "Créer l'espace"}
          </Button>
        </>
      }
    >
      <p className="rounded-[10px] bg-app px-3.5 py-3 text-xs font-semibold text-[#8a8a9a]">
        Créez un espace en marque blanche pour un nouveau client. Il pourra se connecter dès
        validation du paiement de sa cotisation.
      </p>
      <Field label="Nom de l'agence">
        <Input name="agency" placeholder="ex. Agence Horizon" required />
      </Field>
      <Field label="Email administrateur">
        <Input name="email" type="email" placeholder="admin@agence.fr" />
      </Field>
      <Field label="Formule">
        <Select name="plan" defaultValue="mensuel">
          <option value="mensuel">Mensuel</option>
          <option value="annuel">Annuel</option>
        </Select>
      </Field>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-[11px] bg-app p-3 text-[13px] font-bold">
        <input type="checkbox" name="paid" className="size-[18px] accent-accent" />
        Paiement déjà encaissé (activer immédiatement)
      </label>
    </Modal>
  );
}
