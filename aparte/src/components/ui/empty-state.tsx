import { type ReactNode } from "react";

/** État vide générique (listes filtrées sans résultat). */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="p-9 text-center text-[13px] font-semibold text-faint">{children}</div>
  );
}
