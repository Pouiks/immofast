import { describe, it, expect } from "vitest";
import { avatarColors } from "./avatar";

describe("avatarColors", () => {
  it("est déterministe (même nom → mêmes couleurs)", () => {
    expect(avatarColors("Marc Dubois")).toEqual(avatarColors("Marc Dubois"));
    expect(avatarColors("Sophie Leroy")).toEqual(avatarColors("Sophie Leroy"));
  });

  it("renvoie un couple [fond, texte] en hex", () => {
    const [bg, fg] = avatarColors("Julie Martin");
    expect(bg).toMatch(/^#[0-9a-f]{6}$/i);
    expect(fg).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("répartit les noms sur la palette (pas une seule couleur)", () => {
    const names = ["Marc", "Sophie", "Thomas", "Julie", "Paul", "Léa", "Camille"];
    const uniques = new Set(names.map((n) => avatarColors(n).join()));
    expect(uniques.size).toBeGreaterThan(1);
  });
});
