# Spec 03 — Carte de progression du livreur

**Produit** : plateforme de livraison de repas (exercice Noé, cadre Deliveroo)
**Feature parente** : Suivi de commande en direct — prototype de test
**Statut** : v1 — document vivant
**Date** : 16 septembre 2026
**Specs sœurs** : [Spec 01 — Timeline des quatre étapes] (dépendance) · [Spec 02 — Compte à rebours ETA]
**Document amont** : `eta-livrable-v6.html` — pour la règle d'encapsulation du prestataire Maps

---

## Périmètre en une phrase

> Cette spec couvre **la carte affichée pendant l'étape « En livraison » : un tracé fixe entre le restaurant et l'adresse du client, et une pastille qui avance dessus au rythme du scénario — entièrement simulée, sans aucune donnée de position réelle**. Et rien d'autre.

**Dépendance** : la spec 01 doit être livrée d'abord. Elle fournit l'écran, les étapes et les scripts. Cette spec n'existe que pendant l'étape 3.

**C'est la spec la plus coûteuse à fabriquer des trois et la seule qu'on peut couper sans casser le test.** Si la deadline se resserre, c'est celle qui saute — et la conséquence est nommée : on ne saura pas si la carte apporte une réassurance que le texte ne donne pas.

### Hors périmètre, avec propriétaire

| Élément | Propriétaire |
|---|---|
| Les quatre étapes, leur progression, la remise à zéro | **Spec 01 — Timeline** |
| Temps restant, fourchette, ré-estimation | **Spec 02 — Compte à rebours ETA** |
| Toute intégration réelle de Maps, géocodage, calcul d'itinéraire | `eta-livrable-v6.html` — et par principe **jamais côté client** (règle recopiée ci-dessous) |
| Position réelle du livreur, identité du livreur, photo, nom, note, véhicule | Hors chantier |
| Chat livreur, appel masqué, consignes de livraison | Hors chantier |
| Carte sur la page restaurant ou la page de recherche | N'existe pas, non demandé |

---

## 1. Context & User Persona

### Le problème

La timeline dit *où en est* la commande, le décompte dit *quand* elle arrive. Ni l'un ni l'autre ne dit *où elle est*. L'hypothèse de cette spec est que la position visible du livreur apporte une réassurance d'une autre nature : voir bouger quelque chose vaut mieux que lire que ça bouge.

**Avertissement de rigueur.** Cette hypothèse n'est étayée par aucune donnée de discovery fournie. Elle est plausible et répandue dans le secteur, ce qui n'en fait pas un fait. **L'objet même de cette spec est de la mettre à l'épreuve**, ce qui suppose un dispositif de comparaison — voir Tracking, contrôle de mesurabilité, et P3.1.

### Acteur et bénéficiaire

| Rôle | Qui | Ce qu'il gagne |
|---|---|---|
| **Acteur** | Le client qui attend sa commande | Il regarde, il n'agit pas |
| **Bénéficiaire** | Le même client | Il voit que ça avance au lieu de le lire |
| **Utilisateur interne** | L'équipe produit | Elle obtient un élément de décision sur une brique coûteuse à développer en production |

Personas : **primo-commandant** et **client habitué**, définition recopiée de la spec 01. Le second est le plus informatif ici : il a déjà vu des cartes de livraison ailleurs, et sait dire si celle-ci lui apporte quelque chose.

### Objectif de test servi par cette spec

**O3 — La carte vaut-elle son coût ?** La timeline seule suffit-elle, ou la carte apporte-t-elle une réassurance que le texte ne donne pas ? La réponse est directement actionnable sur le budget de développement de la feature de production.

---

## 2. User Stories

