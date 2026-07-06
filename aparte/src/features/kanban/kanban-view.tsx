"use client";

import { useRef } from "react";
import { useProspects, useSetProspectStage } from "@/features/prospects/hooks";
import { useUIStore } from "@/stores/ui-store";
import { Avatar, EmptyState } from "@/components/ui";
import { formatEuro } from "@/lib/utils";
import { PROSPECT_STAGES, PROSPECT_STAGE_LABELS, type ProspectStage } from "@/types/domain";
import type { ProspectRow } from "@/types/database";

/**
 * Pipeline Kanban : une colonne par étape, cartes prospect déplaçables par
 * glisser-déposer (HTML5 DnD). Le drop déclenche un changement de statut
 * (mutation optimiste partagée avec la liste Prospects et le drawer).
 */
export function KanbanView() {
  const { data: prospects = [], isLoading } = useProspects();
  const setStage = useSetProspectStage();
  const openProspect = useUIStore((s) => s.openProspect);
  const dragId = useRef<string | null>(null);

  if (isLoading) return <EmptyState>Chargement du pipeline…</EmptyState>;

  const onDrop = (stage: ProspectStage) => {
    const id = dragId.current;
    dragId.current = null;
    if (id) setStage.mutate({ id, stage });
  };

  return (
    <div className="flex items-start gap-3.5 overflow-x-auto pb-2">
      {PROSPECT_STAGES.map((stage) => {
        const items = prospects.filter((p) => p.stage === stage);
        return (
          <div
            key={stage}
            data-testid={`kcol-${stage}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(stage)}
            className="w-[238px] flex-none rounded-card bg-[#efeef3] p-3 transition"
          >
            <div className="flex items-center justify-between px-2 pb-3 pt-1">
              <div className="text-[13px] font-extrabold">{PROSPECT_STAGE_LABELS[stage]}</div>
              <div className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-extrabold text-[#8a8a9a]">
                {items.length}
              </div>
            </div>
            <div className="flex min-h-10 flex-col gap-2.5">
              {items.map((p) => (
                <KanbanCard
                  key={p.id}
                  prospect={p}
                  onClick={() => openProspect(p.id)}
                  onDragStart={() => (dragId.current = p.id)}
                />
              ))}
              {/* zone de dépôt même quand la colonne est vide */}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  prospect: p,
  onClick,
  onDragStart,
}: {
  prospect: ProspectRow;
  onClick: () => void;
  onDragStart: () => void;
}) {
  return (
    <div
      draggable
      data-testid={`kcard-${p.id}`}
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-black/[.04] bg-surface p-3 transition hover:-translate-y-[3px] hover:shadow-lift active:cursor-grabbing"
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={p.full_name} size={28} radius={8} />
        <div className="text-[12.5px] font-bold">{p.full_name}</div>
      </div>
      <div className="mt-2 text-[11.5px] font-semibold text-[#8a8a9a]">{p.search_label ?? "—"}</div>
      <div className="mt-1.5 text-[13px] font-extrabold text-accent">
        {p.budget_amount != null ? formatEuro(p.budget_amount) : "—"}
      </div>
    </div>
  );
}
