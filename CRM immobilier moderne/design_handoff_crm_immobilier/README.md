# Handoff : CRM / SaaS immobilier « Aparté »

## Vue d'ensemble
CRM immobilier en **marque blanche**, distribué en **SaaS par abonnement**, à destination des agents et agences immobilières. L'outil couvre : tableau de bord, gestion des prospects (avec GED documentaire), gestion des biens/mandats (avec publication vers un site public), pipeline Kanban, agenda (semaine/mois + drag-and-drop, connexion Google Agenda), et une couche compte/facturation/administration conditionnée par le rôle de l'utilisateur connecté.

Direction visuelle : **fintech épurée façon Revolut** — fond clair, cartes arrondies, une couleur d'accent forte, typographie grasse, densité aérée.

## À propos des fichiers de design
Les fichiers de ce paquet sont des **références de design réalisées en HTML** (un prototype interactif), pas du code de production à copier tel quel. La mission est de **recréer ces écrans dans l'environnement cible** (framework à choisir — voir plus bas) en suivant ses conventions, pas d'expédier le HTML.

- `CRM Immobilier.dc.html` — prototype complet, interactif (React rendu via un runtime maison « Design Component »). Toute la logique est dans la classe `Component` en bas du fichier ; le template est au-dessus. Ouvrez-le dans un navigateur pour explorer le comportement réel.
- `image-slot.js` — composant web `<image-slot>` utilisé pour le dépôt d'images (photos de biens). À remplacer par un vrai uploader dans la stack cible.

> Le prototype n'a **aucun backend** : toutes les données vivent en mémoire (state React), les paiements/SSO/emails/Google Agenda sont simulés. C'est un contrat visuel + fonctionnel, à brancher sur de vrais services.

## Fidélité
**Haute fidélité (hifi).** Couleurs, typographie, espacements, rayons et interactions sont définitifs. Recréez l'UI au pixel près en utilisant les composants/design-system de la stack cible.

## Stack recommandée (si aucun code existant)
- **Front** : React + TypeScript + Vite, Tailwind CSS (ou CSS Modules). Router : React Router / TanStack Router.
- **State/données** : TanStack Query pour le fetch + un store léger (Zustand) pour l'UI.
- **Backend** : API REST/tRPC (Node/NestJS) ou Supabase. Auth : Clerk/Auth0/Supabase Auth avec rôles.
- **Facturation** : Stripe (Billing + abonnements + proration native — voir §Facturation).
- **Stockage documents/photos** : S3 / Supabase Storage.
- **Agenda** : Google Calendar API (OAuth).
Si un codebase existe déjà, ignorez ceci et suivez ses patterns.

---

## Rôles & permissions (essentiel)
Trois rôles, à faire respecter côté serveur **et** UI :

| Capacité | Admin SaaS | Client (titulaire) | Invité |
|---|---|---|---|
| Accès au CRM (prospects, biens, kanban, agenda) | ❌ | ✅ | ✅ |
| Console d'administration SaaS (gérer les espaces clients) | ✅ | ❌ | ❌ |
| Profil personnel | ✅ | ✅ | ✅ |
| Abonnement (formule, changement, résiliation) | ❌ | ✅ | ❌ |
| Facturation + moyens de paiement | ❌ | ✅ | ❌ |
| Marque blanche (nom/branding de l'agence) | ❌ | ✅ | ❌ |

- **Admin SaaS** : n'accède **pas** au CRM. Arrive sur une console dédiée : KPIs (nb d'espaces, abonnements actifs, MRR), liste des espaces clients, actions autoriser / suspendre / activer.
- **Client (titulaire du compte)** : accès complet CRM + gestion de son abonnement, sa facturation, ses moyens de paiement, et le branding de son espace.
- **Invité** : mêmes droits CRM que le titulaire qui l'a invité, **mais jamais** la facturation/les moyens de paiement ni l'administration. (À venir, non encore maquetté : le titulaire invite des membres par email ; un compte peut relier plusieurs personnes, les invités héritant des droits CRM uniquement.)

---

