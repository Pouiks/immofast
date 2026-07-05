import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import {
  AGENDA_HOURS,
  weekStart,
  weekdays,
  monthCells,
  atHour,
  moveToDay,
  sameDay,
} from "./date-utils";

describe("weekStart / weekdays", () => {
  it("ramène au lundi de la semaine", () => {
    // 8 juillet 2026 = mercredi → lundi = 6 juillet.
    expect(format(weekStart(new Date(2026, 6, 8)), "yyyy-MM-dd")).toBe("2026-07-06");
  });

  it("weekdays renvoie 5 jours ouvrés (lun→ven)", () => {
    const days = weekdays(weekStart(new Date(2026, 6, 8)));
    expect(days).toHaveLength(5);
    expect(format(days[0], "yyyy-MM-dd")).toBe("2026-07-06");
    expect(format(days[4], "yyyy-MM-dd")).toBe("2026-07-10");
  });
});

describe("AGENDA_HOURS", () => {
  it("couvre 08:00 → 20:00", () => {
    expect(AGENDA_HOURS[0]).toBe(8);
    expect(AGENDA_HOURS.at(-1)).toBe(20);
    expect(AGENDA_HOURS).toHaveLength(13);
  });
});

describe("monthCells", () => {
  it("aligne sur une grille lundi-first, multiple de 7", () => {
    const cells = monthCells(new Date(2026, 6, 1)); // juillet 2026
    expect(cells.length % 7).toBe(0);
    const days = cells.filter(Boolean);
    expect(days).toHaveLength(31);
    // Le 1er jour existe et est un objet Date.
    expect(format(days[0]!, "yyyy-MM-dd")).toBe("2026-07-01");
    // 1er juillet 2026 = mercredi → 2 cases vides en tête (lundi, mardi).
    expect(cells[0]).toBeNull();
    expect(cells[1]).toBeNull();
    expect(cells[2]).not.toBeNull();
  });
});

describe("atHour / moveToDay", () => {
  it("atHour fixe l'heure, minutes à 0", () => {
    const d = atHour(new Date(2026, 6, 6), 14);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(0);
    expect(d.getDate()).toBe(6);
  });

  it("moveToDay conserve l'horaire sur un autre jour", () => {
    const moved = moveToDay(new Date(2026, 6, 9), new Date(2026, 6, 6, 16, 30));
    expect(moved.getDate()).toBe(9);
    expect(moved.getHours()).toBe(16);
    expect(moved.getMinutes()).toBe(30);
  });
});

describe("sameDay", () => {
  it("compare la date du jour sans l'heure", () => {
    expect(sameDay(new Date(2026, 6, 6, 9), new Date(2026, 6, 6, 18))).toBe(true);
    expect(sameDay(new Date(2026, 6, 6), new Date(2026, 6, 7))).toBe(false);
  });
});
