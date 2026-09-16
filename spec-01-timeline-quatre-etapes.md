# Spec 01 — Timeline des quatre étapes de commande

**Produit** : plateforme de livraison de repas (exercice Noé, cadre Deliveroo)
**Feature parente** : Suivi de commande en direct — prototype de test
**Statut** : v1 — document vivant
**Date** : 16 septembre 2026
**Specs sœurs** : [Spec 02 — Compte à rebours ETA] · [Spec 03 — Carte de progression]
**Document amont** : `eta-livrable-v6.html` — cadrage de la feature ETA sur la page restaurant

---

## Périmètre en une phrase

> Cette spec couvre **l'ossature de l'écran affiché après le paiement : quatre étapes de commande nommées, qui avancent seules sur minuteurs, dans un prototype entièrement simulé destiné aux sessions de test utilisateur**. Et rien d'autre.

C'est la spec socle : les deux specs sœurs viennent se poser dessus. Le pilotage des sessions par le facilitateur y figure parce qu'il concerne un **utilisateur interne de la même fonctionnalité**, pas un mécanisme de plus.

### Hors périmètre, avec propriétaire

| Élément | Propriétaire |
|---|---|
| Temps restant, fourchette, décompte, ré-estimation en cas de retard | **Spec 02 — Compte à rebours ETA** |
| Carte, tracé, pastille du livreur, animation de progression | **Spec 03 — Carte de progression** |
| Calcul réel de l'ETA, API, cache, secteurs de livraison | `eta-livrable-v6.html`, non modifié |
| Paiement, récapitulatif de commande, montant, facture | Composants existants, non modifiés |
| Notifications push et e-mails de suivi | Hors chantier |
| Chat livreur, contact support, pourboire, annulation, notation | Hors chantier |
| Statuts réels de commande, position réelle du livreur | Feature de production, non spécifiée |
| Recrutement des participants, guide d'entretien, analyse | Équipe recherche |

---

## 1. Context & User Persona

### Le problème

Le paiement débouche aujourd'hui sur un écran de confirmation statique : « Commande confirmée ». Ensuite, plus rien ne bouge. L'utilisateur qui veut savoir où en est sa commande n'a que trois options : rafraîchir, attendre, ou contacter le support.

**Avertissement de rigueur.** Aucune donnée de discovery n'a été fournie sur ce problème précis. Le poids business — contacts support « où est ma commande ? », fréquence de retour sur l'écran, abandon — **n'est pas chiffré et reste un point ouvert**. Le seul élément documenté en amont est que l'incertitude sur le délai fait quitter la page restaurant *avant* commande (`eta-livrable-v6.html`) : c'est un problème voisin, pas le même. Cette feature répond à une hypothèse, pas à une mesure.

### Pourquoi un prototype plutôt qu'une maquette

La feature repose sur du mouvement : des étapes qui avancent toutes seules. Une maquette statique n'en montre rien, et un prototype Figma animé coûterait plus cher que la version codée. Le prototype simulé est le support de test, pas une étape vers la production.

### Acteur et bénéficiaire

| Rôle | Qui | Ce qu'il fait / ce qu'il gagne |
|---|---|---|
| **Acteur** | Le client qui vient de payer | Il regarde l'écran ; il n'a aucune action à faire |
| **Bénéficiaire** | Le même client | Il sait ce qui se passe sans avoir à demander |
| **Bénéficiaire indirect** | Le support client | Moins de sollicitations « où est ma commande ? » |
| **Utilisateur interne** | Le facilitateur des sessions | Il déroule un scénario et remet à zéro entre deux participants, sans aide technique |
| **Utilisateur interne** | L'équipe produit / recherche | Elle reconstruit a posteriori ce que le participant avait sous les yeux |

### Deux personas à distinguer

- **Le primo-commandant** : première commande sur la plateforme, aucune référence de ce qu'est un délai normal. C'est lui qui décide si les quatre étapes sont lisibles **sans apprentissage**.
- **Le client habitué** : son attente est déjà calibrée. Il lit les étapes en diagonale — ce qui est en soi une information sur leur utilité.

