"use client";

import { ProspectDrawer } from "@/features/prospects/components/prospect-drawer";
import { ProspectModal } from "@/features/prospects/components/prospect-modal";
import { DocumentModal } from "@/features/prospects/components/document-modal";
import { PropertyDrawer } from "@/features/biens/components/property-drawer";
import { PropertyModal } from "@/features/biens/components/property-modal";
import { ShareModal } from "@/features/biens/components/share-modal";
import { VisitModal } from "@/features/agenda/components/visit-modal";
import { PlanModal } from "@/features/account/plan-modal";

/**
 * Monte les overlays globaux (drawers de détail + modale unique multi-usage).
 * Chaque composant décide seul de s'afficher selon l'état du store UI, donc
 * ils sont disponibles depuis n'importe quel écran (prospects, kanban, biens…).
 */
export function Overlays() {
  return (
    <>
      <ProspectDrawer />
      <ProspectModal />
      <DocumentModal />
      <PropertyDrawer />
      <PropertyModal />
      <ShareModal />
      <VisitModal />
      <PlanModal />
    </>
  );
}
