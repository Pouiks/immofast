import type { AccountStatus } from "@/types/domain";

/**
 * État d'accès d'un espace, calculé de façon centralisée (source unique).
 *  - active   : abonnement Stripe actif/en essai → accès complet
 *  - trialing : essai gratuit 24 h en cours (sans abonnement) → accès complet
 *  - locked   : essai expiré et pas d'abonnement → CRM verrouillé (paywall)
 *  - suspended: espace suspendu par l'admin SaaS → bloqué
 */
export type AccessState = "active" | "trialing" | "locked" | "suspended";

/** Statuts Stripe considérés comme donnant accès. */
const GRANTING_SUB_STATUSES = new Set(["active", "trialing"]);

export interface AccessInput {
  accountStatus: AccountStatus;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  /** Injectable pour les tests ; défaut = maintenant. */
  now?: Date;
}

export function resolveAccess(input: AccessInput): AccessState {
  const now = input.now ?? new Date();

  if (input.accountStatus === "suspended") return "suspended";

  const subGrants =
    input.subscriptionStatus !== null &&
    GRANTING_SUB_STATUSES.has(input.subscriptionStatus) &&
    (input.currentPeriodEnd === null || new Date(input.currentPeriodEnd) > now);
  if (subGrants) return "active";

  if (input.trialEndsAt !== null && new Date(input.trialEndsAt) > now) return "trialing";

  return "locked";
}

/** L'utilisateur peut-il accéder au CRM ? */
export function hasCrmAccess(state: AccessState): boolean {
  return state === "active" || state === "trialing";
}
