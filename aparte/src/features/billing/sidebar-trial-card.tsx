"use client";

import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { useAccount } from "@/features/account/account-context";
import { useSubscription } from "./hooks";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const TRIAL_MS = 24 * 60 * 60 * 1000;

/**
 * Encart de la barre latérale : suit la période d'essai gratuit 24 h avec une
 * barre de progression du temps restant, puis propose de passer à un plan.
 * S'adapte à l'état : abonné / en essai / essai terminé / à activer.
 */
export function SidebarTrialCard({ className }: { className?: string }) {
  const trialEndsAt = useAccount().account.trialEndsAt;
  const { data: sub } = useSubscription();
  const openAccount = useUIStore((s) => s.openAccount);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hasSub = sub && (sub.status === "active" || sub.status === "trialing");

  // Abonné → carte compacte.
  if (hasSub) {
    return (
      <div className={cn("rounded-card bg-app p-3.5", className)}>
        <div className="flex items-center gap-1.5 text-[12px] font-bold">
          <Sparkles size={13} strokeWidth={2.4} className="text-accent" />
          Formule {sub!.plan === "annuel" ? "annuelle" : "mensuelle"}
        </div>
        <div className="mt-0.5 text-[11px] font-bold text-success">Abonnement actif</div>
      </div>
    );
  }

  // Ni essai ni abonnement → inciter à choisir une formule.
  if (!trialEndsAt) {
    return (
      <button
        onClick={() => openAccount("abonnement")}
        className={cn("rounded-card bg-app p-3.5 text-left transition hover:bg-hover", className)}
      >
        <div className="text-[12px] font-bold">Choisissez votre formule</div>
        <div className="mt-0.5 text-[11px] font-semibold text-faint">Activez votre espace</div>
      </button>
    );
  }

  const remaining = Math.max(0, new Date(trialEndsAt).getTime() - now);
  const fraction = Math.max(0, Math.min(1, remaining / TRIAL_MS));

  // Essai terminé → CTA de mise à niveau.
  if (remaining <= 0) {
    return (
      <div className={cn("rounded-card bg-danger-bg p-3.5", className)}>
        <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-danger">
          <Clock size={13} strokeWidth={2.6} /> Essai terminé
        </div>
        <div className="mt-1 text-[11px] font-semibold text-danger/80">
          Passez à un plan pour continuer à utiliser votre espace.
        </div>
        <button
          onClick={() => openAccount("abonnement")}
          className="mt-2.5 w-full rounded-[9px] bg-accent px-3 py-2 text-[12px] font-bold text-white hover:brightness-105"
        >
          Mettre à niveau
        </button>
      </div>
    );
  }

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const label = h > 0 ? `${h} h ${String(m).padStart(2, "0")} restantes` : `${m} min restantes`;
  const low = fraction < 0.15;

  return (
    <div className={cn("rounded-card bg-app p-3.5", className)}>
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold">
        <Clock size={13} strokeWidth={2.4} className="text-accent" /> Période d'essai
      </div>
      <div className="mb-2 text-[11px] font-semibold text-faint">{label}</div>
      <div className="h-[7px] overflow-hidden rounded-[5px] bg-[#e4e3ea]">
        <div
          className={cn(
            "h-full rounded-[5px] transition-all duration-500",
            low ? "bg-danger" : "bg-gradient-to-r from-accent to-accent-2",
          )}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <button
        onClick={() => openAccount("abonnement")}
        className="mt-2.5 w-full rounded-[9px] bg-accent px-3 py-1.5 text-[12px] font-bold text-white hover:brightness-105"
      >
        S'abonner
      </button>
    </div>
  );
}
