"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useUIStore } from "@/stores/ui-store";
import { useNotifications, useMarkAllRead, useMarkOneRead } from "./hooks";
import { EmptyState } from "@/components/ui";
import type { NotificationKind } from "@/types/domain";
import type { NotificationRow } from "@/types/database";

const DOT_COLOR: Record<NotificationKind, string> = {
  offre: "#12a150",
  lead: "#5b4bff",
  visite: "#e07a1c",
  document: "#3b6bff",
};

/** Panneau de notifications ancré sous la cloche (données réelles + deep-link). */
export function NotifPanel() {
  const router = useRouter();
  const { toggleNotif, openProspect, openProperty, openModal } = useUIStore();
  const { data: notifs = [], isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const markOne = useMarkOneRead();

  /** Ouvre l'écran + le contexte ciblés par la notification, et la marque lue. */
  const onNotifClick = (n: NotificationRow) => {
    if (!n.read) markOne.mutate(n.id);
    if (!n.entity_type || !n.entity_id) return;
    toggleNotif(); // ferme le panneau
    switch (n.entity_type) {
      case "prospect":
        router.push("/prospects");
        openProspect(n.entity_id);
        break;
      case "property":
        router.push("/biens");
        openProperty(n.entity_id);
        break;
      case "visit":
        router.push("/agenda");
        openModal({ type: "visite", mode: "edit", entityId: n.entity_id });
        break;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={toggleNotif} />
      <div className="absolute right-0 top-[50px] z-[60] w-[344px] overflow-hidden rounded-card border border-black/[.08] bg-surface shadow-[0_20px_50px_-18px_rgba(0,0,0,.3)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-[15px]">
          <div className="text-sm font-extrabold">Notifications</div>
          <button className="text-[11.5px] font-bold text-accent" onClick={() => markAll.mutate()}>
            Tout marquer lu
          </button>
        </div>
        <div className="max-h-[344px] overflow-y-auto">
          {isLoading && <EmptyState>Chargement…</EmptyState>}
          {!isLoading && notifs.length === 0 && (
            <EmptyState>Aucune notification pour le moment.</EmptyState>
          )}
          {notifs.map((n) => {
            const clickable = !!(n.entity_type && n.entity_id);
            return (
              <button
                key={n.id}
                onClick={() => onNotifClick(n)}
                disabled={!clickable && n.read}
                className="flex w-full gap-3 border-b border-line-soft px-4 py-3.5 text-left last:border-0 enabled:hover:bg-hover disabled:cursor-default"
              >
                <span
                  className="mt-[5px] size-[9px] flex-none rounded-full"
                  style={{ background: n.read ? "#d8d6e0" : DOT_COLOR[n.kind] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-[11.5px] font-medium text-muted">{n.body}</div>}
                  <div className="mt-1 text-[10.5px] font-semibold text-ghost">
                    {formatDistanceToNow(new Date(n.created_at), { locale: fr, addSuffix: true })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