Un panel qui ne recrute que des habitués ne dira rien sur la lisibilité.

### Objectif de test servi par cette spec

**O1 — Lisibilité des quatre étapes.** Le participant comprend-il où en est sa commande et ce qui se passe à chaque étape, sans explication ? Mesuré par grille d'observation et reformulation en entretien, **pas par event** (voir Tracking).

---

## 2. User Stories

| ID | User story |
|---|---|
| **US1.1** | En tant que **client venant de payer**, quand j'arrive sur l'écran qui suit le paiement, je veux voir où en est ma commande parmi quatre étapes nommées, afin de **savoir ce qui se passe sans avoir à demander à quelqu'un**. |
| **US1.2** | En tant que **client en attente**, quand une étape est franchie, je veux que l'écran le montre sans que j'aie à le rafraîchir, afin de **cesser de vérifier**. |
| **US1.3** | En tant que **facilitateur de session**, quand j'enchaîne les participants, je veux dérouler un scénario complet en moins de dix minutes et remettre le prototype à zéro, afin de **tenir le planning de la journée sans intervention technique**. |

---

## 3. Releases

| Release | Contenu | Justification |
|---|---|---|
| **R1 — Le socle testable** | Les quatre étapes, leur progression automatique sur minuteurs, l'état final, la sélection de scénario et la remise à zéro. | En dessous, il n'y a pas d'écran à montrer et les specs 02 et 03 n'ont rien sur quoi se poser. |
| **R2 — Le confort de session** | Console facilitateur (sauter une étape, avancer le temps, changer de scénario en cours), reprise de l'état après fermeture complète de l'app. | Permet de rattraper un participant lent, mais n'apporte aucun apprentissage supplémentaire. |

R1 est un vrai minimum : deux scripts et un bouton de remise à zéro.

---

## 4. Acceptance Criteria

### US1.1 — Les quatre étapes sont lisibles

| # | Critère |
|---|---|
| AC1.1.1 | **GIVEN** un paiement validé dans le prototype, **WHEN** l'écran suivant s'affiche, **THEN** les quatre étapes *Confirmée*, *En préparation*, *En livraison*, *Livrée* sont visibles simultanément, **AND** *Confirmée* est marquée comme atteinte, **AND** les trois autres sont visiblement à venir. |
| AC1.1.2 | **GIVEN** une étape courante, **WHEN** le participant lit l'écran, **THEN** une phrase en langage courant décrit ce qui se passe (ex. *En préparation* → « Le restaurant prépare votre commande »), **AND** aucun statut technique, identifiant ou nom de service interne n'apparaît. |
| AC1.1.3 | **GIVEN** l'écran de suivi, **WHEN** le participant le parcourt, **THEN** le récapitulatif de commande existant (articles, montant, adresse) reste accessible sous la timeline, **AND** il n'est ni modifié ni redessiné par cette spec. |
| AC1.1.4 | **GIVEN** l'écran de suivi, **WHEN** le participant tape sur une étape à venir ou déjà franchie, **THEN** rien ne se produit — pas de navigation, pas de message d'erreur, pas de saut d'étape. |

### US1.2 — La progression se voit sans action

| # | Critère |
|---|---|
| AC1.2.1 | **GIVEN** l'écran ouvert, **WHEN** le minuteur d'une étape arrive à échéance, **THEN** l'étape suivante devient l'étape courante sans action du participant, **AND** l'étape précédente passe à l'état « franchie » sans disparaître de l'écran. |
| AC1.2.2 | **GIVEN** un changement d'étape, **WHEN** il se produit, **THEN** il est perceptible sans fixer l'écran, **AND** il ne déplace aucun autre contenu de la page. |
| AC1.2.3 | **GIVEN** la dernière étape, **WHEN** *Livrée* devient courante, **THEN** les quatre étapes apparaissent franchies, **AND** aucun minuteur ne continue de tourner, **AND** aucune cinquième étape n'apparaît. |
| AC1.2.4 | **GIVEN** un scénario en cours, **WHEN** le participant recharge la page, verrouille le téléphone ou met l'app en arrière-plan puis revient, **THEN** l'écran affiche l'étape correspondant au temps réellement écoulé, **AND** ne reprend pas là où il s'était arrêté. |

