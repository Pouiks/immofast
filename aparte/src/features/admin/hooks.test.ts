import { describe, it, expect } from "vitest";
import { estimateMRR } from "./hooks";

describe("estimateMRR", () => {
  it("somme les abonnements actifs (mensuel 49 €, annuel 44,1 €)", () => {
    const accounts = [
      { plan: "mensuel", status: "active" },
      { plan: "annuel", status: "active" },
      { plan: "mensuel", status: "active" },
    ];
    // 49 + 44,1 + 49 = 142,1 → arrondi 142
    expect(estimateMRR(accounts)).toBe(142);
  });

  it("ignore les espaces non actifs", () => {
    const accounts = [
      { plan: "mensuel", status: "active" },
      { plan: "mensuel", status: "pending_payment" },
      { plan: "annuel", status: "suspended" },
    ];
    expect(estimateMRR(accounts)).toBe(49);
  });

  it("renvoie 0 sans compte actif", () => {
    expect(estimateMRR([])).toBe(0);
  });
});