## Écrans / vues

### 1. Connexion (`notAuthed`)
- Plein écran, fond sombre `#0b0b12` avec deux halos radiaux (accent + cyan). Carte blanche centrée, `width:408px`, `border-radius:22px`, `padding:34px 30px`.
- Logo (dégradé accent) + nom de marque + « CRM IMMOBILIER · SaaS ».
- Titre « Connexion à votre espace », sous-titre « Accès réservé aux abonnés actifs ».
- Champs Email / Mot de passe (pré-remplis, en lecture seule dans la démo).
- Démo : 3 boutons de connexion — **Client · titulaire du compte** (plein, accent), **Utilisateur invité** et **Admin SaaS** (contour). En production : un vrai formulaire d'auth ; le rôle vient du compte, pas d'un choix.
- Note bas de carte : « Pas encore client ? Souscrivez sur le site pour obtenir un accès. »

### 2. Console SaaS admin (`isAdminView`)
- Plein écran, fond `#f4f4f7`. Barre supérieure blanche (66px) : logo + « {marque} · Console SaaS » + avatar + « Se déconnecter ».
- Contenu centré, `max-width:860px` : 3 cartes KPI (Espaces clients, Abonnements actifs, MRR estimé — la 3e en dégradé accent), puis bloc « Espaces clients » avec bouton « + Autoriser un nouveau client » et la liste des espaces (avatar initiale, agence, email · formule, badge statut, bouton Suspendre/Activer).
- Statuts d'espace : **Actif** (vert), **En attente de paiement** (orange), **Suspendu** (rouge).

### 3. Shell CRM (client & invité)
Structure : **barre latérale 236px** + **zone principale** (topbar 70px + contenu scrollable, `padding:26px 28px`).

