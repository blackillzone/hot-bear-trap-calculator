# Audit de suivi de la codebase

Date: 2026-04-19

Base de comparaison: [doc/feddbacks/2026-04-19-codebase-review.md](./2026-04-19-codebase-review.md)

Objectif cible: obtenir une SPA React propre, avec une architecture maintenable, des pratiques TypeScript solides, et une suite de tests réellement fiable.

## Verdict

Il y a une amélioration nette par rapport au premier audit, mais la cible n'est pas encore atteinte.

Les progrès sont réels sur les fondations:

- le build repasse
- le flux d'import de profil a été assaini
- plusieurs responsabilités ont commencé à être extraites hors des composants
- une vraie infrastructure de tests existe désormais
- un ErrorBoundary a été ajouté

En revanche, trois points empêchent encore de qualifier la base de code comme propre et correctement testée:

1. la chaîne qualité n'est pas entièrement verte en pratique
2. une partie importante des tests donne une fausse impression de sécurité
3. l'architecture métier reste incomplète car des données éditables ne pilotent toujours pas le calcul

Conclusion synthétique: la base est meilleure, plus structurée et plus sûre qu'au moment du premier rapport, mais elle n'est pas encore au niveau d'une SPA React proprement architecturée et correctement testée.

## Mesures réelles prises pendant l'audit

### Scripts exécutés

- `npm run build`
- `npm run lint`
- `npm run lint:ci`
- `npm run test:coverage`
- `npm run test:e2e`

### Résultats constatés

#### Build

`npm run build` passe.

Point à noter:

- Vite émet encore un warning de bundle volumineux: le chunk principal produit fait environ `902.68 kB` minifié

Cela ne casse pas l'application, mais indique que la SPA n'est pas encore optimisée en découpage de code.

#### Lint

`npm run lint` ne remonte pas d'erreurs bloquantes, mais remonte encore `59 warnings`.

Exemples représentatifs:

- non-null assertions encore présentes dans `src/store/useRallyStore.ts`
- non-null assertions dans `src/hooks/useHeroRosterNavigation.ts`
- non-null assertions et patterns discutables dans `src/components/Results/JoinerRecommender.tsx`
- warning d'accessibilité dans `src/components/Profiles/HeroDetailPanel.tsx`
- une partie des warnings se trouve aussi dans les tests eux-mêmes

`npm run lint:ci` remonte toujours des diagnostics et des écarts de formatage. La base n'est donc pas réellement "propre" au niveau de la gate CI.

#### Tests unitaires / composants / couverture

`npm run test:coverage` exécute `134 tests`, tous passants, mais la commande échoue quand même à cause des seuils de couverture.

Seuils non atteints:

- `src/lib/heroes.ts`: branches `83.33%` pour un seuil configuré à `100%`
- `src/lib/storage.ts`: branches `94.64%` pour un seuil configuré à `100%`

Constat important: la suite est donc "verte" en nombre de tests, mais pas verte en quality gate globale.

#### E2E

`npm run test:e2e` passe: `15/15`.

Le point faible n'est pas le taux de réussite, mais la qualité intrinsèque de ces scénarios, détaillée plus bas.

## Améliorations vérifiées depuis le premier audit

### 1. Le flux d'import de profil a été corrigé

Le premier audit signalait un contrat flou entre import externe et mise à jour du profil courant.

Ce point a été réellement amélioré:

- `src/store/useRallyStore.ts` expose maintenant une action dédiée `importProfile`
- `src/components/Profiles/ProfileManager.tsx` utilise bien `importProfileFromJson(...)` puis `importProfile(...)`

Le contrat est désormais plus clair et nettement plus sûr.

### 2. Une partie de la logique UI a été extraite hors des composants

Deux améliorations concrètes:

- `src/hooks/useAnimatedHeroPanel.ts` extrait la logique d'animation du panneau héros
- `src/hooks/useHeroRosterNavigation.ts` extrait la navigation clavier dans le roster

Cela améliore la lisibilité et réduit la dette signalée dans le premier rapport.

### 3. Les métadonnées UI des héros sont mieux centralisées

La création de `src/lib/heroCatalog.ts` est une vraie amélioration.

Ce module centralise:

- images de héros
- images de widgets
- groupes d'affichage
- badges de génération
- helpers de tri

Le problème n'est pas entièrement résolu, mais l'état actuel est clairement meilleur que celui décrit dans le premier rapport.

### 4. La résilience UI a progressé

Le premier audit pointait l'absence d'ErrorBoundary.

Ce point est maintenant traité:

