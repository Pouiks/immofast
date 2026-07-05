import { z } from "zod";

/**
 * Champs numériques optionnels issus de <input type="number"> : une valeur
 * vide ("") doit devenir `undefined` (→ null en base), pas 0. `z.coerce`
 * seul convertirait "" en 0, d'où le preprocess.
 */
export const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().nonnegative().optional(),
);

export const optionalNumber = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

/** Renvoie la valeur si c'est un nombre fini, sinon null (pour un payload DB). */
export function numOrNull(v: number | undefined): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
