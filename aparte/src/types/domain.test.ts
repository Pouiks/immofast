import { describe, it, expect } from "vitest";
import {
  ROLES,
  ROLE_LABELS,
  PROSPECT_STAGES,
  PROSPECT_STAGE_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  CONTRACT_STEPS,
  CONTRACT_STEP_LABELS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  ACCOUNT_STATUSES,
  ACCOUNT_STATUS_LABELS,
} from "./domain";

/** Chaque valeur d'enum doit avoir un libellé FR non vide (aucun trou d'affichage). */
const cases: [string, readonly string[], Record<string, string>][] = [
  ["rôle", ROLES, ROLE_LABELS],
  ["étape prospect", PROSPECT_STAGES, PROSPECT_STAGE_LABELS],
  ["statut bien", PROPERTY_STATUSES, PROPERTY_STATUS_LABELS],
  ["étape contractualisation", CONTRACT_STEPS, CONTRACT_STEP_LABELS],
  ["type document", DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS],
  ["statut espace", ACCOUNT_STATUSES, ACCOUNT_STATUS_LABELS],
];

describe("libellés d'enums", () => {
  for (const [name, values, labels] of cases) {
    it(`${name} : tout est libellé`, () => {
      for (const value of values) {
        expect(labels[value], `libellé manquant pour ${value}`).toBeTruthy();
      }
      // Pas de libellé orphelin.
      expect(Object.keys(labels).sort()).toEqual([...values].sort());
    });
  }
});
