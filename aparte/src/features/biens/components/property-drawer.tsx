"use client";

import { Pencil, Mail } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import {
  useProperty,
  useSetPropertyStatus,
  useSetContractStep,
  useTogglePublished,
  useLinkOffer,
  useDeleteProperty,
} from "../hooks";
import { propertyGradient } from "../gradient";
import { useProspects } from "@/features/prospects/hooks";
import { Drawer, DrawerSection, Badge, Button, Select } from "@/components/ui";
import { cn, formatEuro } from "@/lib/utils";
import { PROPERTY_STATUS_TONE } from "@/lib/status";
import {
  PROPERTY_STATUSES,
  PROPERTY_STATUS_LABELS,
  CONTRACT_STEPS,
  CONTRACT_STEP_LABELS,
  type PropertyStatus,
} from "@/types/domain";

export function PropertyDrawer() {
  const selectedId = useUIStore((s) => s.selectedPropertyId);
  const closeProperty = useUIStore((s) => s.closeProperty);
  const openModal = useUIStore((s) => s.openModal);
  const { data: b, isLoading } = useProperty(selectedId);
  const { data: prospects = [] } = useProspects();
  const setStatus = useSetPropertyStatus();
  const setStep = useSetContractStep();
  const togglePub = useTogglePublished();
  const linkOffer = useLinkOffer();
  const del = useDeleteProperty();

  if (!selectedId) return null;

  const onDelete = () => {
    if (confirm("Supprimer définitivement ce bien ?")) {
      del.mutate(selectedId, { onSuccess: closeProperty });
    }
  };

  const currentStepIdx = b?.contract_step ? CONTRACT_STEPS.indexOf(b.contract_step) : -1;

  return (
    <Drawer
      open={!!selectedId}
      onClose={closeProperty}
      width={560}
      header={
        b ? (
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-accent">{b.ref}</div>
            <div className="mt-0.5 text-[19px] font-extrabold tracking-tight">{b.title}</div>
            <div className="text-[12.5px] font-semibold text-[#8a8a9a]">{b.city ?? "—"}</div>
          </div>
        ) : (
          <div className="text-sm font-semibold text-faint">Chargement…</div>
        )
      }
      footer={
        b && (
          <>
            <Button variant="outline" onClick={() => openModal({ type: "bien", mode: "edit", entityId: b.id })}>
              <Pencil size={15} strokeWidth={2.2} /> Modifier
            </Button>
            <Button className="flex-1" onClick={() => openModal({ type: "share", mode: "create", entityId: b.id })}>
              <Mail size={15} strokeWidth={2.2} /> Partager par mail au client
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Supprimer
            </Button>
          </>
        )
      }
    >
      {isLoading || !b ? (
        <div className="text-sm font-semibold text-faint">Chargement de la fiche…</div>
      ) : (
        <>
          {/* Galerie (placeholders — uploader Storage à venir) */}
          <div className="grid h-[230px] grid-cols-[2fr_1fr] grid-rows-2 gap-2">
            <div className="row-span-2 flex items-end rounded-[14px] p-3 text-[11px] font-bold text-white/80" style={{ background: propertyGradient(b.id) }}>
              Photo principale
            </div>
            <div className="rounded-[14px]" style={{ background: propertyGradient(b.id + "-2") }} />
            <div className="rounded-[14px]" style={{ background: propertyGradient(b.id + "-3") }} />
          </div>

          {/* Prix + statut + publication */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                {b.price_amount != null ? formatEuro(b.price_amount) : "—"}
              </div>
              <Badge tone={PROPERTY_STATUS_TONE[b.status]} className="mt-1">
                {PROPERTY_STATUS_LABELS[b.status]}
              </Badge>
            </div>
            <button
              onClick={() => togglePub.mutate({ id: b.id, published: !b.published })}
              className={cn(
                "flex items-center gap-2 rounded-[9px] px-3 py-2 text-[11.5px] font-bold",
                b.published ? "bg-success-bg text-success" : "bg-line text-faint",
              )}
            >
              <span className="size-2 rounded-full bg-current" />
              {b.published ? "Publié sur le site" : "Non publié"}
            </button>
          </div>

          {/* Statut du bien */}
          <DrawerSection title="Statut du bien · cliquez pour changer">
            <div className="flex gap-1.5">
              {PROPERTY_STATUSES.map((s) => (
                <StatusChip key={s} status={s} active={b.status === s} onClick={() => setStatus.mutate({ id: b.id, status: s })} />
              ))}
            </div>
          </DrawerSection>

          {/* Parcours de contractualisation */}
          <DrawerSection title="Parcours de contractualisation">
            <div className="flex flex-col gap-1.5">
              {CONTRACT_STEPS.map((step, i) => {
                const done = currentStepIdx >= 0 && i <= currentStepIdx;
                return (
                  <button
                    key={step}
                    onClick={() => setStep.mutate({ id: b.id, step })}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-xs font-bold",
                      done ? "bg-accent-soft text-accent" : "bg-app text-faint",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 flex-none items-center justify-center rounded-full text-[10px] font-extrabold",
                        done ? "bg-accent text-white" : "bg-[#e4e3ea] text-faint",
                      )}
                    >
                      {i + 1}
                    </span>
                    {CONTRACT_STEP_LABELS[step]}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-bold text-ghost">Offre liée à un prospect</div>
              <Select
                value={b.offer_prospect_id ?? ""}
                onChange={(e) => linkOffer.mutate({ id: b.id, prospectId: e.target.value || null })}
              >
                <option value="">Aucun prospect lié</option>
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </Select>
            </div>
          </DrawerSection>

          {/* Caractéristiques */}
          <DrawerSection title="Caractéristiques">
            <div className="grid grid-cols-3 gap-2.5">
              <Spec label="Surface" value={b.surface_m2 != null ? `${b.surface_m2} m²` : "—"} />
              <Spec label="Pièces" value={b.rooms != null ? String(b.rooms) : "—"} />
              <Spec label="Chambres" value={b.bedrooms != null ? String(b.bedrooms) : "—"} />
              <Spec label="Salles de bain" value={b.bathrooms != null ? String(b.bathrooms) : "—"} />
              <Spec label="Étage" value={b.floor_label ?? "—"} />
              <Spec label="DPE" value={b.dpe ? `Classe ${b.dpe}` : "—"} />
            </div>
          </DrawerSection>

          {/* Description */}
          <DrawerSection title="Description">
            <p className="text-[13px] font-medium leading-relaxed text-[#3a3a48]">
              {b.description || "Aucune description."}
            </p>
          </DrawerSection>

          {/* Marge + type */}
          <div className="flex gap-2.5">
            <div className="flex-1 rounded-xl bg-gradient-to-br from-accent to-accent-2 p-3.5 text-white">
              <div className="text-[11px] font-bold opacity-85">Marge agence</div>
              <div className="mt-0.5 text-xl font-extrabold">
                {b.margin_pct != null ? `${b.margin_pct} %` : "—"}
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-app p-3.5">
              <div className="text-[11px] font-bold text-[#8a8a9a]">Type de bien</div>
              <div className="mt-0.5 text-base font-extrabold">{b.property_type ?? "—"}</div>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}

function StatusChip({
  status,
  active,
  onClick,
}: {
  status: PropertyStatus;
  active: boolean;
  onClick: () => void;
}) {
  if (active) {
    return (
      <button onClick={onClick} className="rounded-lg">
        <Badge tone={PROPERTY_STATUS_TONE[status]} className="border-[1.5px] border-current px-3 py-1.5 text-[11.5px]">
          {PROPERTY_STATUS_LABELS[status]}
        </Badge>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-[1.5px] border-transparent bg-app px-3 py-1.5 text-[11.5px] font-bold text-faint"
    >
      {PROPERTY_STATUS_LABELS[status]}
    </button>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[11px] bg-app p-3">
      <div className="text-[11px] font-bold text-[#8a8a9a]">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold">{value}</div>
    </div>
  );
}
