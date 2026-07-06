/**
 * Scénario d'onboarding : chaque étape cible un élément via `[data-tour="…"]`
 * (ou aucun pour un panneau centré). L'ordre = l'ordre du parcours.
 */
export interface TourStep {
  /** Sélecteur de la cible à mettre en lumière ; absent = carte centrée. */
  target?: string;
  title: string;
  body: string;
  /** Emoji d'accent affiché dans la carte. */
  emoji?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    emoji: "👋",
    title: "Bienvenue sur votre espace",
    body: "En moins d'une minute, découvrez comment tirer le meilleur de votre CRM. Vous pourrez passer ce guide à tout moment.",
  },
  {
    target: '[data-tour="sidebar-nav"]',
    emoji: "🧭",
    title: "Vos modules, à portée de clic",
    body: "Naviguez entre le tableau de bord, les prospects, les biens, le pipeline Kanban et l'agenda depuis cette barre latérale.",
  },
  {
    target: '[data-tour="nav-prospects"]',
    emoji: "👥",
    title: "Suivez vos prospects",
    body: "Centralisez vos contacts, leur budget, leur statut dans le pipeline et leurs documents (GED). Cliquez une fiche pour tout voir.",
  },
  {
    target: '[data-tour="topbar-create"]',
    emoji: "⚡",
    title: "Créez en un clic",
    body: "Ce bouton s'adapte à l'écran : nouveau prospect, nouvelle annonce, nouvelle visite… Toujours au même endroit.",
  },
  {
    target: '[data-tour="topbar-search"]',
    emoji: "🔎",
    title: "Trouvez tout, tout de suite",
    body: "La recherche filtre l'écran courant en temps réel : un nom, une ville, une référence… et c'est trouvé.",
  },
  {
    target: '[data-tour="topbar-notif"]',
    emoji: "🔔",
    title: "Ne ratez rien",
    body: "Nouveaux prospects, visites, offres, documents reçus : cliquez une notification pour aller droit au bon endroit.",
  },
  {
    target: '[data-tour="sidebar-profile"]',
    emoji: "⚙️",
    title: "Votre compte & votre marque",
    body: "Gérez votre profil, votre abonnement, votre facturation et personnalisez votre marque blanche depuis votre profil.",
  },
  {
    emoji: "🚀",
    title: "Vous êtes prêt !",
    body: "Explorez librement. Vous pourrez relancer ce guide depuis votre profil quand vous le souhaitez. Bonne prospection !",
  },
];
