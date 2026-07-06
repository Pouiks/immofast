import { describe, it, expect, vi, beforeEach } from "vitest";

// Les mappers lisent env pour déduire le plan → on mocke env.
vi.mock("@/lib/env", () => ({
  env: { stripePriceMensuel: "price_m", stripePriceAnnuel: "price_a" },
}));

const { mapSubscription, mapInvoice, mapPaymentMethod, planForPrice } = await import("./mappers");

const NOW = "2026-07-06T12:00:00.000Z";
beforeEach(() => vi.clearAllMocks());

describe("planForPrice", () => {
  it("déduit le plan depuis l'id de prix", () => {
    expect(planForPrice("price_m")).toBe("mensuel");
    expect(planForPrice("price_a")).toBe("annuel");
    expect(planForPrice("price_inconnu")).toBeNull();
    expect(planForPrice(null)).toBeNull();
  });
});

describe("mapSubscription", () => {
  it("mappe une subscription Stripe vers notre ligne", () => {
    const sub = {
      id: "sub_1",
      status: "active",
      cancel_at_period_end: false,
      current_period_end: 1780000000,
      trial_end: null,
      items: { data: [{ price: { id: "price_a" } }] },
    };
    const row = mapSubscription(sub, "acc_1", NOW);
    expect(row).toMatchObject({
      account_id: "acc_1",
      stripe_subscription_id: "sub_1",
      stripe_price_id: "price_a",
      plan: "annuel",
      status: "active",
      cancel_at_period_end: false,
      updated_at: NOW,
    });
    expect(row.current_period_end).toBe(new Date(1780000000 * 1000).toISOString());
  });

  it("lit current_period_end depuis l'item si absent de la sub", () => {
    const sub = {
      id: "sub_2",
      status: "trialing",
      items: { data: [{ price: { id: "price_m" }, current_period_end: 1781000000 }] },
    };
    const row = mapSubscription(sub, "acc_2", NOW);
    expect(row.plan).toBe("mensuel");
    expect(row.current_period_end).toBe(new Date(1781000000 * 1000).toISOString());
  });
});

describe("mapInvoice", () => {
  it("mappe une facture et déduit la période", () => {
    const inv = {
      id: "in_1",
      status: "paid",
      amount_paid: 4900,
      hosted_invoice_url: "https://stripe/inv",
      invoice_pdf: "https://stripe/pdf",
      period_start: Date.UTC(2026, 6, 1) / 1000, // juillet 2026
    };
    const row = mapInvoice(inv, "acc_1");
    expect(row).toMatchObject({
      account_id: "acc_1",
      stripe_invoice_id: "in_1",
      period: "2026-07",
      amount_cents: 4900,
      status: "paid",
      hosted_invoice_url: "https://stripe/inv",
      pdf_url: "https://stripe/pdf",
    });
  });
});

describe("mapPaymentMethod", () => {
  it("mappe une carte", () => {
    const pm = { id: "pm_1", type: "card", card: { brand: "visa", last4: "4242", exp_month: 9, exp_year: 2028 } };
    expect(mapPaymentMethod(pm, "acc_1")).toMatchObject({
      account_id: "acc_1",
      stripe_payment_method_id: "pm_1",
      brand: "visa",
      last4: "4242",
      exp_month: 9,
      exp_year: 2028,
      is_default: true,
    });
  });

  it("mappe un moyen Stripe Link (sans carte exposée)", () => {
    const pm = { id: "pm_link", type: "link" };
    expect(mapPaymentMethod(pm, "acc_1")).toMatchObject({
      stripe_payment_method_id: "pm_link",
      brand: "Link",
      last4: "",
      exp_month: 0,
      exp_year: 0,
    });
  });
});
