import { describe, it, expect } from "vitest";
import { resolveAccess, hasCrmAccess } from "./access";

const NOW = new Date("2026-07-06T12:00:00Z");
const future = "2026-07-10T12:00:00Z";
const past = "2026-07-01T12:00:00Z";

const base = {
  accountStatus: "active" as const,
  trialEndsAt: null,
  subscriptionStatus: null,
  currentPeriodEnd: null,
  now: NOW,
};

describe("resolveAccess", () => {
  it("abonnement actif → active", () => {
    expect(resolveAccess({ ...base, subscriptionStatus: "active", currentPeriodEnd: future })).toBe("active");
  });

  it("abonnement en essai Stripe → active", () => {
    expect(resolveAccess({ ...base, subscriptionStatus: "trialing", currentPeriodEnd: future })).toBe("active");
  });

  it("essai gratuit 24 h en cours (sans abonnement) → trialing", () => {
    expect(resolveAccess({ ...base, trialEndsAt: future })).toBe("trialing");
  });

  it("essai expiré et pas d'abonnement → locked", () => {
    expect(resolveAccess({ ...base, trialEndsAt: past })).toBe("locked");
  });

  it("abonnement dont la période est dépassée → locked", () => {
    expect(resolveAccess({ ...base, subscriptionStatus: "active", currentPeriodEnd: past })).toBe("locked");
  });

  it("statut Stripe past_due → pas d'accès (locked si pas d'essai)", () => {
    expect(resolveAccess({ ...base, subscriptionStatus: "past_due" })).toBe("locked");
  });

  it("espace suspendu par l'admin → suspended, même avec abonnement actif", () => {
    expect(
      resolveAccess({
        ...base,
        accountStatus: "suspended",
        subscriptionStatus: "active",
        currentPeriodEnd: future,
      }),
    ).toBe("suspended");
  });
});

describe("hasCrmAccess", () => {
  it("autorise active et trialing uniquement", () => {
    expect(hasCrmAccess("active")).toBe(true);
    expect(hasCrmAccess("trialing")).toBe(true);
    expect(hasCrmAccess("locked")).toBe(false);
    expect(hasCrmAccess("suspended")).toBe(false);
  });
});
