"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "@/features/account/account-context";
import { useOnboardingStore } from "./onboarding-store";
import { OnboardingTour } from "./onboarding-tour";

/**
 * Démarre automatiquement le guide à la première connexion
 * (onboarding_completed = false) et monte le tour. Le léger délai laisse le
 * shell se monter pour que les cibles soient mesurables.
 */
export function OnboardingLauncher() {
  const onboardingCompleted = useAccount().profile.onboardingCompleted;
  const start = useOnboardingStore((s) => s.start);
  const triggered = useRef(false);

  useEffect(() => {
    if (onboardingCompleted || triggered.current) return;
    triggered.current = true;
    const t = setTimeout(() => start(), 450);
    return () => clearTimeout(t);
  }, [onboardingCompleted, start]);

  return <OnboardingTour />;
}
