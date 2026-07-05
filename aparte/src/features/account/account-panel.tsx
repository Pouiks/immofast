"use client";

import { X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Overlay } from "@/components/ui";

/**
 * Panneau Compte (réglages façon Claude) : Profil / Abonnement / Facturation /
 * Marque blanche selon le rôle. Coquille en place ; les onglets seront
 * construits en tant que feature dédiée. z-index 70 (au-dessus des drawers).
 */
export function AccountPanel() {
  const { accountOpen, closeAccount } = useUIStore();
  if (!accountOpen) return null;

  return (
    <Overlay onClose={closeAccount} z={70}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        <div className="pointer-events-auto relative flex h-[604px] max-h-[90vh] w-[900px] max-w-full overflow-hidden rounded-[20px] bg-surface shadow-overlay [animation:var(--animate-md-in)]">
          <div className="flex flex-1 items-center justify-center text-[13px] font-semibold text-faint">
            Panneau Compte — à construire (Profil, Abonnement, Facturation, Marque blanche).
          </div>
          <button
            onClick={closeAccount}
            className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-[9px] bg-app text-muted"
            aria-label="Fermer"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
