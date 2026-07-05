"use client";

import { type ReactNode } from "react";
import { Overlay } from "./overlay";

/**
 * Modale centrée réutilisable (création/édition). Le pied est fourni par
 * l'appelant pour rester générique (boutons Annuler / Enregistrer, Supprimer…).
 */
export function Modal({
  open,
  onClose,
  title,
  width = 460,
  z = 80,
  footer,
  children,
  as = "div",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  width?: number;
  z?: number;
  footer?: ReactNode;
  children: ReactNode;
  /** `form` pour envelopper le contenu dans un formulaire soumettable. */
  as?: "div" | "form";
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  const inner = (
    <>
      <div className="px-6 pt-[22px] pb-1 text-lg font-extrabold tracking-tight">{title}</div>
      <div className="flex flex-col gap-3.5 px-6 py-4">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2.5 px-6 pt-3.5 pb-[22px]">{footer}</div>
      )}
    </>
  );
  const panelClass =
    "pointer-events-auto relative max-h-[90vh] w-full overflow-y-auto rounded-[20px] bg-surface shadow-overlay [animation:var(--animate-md-in)]";

  return (
    <Overlay onClose={onClose} z={z}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
        {as === "form" ? (
          <form onSubmit={onSubmit} className={panelClass} style={{ width }}>
            {inner}
          </form>
        ) : (
          <div className={panelClass} style={{ width }}>
            {inner}
          </div>
        )}
      </div>
    </Overlay>
  );
}
