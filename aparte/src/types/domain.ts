/**
 * Vocabulaire métier partagé (enums + libellés FR).
 * Les valeurs stockées en base sont en snake_case ASCII ; les libellés
 * d'affichage vivent ici pour rester traduisibles et cohérents partout.
 */

// ─── Rôles & abonnement ────────────────────────────────────────────────────
export const ROLES = ["admin", "client", "invite"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur SaaS",
  client: "Titulaire du compte",
  invite: "Utilisateur invité",
};

export const PLANS = ["mensuel", "annuel"] as const;
export type Plan = (typeof PLANS)[number];

export const ACCOUNT_STATUSES = ["active", "pending_payment", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Actif",
  pending_payment: "En attente de paiement",
  suspended: "Suspendu",
};

// ─── Pipeline prospect ─────────────────────────────────────────────────────
export const PROSPECT_STAGES = [
  "nouveau",
  "qualifie",
  "visite",
  "offre",
  "compromis",
] as const;
export type ProspectStage = (typeof PROSPECT_STAGES)[number];

export const PROSPECT_STAGE_LABELS: Record<ProspectStage, string> = {
  nouveau: "Nouveau",
  qualifie: "Qualifié",
  visite: "Visite",
  offre: "Offre",
  compromis: "Compromis",
};

// ─── Biens ─────────────────────────────────────────────────────────────────
export const PROPERTY_STATUSES = ["disponible", "sous_offre", "vendu"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  sous_offre: "Sous offre",
  vendu: "Vendu",
};

export const CONTRACT_STEPS = [
  "offre_recue",
  "offre_acceptee",
  "compromis_signe",
  "acte_definitif",
] as const;
export type ContractStep = (typeof CONTRACT_STEPS)[number];

export const CONTRACT_STEP_LABELS: Record<ContractStep, string> = {
  offre_recue: "Offre reçue",
  offre_acceptee: "Offre acceptée",
  compromis_signe: "Compromis signé",
  acte_definitif: "Acte définitif",
};

export const DPE_CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type DpeClass = (typeof DPE_CLASSES)[number];

// ─── GED (documents) ───────────────────────────────────────────────────────
export const DOCUMENT_TYPES = [
  "piece_identite",
  "justificatif_revenus",
  "avis_imposition",
  "offre_achat",
  "compromis_vente",
  "simulation_pret",
  "mandat",
  "autre",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  piece_identite: "Pièce d'identité",
  justificatif_revenus: "Justificatif de revenus",
  avis_imposition: "Avis d'imposition",
  offre_achat: "Offre d'achat",
  compromis_vente: "Compromis de vente",
  simulation_pret: "Simulation de prêt",
  mandat: "Mandat",
  autre: "Autre",
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const NOTIFICATION_KINDS = ["lead", "visite", "offre", "document"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Palette d'accent thémable (marque blanche). Couples [base, dégradé]. */
export const ACCENT_PRESETS = {
  indigo: ["#5b4bff", "#8f6cff"],
  emeraude: ["#0ea472", "#34d399"],
  ocean: ["#2563eb", "#38bdf8"],
  corail: ["#f5623c", "#ff8a5b"],
  graphite: ["#111827", "#4b5563"],
} as const satisfies Record<string, [string, string]>;

export type AccentPreset = keyof typeof ACCENT_PRESETS;
