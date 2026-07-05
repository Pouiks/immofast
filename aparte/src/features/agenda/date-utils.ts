import { startOfWeek, addDays, startOfMonth, getDaysInMonth, getDay } from "date-fns";

/** Créneaux horaires affichés dans la vue semaine (08:00 → 20:00). */
export const AGENDA_HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

/** Lundi de la semaine contenant `date`. */
export function weekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Jours ouvrés (Lun→Ven) à partir d'un lundi. */
export function weekdays(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => addDays(monday, i));
}

/**
 * Grille du calendrier mensuel, commençant le lundi : cases `null` en amont
 * pour l'alignement, puis un Date par jour, complétée à un multiple de 7.
 */
export function monthCells(monthDate: Date): (Date | null)[] {
  const first = startOfMonth(monthDate);
  const lead = (getDay(first) + 6) % 7; // 0 = lundi
  const days = getDaysInMonth(monthDate);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Combine un jour et une heure en Date (minutes = 0). */
export function atHour(day: Date, hour: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0);
}

/** Reporte l'horaire de `time` sur le jour `day` (conserve heures/minutes). */
export function moveToDay(day: Date, time: Date): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
  );
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