### US1.3 — Le pilotage de session

| # | Critère |
|---|---|
| AC1.3.1 | **GIVEN** un scénario terminé, **WHEN** le facilitateur déclenche la remise à zéro, **THEN** le prototype revient à l'état d'avant paiement, **AND** aucune trace de la session précédente n'est visible par le participant suivant. |
| AC1.3.2 | **GIVEN** le lancement d'une session, **WHEN** le facilitateur choisit un scénario, **THEN** il sélectionne *nominal* ou *retard* avant de passer la main, **AND** le choix n'est plus modifiable une fois le scénario lancé (R1). |
| AC1.3.3 | **GIVEN** un scénario lancé, **WHEN** on chronomètre son déroulé complet, **THEN** il ne dépasse pas 10 minutes réelles. |
| AC1.3.4 | **GIVEN** le prototype ouvert, **WHEN** le faux paiement échoue ou qu'une erreur survient avant l'écran de suivi, **THEN** l'écran de suivi s'affiche quand même avec le scénario choisi — une session ne doit jamais s'arrêter sur un incident du faux paiement. |

---

## 5. Management Rules

### Les quatre étapes et leurs libellés

| Étape | Titre affiché | Phrase d'explication |
|---|---|---|
| 1 | Confirmée | « Le restaurant a reçu votre commande » |
| 2 | En préparation | « Le restaurant prépare votre commande » |
| 3 | En livraison | « Votre commande est en route » |
| 4 | Livrée | « Bon appétit » |

- Les libellés sont fixés par le prototype, jamais composés à l'écran : deux participants voient exactement le même texte.
- L'ordre est strictement linéaire. Aucun retour en arrière, aucun saut, aucune étape conditionnelle.

### Correspondance entre les trois durées du modèle v6 et les quatre étapes

| Étape | Durée qu'elle porte |
|---|---|
| Confirmée | 1 min forfaitaire — le temps que le restaurant accuse réception |
| En préparation | La durée de **préparation** |
| En livraison | **Retrait + trajet** |
| Livrée | — |

Dans la réalité, le retrait du livreur chevauche la préparation. Le prototype ne modélise pas ce chevauchement : le participant voit des étapes, pas une décomposition, et le total reste celui du modèle v6. Simplification assumée, à ne pas reporter telle quelle dans la future feature de production.

### Les deux scripts — définition partagée

> **Ces deux tableaux sont la définition de référence des scénarios. Ils sont recopiés à l'identique dans les specs 02 et 03. Toute modification ici doit être répercutée dans les deux autres.**

**S1 — nominal.** Préparation 18 + retrait 6 + trajet 12 = 36 min de centrale.

| T simulé | Étape |
|---|---|
| 0 min | Confirmée |
| +1 min | En préparation |
| +19 min | En livraison |
| +37 min | Livrée |

**S2 — retard.** Départ identique. À T+20, la préparation est révisée de 18 à 30 min → centrale 48 min.

| T simulé | Étape | Événement |
|---|---|---|
| 0 min | Confirmée | — |
| +1 min | En préparation | — |
| +20 min | En préparation | Ré-estimation (spec 02) |
| +31 min | En livraison | — |
| +49 min | Livrée | — |

### La compression du temps — définition partagée

- Facteur par défaut **×6** : une minute simulée s'écoule en 10 secondes réelles. Paramétrable.
- Le facteur s'applique uniformément. Aucune étape n'est accélérée davantage qu'une autre, sinon les durées relatives entre étapes ne sont plus celles qu'on veut faire percevoir.
- Durée réelle : S1 = **6 min 10**, S2 = **8 min 10**.
- **Le participant doit être informé de l'accélération au brief de session.** Sans cette information, on mesure sa réaction à un dispositif accéléré, pas à une livraison. Conséquence assumée : le test ne dira rien de l'anxiété liée à une attente longue.

### Les exclusions nommées

