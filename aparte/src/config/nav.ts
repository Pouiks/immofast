import { LayoutGrid, Users, Building2, KanbanSquare, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Titre affiché dans la topbar. */
  title: string;
  /** Libellé du bouton « + Créer » contextuel. */
  createLabel: string;
  searchPlaceholder?: string;
}

/** Navigation CRM (client & invité). L'ordre = l'ordre d'affichage. */
export const CRM_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutGrid,
    title: "Tableau de bord",
    createLabel: "Créer",
    searchPlaceholder: "Rechercher…",
  },
  {
    href: "/prospects",
    label: "Prospects",
    icon: Users,
    title: "Prospects",
    createLabel: "Nouveau prospect",
    searchPlaceholder: "Rechercher un prospect…",
  },
  {
    href: "/biens",
    label: "Biens",
    icon: Building2,
    title: "Biens",
    createLabel: "Nouvelle annonce",
    searchPlaceholder: "Rechercher un bien…",
  },
  {
    href: "/kanban",
    label: "Kanban",
    icon: KanbanSquare,
    title: "Kanban",
    createLabel: "Nouveau prospect",
  },
  {
    href: "/agenda",
    label: "Agenda",
    icon: CalendarDays,
    title: "Agenda",
    createLabel: "Nouvelle visite",
  },
];

export function navItemForPath(pathname: string): NavItem {
  return CRM_NAV.find((n) => pathname.startsWith(n.href)) ?? CRM_NAV[0];
}
