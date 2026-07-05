import { describe, it, expect } from "vitest";
import { STAGE_TONE, PROPERTY_STATUS_TONE, ACCOUNT_STATUS_TONE } from "./status";
import { PROSPECT_STAGES, PROPERTY_STATUSES, ACCOUNT_STATUSES } from "@/types/domain";

const VALID_TONES = ["success", "warning", "danger", "neutral", "accent"];

describe("mappings statut → ton", () => {
  it("couvre toutes les étapes de prospect", () => {
    for (const stage of PROSPECT_STAGES) {
      expect(VALID_TONES).toContain(STAGE_TONE[stage]);
    }
  });

  it("couvre tous les statuts de bien", () => {
    for (const status of PROPERTY_STATUSES) {
      expect(VALID_TONES).toContain(PROPERTY_STATUS_TONE[status]);
    }
  });

  it("couvre tous les statuts d'espace", () => {
    for (const status of ACCOUNT_STATUSES) {
      expect(VALID_TONES).toContain(ACCOUNT_STATUS_TONE[status]);
    }
  });
});
