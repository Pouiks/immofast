"use client";

import { useUIStore } from "@/stores/ui-store";

/**
 * Panneau de notifications (ancré sous la cloche).
 * Structure en place ; la liste sera alimentée par React Query
 * (feature notifications) une fois Supabase branché.
 */
export function NotifPanel() {
  const toggleNotif = useUIStore((s) => s.toggleNotif);

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={toggleNotif} />
      <div className="absolute right-0 top-[50px] z-[60] w-[344px] overflow-hidden rounded-card border border-black/[.08] bg-surface shadow-[0_20px_50px_-18px_rgba(0,0,0,.3)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-[15px]">
          <div className="text-sm font-extrabold">Notifications</div>
          <button className="text-[11.5px] font-bold text-accent">Tout marquer lu</button>
        </div>
        <div className="p-6 text-center text-[13px] font-semibold text-faint">
          Aucune notification pour le moment.
        </div>
      </div>
    </>
  );
}