**Barre latérale (blanche, bordure droite)** :
- En-tête : logo dégradé (initiale de la marque) + nom de marque + « CRM IMMOBILIER ».
- Nav (icône + label, item actif = fond accent, texte blanc, `border-radius:11px`) : Tableau de bord, Prospects, Biens, Kanban, Agenda.
- Carte « Objectif mensuel » (cliquable → modale d'édition) : libellé « X ventes sur Y » + barre de progression (dégradé accent, largeur = %).
- Bloc profil (cliquable → panneau Compte) : avatar « CM », « Camille Mercier », libellé de rôle, chevron.

**Topbar (blanche)** : titre de l'écran (gauche) ; à droite : recherche (input réel, filtre l'écran courant), cloche de notifications (badge + panneau), bouton « + Créer » (accent, libellé contextuel selon l'écran).

### 4. Tableau de bord
- 4 cartes KPI (Mandats actifs, Nouveaux prospects, Visites planifiées, Pipeline prévisionnel — la 4e en dégradé accent).
- 2 colonnes : « Kanban des affaires » (barres horizontales par étape) + « Visites à venir » (liste heure/jour/objet/prospect).

### 5. Prospects
- Barre d'outils : filtre par statut, tri (récents / nom A→Z / budget ↓ / budget ↑), compteur de résultats.
- Tableau (grille) : Prospect (avatar + nom + téléphone), Recherche, Budget, Statut (badge), chevron. Ligne cliquable → drawer détail. État vide géré.
- **Drawer détail prospect** (droite, 420px) : en-tête (avatar, nom, budget · recherche, bouton éditer, fermer) ; **statut cliquable** (pastilles Nouveau → Qualifié → Visite → Offre → Compromis, changement libre dans les deux sens) ; **Coordonnées** (téléphone, email, adresse) ; **Visites liées** (cliquables → édition) + « Planifier » ; **Documents (GED)** (liste : icône, nom, badge de type, date, suppression + bouton « Ajouter ») ; **Offres / contractualisation** (biens où ce prospect a une offre, avec l'étape). Actions bas : « Modifier la fiche », « Planifier ».

### 6. Biens
- Barre d'outils : filtre statut (Disponible/Sous offre/Vendu), filtre publication (Toutes/En ligne/Brouillon), tri par prix, compteur. État vide géré.
- Grille de cartes (3 colonnes) : bandeau photo (dégradé placeholder) avec réf, badge statut, badge publication (En ligne/Brouillon) ; prix, titre, ville, méta (pièces/surface/chambres). Carte cliquable → drawer fiche.
- **Drawer fiche bien** (droite, 560px) : galerie photos (`<image-slot>` → uploader), prix + badge statut + bascule Publié/Non publié, **caractéristiques** (surface, pièces, chambres, SdB, étage, DPE), **description**, **marge agence (%)**, **statut du bien** (pastilles cliquables), **parcours de contractualisation** (étapes Offre reçue → Offre acceptée → Compromis signé → Acte définitif, cliquables), **offre liée à un prospect** (select). Actions : « Modifier », « Partager par mail au client » (ouvre un `mailto` pré-rempli). Un bien publié alimente le **site public** (à implémenter côté site).

### 7. Kanban
- Colonnes par étape (Nouveau, Qualifié, Visite, Offre, Compromis) avec compteur. Cartes prospect **draggables** entre colonnes (drag-and-drop → change l'étape). Carte cliquable → drawer prospect.

### 8. Agenda
- En-tête : bascule **Semaine / Mois** (segmented), libellé de période, bouton **Connecter Google Agenda** (simulé : bascule un état « connecté » avec email).
- **Vue semaine** : grille créneaux horaires (08:00→20:00) × 5 jours (Lun–Ven). Événements draggables dans un créneau précis (drop → change jour + heure). Clic sur événement → édition.
- **Vue mois** : calendrier (juillet 2026 en démo) ; événements en pastilles, draggables sur un autre jour ; clic → édition.
- **Création/édition de visite** : modale (prospect, objet, jour, heure) + suppression. Une visite est liée à un prospect (apparaît dans sa fiche).

### 9. Panneau Compte (façon réglages Claude)
Overlay centré `900×604`, nav latérale gauche + contenu droite. Onglets selon le rôle :
- **Profil** (tous) : nom, email, téléphone, rôle (lecture seule), agence.
- **Abonnement** (client) : carte formule (dégradé accent) « Pro · Mensuel/Annuel », prix + échéance, boutons « Passer à l'annuel (‑10 %) » et « Résilier ». En annuel : message d'économie.
- **Facturation** (client) : moyen de paiement (carte •••• 4242 + Modifier), liste de factures (mois, montant, PDF).
- **Marque blanche** (client) : champ « Nom de la marque » **modifiable en direct** (met à jour logo + nom dans toute l'app et sur l'écran de connexion) + aperçu du logo. La couleur d'accent est un réglage de thème.
- Pour un **invité** : seul « Profil » ; message « facturation gérée par le titulaire ».
- Bas de nav : « Se déconnecter ».

### 10. Notifications
Cloche → badge (nb non-lues) + panneau (position absolue sous la cloche, 344px) : titre, « Tout marquer lu », liste (pastille colorée par type, titre, texte, horodatage). Types : lead, visite, offre, document.

---

## Facturation & prorata (important)
Passage **mensuel → annuel** sans surfacturation : le temps déjà payé sur le mois en cours est **crédité au prorata**.
- Mensuel : 49 €/mois. Annuel : 529,20 €/an (‑10 % vs 12×49).
- Modale de confirmation affichant : prix annuel (529,20 €), **crédit prorata** du mois en cours (−29,40 € dans l'exemple), **à régler aujourd'hui** (499,80 €), puis 529,20 €/an aux échéances suivantes.
- En production : **utiliser la proration native de Stripe** (`proration_behavior`) lors du changement de plan — ne pas recoder le calcul à la main. Les montants du prototype sont illustratifs.

## Interactions & comportements
- Navigation par onglets via la barre latérale (state `active`).
- Drawers (prospect, bien) et overlays (compte, admin, login) : fond semi-opaque cliquable pour fermer ; animations `ov-in` (fade), `dr-in` (slide depuis la droite), `md-in` (pop). Durées 0,18–0,25 s.
- Recherche : filtre l'écran courant (prospects : nom/tél/email/recherche ; biens : titre/ville/réf). Se combine avec filtres + tri.
- Drag-and-drop : Kanban (colonnes) et Agenda (créneaux/jours) via HTML5 DnD (`draggable`, `onDragStart`/`onDragOver`/`onDrop`).
- Formulaires : modale unique multi-usage (créer/éditer prospect, bien, visite, document, autoriser client, changer de plan) ; champ description obligatoire pour un bien.
- Ordre des z-index : contenu < notif (55/60) < compte (70) < modale (80) < console admin (90) < login (100).

## State management (prototype → à mapper sur de vraies données)
State clés dans la classe `Component` : `authed`, `role` (`admin`|`client`|`invite`), `plan`, `brandName`, `active` (écran), `selectedId` (prospect), `selectedBienId`, `modal`/`modalMode`/`editId`, `accountOpen`/`accountTab`, `notifOpen`, `notifs`, `agendaView`, `gcal`, `query`, filtres (`pFilter`,`pSort`,`bFilter`,`bPub`,`bSort`), `goalDone`/`goalTarget`, et les collections `prospects`, `biens`, `visites`, `clients`.

Entités backend suggérées : `User`(role, accountId), `Account`(agence, branding, plan, statut abonnement, membres), `Prospect`(coordonnées, stage, documents[]), `Property/Bien`(caractéristiques, description, marge, published, photos[], offerProspectId, contractStep), `Visit`(date, heure, prospectId), `Document`(type, fichier), `Invoice`, `PaymentMethod`, `Notification`.

## Design tokens
- **Police** : `Manrope` (400/500/600/700/800), Google Fonts. Chiffres/titres en 800, `letter-spacing` négatif léger sur les gros titres.
- **Accent** (par défaut, bleu océan) : `#2563eb` → `#38bdf8` (dégradé 135°). Le prototype expose 5 palettes d'accent : indigo `#5b4bff/#8f6cff`, émeraude `#0ea472/#34d399`, océan `#2563eb/#38bdf8`, corail `#f5623c/#ff8a5b`, graphite `#111827/#4b5563`. Prévoir l'accent comme variable de thème (marque blanche).
- **Fonds** : app `#f4f4f7`, cartes/surfaces `#ffffff`, gris doux `#faf9fc`, séparateurs `#f0eff4`/`#f6f5f9`, bordures `rgba(20,20,31,.05–.08)`.
- **Texte** : principal `#14141f`, secondaire `#6b6b7b`, atténué `#8a8a9a`/`#9a9aac`/`#a0a0b0`.
- **Statuts** : succès `#12a150` (bg `#e9f7ef`), attention `#e07a1c` (bg `#fff2e6`), danger `#e5484d` (bg `#feeceb`), neutre `#6b6b7b` (bg `#eef0f3`).
- **Rayons** : cartes `16px` (réglable 2–26 px), pilules/badges `6–11px`, avatars `10–14px`, plein rond `999px`.
- **Densité** : padding contenu ≈ `26–34px`, gap grilles `16–24px` (réglable compact/confort/spacieux).
- **Ombres** : cartes `0 1px 3px rgba(0,0,0,.06)`, survol `0 14px 30px -14px rgba(20,20,31,.25)`, overlays `0 30px 70px -20px rgba(0,0,0,.4)`.
- **Icônes** : jeu de traits façon Feather, `stroke-width` ≈ 2,1 (SVG inline). Utiliser une lib d'icônes (lucide/feather) côté cible.

## Assets
- Aucune image bitmap : photos de biens = **placeholders** (`<image-slot>`) et dégradés. À remplacer par un vrai uploader + stockage.
- Avatars = initiales sur fond coloré. Logo = initiale de la marque sur dégradé accent (pas de fichier logo).
- Logo Google (SVG multicolore) inline dans le bouton « Connecter Google Agenda ».

## Fichiers
- `CRM Immobilier.dc.html` — prototype complet (template + logique `Component`).
- `image-slot.js` — composant de dépôt d'image (référence pour l'uploader).