- `src/components/ErrorBoundary.tsx` existe
- `src/main.tsx` enveloppe l'application dans `StrictMode` et `ErrorBoundary`

### 5. La base TypeScript est plus exigeante qu'avant

Le projet n'active toujours pas `strict`, mais `tsconfig.app.json` a progressé.

Améliorations constatées:

- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`

Ce n'est pas encore l'objectif final, mais c'est un progrès réel par rapport au constat initial.

### 6. Le problème de communication produit autour de certaines données a été partiellement clarifié

Le premier audit pointait une UI qui laissait penser que certaines données influençaient le calcul alors que ce n'était pas le cas.

Amélioration partielle:

- `src/components/Profiles/GovDataEditor.tsx` affiche désormais explicitement que les sections `gov-gear`, `static-stats` et `troops` sont enregistrées pour une future version et n'influencent pas encore le résultat actuel

Cette clarification UI est utile, même si le problème métier n'est pas totalement réglé.

## Ce qui reste problématique côté architecture

### 1. Le calcul métier n'utilise toujours pas une partie importante des données éditables

C'est encore le problème d'architecture le plus important.

Les fonctions de calcul `computeOptimalRatio`, `computeDamageScore`, `computeFormation` et `computeParticipantCurve` restent centrées sur:

- `stats`
- `widgets`
- `troop_tier`
- `tg_level`
- `capacity`
- `participants`
- `joiners`

Elles n'utilisent toujours pas:

- `bearLevel`
- `ownedHeroes`
- `govGear`
- `govCharmLevel`
- `staticBonuses`
- `troops`

Conséquences:

- le domaine métier réel et l'UI disponible ne sont toujours pas alignés
- une partie de la dette produit est seulement masquée par de la communication, pas résolue
- la section héros du `User Data` reste particulièrement ambiguë: on peut éditer niveau, étoiles, gear et widget d'un héros, alors que rien de tout cela n'influence encore le moteur de calcul

Verdict sur ce point: amélioration partielle seulement, problème toujours ouvert.

### 2. `useRallyStore` reste un orchestrateur global trop dense

Le store a été amélioré, mais il concentre encore trop de responsabilités.

Il gère toujours dans un seul module:

- chargement initial des profils
- bootstrap du profil par défaut
- persistance locale
- sélection et suppression de profils
- import externe
- configuration du rally
- recalcul du résultat
- navigation d'interface (`activeView`, `activeTab`, `userDataTab`)

Le fichier reste à `260` lignes, avec des frontières encore peu nettes entre domaine, infrastructure et UI.

Le principal progrès est qualitatif, pas structurel: certaines responsabilités sont mieux nommées, mais elles ne sont pas encore réellement séparées.

### 3. `HeroRoster.tsx` a progressé mais reste un composant monolithique

Le premier audit visait directement ce fichier. Le constat doit être nuancé.

Ce qui s'est amélioré:

- `HeroDetailPanel` est maintenant dans son propre module
- la navigation clavier a été sortie dans un hook
- les métadonnées héros ont été externalisées

Ce qui reste problématique:

- `src/components/Profiles/HeroRoster.tsx` fait encore `578` lignes
- le fichier contient encore plusieurs sous-composants internes (`SlideFilterBar`, `Tooltip`, `HeroCard`)
- la logique de filtrage est calculée à deux endroits distincts
- il reste des timers manuels et une orchestration d'animation locale

Le composant est donc moins mauvais qu'avant, mais il reste trop gros pour être considéré comme propre.

### 4. `HeroDetailPanel.tsx` concentre encore beaucoup de complexité UI sans couverture

`src/components/Profiles/HeroDetailPanel.tsx` fait `381` lignes et reste un point de densité élevé.

Il concentre:

- édition du gear
- édition des étoiles
- gestion de preview hover
- widget de héros
- slider de niveau
- SVG interactif personnalisé

Le problème n'est pas seulement la taille: ce composant reste complexe tout en étant totalement non couvert par des tests.

### 5. Le bundle principal reste trop gros pour une SPA de cette taille

Le build passe, mais la sortie Vite indique un chunk principal à environ `902.68 kB` minifié.

Cela suggère:

- peu ou pas de découpage de code
- chargement global de l'application, y compris sur des vues secondaires

Ce n'est pas le problème principal aujourd'hui, mais c'est un signal de dette front déjà visible.

## Revue TypeScript

## Ce qui va dans le bon sens

- `noUncheckedIndexedAccess` est activé
- `exactOptionalPropertyTypes` est activé
- `noUnusedLocals` et `noUnusedParameters` sont activés
- le build TypeScript passe

## Ce qui reste insuffisant

- `strict` n'est toujours pas activé
- le projet utilise encore beaucoup de non-null assertions, y compris dans le code source principal
- les tests ne respectent pas encore le même niveau d'exigence que le code applicatif

Verdict TypeScript: progression réelle, mais niveau encore intermédiaire plutôt qu'exemplaire.

## Revue analytique des tests

## Bilan global

Le projet a désormais une vraie suite de tests. C'est une avancée majeure par rapport au premier audit.

Mais la qualité de cette suite est très hétérogène.

En résumé:

- les tests de logique métier pure sont utiles, bien que perfectibles
- les tests de composants sont globalement trop faibles
- les tests E2E sont majoritairement des smoke tests très permissifs
- plusieurs tests sont peu hermétiques car ils manipulent un store singleton sans remise à zéro complète

Autrement dit: l'infrastructure de test existe, mais la fiabilité réelle des garanties n'est pas encore au niveau attendu.

### 1. Les tests métier sont la partie la plus crédible de la suite

Les meilleures zones aujourd'hui sont:

- `src/lib/formulas.test.ts`
- `src/lib/storage.test.ts`
- `src/lib/heroes.test.ts`
- `src/store/useRallyStore.test.ts`

Points positifs:

- le projet teste enfin les formules, le storage, les héros et le store
- le flux d'import est couvert
- les tests de données sur `HERO_DB` apportent de vraies garanties de cohérence

Mais même ici, il reste des limites.

Exemples de trous visibles:

- `src/lib/formulas.ts` a encore une branche non couverte pour le fallback `sumSq === 0`
- `computeDistribution` n'est pas testé explicitement sur les arrondis et le reliquat archers
- `formatTroops` n'a pas de test dédié
- l'intégration des bonus de joiners n'est pas vraiment testée au niveau du calcul global

### 2. Les tests de composants contiennent plusieurs assertions vacantes ou presque vacantes

C'est le principal problème de qualité du parc de tests actuel.

Exemples concrets:

- `src/components/LeaderStats/StatsForm.test.tsx`
  - `expect(container).toBeDefined()`
  - `expect(inputs.length).toBeGreaterThanOrEqual(0)`
- `src/components/RallyConfig/RallyConfig.test.tsx`
  - `expect(document.querySelector("div")).toBeDefined()`
  - `expect(inputs.length >= 0).toBeTruthy()`
- `src/components/Results/OptimalRatioPie.test.tsx`
  - simple vérification de rendu, sans assertion sur les valeurs affichées
- `src/components/Results/DamageScore.test.tsx`
  - le test "display improvement percentage" se contente d'un `getByText(/\+/)`

Pourquoi c'est un problème:

- ces assertions échouent rarement, même quand le comportement utile est cassé
- elles gonflent artificiellement le nombre de tests sans augmenter beaucoup la confiance
- elles peuvent faire croire que les composants sont couverts alors qu'ils ne sont presque pas testés fonctionnellement

Verdict: une partie de la suite de composants doit être reclassée comme smoke tests, pas comme tests fonctionnels.

### 3. Les E2E passent, mais ils sont beaucoup trop permissifs

Les fichiers E2E actuels:

- `e2e/bear-trap-calculator.spec.ts`
- `e2e/profiles.spec.ts`
- `e2e/user-data.spec.ts`

Le problème n'est pas qu'ils échouent. Le problème est qu'ils peuvent continuer à passer alors que le produit régresse fortement.

Patterns observés:

- `waitForTimeout(...)` comme stratégie principale de synchronisation
- assertions du type `pageText.length > 0` ou `> 100`
- assertions du type `count >= 0`
- clics entourés de `catch(() => {})`
- vérifications comme `expect(page.url()).toBeTruthy()` ou `expect(isVisible).toBeTruthy()`

Ces tests valident surtout que "la page existe" et "le DOM n'est pas vide". Ils valident très peu la logique métier attendue.

Conséquence: les E2E actuels rassurent sur la non-catastrophe, mais pas sur la justesse du produit.

### 4. Les tests du store et des composants ne sont pas complètement hermétiques

Le store Zustand est un singleton de module.

Or:

- `src/store/useRallyStore.test.ts` se contente d'un `localStorage.clear()` en `beforeEach`
- plusieurs tests de composants utilisent `useRallyStore.setState({...})` avec une mise à jour partielle, pas une réinitialisation complète du store

Conséquences possibles:

- dépendance implicite à l'ordre d'exécution
- fuites d'état entre tests
- faux positifs lorsque des champs non remis à zéro restent présents d'un test précédent

Le risque n'est pas forcément visible aujourd'hui parce que les tests restent simples, mais la base n'est pas hermétique au sens strict.

### 5. La couverture globale masque de gros angles morts

Le rapport de couverture montre encore `0%` sur plusieurs zones importantes.

Exemples notables:

- `src/components/Profiles/HeroRoster.tsx`
- `src/components/Profiles/HeroDetailPanel.tsx`
- `src/components/Profiles/GovDataEditor.tsx`
- `src/components/UserData/UserDataPage.tsx`
- `src/components/Results/JoinerRecommender.tsx`
- `src/components/Results/ParticipantGraph.tsx`
- `src/hooks/useAnimatedHeroPanel.ts`
- `src/hooks/useHeroRosterNavigation.ts`
- `src/components/ErrorBoundary.tsx`
- `src/lib/heroCatalog.ts`

Or plusieurs de ces fichiers portent justement la complexité UI et métier la plus fragile.

Le résultat est clair:

- les zones les plus difficiles ne sont pas celles qui sont le mieux testées
- la suite actuelle protège surtout le coeur mathématique et les helpers de persistance
- elle protège encore trop peu le comportement utilisateur réel

### 6. Les tests eux-mêmes génèrent du bruit de qualité

Le lint remonte aussi des warnings dans les tests:

- non-null assertions dans `src/lib/formulas.test.ts`
- non-null assertions et `any` dans `src/store/useRallyStore.test.ts`
- non-null assertions dans `src/lib/storage.test.ts`

Cela indique que la suite de tests ne suit pas encore les mêmes standards de qualité que le code applicatif.

### 7. Le calibrage de couverture est en partie incohérent avec la réalité du code

`vitest.config.ts` impose encore `100%` de branches sur:

- `src/lib/heroes.ts`
- `src/lib/storage.ts`

Dans l'état actuel, deux lectures sont possibles et toutes deux posent problème:

- soit il manque encore quelques tests de corruption / fallback pour justifier le seuil
- soit le seuil est trop strict par rapport à des branches de sécurité peu réalistes

Dans les deux cas, la situation actuelle n'est pas saine, parce que:

- la commande `test:coverage` échoue
- l'équipe n'a pas une lecture claire de ce qui bloque réellement

## Synthèse de l'amélioration par rapport au premier rapport

## Progrès nets

- build désormais passant
- architecture un peu plus modulaire
- flux d'import assaini
- ErrorBoundary ajouté
- meilleure clarification UI sur certaines données non branchées
- vraie base de tests désormais en place
- exigences TypeScript plus fortes qu'au départ

## Progrès partiels seulement

- store encore trop central
- HeroRoster encore trop massif
- User Data encore très partiellement hors domaine réel du calcul
- TypeScript encore en deçà d'un niveau strict

## Toujours insuffisant pour la cible demandée

- lint encore trop bruyant
- `lint:ci` pas propre
- `test:coverage` échoue
- qualité intrinsèque des tests de composants et E2E insuffisante
- couverture absente précisément sur plusieurs zones à risque

## Priorités recommandées

### Priorité 1

- rendre `lint:ci` propre
- rendre `test:coverage` réellement vert
- remplacer les assertions vacantes des tests de composants par des assertions comportementales
- renforcer les E2E avec de vraies assertions sur les résultats, les profils et les interactions

### Priorité 2

- clarifier définitivement le statut métier de `bearLevel`, `ownedHeroes`, `govGear`, `govCharmLevel`, `staticBonuses` et `troops`
- afficher clairement dans l'UI des héros que ces données n'influencent pas encore le calcul, ou les brancher vraiment
- commencer à découper `useRallyStore` en responsabilités plus nettes

### Priorité 3

- finir le refactor de `HeroRoster.tsx`
- couvrir `HeroDetailPanel`, `JoinerRecommender`, `ParticipantGraph`, `UserDataPage` et les hooks associés
- envisager l'activation progressive de `strict`
- introduire du code splitting sur les vues secondaires si la SPA continue à grossir

## Conclusion finale

Le projet est objectivement dans un meilleur état qu'au moment du premier rapport.

Ce n'est plus une base sans filet. C'est désormais une base avec:

- une doc plus structurée
- une résilience minimale
- un début de modularisation
- une vraie base de tests

Mais il serait prématuré de considérer que l'architecture est propre et que le code est correctement testé.

Le vrai sujet n'est plus l'absence d'outillage. Le vrai sujet est maintenant la qualité réelle des garanties apportées par cet outillage.

En l'état, le projet a franchi un palier important, mais il lui manque encore une phase de consolidation sérieuse pour atteindre la cible demandée.
