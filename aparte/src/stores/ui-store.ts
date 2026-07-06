import { create } from "zustand";

/**
 * État UI *pur* (éphémère, non serveur) : drawers, modale active, notifications.
 * Toute donnée persistée (prospects, biens…) vit dans React Query, jamais ici.
 */

export type ModalType =
  | "prospect"
  | "bien"
  | "visite"
  | "document"
  | "share"
  | "objectif"
  | "client"
  | "plan";

export type ModalMode = "create" | "edit";

interface ModalState {
  type: ModalType;
  mode: ModalMode;
  /** Id de l'entité éditée, ou contexte (ex. prospectId pour un document). */
  entityId?: string | null;
}

interface UIState {
  // Drawers de détail
  selectedProspectId: string | null;
  selectedPropertyId: string | null;
  openProspect: (id: string) => void;
  closeProspect: () => void;
  openProperty: (id: string) => void;
  closeProperty: () => void;

  // Modale unique multi-usage
  modal: ModalState | null;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;

  // Recherche de l'écran courant (filtre la liste active)
  query: string;
  setQuery: (query: string) => void;

  // Overlays
  notifOpen: boolean;
  toggleNotif: () => void;
  accountOpen: boolean;
  accountTab: AccountTab;
  openAccount: (tab?: AccountTab) => void;
  closeAccount: () => void;
}

export type AccountTab = "profil" | "abonnement" | "facturation" | "marque";

export const useUIStore = create<UIState>((set) => ({
  selectedProspectId: null,
  selectedPropertyId: null,
  openProspect: (id) => set({ selectedProspectId: id }),
  closeProspect: () => set({ selectedProspectId: null }),
  openProperty: (id) => set({ selectedPropertyId: id }),
  closeProperty: () => set({ selectedPropertyId: null }),

  modal: null,
  openModal: (modal) => set({ modal, notifOpen: false }),
  closeModal: () => set({ modal: null }),

  query: "",
  setQuery: (query) => set({ query }),

  notifOpen: false,
  toggleNotif: () => set((s) => ({ notifOpen: !s.notifOpen })),
  accountOpen: false,
  accountTab: "profil",
  openAccount: (tab = "profil") => set({ accountOpen: true, accountTab: tab, notifOpen: false }),
  closeAccount: () => set({ accountOpen: false }),
}));
