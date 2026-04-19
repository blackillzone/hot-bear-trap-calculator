# Plan de refactoring — suite à l'audit du 2026-04-19

## Contexte

Audit réalisé le 2026-04-19. Les points suivants ont déjà été traités avant ce plan :

- ✅ **Quality gate remise au vert** — build propre, lint sans erreurs critiques (Biome, 18 warnings résiduels non bloquants)
- ✅ **Tests automatisés implémentés** — Vitest (unitaires + composants) + Playwright (E2E) ; couverture cible atteinte sur `formulas.ts`, `heroes.ts`, `storage.ts`
- ✅ **Knip intégré** — détection de code mort, exports inutilisés identifiés
- ✅ **CI stabilisée** — GitHub Actions build + lint passe sur `main`

Ce plan couvre les refactorings restants, organisés par priorité.

---

## Priorité 1 — Corrections structurantes

Ces tâches doivent être faites en premier. Elles débloqueront les priorités suivantes et réduiront directement le risque d'introduction de bugs.

---

### 1.1 Décomposer `HeroRoster.tsx` (1194 lignes)

**Problème :** Le fichier concentre données statiques, filtres, tooltips, cartes, panneau de détail, navigation clavier, animations et logique de sélection. C'est un sous-module applicatif compressé dans un seul fichier.

**Actions :**

