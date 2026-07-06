"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, Plus } from "lucide-react";
import { navItemForPath } from "@/config/nav";
import { useUIStore, type ModalType } from "@/stores/ui-store";
import { Button } from "@/components/ui";
import { NotifPanel } from "@/features/notifications/notif-panel";
import { useNotifications } from "@/features/notifications/hooks";

/** Modale de création déclenchée par le bouton « + » selon l'écran actif. */
const CREATE_MODAL: Record<string, ModalType> = {
  "/biens": "bien",
  "/agenda": "visite",
};

export function Topbar() {
  const pathname = usePathname();
  const item = navItemForPath(pathname);
  const { query, setQuery, notifOpen, toggleNotif, openModal } = useUIStore();
  const { data: notifs = [] } = useNotifications();
  const unread = notifs.filter((n) => !n.read).length;

  // La recherche est propre à chaque écran : on la réinitialise à la navigation.
  useEffect(() => setQuery(""), [pathname, setQuery]);

  const onCreate = () =>
    openModal({ type: CREATE_MODAL[item.href] ?? "prospect", mode: "create" });

  return (
    <header className="flex h-[70px] flex-none items-center justify-between border-b border-black/[.07] bg-surface px-7">
      <div className="text-[19px] font-extrabold tracking-tight">{item.title}</div>
      <div className="flex items-center gap-3">
        <div
          data-tour="topbar-search"
          className="flex w-[240px] items-center gap-2 rounded-[11px] bg-app px-3 py-2.5 text-faint"
        >
          <Search size={16} strokeWidth={2.2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={item.searchPlaceholder ?? "Rechercher…"}
            className="w-full border-none bg-transparent text-[13px] font-semibold text-ink outline-none"
          />
        </div>

        <div className="relative" data-tour="topbar-notif">
          <button
            onClick={toggleNotif}
            className="relative flex size-10 items-center justify-center rounded-[11px] bg-app text-muted"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2.1} />
            {unread > 0 && (
              <span className="absolute -right-[3px] -top-[3px] flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-danger px-1 text-[9.5px] font-extrabold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && <NotifPanel />}
        </div>

        <Button data-tour="topbar-create" onClick={onCreate}>
          <Plus size={16} strokeWidth={2.6} />
          {item.createLabel}
        </Button>
      </div>
    </header>
  );
}
