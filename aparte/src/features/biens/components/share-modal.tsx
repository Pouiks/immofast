"use client";

import { type FormEvent } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useProperty } from "../hooks";
import { Modal, Field, Input, Textarea, Button } from "@/components/ui";
import { formatEuro } from "@/lib/utils";

/** Partage d'une fiche bien par email (ouvre un mailto pré-rempli). */
export function ShareModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { data: b } = useProperty(modal?.type === "share" ? (modal.entityId ?? null) : null);

  if (modal?.type !== "share") return null;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const to = String(f.get("to") ?? "");
    const msg = String(f.get("msg") ?? "");
    const details = b
      ? `${b.title} — ${b.price_amount != null ? formatEuro(b.price_amount) : ""}\n${b.city ?? ""}`
      : "";
    const subject = encodeURIComponent(`Fiche bien : ${b?.title ?? ""}`);
    const body = encodeURIComponent(`${msg}\n\n${details}`);
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
    closeModal();
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={onSubmit}
      onClose={closeModal}
      title="Partager la fiche par mail"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button type="submit">Envoyer</Button>
        </>
      }
    >
      {b && (
        <div className="flex items-center gap-3 rounded-xl bg-app px-3.5 py-3">
          <div className="size-10 rounded-[10px] bg-gradient-to-br from-accent to-accent-2" />
          <div>
            <div className="text-[13px] font-extrabold">{b.title}</div>
            <div className="text-[11.5px] font-semibold text-[#8a8a9a]">
              Fiche envoyée avec photos et description
            </div>
          </div>
        </div>
      )}
      <Field label="Destinataire">
        <Input name="to" type="email" placeholder="client@email.fr" required />
      </Field>
      <Field label="Message">
        <Textarea
          name="msg"
          rows={3}
          defaultValue="Bonjour, voici la fiche du bien qui pourrait vous intéresser. N'hésitez pas à me contacter pour organiser une visite."
        />
      </Field>
    </Modal>
  );
}
