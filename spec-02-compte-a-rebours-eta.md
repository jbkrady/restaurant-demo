# Spec 02 — Compte à rebours de l'ETA sur l'écran de suivi

**Produit** : plateforme de livraison de repas (exercice Noé, cadre Deliveroo)
**Feature parente** : Suivi de commande en direct — prototype de test
**Statut** : v1 — document vivant
**Date** : 16 septembre 2026
**Specs sœurs** : [Spec 01 — Timeline des quatre étapes] (dépendance) · [Spec 03 — Carte de progression]
**Document amont** : `eta-livrable-v6.html` — modèle de calcul et règles d'affichage de l'ETA

---

## Périmètre en une phrase

> Cette spec couvre **le temps restant affiché sur l'écran de suivi : une fourchette qui se décrémente à la minute, ses trois formes d'affichage, et sa correction en cours de route quand la commande prend du retard**. Et rien d'autre.

**Dépendance** : la spec 01 doit être livrée d'abord. Elle fournit l'écran, les quatre étapes, les deux scripts et la règle de compression du temps. Cette spec ne fait qu'occuper l'emplacement que la spec 01 réserve.

### Hors périmètre, avec propriétaire

| Élément | Propriétaire |
|---|---|
| Les quatre étapes, leur progression, les libellés, la remise à zéro | **Spec 01 — Timeline** |
| Carte, tracé, pastille du livreur | **Spec 03 — Carte de progression** |
| Le calcul de l'estimation initiale sur la page restaurant, les API, le cache | `eta-livrable-v6.html`, non modifié |
| L'affichage de l'ETA *avant* commande (page restaurant, page de recherche) | `eta-livrable-v6.html`, non modifié |
| Notifications push de retard, e-mail d'excuse, geste commercial | Hors chantier |
| Statuts réels de commande, vraie ré-estimation serveur | Feature de production, non spécifiée |

---

## 1. Context & User Persona

### Le problème

Une commande confirmée sans horizon de temps laisse l'utilisateur sans décision possible : commence-t-il un épisode, prend-il une douche, descend-il chercher le pain ? Et quand la livraison prend du retard, il l'apprend aujourd'hui en constatant que rien n'arrive — le pire moment et la pire manière.

Le livrable v6 a déjà tranché la forme de l'estimation **avant** commande : une fourchette assortie d'un niveau de fiabilité, jamais un chiffre unique, avec une marge volontairement asymétrique (`× 0,70` en bas, `× 1,10` en haut) parce que « arriver en avance est une bonne surprise, arriver en retard est une réclamation ». Cette spec applique le même modèle **après** commande. C'est la définition partagée entre les deux specs : elle est recopiée à l'identique, pas réinventée.

**Avertissement de rigueur.** Le taux de commandes livrées hors de la fourchette annoncée n'est pas fourni. On ne sait donc pas à quelle fréquence le scénario de retard se produit dans la vraie vie, ni si le tester représente un cas marginal ou courant. Point ouvert P2.4.

### Acteur et bénéficiaire

| Rôle | Qui | Ce qu'il gagne |
|---|---|---|
| **Acteur** | Le client qui vient de payer | Il décide quoi faire de son attente |
| **Bénéficiaire** | Le même client | Il apprend un retard au lieu de le subir |
| **Bénéficiaire indirect** | Le support client | L'appel « ça fait 40 minutes » n'a plus lieu d'être si l'écran l'a dit avant |

