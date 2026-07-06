# Cahier de tests manuels — Aparté

Ce cahier couvre **tous les cas d'usage** ayant un test E2E automatisé. Chaque
cas est rédigé sous forme de *user story* (En tant que / Je veux / Afin de)
avec des **critères d'acceptation** vérifiables à la main.

## Comptes de test (mot de passe : `demodemo`)

| Email | Rôle | État | Usage |
|---|---|---|---|
| `camille@agence.fr` | Titulaire (client) | Abonné | Compte de démo principal |
| `admin@aparte.fr` | Admin SaaS | — | Console d'administration |
| `trial@aparte.fr` | Titulaire | Essai en cours | Parcours d'essai |
| `locked@aparte.fr` | Titulaire | Essai expiré, sans abonnement | Paywall / gating |
| `sandbox@aparte.fr` | Titulaire | Abonné | Bac à sable (catalogue) |
| `crud@aparte.fr` | Titulaire | Abonné | Bac à sable (CRUD) |

> Prérequis local : `pnpm dev` en cours. Pour la facturation réelle, lancer aussi
> `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

---

## 1. Authentification & rôles

### CU-1.1 — Garde d'accès
**En tant que** visiteur non connecté, **je veux** être redirigé vers la connexion **afin de** protéger les données.
- **Étapes** : ouvrir `/prospects` (ou tout écran CRM) sans être connecté.
- **Critères d'acceptation** :
  - [ ] Redirection automatique vers `/login`.
  - [ ] Le titre « Connexion à votre espace » est affiché.

### CU-1.2 — Connexion réussie
**En tant que** titulaire, **je veux** me connecter **afin d'**accéder à mon CRM.
- **Étapes** : sur `/login`, saisir `camille@agence.fr` / `demodemo`, cliquer « Se connecter ».
- **Critères d'acceptation** :
  - [ ] Redirection vers `/dashboard`.
  - [ ] Le nom « Camille Mercier » apparaît dans la barre latérale.

### CU-1.3 — Cloisonnement de l'admin
**En tant qu'**admin SaaS, **je veux** accéder à ma console **afin de** gérer les espaces, sans voir le CRM.
- **Étapes** : se connecter avec `admin@aparte.fr`.
- **Critères d'acceptation** :
  - [ ] Arrivée sur `/admin` (Console SaaS), pas sur le CRM.
  - [ ] Un client (`camille`) qui tente `/admin` est renvoyé sur `/dashboard`.

---

## 2. Navigation

### CU-2.1 — Naviguer entre les modules
**En tant que** titulaire, **je veux** passer d'un écran à l'autre **afin de** travailler.
- **Étapes** : cliquer successivement Tableau de bord, Prospects, Biens, Kanban, Agenda.
- **Critères d'acceptation** :
  - [ ] L'URL change à chaque clic (`/dashboard`, `/prospects`, …).
  - [ ] Le titre de la topbar reflète l'écran courant.
  - [ ] Un indicateur de chargement apparaît brièvement sur l'item cliqué.

---

## 3. Prospects

### CU-3.1 — Lister, filtrer, rechercher
**En tant que** titulaire, **je veux** retrouver un prospect **afin de** le suivre.
- **Étapes** : ouvrir Prospects ; filtrer par statut « Compromis » ; taper « Sophie » dans la recherche.
- **Critères d'acceptation** :
  - [ ] La liste affiche les prospects de l'espace et le compteur de résultats.
  - [ ] Le filtre « Compromis » ne montre que Paul Girard (1 résultat).
  - [ ] La recherche « Sophie » montre Sophie Leroy et masque les autres.

### CU-3.2 — Consulter une fiche
**En tant que** titulaire, **je veux** ouvrir une fiche **afin de** voir coordonnées et documents.
- **Étapes** : cliquer sur la ligne « Marc Dubois ».
- **Critères d'acceptation** :
  - [ ] Le drawer s'ouvre avec téléphone, email, adresse.
  - [ ] La section « Documents (GED) » liste ses pièces.

### CU-3.3 — Cycle de vie complet (statut, édition, GED, suppression)
**En tant que** titulaire, **je veux** créer et gérer un prospect **afin de** tenir mon pipeline à jour.
- **Étapes** :
  1. « Nouveau prospect » → saisir un nom → Enregistrer.
  2. Ouvrir sa fiche → cliquer la pastille « Qualifié ».
  3. « + Ajouter » (GED) → joindre un fichier → Ajouter.
  4. « Modifier la fiche » → changer le nom → Enregistrer.
  5. « Supprimer » → confirmer.
- **Critères d'acceptation** :
  - [ ] Le prospect apparaît dans la liste après création.
  - [ ] Le statut passe à « Qualifié » (pastille active).
  - [ ] Le document uploadé apparaît dans la GED et est cliquable (ouverture).
  - [ ] Le nom modifié est reflété dans la fiche.
  - [ ] Après suppression, le prospect n'apparaît plus.

---

## 4. Biens

### CU-4.1 — Lister & filtrer
**En tant que** titulaire, **je veux** filtrer mes biens **afin de** cibler.
- **Étapes** : ouvrir Biens ; filtre publication « Brouillon ».
- **Critères d'acceptation** :
  - [ ] La grille et le compteur s'affichent.
  - [ ] « Brouillon » ne montre que les biens non publiés.

### CU-4.2 — Cycle de vie complet
**En tant que** titulaire, **je veux** gérer une annonce **afin de** la commercialiser.
- **Étapes** :
  1. « Nouvelle annonce » → titre + prix + **description (obligatoire)** → Enregistrer.
  2. Ouvrir la fiche → basculer « Non publié » → « Publié ».
  3. Cliquer le statut « Sous offre » puis l'étape « Offre reçue ».
  4. « Partager par mail au client » → vérifier la modale → Annuler.
  5. « Modifier » → changer le titre → Enregistrer.
  6. « Supprimer » → confirmer.
- **Critères d'acceptation** :
  - [ ] Impossible d'enregistrer un bien sans description.
  - [ ] Le badge de publication passe à « En ligne ».
  - [ ] Statut = « Sous offre » et parcours = « Offre reçue » persistés.
  - [ ] La modale de partage affiche le bien et le champ destinataire.
  - [ ] Le titre modifié est reflété ; après suppression, le bien disparaît.

---

## 5. Kanban

### CU-5.1 — Vue pipeline
**En tant que** titulaire, **je veux** voir mon pipeline **afin de** piloter mes affaires.
- **Critères d'acceptation** :
  - [ ] Une colonne par étape (Nouveau, Qualifié, Visite, Offre, Compromis).
  - [ ] Chaque prospect est dans la colonne de son statut.
  - [ ] Cliquer une carte ouvre la fiche prospect.

### CU-5.2 — Déplacer une carte (drag-and-drop)
**En tant que** titulaire, **je veux** glisser une carte **afin de** changer son statut rapidement.
- **Étapes** : glisser une carte de « Nouveau » vers « Qualifié ».
- **Critères d'acceptation** :
  - [ ] La carte se retrouve dans la colonne cible.
  - [ ] Le statut du prospect est mis à jour (visible aussi dans sa fiche).

---

## 6. Agenda

### CU-6.1 — Vues & connexion Google
**En tant que** titulaire, **je veux** consulter mon agenda **afin de** planifier.
- **Critères d'acceptation** :
  - [ ] Vue semaine : créneaux de 08:00 à 20:00.
  - [ ] Bascule « Mois » affiche le week-end (Sam/Dim).
  - [ ] « Connecter Google Agenda » bascule en état connecté (simulé).

### CU-6.2 — Replanifier par glisser-déposer
**En tant que** titulaire, **je veux** déplacer une visite **afin de** la reprogrammer.
- **Étapes** : glisser un événement d'un créneau (ex. 10:00) vers un autre (14:00).
- **Critères d'acceptation** :
  - [ ] L'événement change de créneau et l'horaire est mis à jour.

### CU-6.3 — Éditer / supprimer une visite & naviguer
**En tant que** titulaire, **je veux** modifier ou annuler une visite **afin de** gérer mes rendez-vous.
- **Étapes** : cliquer une visite → modifier l'objet → Enregistrer ; puis cliquer → Supprimer ; puis « › » (semaine suivante) et « Mois ».
- **Critères d'acceptation** :
  - [ ] L'objet modifié est enregistré.
  - [ ] La visite supprimée disparaît de l'agenda.
  - [ ] La navigation change la période affichée.

---

## 7. Notifications

### CU-7.1 — Consulter & tout marquer lu
**En tant que** titulaire, **je veux** gérer mes notifications **afin de** rester informé.
- **Étapes** : cliquer la cloche ; cliquer « Tout marquer lu ».
- **Critères d'acceptation** :
  - [ ] Le panneau liste les notifications ; un badge indique les non-lues.
  - [ ] Après « Tout marquer lu », le badge disparaît.

### CU-7.2 — Deep-link contextuel
**En tant que** titulaire, **je veux** cliquer une notification **afin d'**arriver au bon endroit.
- **Critères d'acceptation** :
  - [ ] Notif prospect → écran Prospects + fiche ouverte.
  - [ ] Notif offre → écran Biens + fiche bien ouverte.
  - [ ] Notif visite → écran Agenda + visite ouverte.

---

## 8. Compte & marque blanche

### CU-8.1 — Onglets selon le rôle
**En tant que** titulaire, **je veux** accéder à mes réglages **afin de** gérer mon compte.
- **Critères d'acceptation** :
  - [ ] Onglets Profil, Abonnement, Facturation, Collaborateurs, Marque blanche.
  - [ ] Un invité ne voit que « Profil ».

### CU-8.2 — Marque blanche en direct
**En tant que** titulaire, **je veux** changer le nom de ma marque **afin de** personnaliser l'espace.
- **Étapes** : Marque blanche → modifier le nom.
- **Critères d'acceptation** :
  - [ ] La barre latérale reflète le nouveau nom **immédiatement**.

### CU-8.3 — Persistance des enregistrements
**En tant que** titulaire, **je veux** que mes modifications soient sauvegardées **afin de** les retrouver.
- **Étapes** : modifier le nom du profil → Enregistrer ; modifier la marque → Enregistrer ; **recharger la page**.
- **Critères d'acceptation** :
  - [ ] Le nom du profil est conservé après rechargement.
  - [ ] Le nom de marque est conservé (barre latérale) après rechargement.

---

## 9. Collaborateurs (licence multi-utilisateurs)

### CU-9.1 — Inviter puis retirer
**En tant que** titulaire, **je veux** inviter des collaborateurs **afin de** partager l'outil.
- **Étapes** : Compte → Collaborateurs → saisir un email → Inviter ; puis retirer.
- **Critères d'acceptation** :
  - [ ] Le titulaire est listé avec le badge « Titulaire ».
  - [ ] Après invitation : le collaborateur apparaît + un lien d'invitation est fourni + le compteur passe à « 1 / 3 ».
  - [ ] Après retrait : le collaborateur disparaît + compteur « 0 / 3 ».

### CU-9.2 — Limite de places
**En tant que** titulaire, **je veux** être limité à 3 collaborateurs **afin de** respecter mon offre.
- **Critères d'acceptation** :
  - [ ] À 3/3, le formulaire d'invitation est désactivé et un message invite à faire évoluer l'offre.

---

## 10. Facturation & abonnement (Stripe)

### CU-10.1 — Souscrire
**En tant que** titulaire sans abonnement, **je veux** choisir une formule **afin d'**activer mon espace.
- **Critères d'acceptation** :
  - [ ] L'onglet Abonnement propose « Formule mensuelle » (49 €) et « Formule annuelle » (529 €).
  - [ ] Le clic redirige vers le paiement sécurisé Stripe (retour visuel de chargement).

### CU-10.2 — Gérer le moyen de paiement
**En tant que** titulaire abonné, **je veux** modifier ma carte **afin de** garder mes paiements à jour.
- **Étapes** : Facturation → « Modifier ».
- **Critères d'acceptation** :
  - [ ] Ouverture du **Stripe Customer Portal** (carte via navigateur, factures, résiliation).
  - [ ] Au retour, la carte / les factures affichées sont **à jour** (jamais de fausse info).

### CU-10.3 — Passer de mensuel à annuel
**En tant que** titulaire, **je veux** changer de formule **afin d'**économiser.
- **Étapes** : depuis un abonnement mensuel, changer pour annuel (via le portail / carte test `4242 4242 4242 4242`).
- **Critères d'acceptation** :
  - [ ] Après le retour de Stripe, l'abonnement affiché passe à « Pro · Annuel ».

---

## 11. Essai gratuit & verrouillage (paywall)

### CU-11.1 — Période d'essai
**En tant que** nouveau client en essai, **je veux** essayer le produit **afin de** décider.
- **Étapes** : se connecter avec `trial@aparte.fr`.
- **Critères d'acceptation** :
  - [ ] L'encart de la barre latérale affiche « Période d'essai » + temps restant.
  - [ ] L'accès au CRM est complet.
  - [ ] Le bouton « S'abonner » ouvre le choix de formule.

### CU-11.2 — Essai expiré (paywall)
**En tant que** client dont l'essai est fini, **je veux** être invité à m'abonner **afin de** continuer.
- **Étapes** : se connecter avec `locked@aparte.fr`.
- **Critères d'acceptation** :
  - [ ] Le CRM reste **visible mais flouté** derrière un paywall (rappelle la valeur).
  - [ ] Le paywall propose les formules et suit l'utilisateur sur tous les écrans.
  - [ ] Souscrire réactive l'accès.

---

## 12. Onboarding

### CU-12.1 — Guide d'accueil
**En tant que** nouvel utilisateur, **je veux** un guide **afin de** prendre l'outil en main.
- **Étapes** : à la 1re connexion (ou Compte → Profil → « Revoir le guide d'accueil »).
- **Critères d'acceptation** :
  - [ ] Le guide met en lumière des éléments (spotlight) et affiche « Étape X sur N ».
  - [ ] « Suivant » / « Précédent » naviguent ; « Passer » ferme le guide.
  - [ ] Une fois terminé, il ne se relance pas automatiquement.

---

## 13. Console admin SaaS

### CU-13.1 — Vue d'ensemble
**En tant qu'**admin, **je veux** un tableau de bord **afin de** suivre l'activité.
- **Critères d'acceptation** :
  - [ ] KPIs : espaces clients, abonnements actifs, MRR estimé.
  - [ ] La liste des espaces clients s'affiche.

### CU-13.2 — Gérer un espace
**En tant qu'**admin, **je veux** autoriser/suspendre un espace **afin de** gérer les abonnés.
- **Étapes** : « + Autoriser un nouveau client » → renseigner → Créer ; puis Suspendre / Activer.
- **Critères d'acceptation** :
  - [ ] Le nouvel espace apparaît dans la liste (statut selon paiement).
  - [ ] « Suspendre » passe le statut à « Suspendu » ; « Activer » le repasse à « Actif ».

---

## 14. Provisioning & sécurité

### CU-14.1 — Création d'espace depuis la vitrine
**En tant que** site vitrine, **je veux** créer un espace via API **afin d'**onboarder un client.
- **Étapes** : `POST /api/provision` avec l'en-tête `x-provision-secret`.
- **Critères d'acceptation** :
  - [ ] Sans secret : réponse **401**.
  - [ ] Avec secret : espace créé + **essai 24 h** + lien d'invitation retourné.

### CU-14.2 — Isolation des données (multi-tenant)
**En tant que** titulaire, **je veux** ne voir que mes données **afin de** garantir la confidentialité.
- **Critères d'acceptation** :
  - [ ] Connecté sur un espace, les prospects/biens d'un **autre** espace ne sont **jamais** visibles.

---

> Correspondance avec l'automatisation : chaque cas ci-dessus a un test Playwright
> équivalent dans `e2e/` (51 tests unitaires + 49 E2E). Lancer : `pnpm test` puis `pnpm test:e2e`.
