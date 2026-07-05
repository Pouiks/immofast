"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Target } from "lucide-react";
import { CRM_NAV } from "@/config/nav";
import { useUIStore } from "@/stores/ui-store";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, type Role } from "@/types/domain";

export interface SidebarProps {
  brandName: string;
  fullName: string;
  role: Role;
  /** Objectif mensuel (placeholder tant que les réglages ne sont pas branchés). */
  goalDone?: number;
  goalTarget?: number;
}

export function Sidebar({ brandName, fullName, role, goalDone = 3, goalTarget = 5 }: SidebarProps) {
  const pathname = usePathname();
  const openModal = useUIStore((s) => s.openModal);
  const openAccount = useUIStore((s) => s.openAccount);
  const pct = Math.min(100, Math.round((goalDone / Math.max(1, goalTarget)) * 100));

  return (
    <aside className="flex w-[236px] flex-none flex-col gap-6 border-r border-black/[.07] bg-surface px-4 py-[22px]">
      {/* Logo + marque */}
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="flex size-9 items-center justify-center rounded-[9px] bg-gradient-to-br from-accent to-accent-2 text-lg font-extrabold text-white">
          {initials(brandName, 1)}
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight">{brandName}</div>
          <div className="text-[10.5px] font-semibold tracking-wide text-faint">CRM IMMOBILIER</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {CRM_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[11px] px-3 py-[11px] font-bold transition",
                active ? "bg-accent text-white" : "text-muted hover:bg-app",
              )}
            >
              <Icon size={18} strokeWidth={2.1} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Objectif mensuel */}
      <button
        onClick={() => openModal({ type: "objectif", mode: "edit" })}
        className="mt-auto rounded-card bg-app p-[15px] text-center"
      >
        <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold">
          Objectif mensuel <Target size={12} strokeWidth={2.4} className="text-faint" />
        </div>
        <div className="mb-2.5 text-[11px] font-semibold text-faint">
          {goalDone} ventes sur {goalTarget}
        </div>
        <div className="h-[7px] overflow-hidden rounded-[5px] bg-[#e4e3ea]">
          <div
            className="h-full rounded-[5px] bg-gradient-to-r from-accent to-accent-2"
            style={{ width: `${pct}%` }}
          />
        </div>
      </button>

      {/* Profil */}
      <button
        onClick={openAccount}
        className="-mx-1.5 flex items-center gap-2.5 rounded-[10px] border-t border-line px-1.5 py-2.5 text-left hover:bg-hover"
      >
        <div className="flex size-9 flex-none items-center justify-center rounded-[11px] bg-gradient-to-br from-[#ff8a5b] to-[#ff5b8a] font-extrabold text-white">
          {initials(fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold">{fullName}</div>
          <div className="text-[11px] font-semibold text-faint">{ROLE_LABELS[role]}</div>
        </div>
        <ChevronRight size={16} strokeWidth={2.2} className="text-[#c4c4d0]" />
      </button>
    </aside>
  );
}
