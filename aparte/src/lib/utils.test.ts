import { describe, it, expect } from "vitest";
import { initials, parseAmount, formatEuro } from "./utils";

describe("initials", () => {
  it("prend les deux premières initiales", () => {
    expect(initials("Camille Mercier")).toBe("CM");
    expect(initials("Marc Dubois")).toBe("MD");
  });

  it("respecte le maximum demandé", () => {
    expect(initials("Aparté", 1)).toBe("A");
    expect(initials("Jean Paul Belmondo", 2)).toBe("JP");
  });

  it("renvoie ? pour une chaîne vide", () => {
    expect(initials("")).toBe("?");
  });
});

describe("parseAmount", () => {
  it("gère le suffixe k (milliers)", () => {
    expect(parseAmount("520 k€")).toBe(520000);
    expect(parseAmount("290 k€")).toBe(290000);
  });

  it("gère un montant complet formaté", () => {
    expect(parseAmount("680 000 €")).toBe(680000);
    expect(parseAmount("1 250 000 €")).toBe(1250000);
  });

  it("gère les entrées nulles ou vides", () => {
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
    expect(parseAmount("")).toBe(0);
  });
});

describe("formatEuro", () => {
  it("formate en euros sans décimales", () => {
    // Les séparateurs peuvent être des espaces insécables selon l'ICU.
    expect(formatEuro(520000)).toMatch(/^520.000.*€$/u);
    expect(formatEuro(0)).toMatch(/0.*€/u);
  });

  it("n'affiche pas de centimes", () => {
    expect(formatEuro(49)).not.toContain(",00");
  });
});
