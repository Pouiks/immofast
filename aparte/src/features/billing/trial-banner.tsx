"use client";

import { Clock } from "lucide-react";
import { useAccount } from "@/features/account/account-context";
import { useSubscription } from "./hooks";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * Bandeau d'essai : rappelle le temps restant sur l'essai gratuit 24 h et
 * invite à s'abonner. Masqué si un abonnement actif existe ou s'il n'y a pas
 * d'essai. (Le verrouillage complet après essai arrivera avec le gating.)
 */
export function TrialBanner() {
  const trialEndsAt = useAccount().account.trialEndsAt;
  const { data: sub } = useSubscription();
  const openAccount = useUIStore((s) => s.openAccount);

  if (!trialEndsAt) return null;
  if (sub && (sub.status === "active" || sub.status === "trialing")) return null;

  const end = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const expired = end <= now;
  const hoursLeft = Math.max(0, Math.ceil((end - now) / 3_600_000));

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-7 py-2.5 text-[12.5px] font-bold",
        expired ? "bg-danger-bg text-danger" : "bg-accent-soft text-accent",
      )}
    >
      <Clock size={15} strokeWidth={2.4} />
      {expired ? (
        <span>Votre essai gratuit est terminé — abonnez-vous pour continuer à utiliser votre espace.</span>
      ) : (
        <span>
          Essai gratuit — <strong>{hoursLeft} h</strong> restantes pour découvrir toutes les fonctionnalités.
        </span>
      )}
      <button
        onClick={openAccount}
        className="ml-auto rounded-[9px] bg-accent px-3 py-1.5 text-[12px] font-bold text-white hover:brightness-105"
      >
        S'abonner
      </button>
    </div>
  );
}
