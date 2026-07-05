"use client";

import { type ReactNode } from "react";
import { ACCENT_PRESETS } from "@/types/domain";

/**
 * Applique l'accent de la marque blanche en surchargeant --ac / --ac2.
 * --ac-soft se recalcule automatiquement (color-mix référence var(--ac)).
 * Utilise display:contents pour ne pas perturber la mise en page.
 */
export function ThemeProvider({
  accent = ACCENT_PRESETS.ocean,
  children,
}: {
  accent?: readonly [string, string];
  children: ReactNode;
}) {
  return (
    <div
      style={
        {
          display: "contents",
          "--ac": accent[0],
          "--ac2": accent[1],
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
