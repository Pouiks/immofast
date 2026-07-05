/** Dégradés de placeholder pour les photos de biens (déterministe par id). */
const GRADIENTS: [string, string][] = [
  ["#5b4bff", "#8f6cff"],
  ["#0ea472", "#34d399"],
  ["#f5623c", "#ff8a5b"],
  ["#2563eb", "#38bdf8"],
  ["#64748b", "#94a3b8"],
  ["#d6317a", "#ff6ba6"],
];

/** Renvoie une chaîne CSS linear-gradient stable pour un bien. */
export function propertyGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const [a, b] = GRADIENTS[hash % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
