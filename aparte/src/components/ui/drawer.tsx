"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Overlay } from "./overlay";

/**
 * Panneau latéral droit (slide-over) réutilisable : en-tête figé, corps
 * scrollable, pied optionnel. Utilisé pour les fiches prospect et bien.
 */
export function Drawer({
  open,
  onClose,
  width = 420,
  z = 40,
  header,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  z?: number;
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose} z={z}>
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex max-w-full flex-col bg-surface shadow-[-20px_0_50px_-20px_rgba(0,0,0,.3)] [animation:var(--animate-dr-in)]"
        style={{ width }}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div className="min-w-0">{header}</div>
          <button
            onClick={onClose}
            className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-app text-muted"
            aria-label="Fermer"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && <div className="flex gap-2.5 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </Overlay>
  );
}

/** Titre de section réutilisable dans les drawers (petit label majuscule). */
export function DrawerSection({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wider text-ghost">{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}
