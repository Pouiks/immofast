"use client";

import { useMemo, useState } from "react";
import { addDays, addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useVisits, useUpdateVisit } from "../hooks";
import { useProspects } from "@/features/prospects/hooks";
import { useUIStore } from "@/stores/ui-store";
import { weekStart } from "../date-utils";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { Segmented, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

type View = "semaine" | "mois";

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
    <path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.3 13.6 17.6 9.5 24 9.5z" />
    <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9C43.9 38.1 46.5 31.9 46.5 24.5z" />
    <path fill="#FBBC05" d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z" />
    <path fill="#EA4335" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.7-4.1-13.6-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

export function AgendaView() {
  const { data: visits = [], isLoading } = useVisits();
  const { data: prospects = [] } = useProspects();
  const update = useUpdateVisit();
  const openModal = useUIStore((s) => s.openModal);
  const [view, setView] = useState<View>("semaine");
  const [anchor, setAnchor] = useState(() => new Date());
  const [gcal, setGcal] = useState(false);

  const nameOf = useMemo(() => {
    const map = new Map(prospects.map((p) => [p.id, p.full_name]));
    return (id: string | null) => (id ? map.get(id) ?? "—" : "—");
  }, [prospects]);

  const monday = weekStart(anchor);
  const periodLabel =
    view === "semaine"
      ? `Semaine du ${format(monday, "d MMM", { locale: fr })}`
      : capitalize(format(anchor, "MMMM yyyy", { locale: fr }));

  const shift = (dir: 1 | -1) =>
    setAnchor((d) => (view === "semaine" ? addDays(d, dir * 7) : addMonths(d, dir)));

  const onOpen = (id: string) => openModal({ type: "visite", mode: "edit", entityId: id });
  const onMove = (id: string, startISO: string) =>
    update.mutate({ id, patch: { starts_at: startISO } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "semaine", label: "Semaine" },
            { value: "mois", label: "Mois" },
          ]}
        />
        <div className="flex items-center gap-2.5">
          <button onClick={() => shift(-1)} className="flex size-8 items-center justify-center rounded-[9px] bg-surface text-muted" aria-label="Précédent">
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>
          <div className="min-w-[150px] text-center text-[13px] font-extrabold">{periodLabel}</div>
          <button onClick={() => shift(1)} className="flex size-8 items-center justify-center rounded-[9px] bg-surface text-muted" aria-label="Suivant">
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
          <button
            onClick={() => setGcal((g) => !g)}
            className={cn(
              "flex items-center gap-2 rounded-[11px] border px-3.5 py-2.5 text-[12.5px] font-bold",
              gcal ? "border-[#b7e6c9] bg-success-bg text-success" : "border-[#eceaf0] bg-surface text-[#3a3a48]",
            )}
          >
            {gcal ? <Check size={16} strokeWidth={2.6} /> : <GoogleLogo />}
            {gcal ? "camille.mercier@gmail.com" : "Connecter Google Agenda"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <EmptyState>Chargement de l'agenda…</EmptyState>
      ) : view === "semaine" ? (
        <WeekView visits={visits} monday={monday} nameOf={nameOf} onOpen={onOpen} onMove={onMove} />
      ) : (
        <MonthView visits={visits} anchor={anchor} onOpen={onOpen} onMove={onMove} />
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