| ID | User story |
|---|---|
| **US3.1** | En tant que **client dont la commande est en route**, quand j'ouvre l'écran de suivi, je veux voir sur une carte où en est mon livreur entre le restaurant et chez moi, afin de **comprendre d'un coup d'œil s'il vient de partir ou s'il arrive**. |
| **US3.2** | En tant que **client**, quand la commande n'est pas encore partie du restaurant, je veux que l'écran ne me montre pas une carte trompeuse, afin de **ne pas croire que mon livreur roule alors qu'il attend**. |
| **US3.3** | En tant qu'**équipe produit**, quand j'analyse les sessions, je veux savoir si les participants ont regardé la carte et ce qu'ils en ont dit, afin de **trancher si elle mérite d'être développée en production**. |

---

## 3. Releases

| Release | Contenu | Justification |
|---|---|---|
| **R1 — La carte minimale** | Tracé fixe pré-dessiné restaurant → adresse, pastille qui avance au rythme de l'étape *En livraison*, carte absente avant cette étape, état final à l'arrivée. | C'est le strict nécessaire pour poser la question O3. Tout le reste est décoration. |
| **R2 — Les raffinements** | Panoramique et zoom, pastille du restaurant et du domicile identifiées, variante « livreur à l'arrêt ». | Peut enrichir l'entretien, ne change pas la réponse à O3. |

---

## 4. Acceptance Criteria

### US3.1 — La carte pendant la livraison

| # | Critère |
|---|---|
| AC3.1.1 | **GIVEN** l'étape *En livraison* devenue courante, **WHEN** l'écran s'affiche, **THEN** une carte apparaît avec un tracé entre un point de départ (restaurant) et un point d'arrivée (adresse), **AND** une pastille représentant le livreur est positionnée sur ce tracé. |
| AC3.1.2 | **GIVEN** l'étape *En livraison* en cours, **WHEN** le temps simulé avance, **THEN** la pastille progresse le long du tracé proportionnellement au temps écoulé dans l'étape, **AND** le mouvement est continu, sans saut visible d'un point à l'autre. |
| AC3.1.3 | **GIVEN** la carte affichée, **WHEN** le participant la regarde, **THEN** le tracé complet reste visible en entier sans action de sa part, **AND** la pastille ne sort jamais du cadre. |
| AC3.1.4 | **GIVEN** l'étape *Livrée* atteinte, **WHEN** elle devient courante, **THEN** la pastille est arrivée au point d'arrivée, **AND** plus rien ne bouge sur la carte. |
| AC3.1.5 | **GIVEN** la carte affichée, **WHEN** le participant tape sur la pastille, le tracé ou la carte, **THEN** rien ne se produit en R1 — pas de fiche livreur, pas de zoom, pas de message d'erreur. |

### US3.2 — Avant le départ, pas de carte

| # | Critère |
|---|---|
| AC3.2.1 | **GIVEN** les étapes *Confirmée* ou *En préparation*, **WHEN** l'écran s'affiche, **THEN** aucune carte n'est visible, **AND** aucune pastille de livreur n'est affichée où que ce soit. |
| AC3.2.2 | **GIVEN** le passage de *En préparation* à *En livraison*, **WHEN** il se produit, **THEN** la carte apparaît à sa taille finale sans pousser le reste du contenu vers le bas. |
| AC3.2.3 | **GIVEN** le scénario S2, **WHEN** la ré-estimation prolonge l'étape *En préparation*, **THEN** la carte reste absente pendant toute la prolongation, **AND** apparaît au passage réel à *En livraison*, à T+31. |

### US3.3 — La trace pour l'analyse

| # | Critère |
|---|---|
| AC3.3.1 | **GIVEN** l'apparition de la carte, **WHEN** elle s'affiche, **THEN** l'event `tracking_map_shown` part avec la variante du prototype et le temps simulé écoulé. |
| AC3.3.2 | **GIVEN** une session sur la variante sans carte, **WHEN** l'étape *En livraison* est atteinte, **THEN** aucun event de carte ne part, **AND** la propriété `variant` de l'event d'ouverture d'écran vaut `no_map`. |

---

## 5. Management Rules

### Ce que la carte est, et n'est pas

