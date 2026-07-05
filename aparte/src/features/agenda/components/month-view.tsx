"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui";
import { monthCells, moveToDay, sameDay } from "../date-utils";
import type { VisitRow } from "@/types/database";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function MonthView({
  visits,
  anchor,
  onOpen,
  onMove,
}: {
  visits: VisitRow[];
  anchor: Date;
  onOpen: (id: string) => void;
  onMove: (id: string, startISO: string) => void;
}) {
  const cells = monthCells(anchor);
  const dragId = useRef<string | null>(null);

  return (
    <Card className="p-[18px]">
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[11px] font-bold uppercase tracking-wider text-ghost">
            {l}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <div
              key={day.toISOString()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId.current) {
                  const time = visits.find((v) => v.id === dragId.current);
                  const iso = time
                    ? moveToDay(day, new Date(time.starts_at)).toISOString()
                    : day.toISOString();
                  onMove(dragId.current, iso);
                }
                dragId.current = null;
              }}
              className="min-h-[96px] rounded-[10px] border border-[#f2f1f6] p-1.5"
            >
              <div className="mb-1 text-xs font-extrabold text-muted">{format(day, "d")}</div>
              {visits
                .filter((v) => sameDay(new Date(v.starts_at), day))
                .map((v) => (
                  <div
                    key={v.id}
                    draggable
                    onDragStart={() => (dragId.current = v.id)}
                    onClick={() => onOpen(v.id)}
                    className="mb-1 cursor-grab truncate rounded-md bg-accent-soft px-1.5 py-1 text-[10px] font-bold text-accent active:cursor-grabbing"
                  >
                    {format(new Date(v.starts_at), "HH:mm")} · {v.title}
                  </div>
                ))}
            </div>
          ),
        )}
      </div>
    </Card>
  );
}
