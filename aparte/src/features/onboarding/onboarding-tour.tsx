"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useOnboardingStore } from "./onboarding-store";
import { completeOnboarding } from "./actions";
import { TOUR_STEPS } from "./steps";
import { useAccount } from "@/features/account/account-context";
import { cn } from "@/lib/utils";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CARD_W = 360;
const PAD = 8; // marge de la découpe autour de la cible
const GAP = 16; // espace entre la cible et la carte

/**
 * Tour d'onboarding « spotlight » : assombrit toute l'interface sauf l'élément
 * ciblé (mis en lumière), et affiche une carte guidée (Précédent / Suivant /
 * Passer) à côté. Navigation clavier, repositionnement au resize/scroll.
 */
export function OnboardingTour() {
  const { active, index, close, setIndex } = useOnboardingStore();
  const { patchProfile } = useAccount();
  const [rect, setRect] = useState<Box | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const total = TOUR_STEPS.length;
  const step = TOUR_STEPS[index];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const finish = useCallback(() => {
    close();
    patchProfile({ onboardingCompleted: true });
    void completeOnboarding();
  }, [close, patchProfile]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setIndex(index + 1);
  }, [isLast, finish, setIndex, index]);

  const prev = useCallback(() => {
    if (!isFirst) setIndex(index - 1);
  }, [isFirst, setIndex, index]);

  // Mesure la cible (et suit resize/scroll).
  useEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = step?.target
        ? (document.querySelector(step.target) as HTMLElement | null)
        : null;
      if (el) {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  // Positionne la carte en fonction de la cible (côté droit, dessous, ou centre).
  useLayoutEffect(() => {
    if (!active) return;
    const card = cardRef.current;
    const ch = card?.offsetHeight ?? 200;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = 16;
    if (!rect) {
      setCardPos({ top: (vh - ch) / 2, left: (vw - CARD_W) / 2 });
      return;
    }
    let top: number;
    let left: number;
    if (rect.left < 300) {
      // cible dans la barre latérale → carte à droite
      left = rect.left + rect.width + GAP;
      top = rect.top;
    } else if (rect.top < 100) {
      // cible dans la topbar → carte dessous, alignée à droite
      top = rect.top + rect.height + GAP;
      left = rect.left + rect.width - CARD_W;
    } else {
      top = rect.top + rect.height + GAP;
      left = rect.left;
    }
    left = Math.min(Math.max(m, left), vw - CARD_W - m);
    top = Math.min(Math.max(m, top), vh - ch - m);
    setCardPos({ top, left });
  }, [active, rect, index]);

  // Clavier : Échap = passer, →/Entrée = suivant, ← = précédent.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, finish, next, prev]);

  if (!active || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Guide d'accueil">
      {/* Découpe lumineuse : le box-shadow géant assombrit tout sauf la cible */}
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-[14px] ring-2 ring-accent transition-all duration-300 ease-out"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(11,11,18,.60)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(11,11,18,.60)]" />
      )}

      {/* Bloqueur d'interactions (l'app est en pause pendant le guide) */}
      <div className="absolute inset-0" />

      {/* Carte guidée */}
      <div
        ref={cardRef}
        className="absolute w-[360px] max-w-[calc(100vw-32px)] rounded-[18px] bg-surface p-5 shadow-overlay [animation:var(--animate-md-in)]"
        style={{ top: cardPos?.top ?? -9999, left: cardPos?.left ?? -9999 }}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[11px] bg-accent-soft text-lg">
            {step.emoji ?? "✨"}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ghost">
            Étape {index + 1} sur {total}
          </div>
        </div>

        <div className="text-[17px] font-extrabold tracking-tight">{step.title}</div>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted">{step.body}</p>

        {/* Progression */}
        <div className="mt-4 flex gap-1.5">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Aller à l'étape ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-accent" : "w-1.5 bg-[#e4e3ea] hover:bg-[#c4c4d0]",
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={finish}
            className="text-[12.5px] font-bold text-faint hover:text-muted"
          >
            Passer
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 rounded-[10px] border border-[#e4e3ea] bg-surface px-3 py-2 text-[12.5px] font-bold text-ink hover:bg-app"
              >
                <ArrowLeft size={14} strokeWidth={2.4} /> Précédent
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1.5 rounded-[10px] bg-accent px-3.5 py-2 text-[12.5px] font-bold text-white hover:brightness-105"
            >
              {isLast ? (
                <>
                  <Check size={14} strokeWidth={2.6} /> Terminer
                </>
              ) : (
                <>
                  Suivant <ArrowRight size={14} strokeWidth={2.4} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