- **Le tracé est pré-dessiné et fixe.** Aucun calcul d'itinéraire, aucun appel à un service de cartographie, aucune donnée de position. C'est une image et une animation.
- **Un seul tracé pour tous les participants.** Deux participants voient la même carte : les différences de réaction ne viennent donc pas de la carte elle-même.
- **Aucune adresse réelle.** Ni celle du participant, ni une adresse identifiable. Le point d'arrivée est générique.
- **Aucune identité de livreur** : ni nom, ni photo, ni note, ni type de véhicule. Ces éléments changeraient la nature de ce qu'on teste.

### La règle d'encapsulation — recopiée de `eta-livrable-v6.html`

> « Un prestataire externe payant n'est jamais exposé au client. Il est toujours encapsulé derrière un service à toi, qui en contrôle le volume, le coût et le remplacement. »

Conséquence pour cette spec : même en production, la carte ne parlera jamais directement à Maps depuis l'application. Le prototype, lui, n'appelle rien du tout. **Un prototype qui appellerait une carte en ligne introduirait une dépendance réseau dans une salle de test** — et une session perdue au premier wifi capricieux.

### La progression de la pastille

- La pastille avance **proportionnellement au temps écoulé dans l'étape *En livraison***, de 0 % au départ à 100 % à l'arrivée.
- Vitesse constante. Pas d'accélération, pas d'arrêt, pas de détour : le prototype ne simule pas la circulation.
- Durée de l'étape *En livraison* : **18 min simulées** dans les deux scripts (retrait 6 + trajet 12), soit **3 minutes réelles** à la compression ×6.
- Si le temps écoulé dépasse la durée de l'étape (défaut de script), la pastille reste au point d'arrivée. Elle ne le dépasse jamais.

### Les deux scripts — fenêtre d'affichage de la carte

Définition recopiée de la spec 01. La carte n'existe que sur la ligne *En livraison*.

| Script | Carte visible de | à | Durée réelle |
|---|---|---|---|
| **S1 — nominal** | T+19 | T+37 | 3 min |
| **S2 — retard** | T+31 | T+49 | 3 min |

En S2, la ré-estimation intervient **avant** l'apparition de la carte (T+20 contre T+31). Le participant vit donc le retard sans carte, puis voit la carte apparaître : l'ordre compte pour l'analyse, et il est identique pour tous les participants.

### Les deux variantes du prototype

Pour que l'objectif O3 signifie quelque chose, deux versions du prototype coexistent :

| Variante | Contenu | `variant` |
|---|---|---|
| **Avec carte** | Specs 01 + 02 + 03 | `with_map` |
| **Sans carte** | Specs 01 + 02 seules | `no_map` |

Les participants sont affectés **en alternance** à l'une ou l'autre, à personas équilibrés entre les deux. Sans cette alternance, l'objectif O3 n'est pas mesurable — voir Tracking.

### Les exclusions nommées

- L'emplacement de la carte est **réservé à sa taille finale par la spec 01**, comme celui du temps restant. Cette spec ne réserve rien, elle remplit.
- Les quatre étapes restent visibles **au-dessus** de la carte : la carte ne les remplace pas et ne les repousse pas hors de l'écran.

### Performance

- La carte est une ressource locale : elle s'affiche instantanément, sans état de chargement. S'il faut un état de chargement, c'est que la ressource est distante — ce qui est exclu.

---

## 6. Edge Cases

