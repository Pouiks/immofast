"use client";

import { useAccounts, useSetAccountStatus, estimateMRR } from "../hooks";
import { AuthorizeModal } from "./authorize-modal";
import { useUIStore } from "@/stores/ui-store";
import { Card, KpiCard, Badge, Button, Avatar, EmptyState } from "@/components/ui";
import { ACCOUNT_STATUS_TONE } from "@/lib/status";
import { ACCOUNT_STATUS_LABELS } from "@/types/domain";

/** Console SaaS : KPIs + gestion des espaces clients (hors espace de l'admin). */
export function AdminConsole({ excludeAccountId }: { excludeAccountId: string }) {
  const { data: all = [], isLoading } = useAccounts();
  const setStatus = useSetAccountStatus();
  const openModal = useUIStore((s) => s.openModal);

  const accounts = all.filter((a) => a.id !== excludeAccountId);
  const active = accounts.filter((a) => a.status === "active").length;
  const mrr = estimateMRR(accounts);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Espaces clients" value={accounts.length} />
        <KpiCard label="Abonnements actifs" value={active} />
        <KpiCard label="MRR estimé" value={`${mrr.toLocaleString("fr-FR")} €`} accent />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-base font-extrabold">Espaces clients</div>
        <Button size="sm" onClick={() => openModal({ type: "client", mode: "create" })}>
          + Autoriser un nouveau client
        </Button>
      </div>

      <Card className="px-[18px] py-1">
        {isLoading && <EmptyState>Chargement…</EmptyState>}
        {!isLoading && accounts.length === 0 && <EmptyState>Aucun espace client.</EmptyState>}
        {accounts.map((a) => (
          <div
            key={a.id}
            data-testid={`account-${a.email ?? a.id}`}
            className="flex items-center gap-3 border-b border-line-soft py-[15px] last:border-0"
          >
            <Avatar name={a.agency_name} size={38} radius={10} colors={["#eef0ff", "#2563eb"]} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold">{a.agency_name}</div>
              <div className="text-[11.5px] font-semibold text-[#8a8a9a]">
                {a.email ?? "—"} · {a.plan === "annuel" ? "Annuel" : "Mensuel"}
              </div>
            </div>
            <Badge tone={ACCOUNT_STATUS_TONE[a.status]}>{ACCOUNT_STATUS_LABELS[a.status]}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setStatus.mutate({ id: a.id, status: a.status === "active" ? "suspended" : "active" })
              }
            >
              {a.status === "active" ? "Suspendre" : "Activer"}
            </Button>
          </div>
        ))}
      </Card>

      <AuthorizeModal />
    </div>
  );
}
