"use client";

import { Phone, Mail, MapPin, FileText, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useUIStore } from "@/stores/ui-store";
import { useProspectDetail, useSetProspectStage, useDeleteProspect, useDeleteDocument } from "../hooks";
import { getDocumentUrl } from "../api";
import { Drawer, DrawerSection, Avatar, Badge, Button } from "@/components/ui";
import { formatEuro } from "@/lib/utils";
import { STAGE_TONE } from "@/lib/status";
import {
  PROSPECT_STAGES,
  PROSPECT_STAGE_LABELS,
  DOCUMENT_TYPE_LABELS,
  CONTRACT_STEP_LABELS,
  type ProspectStage,
} from "@/types/domain";

export function ProspectDrawer() {
  const selectedId = useUIStore((s) => s.selectedProspectId);
  const closeProspect = useUIStore((s) => s.closeProspect);
  const openModal = useUIStore((s) => s.openModal);
  const { data, isLoading } = useProspectDetail(selectedId);
  const setStage = useSetProspectStage();
  const deleteProspect = useDeleteProspect();
  const deleteDoc = useDeleteDocument();

  if (!selectedId) return null;
  const p = data?.prospect;

  const onDelete = () => {
    if (!selectedId) return;
    if (confirm("Supprimer définitivement ce prospect ?")) {
      deleteProspect.mutate(selectedId, { onSuccess: closeProspect });
    }
  };

  return (
    <Drawer
      open={!!selectedId}
      onClose={closeProspect}
      width={420}
      header={
        p ? (
          <div className="flex items-center gap-3">
            <Avatar name={p.full_name} size={52} radius={14} />
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold leading-tight tracking-tight">
                {p.full_name}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[#8a8a9a]">
                {p.budget_amount != null ? formatEuro(p.budget_amount) : "—"} · {p.search_label ?? "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-semibold text-faint">Chargement…</div>
        )
      }
      footer={
        p && (
          <>
            <Button variant="outline" className="flex-1" onClick={() => openModal({ type: "prospect", mode: "edit", entityId: p.id })}>
              <Pencil size={15} strokeWidth={2.2} /> Modifier la fiche
            </Button>
            <Button variant="danger" onClick={onDelete}>
              Supprimer
            </Button>
          </>
        )
      }
    >
      {isLoading || !p ? (
        <div className="text-sm font-semibold text-faint">Chargement de la fiche…</div>
      ) : (
        <>
          {/* Statut · cliquable */}
          <DrawerSection title="Statut · cliquez pour changer">
            <div className="flex flex-wrap gap-1.5">
              {PROSPECT_STAGES.map((s) => (
                <StageChip
                  key={s}
                  stage={s}
                  active={p.stage === s}
                  onClick={() => setStage.mutate({ id: p.id, stage: s })}
                />
              ))}
            </div>
          </DrawerSection>

          {/* Coordonnées */}
          <DrawerSection title="Coordonnées">
            <div className="flex flex-col gap-2.5">
              <Contact icon={<Phone size={16} strokeWidth={2.1} />} value={p.phone} />
              <Contact icon={<Mail size={16} strokeWidth={2.1} />} value={p.email} />
              <Contact icon={<MapPin size={16} strokeWidth={2.1} />} value={p.address} />
            </div>
          </DrawerSection>

          {/* Visites liées */}
          <DrawerSection
            title="Visites liées"
            action={
              <button
                className="text-xs font-bold text-accent"
                onClick={() => openModal({ type: "visite", mode: "create", entityId: p.id })}
              >
                + Planifier
              </button>
            }
          >
            {data.visits.length === 0 ? (
              <p className="py-1 text-[12.5px] font-semibold italic text-faint">
                Aucune visite planifiée.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.visits.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded-[11px] bg-app px-3 py-2.5">
                    <div className="text-center">
                      <div className="text-[13px] font-extrabold text-accent">
                        {format(new Date(v.starts_at), "HH:mm")}
                      </div>
                      <div className="text-[10px] font-bold text-faint">
                        {format(new Date(v.starts_at), "EEE d", { locale: fr })}
                      </div>
                    </div>
                    <div className="text-[12.5px] font-bold">{v.title}</div>
                  </div>
                ))}
              </div>
            )}
          </DrawerSection>

          {/* Documents (GED) */}
          <DrawerSection
            title="Documents (GED)"
            action={
              <button
                className="text-xs font-bold text-accent"
                onClick={() => openModal({ type: "document", mode: "create", entityId: p.id })}
              >
                + Ajouter
              </button>
            }
          >
            {data.documents.length === 0 ? (
              <p className="py-1 text-[12.5px] font-semibold italic text-faint">
                Aucun document. Cliquez sur « Ajouter » pour déposer une pièce.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-[11px] bg-app px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => d.storage_path && openDocument(d.storage_path)}
                      disabled={!d.storage_path}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      title={d.storage_path ? "Ouvrir le document" : "Aucun fichier joint"}
                    >
                      <div className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-surface">
                        <FileText size={17} strokeWidth={2} className="text-[#8a8a9a]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-bold">{d.name}</div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge tone="accent">{DOCUMENT_TYPE_LABELS[d.doc_type]}</Badge>
                          <span className="text-[10.5px] font-semibold text-ghost">
                            {format(new Date(d.created_at), "dd/MM")}
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteDoc.mutate({ id: d.id, prospectId: p.id, storagePath: d.storage_path })}
                      className="flex size-6 flex-none items-center justify-center rounded-[7px]"
                      aria-label="Supprimer le document"
                    >
                      <Trash2 size={14} strokeWidth={2.2} className="text-[#c4667a]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </DrawerSection>

          {/* Offres / contractualisation */}
          <DrawerSection title="Offres / contractualisation">
            {data.offers.length === 0 ? (
              <p className="py-1 text-[12.5px] font-semibold italic text-faint">
                Aucune offre en cours pour ce prospect.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.offers.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2.5 rounded-[11px] bg-app px-3 py-2.5"
                  >
                    <div>
                      <div className="text-[12.5px] font-bold">{o.title}</div>
                      <div className="text-[11px] font-semibold text-[#8a8a9a]">
                        {o.price_amount != null ? formatEuro(o.price_amount) : "—"}
                      </div>
                    </div>
                    <Badge tone="accent">
                      {o.contract_step ? CONTRACT_STEP_LABELS[o.contract_step] : "Offre reçue"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </DrawerSection>
        </>
      )}
    </Drawer>
  );
}

function StageChip({
  stage,
  active,
  onClick,
}: {
  stage: ProspectStage;
  active: boolean;
  onClick: () => void;
}) {
  if (active) {
    return (
      <button onClick={onClick} className="rounded-lg">
        <Badge
          tone={STAGE_TONE[stage]}
          className="border-[1.5px] border-current px-3 py-1.5 text-[11.5px]"
        >
          {PROSPECT_STAGE_LABELS[stage]}
        </Badge>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-[1.5px] border-transparent bg-app px-3 py-1.5 text-[11.5px] font-bold text-faint transition"
    >
      {PROSPECT_STAGE_LABELS[stage]}
    </button>
  );
}

async function openDocument(storagePath: string) {
  try {
    const url = await getDocumentUrl(storagePath);
    window.open(url, "_blank");
  } catch {
    alert("Impossible d'ouvrir le document.");
  }
}

function Contact({ icon, value }: { icon: React.ReactNode; value: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-faint">{icon}</span>
      <span className="text-[13.5px] font-semibold">{value || "—"}</span>
    </div>
  );
}