| Situation | Comportement attendu |
|---|---|
| Le participant recharge la page pendant *En livraison* | La pastille reprend à la position correspondant au temps écoulé, pas au départ du tracé. |
| Le téléphone se verrouille pendant *En livraison* | Au retour, la pastille est à la bonne position — pas figée là où elle était. |
| Le participant fait un geste de zoom ou de panoramique | R1 : la carte ne réagit pas et ne se déforme pas. À noter comme demande si le geste revient chez plusieurs participants — c'est l'indice le plus fiable que la carte les intéresse vraiment. |
| Le participant tape sur la pastille en attendant une fiche livreur | Rien ne se produit. Demande à consigner : c'est une feature distincte, hors chantier. |
| L'étape change pendant l'animation | L'animation s'arrête proprement à la position atteinte ; elle ne saute pas à 100 % et ne redémarre pas. |
| La session dure plus longtemps que l'étape (participant qui parle) | La pastille reste à l'arrivée. Elle ne fait pas d'aller-retour, elle ne clignote pas. |
| Le participant demande « c'est vraiment mon livreur ? » | Prévu. Consigne au facilitateur : répondre après la session, jamais pendant — la réponse changerait la réaction qu'on cherche à observer. |
| Écran de petite taille | Le tracé reste visible en entier et les quatre étapes restent à l'écran. Si les deux ne tiennent pas, **les étapes gagnent** : elles portent l'objectif O1, la carte un objectif secondaire. |
| Le participant ne regarde jamais la carte | C'est un résultat, pas un incident. À consigner explicitement — une carte ignorée est la réponse la plus utile que O3 puisse produire. |

---

## 7. Designs & Workflow

**Aucune maquette Figma.** États à produire :

| État | Ce qu'il montre |
|---|---|
| C1 | Pas de carte — étapes *Confirmée* et *En préparation* |
| C2 | Carte au départ : pastille au point restaurant |
| C3 | Carte à mi-parcours |
| C4 | Carte à l'arrivée : pastille au point d'arrivée, rien ne bouge |
| C5 | Reprise : carte rouverte en cours d'étape, pastille à la bonne position |

**Ressource à fabriquer** : un fond de carte générique et un tracé, en une seule image. Ni ville reconnaissable, ni rue nommée, ni logo de prestataire — une carte identifiable soulèverait une question de droits pour un prototype qui n'en a aucun besoin.

**État non dessiné que la spec suppose** : la transition d'apparition de la carte au passage à *En livraison* (AC3.2.2). Si elle pousse le contenu, elle casse la règle de réservation d'espace de la spec 01.

---

## 8. Tracking

| Event | Trigger | Propriétés clés | Métrique servie |
|---|---|---|---|
| `tracking_map_shown` | À l'apparition de la carte, au passage à *En livraison* | `variant`, `elapsed_simulated_minutes` | **M4** — confirmation que la carte est bien apparue au bon moment dans les sessions `with_map` |
| `tracking_screen_viewed` *(propriété ajoutée)* | À l'affichage de l'écran — event de la spec 01 | `variant` en plus des propriétés existantes | Séparation des deux groupes à l'analyse |

**Un seul event nouveau**, et une propriété ajoutée à l'event de la spec 01 plutôt qu'un doublon. Dépendance signalée : `variant` est utilisée par les trois specs, elle doit être définie une seule fois, dans la spec 01.

### Contrôle de mesurabilité — le point critique de cette spec

L'objectif O3 compare deux populations : les participants qui voient la timeline seule, et ceux qui voient la timeline plus la carte. **Cette comparaison n'est valide que si les deux groupes ne diffèrent par rien d'autre.** Deux conditions, non négociables :

1. **Les deux variantes du prototype existent** — sinon il n'y a pas de comparaison, seulement une opinion recueillie auprès de gens qui n'ont jamais vu l'alternative.
2. **L'affectation est alternée et les personas équilibrés** entre les deux groupes. Si les quatre primo-commandants se retrouvent tous dans le groupe « avec carte », l'écart observé mesurera la familiarité avec la plateforme, pas la carte.

**Conséquence concrète si personne ne tranche** : on conclura sur la carte à partir de verbatims de participants qui ne l'auront jamais comparée à son absence — c'est-à-dire qu'on ne conclura rien, tout en croyant le contraire. Et on engagera, ou non, un développement coûteux sur cette base.

**Ce que le tracking ne mesure pas** : le temps passé à regarder la carte. Aucun event ne le donne — cela relève de l'observation en session, voire de l'oculométrie, qui est hors budget. La question « l'ont-ils regardée ? » se répond à l'œil nu, par le facilitateur.

---

## 9. Rollout Plan

