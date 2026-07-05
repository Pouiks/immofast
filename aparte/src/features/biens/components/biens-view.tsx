"use client";

import { useMemo, useState } from "react";
import { useProperties } from "../hooks";
import { propertyGradient } from "../gradient";
import { useUIStore } from "@/stores/ui-store";
import { Card, Badge, EmptyState, Select } from "@/components/ui";
import { PROPERTY_STATUS_TONE } from "@/lib/status";
import { formatEuro } from "@/lib/utils";
import {
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  type PropertyStatus,
} from "@/types/domain";
import type { PropertyRow } from "@/types/database";

type SortKey = "recent" | "prix-desc" | "prix-asc";
type PubFilter = "toutes" | "en_ligne" | "brouillon";

export function BiensView() {
  const { data: properties = [], isLoading, error } = useProperties();
  const query = useUIStore((s) => s.query);
  const openProperty = useUIStore((s) => s.openProperty);
  const [status, setStatus] = useState<PropertyStatus | "tous">("tous");
  const [pub, setPub] = useState<PubFilter>("toutes");
  const [sort, setSort] = useState<SortKey>("recent");

  const cards = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = properties.filter((b) => status === "tous" || b.status === status);
    list = list.filter((b) =>
      pub === "toutes" ? true : pub === "en_ligne" ? b.published : !b.published,
    );
    if (q) {
      list = list.filter((b) =>
        `${b.title} ${b.city ?? ""} ${b.ref}`.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "prix-desc") sorted.sort((a, b) => (b.price_amount ?? 0) - (a.price_amount ?? 0));
    else if (sort === "prix-asc") sorted.sort((a, b) => (a.price_amount ?? 0) - (b.price_amount ?? 0));
    return sorted;
  }, [properties, status, pub, sort, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus | "tous")} className="w-auto">
          <option value="tous">Tous les statuts</option>
          {PROPERTY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PROPERTY_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select value={pub} onChange={(e) => setPub(e.target.value as PubFilter)} className="w-auto">
          <option value="toutes">Publication : toutes</option>
          <option value="en_ligne">En ligne</option>
          <option value="brouillon">Brouillon</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="w-auto">
          <option value="recent">Tri : plus récents</option>
          <option value="prix-desc">Tri : prix décroissant</option>
          <option value="prix-asc">Tri : prix croissant</option>
        </Select>
        <div className="ml-auto text-xs font-bold text-faint">{cards.length} résultat(s)</div>
      </div>

      {isLoading && <EmptyState>Chargement…</EmptyState>}
      {error && <EmptyState>Erreur de chargement des biens.</EmptyState>}
      {!isLoading && !error && cards.length === 0 && (
        <EmptyState>Aucun bien ne correspond à votre recherche.</EmptyState>
      )}

      <div className="grid grid-cols-3 gap-[18px]">
        {cards.map((b) => (
          <PropertyCard key={b.id} property={b} onClick={() => openProperty(b.id)} />
        ))}
      </div>
    </div>
  );
}

function PropertyCard({ property: b, onClick }: { property: PropertyRow; onClick: () => void }) {
  const meta = [
    b.rooms != null ? `${b.rooms} pièces` : null,
    b.surface_m2 != null ? `${b.surface_m2} m²` : null,
    b.bedrooms != null ? `${b.bedrooms} ch.` : null,
  ].filter(Boolean);

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer overflow-hidden p-0 transition hover:-translate-y-[3px] hover:shadow-lift"
    >
      <div
        className="relative flex h-[150px] items-end p-3"
        style={{ background: propertyGradient(b.id) }}
      >
        <span className="rounded-md bg-white/90 px-2.5 py-1 text-[10.5px] font-extrabold text-ink">
          {b.ref}
        </span>
        <span className="absolute right-3 top-3">
          <Badge tone={PROPERTY_STATUS_TONE[b.status]}>{PROPERTY_STATUS_LABELS[b.status]}</Badge>
        </span>
        <span
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold"
          style={{ color: b.published ? "#12a150" : "#9a9aac" }}
        >
          <span className="size-[7px] rounded-full" style={{ background: b.published ? "#12a150" : "#9a9aac" }} />
          {b.published ? "En ligne" : "Brouillon"}
        </span>
      </div>
      <div className="px-4 pb-4 pt-4">
        <div className="text-[15px] font-extrabold tracking-tight">
          {b.price_amount != null ? formatEuro(b.price_amount) : "—"}
        </div>
        <div className="mt-1 text-[13px] font-bold">{b.title}</div>
        <div className="mt-0.5 text-xs font-semibold text-[#8a8a9a]">{b.city ?? "—"}</div>
        {meta.length > 0 && (
          <div className="mt-3 flex gap-3.5 border-t border-[#f4f3f7] pt-3 text-[11.5px] font-bold text-muted">
            {meta.map((m) => (
              <span key={m as string}>{m}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
