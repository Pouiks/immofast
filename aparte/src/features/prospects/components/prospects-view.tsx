"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useProspects } from "../hooks";
import { useUIStore } from "@/stores/ui-store";
import { Card, Avatar, Badge, EmptyState, Select } from "@/components/ui";
import { STAGE_TONE } from "@/lib/status";
import { formatEuro } from "@/lib/utils";
import {
  PROSPECT_STAGES,
  PROSPECT_STAGE_LABELS,
  type ProspectStage,
} from "@/types/domain";
import type { ProspectRow } from "@/types/database";

type SortKey = "recent" | "nom" | "budget-desc" | "budget-asc";

const GRID = "grid grid-cols-[2.2fr_1.6fr_1fr_1.1fr_40px] gap-3 items-center";

export function ProspectsView() {
  const { data: prospects = [], isLoading, error } = useProspects();
  const query = useUIStore((s) => s.query);
  const openProspect = useUIStore((s) => s.openProspect);
  const [stage, setStage] = useState<ProspectStage | "tous">("tous");
  const [sort, setSort] = useState<SortKey>("recent");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = prospects.filter((p) => stage === "tous" || p.stage === stage);
    if (q) {
      list = list.filter((p) =>
        `${p.full_name} ${p.search_label ?? ""} ${p.phone ?? ""} ${p.email ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "nom") sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
    else if (sort === "budget-desc") sorted.sort((a, b) => (b.budget_amount ?? 0) - (a.budget_amount ?? 0));
    else if (sort === "budget-asc") sorted.sort((a, b) => (a.budget_amount ?? 0) - (b.budget_amount ?? 0));
    return sorted;
  }, [prospects, stage, sort, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Select
          value={stage}
          onChange={(e) => setStage(e.target.value as ProspectStage | "tous")}
          className="w-auto"
        >
          <option value="tous">Tous les statuts</option>
          {PROSPECT_STAGES.map((s) => (
            <option key={s} value={s}>
              {PROSPECT_STAGE_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-auto">
          <option value="recent">Tri : plus récents</option>
          <option value="nom">Tri : nom (A→Z)</option>
          <option value="budget-desc">Tri : budget décroissant</option>
          <option value="budget-asc">Tri : budget croissant</option>
        </Select>
        <div className="ml-auto text-xs font-bold text-faint">{rows.length} résultat(s)</div>
      </div>

      <Card className="px-5 pb-3 pt-1.5">
        <div
          className={`${GRID} border-b border-line px-2 pb-3 pt-4 text-[11px] font-bold uppercase tracking-wider text-ghost`}
        >
          <div>Prospect</div>
          <div>Recherche</div>
          <div>Budget</div>
          <div>Statut</div>
          <div />
        </div>

        {isLoading && <EmptyState>Chargement…</EmptyState>}
        {error && <EmptyState>Erreur de chargement des prospects.</EmptyState>}
        {!isLoading && !error && rows.length === 0 && (
          <EmptyState>Aucun prospect ne correspond à votre recherche.</EmptyState>
        )}

        {rows.map((p) => (
          <ProspectRow key={p.id} prospect={p} onClick={() => openProspect(p.id)} />
        ))}
      </Card>
    </div>
  );
}

function ProspectRow({ prospect: p, onClick }: { prospect: ProspectRow; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${GRID} -mx-2 w-[calc(100%+1rem)] cursor-pointer rounded-[10px] border-b border-line-soft px-2 py-3 text-left hover:bg-hover`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={p.full_name} size={34} radius={10} />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-bold">{p.full_name}</div>
          <div className="truncate text-[11px] font-semibold text-ghost">{p.phone ?? "—"}</div>
        </div>
      </div>
      <div className="truncate text-[12.5px] font-semibold text-muted">{p.search_label ?? "—"}</div>
      <div className="text-[13.5px] font-extrabold">
        {p.budget_amount != null ? formatEuro(p.budget_amount) : "—"}
      </div>
      <div>
        <Badge tone={STAGE_TONE[p.stage]}>{PROSPECT_STAGE_LABELS[p.stage]}</Badge>
      </div>
      <div className="flex justify-end text-[#c4c4d0]">
        <ChevronRight size={18} strokeWidth={2.2} />
      </div>
    </button>
  );
}
