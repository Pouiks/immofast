import type { Tone } from "@/components/ui/badge";
import type { ProspectStage, PropertyStatus, AccountStatus } from "@/types/domain";

/** Mappe un statut métier sur le ton visuel d'un Badge. Source unique de vérité. */
export const STAGE_TONE: Record<ProspectStage, Tone> = {
  nouveau: "neutral",
  qualifie: "success",
  visite: "warning",
  offre: "accent",
  compromis: "success",
};

export const PROPERTY_STATUS_TONE: Record<PropertyStatus, Tone> = {
  disponible: "success",
  sous_offre: "warning",
  vendu: "neutral",
};

export const ACCOUNT_STATUS_TONE: Record<AccountStatus, Tone> = {
  active: "success",
  pending_payment: "warning",
  suspended: "danger",
};
