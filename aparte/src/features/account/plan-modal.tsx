"use client";

import { useUIStore } from "@/stores/ui-store";
import { useAccount } from "./account-context";
import { useUpdateAccount } from "./hooks";
import { Modal, Button } from "@/components/ui";

/**
 * Confirmation du passage mensuel → annuel avec crédit au prorata.
 * Montants illustratifs : en production, utiliser la proration native de Stripe
 * (proration_behavior) — non branchée pour l'instant (stub).
 */
export function PlanModal() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const { account, patchAccount } = useAccount();
  const update = useUpdateAccount();

  if (modal?.type !== "plan") return null;

  const onConfirm = () => {
    patchAccount({ plan: "annuel" });
    update.mutate(
      { id: account.id, patch: { plan: "annuel" } },
      { onSuccess: closeModal, onError: () => patchAccount({ plan: "mensuel" }) },
    );
  };

  return (
    <Modal
      open
      onClose={closeModal}
      title="Passer à la formule annuelle"
      footer={
        <>
          <Button variant="outline" onClick={closeModal}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={update.isPending}>
            {update.isPending ? "Traitement…" : "Confirmer le passage"}
          </Button>
        </>
      }
    >
      <p className="rounded-[10px] bg-app px-3.5 py-3 text-[12.5px] font-semibold text-[#8a8a9a]">
        Le temps déjà réglé sur votre mois en cours est déduit au prorata — aucun surcoût.
      </p>
      <div className="flex justify-between text-[13.5px] font-semibold">
        <span>Formule annuelle (‑10 %)</span>
        <b>529,20 €</b>
      </div>
      <div className="flex justify-between text-[13.5px] font-semibold text-success">
        <span>Crédit prorata du mois en cours</span>
        <b>− 29,40 €</b>
      </div>
      <div className="h-px bg-line" />
      <div className="flex justify-between text-base font-extrabold">
        <span>À régler aujourd'hui</span>
        <span>499,80 €</span>
      </div>
      <p className="text-[11.5px] font-semibold text-ghost">Puis 529,20 € / an à chaque échéance.</p>
    </Modal>
  );
}