| Phase | Audience | Timing | État | Ce qu'on valide | Condition de passage |
|---|---|---|---|---|---|
| **Alpha** | Équipe produit | J-3 | R1, variante `with_map` seule | La pastille avance sans saut, la carte n'apparaît pas avant *En livraison* | Un S1 complet avec carte, sans défaut visuel |
| **Beta** | 2 participants externes, un par variante | J-1 | R1, les deux variantes | Que les deux variantes soient réellement interchangeables du point de vue du facilitateur | Deux sessions consécutives sur deux variantes différentes, sans confusion de dispositif |
| **Stable** | Tous les participants, affectation alternée | J | R1 | L'objectif O3 | — |

La Beta sur **deux variantes différentes** n'est pas un détail : c'est là qu'on vérifie que le facilitateur ne se trompe pas de version entre deux participants, ce qui ruinerait la comparaison sans que personne s'en aperçoive.

---

## 10. Testing Plan

**Flows critiques :**

1. **L'affectation des variantes.** Une session lancée sur la mauvaise variante est une session perdue pour O3, et le défaut est invisible sur le moment. À vérifier au lancement de chaque session, pas seulement le matin.
2. **La carte n'apparaît jamais avant *En livraison***, y compris en S2 pendant la prolongation de la préparation (AC3.2.3). Une carte qui s'affiche pendant que le restaurant cuisine dit au participant quelque chose de faux.
3. **L'apparition de la carte ne pousse aucun contenu**, sans quoi elle casse la spec 01.

**Cœur fonctionnel** : progression proportionnelle de la pastille, arrêt propre à l'arrivée, reprise correcte après rechargement et verrouillage.

**Events** : `tracking_map_shown` part une fois par session `with_map`, jamais en `no_map` ; `variant` est cohérente entre l'event d'ouverture et l'event de carte.

**UX** : le mouvement de la pastille est perceptible sans fixer l'écran, et le tracé tient en entier sur les appareils réels de la session.

---

## 11. Points ouverts

| # | Constat | Options | Conséquence si personne ne tranche | Recommandation |
|---|---|---|---|---|
| **P3.1** | L'objectif O3 exige deux variantes et une affectation alternée, donc environ deux fois plus de participants pour la même puissance de conclusion. | (a) Deux variantes, panel doublé — (b) Renoncer à O3 pour cette vague — (c) Poser la question en entretien, sans comparaison | On conclura sur une brique coûteuse à partir d'opinions non comparées. | **(b) ou (a)**, jamais (c). Si le budget de sessions ne permet pas deux variantes, retirer O3 des objectifs et l'assumer — plutôt que de le traiter à moitié et de s'en servir quand même. |
| **P3.2** | La carte est la brique la plus coûteuse des trois, pour l'objectif le plus secondaire. | (a) La fabriquer — (b) La couper et reposer la question à la vague suivante | Elle consommera du temps de fabrication au détriment de la robustesse des specs 01 et 02, qui portent O1 et O2. | **Couper en cas de retard de fabrication.** L'ordre de priorité est : spec 01, spec 02, spec 03. |
| **P3.3** | L'étape *En livraison* ne dure que 3 minutes réelles à la compression ×6 : la carte est visible très peu de temps. | (a) Accepter — (b) Réduire la compression pendant cette étape seule — (c) Allonger l'étape dans le script | Trop peu d'exposition pour que le participant se forme un avis, donc un O3 non concluant même avec deux variantes. | **(a)** en R1, et mesurer à la Beta si 3 minutes suffisent. **Pas (b)** : une compression non uniforme fausse les durées relatives entre étapes, contre la règle de la spec 01. |
| **P3.4** | Un fond de carte générique peut paraître peu crédible et attirer les commentaires sur le dispositif plutôt que sur la feature. | (a) Fond neutre — (b) Fond réaliste d'une ville quelconque | Les verbatims porteront sur la qualité du dessin, pas sur l'utilité de la carte. | **(a)**, et l'annoncer au brief au même titre que l'accélération du temps : « la carte est illustrative ». |
