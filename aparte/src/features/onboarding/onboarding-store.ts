import { create } from "zustand";

/** État du tour d'onboarding (UI éphémère). La persistance est côté profil. */
interface OnboardingState {
  active: boolean;
  index: number;
  start: () => void;
  close: () => void;
  setIndex: (index: number) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  active: false,
  index: 0,
  start: () => set({ active: true, index: 0 }),
  close: () => set({ active: false, index: 0 }),
  setIndex: (index) => set({ index }),
}));