1. Extraire le module `src/lib/heroCatalog.ts`
   - Déplacer les métadonnées UI des héros (chemins d'images, labels de widgets, groupes)
   - Exporter les filtres/groupes comme fonctions pures
   - Centraliser avec `HERO_DB` (cf. point 1.4)

2. Extraire les sous-composants dans `src/components/Profiles/HeroRoster/`
   - `HeroFilters.tsx` — barre de filtres (type, génération, recherche)
   - `HeroGrid.tsx` — grille de cartes
   - `HeroCard.tsx` — carte individuelle d'un héros
   - `HeroDetailPanel.tsx` — panneau latéral de détail

3. Extraire le hook `src/hooks/useHeroRosterNavigation.ts`
   - Navigation clavier (flèches, Entrée, Échap)
   - Listeners globaux `window.addEventListener` / `document.querySelector`
   - Logique d'animation de sélection

4. Supprimer `MiniInput` local et utiliser `NumberInput` de `src/components/ui.tsx`

**Critère de validation :** `HeroRoster/index.tsx` < 100 lignes, chaque sous-composant < 200 lignes, tests existants toujours au vert.

---

### 1.2 Clarifier le flux d'import de profil dans `ProfileManager.tsx`

**Problème :** `importProfileFromJson` génère un nouvel `id`, puis `updateProfile` fait un upsert. Ce couplage peut produire un état incohérent entre `activeProfile`, `activeProfileId` et `profiles`.

**Actions :**

1. Créer une action dédiée `importProfile(profile: PlayerProfile)` dans `useRallyStore.ts`
   - Ajoute le profil à la liste
   - Le sélectionne comme profil actif
   - Persiste correctement l'identifiant actif

2. Dans `ProfileManager.tsx`, remplacer l'appel `updateProfile(profile)` par `importProfile(profile)`

3. Interdire que `updateProfile` soit utilisé pour l'import externe (ajouter un commentaire JSDoc explicite sur son contrat)

4. Ajouter un test unitaire dans `useRallyStore.test.ts` couvrant le scénario d'import

**Critère de validation :** le flux import → sélection → persistence est couvert par un test, `updateProfile` n'est plus appelé depuis `ProfileManager` pour l'import.

---

### 1.3 Découper les responsabilités de `useRallyStore.ts`

**Problème :** Le store gère l'hydratation initiale, le bootstrap du premier profil, la persistance, la sélection du profil actif, le calcul du résultat et l'état de navigation UI.

**Actions :**

1. Identifier les responsabilités actuelles et les regrouper en slices logiques :
   - **Slice profil** : CRUD profils, sélection active, persistance
   - **Slice calcul/rally** : stats, widgets, héros, configuration rally, résultat calculé
   - **Slice UI/navigation** : onglet actif, état des panneaux

2. Refactorer en utilisant le pattern de slices Zustand (fonctions créatrices séparées combinées dans le store principal) — ou extraire dans des stores séparés si le couplage le permet

3. Déplacer la logique de persistance (lecture/écriture localStorage) dans `src/lib/storage.ts` ; le store appelle storage, pas l'inverse

4. Garder les calculs dérivés (`computeFormation`, `computeDamageScore`) dans `src/lib/formulas.ts` ; le store ne fait qu'appeler et stocker le résultat

**Critère de validation :** chaque slice/module a une responsabilité unique, les tests existants du store restent au vert, aucun appel direct à `localStorage` dans le store.

---

### 1.4 Centraliser le catalogue héros

**Problème :** Les métadonnées héros sont réparties entre `types/index.ts`, `heroes.ts`, `HeroRoster.tsx` et `StatsForm.tsx`. L'ajout d'un héros implique de synchroniser au moins 4 endroits.

**Actions :**

1. Créer `src/lib/heroCatalog.ts` (ou enrichir `heroes.ts`) avec :
   - Données métier : `HERO_DB`, listes de leads/joiners (déjà dans `heroes.ts`)
   - Métadonnées UI : chemin d'image, label de widget, groupe d'affichage
   - Groupes et filtres exportés comme fonctions ou constantes pures

2. Dériver `HeroName` depuis les clés de `HERO_DB` pour éviter la synchronisation manuelle :
   ```ts
   export type HeroName = keyof typeof HERO_DB;
   ```

3. Supprimer les définitions dupliquées dans `HeroRoster.tsx` et `StatsForm.tsx`

4. Mettre à jour `AGENTS.md` — section "Adding a hero" pour refléter le nouveau workflow en un seul fichier

**Critère de validation :** ajouter un héros ne nécessite de modifier qu'un seul fichier (`heroCatalog.ts` ou `heroes.ts`), `heroes.test.ts` couvre la cohérence des données.

---

## Priorité 2 — Nettoyages React et réduction de dette

Ces tâches peuvent être traitées en parallèle ou dans n'importe quel ordre après la priorité 1.

---

### 2.1 Extraire `useAnimatedHeroPanel` depuis `UserDataPage.tsx`

**Problème :** `UserDataPage.tsx` gère `selectedHero`, `renderedHero`, `panelState`, `panelDx` et un timer manuel. Un `eslint-disable` masque des dépendances `useEffect` manquantes.

**Actions :**

1. Créer `src/hooks/useAnimatedHeroPanel.ts` encapsulant :
   - La logique d'état (`selectedHero`, `renderedHero`, `panelState`, `panelDx`)
   - La gestion du timer de transition
   - L'API publique (sélectionner/fermer un héros)

2. Dans `UserDataPage.tsx`, remplacer le code extrait par un appel au hook

3. Supprimer le commentaire `eslint-disable`

**Critère de validation :** `UserDataPage.tsx` < 80 lignes, aucun `eslint-disable`, le comportement visuel identique vérifié manuellement.

---

### 2.2 Extraire `CustomTooltip` dans `ParticipantGraph.tsx`

**Problème :** Le tooltip est défini dans le corps du composant et injecté comme JSX, ce qui viole la règle React "ne pas créer de composant dans le render" (signalé par le lint).

**Actions :**

1. Extraire `CustomTooltip` en composant stable à l'extérieur de `ParticipantGraph`
   - Soit dans le même fichier en dehors de la fonction principale
   - Soit dans `src/components/Results/ParticipantGraphTooltip.tsx`

2. Vérifier qu'aucun warning lint n'est lié à ce composant

**Critère de validation :** 0 warning lint sur `ParticipantGraph.tsx`.

---

### 2.3 Formaliser la validation et la migration dans `storage.ts`

**Problème :** Le parsing des profils locaux accepte silencieusement des données partiellement corrompues, sans versionnement clair.

**Actions :**

1. Ajouter un champ `_version: number` dans `PlayerProfile` (valeur courante : `2`)

2. Créer une fonction `validateProfile(data: unknown): PlayerProfile | null` avec des garde-types explicites

3. Rendre les migrations explicites :
   ```ts
   function migrateProfile(raw: unknown): PlayerProfile { ... }
   ```
   Une migration par changement de version, testée individuellement

4. Appliquer `validateProfile` à l'import JSON externe et au chargement localStorage

5. En cas de profil invalide : ignorer silencieusement et logger en console (pas de throw en production)

6. Ajouter des tests dans `storage.test.ts` couvrant : profil v1 → v2, données invalides, import JSON corrompu

**Critère de validation :** les tests de migration passent, l'import d'un JSON malformé ne crash pas l'application.

---

### 2.4 Clarifier le statut des données `User Data` non branchées

**Problème :** `bearLevel`, `ownedHeroes`, `govGear`, `govCharmLevel`, `staticBonuses`, `troops` sont stockés et éditables mais n'alimentent aucun calcul.

**Action :**

Décision produit requise. Deux options :

**Option A — Brancher au calcul :** implémenter la prise en compte de ces données dans `computeFormation` / `computeDamageScore`. Travail conséquent, à planifier séparément.

**Option B — Signaler explicitement :** ajouter dans l'UI un indicateur visible ("Ces données sont enregistrées pour une future version du calculateur") sur les sections concernées. Coût minimal, élimine la confusion utilisateur.

La recommandation est l'**Option B à court terme**, en attendant une décision produit sur l'Option A.

**Critère de validation :** l'utilisateur ne peut pas penser qu'une modification de ces champs impacte le résultat actuel.

---

## Priorité 3 — Améliorations de qualité long terme

Ces tâches sont moins urgentes mais réduiront le coût d'évolution futur.

---

### 3.1 Consolider `ui.tsx` en bibliothèque de primitives

**Problème :** `MiniInput` est redéfini dans `HeroRoster.tsx`, et plusieurs `<input>` sont stylés à la main dans d'autres composants, dupliquant règles de parsing et comportements clavier.

**Actions :**

1. Vérifier que `NumberInput` de `ui.tsx` couvre les cas d'usage de `MiniInput`
2. Supprimer `MiniInput` local après migration
3. Standardiser le pattern `display` + `commit()` dans un composant ou hook partagé
4. Documenter les composants disponibles dans `ui.tsx` avec un commentaire JSDoc de référence

---

### 3.2 Ajouter un Error Boundary applicatif

**Problème :** La SPA part du principe que tous les composants rendent correctement. Avec des graphiques, du parsing local et des données dynamiques, c'est fragile.

**Actions :**

1. Créer `src/components/ErrorBoundary.tsx` (composant de classe React standard)
2. L'envelopper autour de l'arbre principal dans `App.tsx`
3. Prévoir un fallback visuel propre et une action "Réinitialiser"

---

### 3.3 Renforcer progressivement TypeScript strict

**Problème :** `strict: true` n'est pas activé dans les tsconfigs applicatifs.

**Actions :**

1. Activer les options les moins risquées en premier : `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
2. Corriger les erreurs résultantes (probablement dans `storage.ts` et le store)
3. Activer `strict: true` une fois les priorités 1 et 2 terminées
4. Supprimer les `(p: any)` dans `useRallyStore.test.ts` (18 warnings lint actuels)

---

## Récapitulatif et ordre suggéré

| # | Tâche | Priorité | Effort estimé | Dépendances |
|---|-------|----------|---------------|-------------|
| 1.1 | Décomposer `HeroRoster.tsx` | P1 | Élevé | 1.4 d'abord |
| 1.2 | Flux d'import de profil | P1 | Faible | — |
| 1.3 | Découper `useRallyStore` | P1 | Moyen | 1.2 d'abord |
| 1.4 | Centraliser catalogue héros | P1 | Moyen | — |
| 2.1 | Hook `useAnimatedHeroPanel` | P2 | Faible | — |
| 2.2 | Extraire `CustomTooltip` | P2 | Très faible | — |
| 2.3 | Validation/migration `storage.ts` | P2 | Moyen | — |
| 2.4 | Clarifier statut `User Data` | P2 | Très faible (Option B) | — |
| 3.1 | Consolider `ui.tsx` | P3 | Faible | 1.1 d'abord |
| 3.2 | Error Boundary | P3 | Faible | — |
| 3.3 | TypeScript strict | P3 | Moyen | P1 + P2 terminées |

**Ordre d'exécution recommandé :**

```
1.4 → 1.1 → 1.2 → 1.3   (P1, séquentiel car couplé)
2.2 → 2.4                 (P2 rapides, en parallèle)
2.1 → 2.3                 (P2 moyens)
3.2 → 3.1 → 3.3           (P3, après stabilisation)
```

---

## Règles transverses pour chaque tâche

- Chaque tâche doit laisser la suite de tests au vert (`npm test`)
- Chaque tâche doit laisser le build propre (`npm run build`)
- Chaque tâche doit laisser le lint sans nouvelles erreurs (`npm run lint`)
- Les tests existants ne doivent pas être supprimés, seulement adaptés si l'interface publique change
- Pas d'ajout de fonctionnalité pendant un refactoring — une PR = un refactoring