- L'écran de paiement et son résultat **existent déjà** dans le prototype : cette spec ne les modifie pas, elle remplace seulement ce qui vient après.
- Le récapitulatif de commande **existe déjà** sur l'écran de confirmation actuel : il est conservé tel quel sous la timeline.
- Le modèle de calcul de l'ETA **appartient au livrable v6** : cette spec ne le consomme même pas, elle n'affiche aucune durée.

### Performance

- L'écran s'affiche immédiatement après le paiement. La timeline ne bloque jamais son rendu.
- L'emplacement des éléments confiés aux specs 02 et 03 est **réservé à sa taille finale dès l'affichage**, pour qu'aucun contenu ne soit poussé vers le bas quand ils arrivent (même règle que le livrable v6).

---

## 6. Edge Cases

| Situation | Comportement attendu |
|---|---|
| Le participant recharge la page en cours de scénario | Le scénario reprend à l'étape correspondant au temps écoulé, pas au début. |
| Le téléphone se verrouille pendant le scénario | Les minuteurs continuent. Au retour, l'écran montre l'étape correcte, pas celle d'avant le verrouillage. |
| Le participant reste sur l'écran après *Livrée* | L'écran reste figé sur l'état final. Aucun minuteur ne repart. |
| Le participant revient en arrière vers l'écran de paiement | Le retour est neutralisé : le scénario ne redémarre pas et n'est pas dupliqué. |
| Deux participants s'enchaînent sans remise à zéro | Le second voit l'écran final du premier. **Risque n°1 de la journée** : la remise à zéro doit être à portée de main du facilitateur, pas dans un menu. |
| Connexion réseau coupée en salle de test | Le scénario continue : il ne dépend d'aucun appel. Une session ne s'arrête jamais à cause du wifi de la salle. |
| Le prototype est resté ouvert deux heures entre deux sessions | Au lancement d'un nouveau scénario, l'état repart de zéro quel que soit le temps écoulé. |
| Le facilitateur lance le mauvais scénario | R1 : remise à zéro et relance, coût 30 secondes. R2 : changement en cours de scénario. |
| Le participant commente l'accélération (« ça va trop vite ») | Prévu. C'est une observation sur le dispositif, pas sur la feature : à noter séparément dans la grille. |
| Le participant demande à revoir une étape franchie | Aucune interaction prévue. À noter comme demande, pas à implémenter dans cette vague. |

---

## 7. Designs & Workflow

**Aucune maquette Figma** — c'est la décision qui a motivé ce prototype. La liste d'états ci-dessous est le livrable attendu du côté fabrication.

| État | Ce qu'il montre |
|---|---|
| E1 | Confirmée atteinte, trois étapes à venir |
| E2 | En préparation courante |
| E3 | En livraison courante |
| E4 | Livrée, quatre étapes franchies |
| E5 | Reprise : écran rouvert en cours de scénario, à l'étape correcte |

**Écran non dessiné que la spec suppose** : la sélection de scénario et la remise à zéro côté facilitateur (E6). Aucun participant ne le voit, mais sans lui AC1.3.1 et AC1.3.2 ne sont pas satisfaits.

Pas de diagramme de flux : la logique est linéaire, sans rôle ni permission.

---

## 8. Tracking

| Event | Trigger | Propriétés clés | Métrique servie |
|---|---|---|---|
| `tracking_screen_viewed` | À l'affichage de l'écran après le paiement | `scenario_id`, `persona` | Contrôle : chaque session a bien démarré sur le bon scénario |
| `tracking_step_changed` | À chaque passage d'étape | `from_step`, `to_step`, `elapsed_simulated_minutes` | **M1** — reconstruction de la timeline de session, pour caler les verbatims sur ce que le participant avait sous les yeux |
| `tracking_screen_exited` | Quand le participant quitte l'écran, le recharge ou revient en arrière | `step_at_exit`, `elapsed_simulated_minutes` | **M2** — signal de besoin de réassurance : quitter l'écran de suivi pendant l'attente est le comportement qu'on cherche à faire disparaître |