Personas : **primo-commandant** (aucune référence de ce qu'est un délai normal — c'est lui qui juge si la fourchette rassure ou inquiète) et **client habitué** (attente calibrée — c'est lui qui réagit le plus fortement au rallongement, parce qu'il sait ce qu'il aurait dû avoir). Définition recopiée de la spec 01.

### Objectif de test servi par cette spec

**O2 — Crédibilité de l'ETA.** Le temps restant rassure-t-il ou inquiète-t-il ? Et surtout : **que se passe-t-il dans la tête du participant au moment où l'estimation se rallonge ?** C'est le moment le plus riche d'enseignements de toute la session, et la seule raison pour laquelle le scénario S2 existe.

---

## 2. User Stories

| ID | User story |
|---|---|
| **US2.1** | En tant que **client en attente**, quand je regarde l'écran de suivi, je veux un temps restant qui se décrémente, afin de **décider si j'ai le temps de faire autre chose avant que ça sonne**. |
| **US2.2** | En tant que **client dont la commande prend du retard**, quand l'estimation se rallonge, je veux être prévenu explicitement et savoir pourquoi, afin de **rester sur l'écran plutôt que d'aller chercher le support**. |
| **US2.3** | En tant qu'**équipe recherche**, quand j'analyse une session, je veux savoir à la seconde près quand la ré-estimation est apparue, afin de **rattacher la réaction du participant à ce qu'il venait de voir**. |

---

## 3. Releases

| Release | Contenu | Justification |
|---|---|---|
| **R1 — La promesse et sa correction** | La fourchette décomptée, ses trois formes d'affichage, la ré-estimation du scénario S2 avec son message de cause et la fiabilité abaissée. | La ré-estimation n'est pas une option : sans elle, l'objectif O2 tombe et le scénario S2 n'a plus d'objet. |
| **R2 — Les variantes** | Variante « fiabilité faible » dès le départ (fourchette large + mention), et affichage du détail du calcul (« dont 18 min de préparation »). | Enrichit l'entretien mais n'est nécessaire à aucune des deux questions posées. |

---

## 4. Acceptance Criteria

### US2.1 — Le temps restant

| # | Critère |
|---|---|
| AC2.1.1 | **GIVEN** l'écran de suivi à l'ouverture, **WHEN** il s'affiche, **THEN** le temps restant apparaît sous forme de fourchette décomptée au format « Livrée dans 25–40 min », **AND** les deux bornes se décrémentent ensemble à chaque minute simulée écoulée. |
| AC2.1.2 | **GIVEN** un temps restant affiché, **WHEN** la borne basse atteint zéro alors que la borne haute est encore positive, **THEN** l'affichage bascule sur « Livrée dans moins de X min » où X est la borne haute, **AND** aucune valeur négative ni aucun zéro n'est jamais affiché. |
| AC2.1.3 | **GIVEN** un temps restant affiché, **WHEN** la borne haute descend à 5 minutes ou moins, **THEN** l'affichage bascule sur « D'une minute à l'autre », **AND** le décompte chiffré disparaît. |
| AC2.1.4 | **GIVEN** l'étape *Livrée* atteinte, **WHEN** elle devient courante, **THEN** le temps restant disparaît au profit de « Livrée à HH:MM », **AND** plus aucune valeur ne se décrémente. |
| AC2.1.5 | **GIVEN** un scénario en cours, **WHEN** le participant recharge la page ou revient d'un verrouillage d'écran, **THEN** le temps restant correspond au temps réellement écoulé depuis le début du scénario, **AND** ne reprend pas à la valeur qu'il avait au départ. |

### US2.2 — Le retard annoncé

| # | Critère |
|---|---|
| AC2.2.1 | **GIVEN** le scénario S2 en cours, **WHEN** T+20 est atteint, **THEN** un message indique la cause en langage courant — « Le restaurant a plus de monde que prévu » — **AND** la nouvelle fourchette remplace l'ancienne à l'écran. |
| AC2.2.2 | **GIVEN** une ré-estimation, **WHEN** elle s'applique, **THEN** elle se déclenche **tant que la borne basse courante est supérieure ou égale à 5 minutes**, **AND** le participant n'assiste jamais à un compteur figé sur zéro. |
| AC2.2.3 | **GIVEN** une ré-estimation appliquée, **WHEN** le nouvel affichage apparaît, **THEN** le message de cause reste visible au moins jusqu'au changement d'étape suivant, **AND** le participant n'a pas à comparer de mémoire pour comprendre que l'estimation a changé. |
| AC2.2.4 | **GIVEN** une ré-estimation, **WHEN** le niveau de fiabilité est recalculé, **THEN** il baisse d'un cran au maximum, **AND** il ne remonte jamais au cours d'un même scénario. |
| AC2.2.5 | **GIVEN** le scénario S1, **WHEN** il se déroule jusqu'au bout, **THEN** aucun message de retard n'apparaît, **AND** la livraison intervient à l'intérieur de la fourchette annoncée au départ. |

### US2.3 — La trace pour l'analyse

| # | Critère |
|---|---|
| AC2.3.1 | **GIVEN** une ré-estimation, **WHEN** elle s'affiche, **THEN** l'event `tracking_eta_extended` part avec l'ancienne et la nouvelle fourchette et la fiabilité après. |
| AC2.3.2 | **GIVEN** l'ouverture de l'écran, **WHEN** l'event d'ouverture de la spec 01 part, **THEN** il porte en plus `eta_min`, `eta_max` et `confidence`, **AND** aucun second event d'ouverture d'écran n'est créé. |

---

## 5. Management Rules

### Le calcul de la fourchette — définition partagée avec `eta-livrable-v6.html`

> **Recopiée à l'identique du livrable v6. Toute divergence entre les deux documents est un défaut, pas une adaptation.**

- Estimation centrale = préparation + retrait + trajet.
- Borne basse = centrale × 0,70, arrondie à la minute la plus proche.
- Borne haute = centrale × 1,10, arrondie à la minute la plus proche.
- Vérification sur l'exemple du v6 : `36 × 0,70 = 25,2 → 25` et `36 × 1,10 = 39,6 → 40`, soit la fourchette « 25–40 min » du livrable amont. L'arrondi au plus proche est le seul qui reproduise ces deux valeurs.
- La marge est asymétrique à dessein : on rogne davantage vers le bas que vers le haut.
- Une ré-estimation en cours de route applique **la même formule** à la nouvelle centrale. On ne rallonge jamais une borne à la main.
- **Écart assumé avec le v6** : le v6 fixe des paliers d'affichage par niveau de fiabilité (élevée 25–40, moyenne 35–50, faible 45–70) pour l'estimation *initiale* sur la page restaurant. Ici, les bornes sont recalculées à partir de la centrale révisée, pas prises dans un palier. Conséquence concrète : une ré-estimation peut produire une fourchette qui ne correspond à aucun palier du v6 (ici 34–53 pour une fiabilité « moyenne »). C'est volontaire — les paliers décrivent une estimation de départ, pas une correction en cours de livraison.

### Les trois formes d'affichage

| Condition | Affichage |
|---|---|
| Borne basse > 0 | « Livrée dans X–Y min » |
| Borne basse ≤ 0 < borne haute | « Livrée dans moins de Y min » |
| Borne haute ≤ 5 min | « D'une minute à l'autre » |
| Étape *Livrée* | « Livrée à HH:MM » |

Jamais de valeur négative. Jamais de zéro affiché. Jamais de secondes.

### Le niveau de fiabilité

| Niveau | Mention affichée |
|---|---|
| Élevée | Aucune mention — la fourchette seule |
| Moyenne | « Estimation moins précise que d'habitude » |
| Faible | « Peu de livreurs disponibles » (libellé repris du v6) |

La mention accompagne la fourchette sans en changer le format.

### Les deux scripts — définition partagée, recopiée de la spec 01

**S1 — nominal.** Préparation 18 + retrait 6 + trajet 12 = **36 min** → fourchette **25–40 min**, fiabilité **élevée**.

| T simulé | Étape | Affichage |
|---|---|---|
| 0 | Confirmée | Livrée dans 25–40 min |
| +1 | En préparation | Livrée dans 24–39 min |
| +19 | En livraison | Livrée dans 6–21 min |
| +25 | En livraison | Livrée dans moins de 15 min |
| +35 | En livraison | D'une minute à l'autre |
| +37 | Livrée | Livrée à HH:MM |

Livraison à T+37, **à l'intérieur** de la fourchette annoncée.

**S2 — retard.** Départ identique. À **T+20**, la préparation est révisée de 18 à 30 min → centrale 30 + 6 + 12 = **48 min** → fourchette **34–53 min**, affichée « Livrée dans 14–33 min ». Fiabilité abaissée à **moyenne**.

| T simulé | Étape | Affichage | Événement |
|---|---|---|---|
| 0 | Confirmée | Livrée dans 25–40 min | — |
| +1 | En préparation | Livrée dans 24–39 min | — |
| +20 | En préparation | Livrée dans 14–33 min | Message de cause + fiabilité moyenne |
| +31 | En livraison | Livrée dans 3–22 min | — |
| +34 | En livraison | Livrée dans moins de 19 min | — |
| +48 | En livraison | D'une minute à l'autre | — |
| +49 | Livrée | Livrée à HH:MM | — |

Livraison à T+49, **à l'intérieur** de la nouvelle fourchette.

**Pourquoi T+20 et pas plus tard.** À T+20, la borne basse courante vaut exactement 5 min. Au-delà, le participant découvrirait le retard par un compteur qui s'éteint — précisément ce que la feature est censée éviter. La règle générale : **ré-estimer tant que la borne basse est ≥ 5 min, jamais après**.

**Pourquoi les deux scripts passent par les trois formes d'affichage.** Un script qui livrerait avant la bascule d'imminence laisserait un état non testé, et il faudrait le découvrir en production.

### La compression du temps — définition partagée, recopiée de la spec 01

- Facteur ×6 : une minute simulée s'écoule en 10 secondes réelles.
- Le décompte affiche des **minutes simulées**, jamais des secondes réelles : il descend d'une unité toutes les 10 secondes.
- **C'est le point de friction majeur de cette spec.** Un décompte qui perd une minute toutes les dix secondes est visiblement anormal, et il est censé servir à mesurer la crédibilité de l'estimation. Voir P2.1.

### Les exclusions nommées

- L'affichage de l'ETA sur la page restaurant et la page de recherche **existe déjà** (livrable v6) : cette spec ne le modifie pas.
- Le modèle de calcul, les API, la stratégie de cache **appartiennent au livrable v6** : cette spec les consomme, elle ne les redéfinit pas.
- L'emplacement du temps restant est **réservé à sa taille finale par la spec 01** : cette spec ne réserve rien, elle remplit.

---

## 6. Edge Cases

| Situation | Comportement attendu |
|---|---|
| La borne haute expire alors que l'étape n'est pas *Livrée* (défaut de script) | Affichage « Avec un peu de retard ». Pas de valeur négative. Consigne au facilitateur : c'est un défaut du script, pas un comportement à tester. |
| Le participant recharge juste après la ré-estimation | Il retrouve la nouvelle fourchette et le message de cause, pas l'ancienne. |
| Le participant a quitté l'écran au moment exact de la ré-estimation | Au retour, il voit la nouvelle fourchette avec le message de cause **toujours affiché** — il ne doit pas rater l'information parce qu'il regardait ailleurs. C'est le cas le plus probable en session réelle. |
| Deux ré-estimations dans un même scénario | Non prévu par les scripts. Si le cas apparaît, la fiabilité ne baisse qu'une fois (AC2.2.4) et seul le dernier message reste. |
| Une ré-estimation **raccourcirait** l'estimation | Non implémentée. Une bonne nouvelle silencieuse vaut mieux qu'un compteur qui remonte puis redescend. |
| La ré-estimation tombe pendant un changement d'étape | Le changement d'étape a la priorité visuelle ; le message de cause s'affiche juste après, sans se superposer. |
| Le participant demande à voir le détail (« pourquoi 25 et pas 30 ? ») | Aucun détail affiché en R1. À noter comme demande : c'est exactement le `breakdown` que le v6 prévoit côté serveur, donc un candidat R2 peu coûteux. |
| Fiabilité faible dès le départ (variante R2) | Fourchette plus large et mention « Peu de livreurs disponibles », mêmes règles de bascule d'affichage. |
| Le participant lit la fourchette comme une promesse ferme (« vous avez dit 25 ») | Prévu. C'est un résultat de test, pas un bug : à consigner tel quel, il alimente l'arbitrage fourchette / chiffre unique. |

---

## 7. Designs & Workflow

**Aucune maquette Figma.** États à produire :

| État | Ce qu'il montre |
|---|---|
| F1 | Fourchette pleine, fiabilité élevée, sans mention |
| F2 | « Livrée dans moins de X min » |
| F3 | « D'une minute à l'autre » |
| F4 | « Livrée à HH:MM » — état final |
| F5 | Ré-estimation : message de cause + nouvelle fourchette + mention de fiabilité abaissée |
| F6 | Fiabilité faible dès le départ (R2) |
| F7 | Dégradé « Avec un peu de retard » (edge case) |

**État non dessiné que la spec suppose** : la transition entre l'ancienne et la nouvelle fourchette. Si elle est instantanée, un participant qui cligne des yeux rate le changement — et l'objectif O2 avec.

---

## 8. Tracking

| Event | Trigger | Propriétés clés | Métrique servie |
|---|---|---|---|
| `tracking_eta_extended` | Au moment de la ré-estimation | `old_min`, `old_max`, `new_min`, `new_max`, `confidence_after`, `elapsed_simulated_minutes` | **M3** — horodatage précis de la réaction au retard (objectif O2) |
| `tracking_screen_viewed` *(propriétés ajoutées)* | À l'affichage de l'écran — event de la spec 01 | `eta_min`, `eta_max`, `confidence` en plus des propriétés existantes | Contrôle : la fourchette de départ est bien celle du script |

**Un seul event nouveau.** L'ouverture d'écran est déjà tracée par la spec 01 : on y ajoute trois propriétés plutôt que de créer un doublon. Dépendance signalée : toute modification de `tracking_screen_viewed` doit être arbitrée avec la spec 01.

**Ce que ces events ne mesurent pas.** Ils horodatent, ils ne qualifient pas. Savoir *quand* le participant a vu la ré-estimation ne dit rien de ce qu'il en a pensé : cela vient de l'observation et du verbatim. L'event sert à recoller les deux, pas à les remplacer.

---

## 9. Rollout Plan

| Phase | Audience | Timing | État | Ce qu'on valide | Condition de passage |
|---|---|---|---|---|---|
| **Alpha** | Équipe produit | J-3 | R1, S1 seul | Les trois bascules d'affichage s'enchaînent aux bons seuils | S1 joué sans valeur aberrante ni négative |
| **Beta** | 2 participants externes | J-1 | R1 complet, S1 et S2 | **Le décompte accéléré casse-t-il la crédibilité de l'estimation ?** | Les deux participants réagissent à la ré-estimation, et pas d'abord à la vitesse du compteur |
| **Stable** | Tous les participants | J | R1, R2 si prêt | L'objectif O2 | — |

La condition de passage de la Beta est la vraie décision de cette spec : si les deux participants pilotes commentent la vitesse du compteur avant de commenter le retard, il faut changer de dispositif avant d'engager le panel (voir P2.1).

---

## 10. Testing Plan

**Flows critiques :**

1. **La ré-estimation du scénario S2.** C'est le seul moment que le test vient chercher. Si elle ne part pas, la session ne sert à rien : à vérifier avant chaque journée.
2. **Les trois bascules d'affichage**, aux seuils exacts (borne basse à 0, borne haute à 5, étape *Livrée*).
3. **Aucune valeur négative, jamais**, y compris en forçant un scénario au-delà de sa borne haute.

**Cohérence chiffrée à contrôler à la main** avant la première session : `48 × 0,70 = 33,6 → 34` et `48 × 1,10 = 52,8 → 53`. Un écart ici mettrait cette spec en contradiction avec le livrable v6.

**Events** : `tracking_eta_extended` part une seule fois par scénario S2 et jamais en S1 ; `elapsed_simulated_minutes` porte le temps simulé, pas le temps réel.

**UX** : le changement de fourchette ne déplace aucun contenu ; le message de cause reste lisible jusqu'au changement d'étape.

---

## 11. Points ouverts

| # | Constat | Options | Conséquence si personne ne tranche | Recommandation |
|---|---|---|---|---|
| **P2.1** | Le décompte accéléré (×6) est le dispositif même dont on veut mesurer la crédibilité. Un compteur qui perd une minute toutes les dix secondes peut fausser l'objectif O2 à lui seul. | (a) ×6 annoncée au brief — (b) Temps réel sur les 10 premières minutes, puis saut piloté vers la ré-estimation — (c) Décompte figé, seules les étapes avancent | On conclura sur la crédibilité d'une estimation à partir de la réaction à un chronomètre anormal. | **(b)**. C'est le seul compromis qui laisse le participant vivre un décompte à vitesse réelle *et* atteindre la ré-estimation dans une session courte. Coût : un saut piloté à implémenter (R2 de la spec 01). À trancher à la Beta. |
| **P2.2** | D'où vient la fourchette affichée au départ : du script, ou de la page restaurant du prototype vue avant paiement ? | (a) Script — (b) Reprise de la valeur vue avant paiement | Un participant qui a vu « 25–40 » avant de payer et autre chose après sera perturbé par une incohérence sans rapport avec la feature. | **(b)** si le prototype couvre la page restaurant ; **(a)** sinon, et dans ce cas ne pas montrer d'ETA avant paiement. |
| **P2.3** | Fourchette ou chiffre unique ? La fourchette vient du v6 ; un décompte à chiffre unique serait plus lisible mais promettrait une précision qu'on n'a pas. | (a) Fourchette (choix actuel) — (b) Chiffre unique — (c) Tester les deux en variantes | Sans comparaison, on validera la fourchette par défaut sans savoir ce que l'autre option aurait donné. | **(a)** pour cette vague, cohérence avec le v6. Noter les verbatims qui demandent un chiffre unique : c'est la matière d'un arbitrage ultérieur. |
| **P2.4** | La fréquence réelle des livraisons hors fourchette n'est pas connue. | (a) Extraire la donnée avant le test — (b) Assumer | On ne saura pas si le scénario S2 représente un cas courant ou marginal, donc quel poids donner aux réactions observées. | **(a)**. C'est la donnée qui dit si cette spec traite un cas central ou un cas rare. |
