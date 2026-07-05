"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Socle commun aux Drawer / Modal : portail sur <body>, verrouillage du scroll,
 * fermeture à l'Échap et au clic sur le fond. Gère l'empilement des z-index.
 */
export function Overlay({
  onClose,
  z = 40,
  children,
}: {
  onClose: () => void;
  z?: number;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: z }}>
      <div
        className="absolute inset-0 bg-[rgba(20,20,31,.4)] [animation:var(--animate-ov-in)]"
        onClick={onClose}
      />
      {children}
    </div>,
    document.body,
  );
}