**Deux métriques, trois events.** Les specs 02 et 03 en ajoutent chacune un, sans dupliquer ceux-ci : elles enrichissent `tracking_screen_viewed` de leurs propres propriétés plutôt que de créer un second event d'ouverture d'écran.

**L'objectif O1 n'apparaît pas ici.** La lisibilité se mesure par la capacité du participant à reformuler chaque étape, en entretien. Créer un event pour la simuler donnerait un chiffre qui ne mesure rien.

---

## 9. Rollout Plan

| Phase | Audience | Timing | État | Ce qu'on valide | Condition de passage |
|---|---|---|---|---|---|
| **Alpha** | 2 à 3 personnes de l'équipe produit | J-3 | R1, scénario nominal seul | Les minuteurs tiennent, la remise à zéro fonctionne, aucun texte de dev ne traîne | Un S1 joué de bout en bout sans intervention |
| **Beta** | 2 participants externes | J-1 | R1 complet | Durée réelle de session, compréhension du brief d'accélération, robustesse de l'enchaînement | Deux sessions consécutives sans remise à zéro manquée et sous 10 minutes |
| **Stable** | Tous les participants recrutés | J | R1, R2 si prêt | L'objectif O1 | — |

La Beta n'est pas une formalité : c'est là qu'on découvre si l'accélération casse la crédibilité du dispositif — avant d'avoir brûlé la moitié du panel.

---

## 10. Testing Plan

**Flows critiques pour le business, à vérifier avant chaque journée de sessions :**

1. **Paiement → écran de suivi.** Le chemin d'entrée ne doit jamais tomber (AC1.3.4). C'est le seul défaut qui ferait perdre une session entière.
2. **La remise à zéro entre deux participants.** Un participant qui démarre sur l'écran final du précédent invalide sa session.
3. **Les deux scripts de bout en bout, chronomètre en main**, pour confirmer les 6 min 10 et 8 min 10.

**Cœur fonctionnel** : enchaînement des quatre étapes, état final figé, reprise après rechargement et verrouillage.

**Events** : les trois events se déclenchent ; `elapsed_simulated_minutes` porte bien le temps **simulé** et non le temps réel ; `scenario_id` distingue S1 de S2, sans quoi les sessions ne seront pas séparables à l'analyse.

**UX** : le changement d'étape se voit sans fixer l'écran et ne déplace aucun contenu.

**Sur les appareils réels de la session**, pas seulement au bureau : le comportement des minuteurs au verrouillage est le point le plus susceptible de différer.

---

## 11. Points ouverts

| # | Constat | Options | Conséquence si personne ne tranche | Recommandation |
|---|---|---|---|---|
| **P1.1** | La compression ×6 rend la progression visiblement rapide. | (a) ×6 annoncée au brief — (b) Temps réel, test limité aux 10 premières minutes — (c) Sauts pilotés par le facilitateur | On mesure la réaction à un dispositif accéléré en croyant mesurer la réaction à une livraison. | **(a)**, avec mention explicite au brief. Seule option qui garde le scénario complet dans une session courte. À réévaluer après la Beta. |
| **P1.2** | Quatre étapes est une hypothèse, pas un résultat de discovery. Un participant peut en vouloir une cinquième (« le livreur est arrivé au restaurant »). | (a) Garder quatre et noter les demandes — (b) Tester une variante à cinq étapes | Si la demande revient chez la majorité des participants, la vague suivante devra reposer la question depuis zéro. | **(a)**. Une variante supplémentaire coûte un doublement du panel pour une question secondaire. |
| **P1.3** | Le poids business du problème n'est pas chiffré. | (a) Extraire la donnée côté support avant le test — (b) Assumer l'hypothèse | Feature priorisée sur une intuition, et aucun point de comparaison après lancement. | **(a)** si la donnée existe — même approximative, elle changera l'arbitrage sur la spec 03. |
| **P1.4** | Nombre de participants et répartition primo-commandants / habitués non fixés. | — | Un panel déséquilibré rend O1 non concluant. | Au minimum 4 de chaque, répartis sur les deux scripts. |
