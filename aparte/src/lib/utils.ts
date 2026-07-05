import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit (utilisé par tous les composants UI). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initiales à partir d'un nom complet, ex. "Camille Mercier" → "CM". */
export function initials(name: string, max = 2): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, max)
      .toUpperCase() || "?"
  );
}

/** Extrait la partie numérique d'un montant formaté ("520 k€" → 520000, "680 000 €" → 680000). */
export function parseAmount(value: string | null | undefined): number {
  const raw = String(value ?? "").toLowerCase();
  const digits = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
  return /\bk/.test(raw) && digits < 100000 ? digits * 1000 : digits;
}

/** Formate un nombre en euros (ex. 520000 → "520 000 €"). */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
