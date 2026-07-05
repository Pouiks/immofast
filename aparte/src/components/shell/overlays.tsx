"use client";

import { ProspectDrawer } from "@/features/prospects/components/prospect-drawer";
import { ProspectModal } from "@/features/prospects/components/prospect-modal";
import { DocumentModal } from "@/features/prospects/components/document-modal";

/**
 * Monte les overlays globaux (drawers de détail + modale unique multi-usage).
 * Chaque composant décide seul de s'afficher selon l'état du store UI, donc
 * ils sont disponibles depuis n'importe quel écran (prospects, kanban…).
 * On étend ce point de montage à chaque nouvelle verticale (biens, visites…).
 */
export function Overlays() {
  return (
    <>
      <ProspectDrawer />
      <ProspectModal />
      <DocumentModal />
    </>
  );
}
