"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui";
import { AGENDA_HOURS, weekdays, atHour, sameDay } from "../date-utils";
import type { VisitRow } from "@/types/database";

export function WeekView({
  visits,
  monday,
  nameOf,
  onOpen,
  onMove,
}: {
  visits: VisitRow[];
  monday: Date;
  nameOf: (id: string | null) => string;
  onOpen: (id: string) => void;
  onMove: (id: string, startISO: string) => void;
}) {
  const days = weekdays(monday);
  const dragId = useRef<string | null>(null);

  return (
    <Card className="max-h-[calc(100vh-190px)] overflow-auto p-4">
      <div className="grid min-w-[760px] grid-cols-[56px_repeat(5,1fr)]">
        <div className="border-b border-line" />
        {days.map((d) => (
          <div key={d.toISOString()} className="border-b border-line pb-2.5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ghost">
              {format(d, "EEE", { locale: fr })}
            </div>
            <div className="mt-0.5 text-lg font-extrabold">{format(d, "d")}</div>
          </div>
        ))}

        {AGENDA_HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-t border-[#f4f3f7] px-2 pt-1.5 text-right text-[11px] font-bold text-ghost">
              {String(hour).padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const cellEvents = visits.filter((v) => {
                const s = new Date(v.starts_at);
                return sameDay(s, day) && s.getHours() === hour;
              });
              return (
                <div
                  key={day.toISOString() + hour}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId.current) onMove(dragId.current, atHour(day, hour).toISOString());
                    dragId.current = null;
                  }}
                  className="min-h-[46px] border-l border-t border-[#f7f6fa] p-1 transition hover:bg-[#faf9ff]"
                >
                  {cellEvents.map((v) => (
                    <div
                      key={v.id}
                      draggable
                      onDragStart={() => (dragId.current = v.id)}
                      onClick={() => onOpen(v.id)}
                      className="mb-1 cursor-grab rounded-md border-l-[3px] border-accent bg-accent-soft px-1.5 py-1 active:cursor-grabbing"
                    >
                      <div className="text-[10.5px] font-extrabold text-accent">
                        {format(new Date(v.starts_at), "HH:mm")}
                      </div>
                      <div className="text-[11px] font-bold leading-tight">{v.title}</div>
                      <div className="text-[10px] font-semibold text-[#8a8a9a]">
                        {nameOf(v.prospect_id)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
