import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Ton du hint (delta). */
  hintTone?: "success" | "muted";
  /** Carte mise en avant en dégradé accent (texte blanc). */
  accent?: boolean;
}

/** Carte KPI du tableau de bord / console admin. */
export function KpiCard({ label, value, hint, hintTone = "muted", accent }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-card p-[18px]",
        accent
          ? "bg-gradient-to-br from-accent to-accent-2 text-white"
          : "border border-black/5 bg-surface",
      )}
    >
      <div className={cn("text-xs font-bold", accent ? "opacity-85" : "text-[#8a8a9a]")}>
        {label}
      </div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
      {hint != null && (
        <div
          className={cn(
            "mt-1 text-[11.5px] font-bold",
            accent ? "opacity-90" : hintTone === "success" ? "text-success" : "text-[#8a8a9a]",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
