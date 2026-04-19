# Plan de remédiation suite à l'audit de codebase — 2026-04-19

**Objectif cible :** Une SPA React propre, avec architecture maintenable, pratiques TypeScript solides, suite de tests fiable.

**État actuel :** Améliorations réelles, mais chaîne qualité incomplètement verte et tests de composants insuffisants.

---

## Vue d'ensemble des problèmes critiques

| Catégorie | Problème | Impact |
|-----------|---------|--------|
| **Qualité** | `npm run lint:ci` échoue (59 warnings) | CI/CD bloquée |
| **Qualité** | `npm run test:coverage` échoue (couverture branches insuffisante) | Pas de déploiement possible |
| **Fiabilité tests** | Assertions vacantes dans tests composants (ex. `expect(container).toBeDefined()`) | Fausse confiance de qualité |
| **Fiabilité tests** | E2E trop permissifs (`waitForTimeout`, assertions génériques) | Régressions non détectées |
| **Architecture** | `useRallyStore` trop dense (260 lignes, 8+ responsabilités) | Maintenance difficile, bugs métier |
| **Architecture** | `HeroRoster.tsx` monolithique (578 lignes, 4 sous-composants) | Complexité non testable |
| **Architecture** | `HeroDetailPanel.tsx` sans couverture (381 lignes) | Risque élevé en prod |
| **Métier** | Données éditables non branchées au calcul | Confusion utilisateur, dette produit |
| **TypeScript** | Non-null assertions omniprésentes, `strict` non activé | Faux sentiment de sécurité |
| **Bundle** | Chunk principal ~902 kB, aucun code splitting | Performance dégradée |

---

## Stratégie générale

### Phase 1 : **Stabiliser la chaîne qualité** (Semaine 1–2)
*Objectif : Rendre `lint:ci` et `test:coverage` verts.*

**Raison :** Bloquer tout déploiement tant que CI/CD n'est pas verte.

### Phase 2 : **Renforcer la fiabilité des tests** (Semaine 2–3)
*Objectif : Remplacer assertions vacantes, consolider E2E, assurer hermétique du store.*

**Raison :** Avoir une vraie confiance dans la suite de tests.

### Phase 3 : **Refactoriser et améliorer la modularité** (Semaine 3–4)
*Objectif : Décomposer `useRallyStore`, `HeroRoster`, `HeroDetailPanel`.*

**Raison :** Rendre le code maintenable à long terme.

### Phase 4 : **Couvrir les zones critiques** (Semaine 4–5)
*Objectif : Tests pour `HeroDetailPanel`, `JoinerRecommender`, `ParticipantGraph`, hooks.*

**Raison :** Protéger les zones de risque élevé.

---

## Phase 1 : Stabiliser la chaîne qualité (2–3 jours)

### 1.1 – Nettoyer les warnings Biome (lint)

**Tâche :** Éliminer les 59 warnings de lint.

**Fichiers impactés :**
- `src/store/useRallyStore.ts` — non-null assertions
- `src/hooks/useHeroRosterNavigation.ts` — non-null assertions
- `src/components/Results/JoinerRecommender.tsx` — non-null assertions + patterns
- `src/components/Profiles/HeroDetailPanel.tsx` — accessibilité
- Tests divers — non-null assertions dans `.test.ts`

**Actions :**
1. Exécuter `npm run lint` et trier par fichier
2. Remplacer chaque `!` par une vérification défensive (guard clause, optional chaining, nullish coalescing)
3. Corriger les warnings d'accessibilité (labels, ARIA)
4. Corriger les imports inutilisés et variables non utilisées
5. Valider : `npm run lint` = 0 warnings

**Critère de succès :**
```
✓ npm run lint — aucun warning
✓ npm run lint:ci — passe (pas de diagnostics)
```

### 1.2 – Augmenter la couverture de branches (test:coverage)

**Tâche :** Atteindre les seuils pour `heroes.ts` et `storage.ts`.

**Fichiers impactés :**
- `src/lib/heroes.ts` — 83.33% → 100% branches
- `src/lib/storage.ts` — 94.64% → 100% branches

**Actions :**
1. Lancer `npm run test:coverage` et examiner les rapports HTML par fichier
2. Identifier les branches non couvertes (fallbacks, erreurs, edge cases)
3. Ajouter des tests spécifiques pour chaque branche manquante :
   - Pour `heroes.ts` : cas de corruption data, héros avec propriétés invalides
   - Pour `storage.ts` : localStorage indisponible, données corrompues, versioning
4. Valider : `npm run test:coverage` = passe avec 100% branches

**Branches attendues :**
- `heroes.ts` : tests de validation HERO_DB (doublons, références invalides)
- `storage.ts` : tests de recovery (corrupted JSON, missing keys)

**Critère de succès :**
```
✓ npm run test:coverage — seuils atteints
✓ Couverture branches : heroes.ts 100%, storage.ts 100%
```

---

## Phase 2 : Renforcer la fiabilité des tests (3–4 jours)

### 2.1 – Remplacer les assertions vacantes par des assertions comportementales

**Tâche :** Audit et réécriture des tests de composants.

**Fichiers à reclasser :**

| Fichier | Problème | Solution |
|---------|---------|----------|
| `StatsForm.test.tsx` | `expect(container).toBeDefined()` | Vérifier inputs, outputs et values |
| `RallyConfig.test.tsx` | `expect(document.querySelector()).toBeDefined()` | Tester change handlers, state updates |
| `OptimalRatioPie.test.tsx` | Pas d'assertions sur valeurs affichées | Vérifier data prop, SVG calculations |
| `DamageScore.test.tsx` | Assertion générique `/\+/` | Vérifier amélioration calculée, formatting |
| `TroopTable.test.tsx` | Smoke test léger | Vérifier rows, cellules, données |

**Actions par test :**

1. **`StatsForm.test.tsx`**
   - Remplacer assertions vacantes par : rendre form, remplir inputs, vérifier onChange appelé, vérifier valeurs
   - Tester min/max, validation edge cases

2. **`RallyConfig.test.tsx`**
   - Remplacer assertions génériques par : rendre, changer widget, vérifier store updated, affichage correct
   - Tester participants count, joiners selection

3. **`OptimalRatioPie.test.tsx`**
   - Ajouter assertions sur : data récupérées, calcul ratio, affichage pourcentage, légende correcte

4. **`DamageScore.test.tsx`**
   - Tester : valeur damage affichée, amélioration calculée, formatting correct, cas edge (0%, 100%)

5. **`TroopTable.test.tsx`**
   - Tester : nombre de lignes = participants, formatage valeurs, couleurs type troupe correctes

**Critère de succès :**
```
✓ Chaque test a ≥ 2 assertions comportementales (pas juste "exist" ou length > 0)
✓ npm run test — 134 tests passent
✓ Couverture composants : seuil minimum 20% comportemental
```

### 2.2 – Consolider l'hermétique du store (tests)

**Tâche :** Assurer aucune fuite d'état entre tests.

**Problème actuel :**
- `beforeEach` fait juste `localStorage.clear()`
- `setState` partiel laisse des champs de test précédent

**Actions :**

1. Créer `src/test/storeFixture.ts` :
```typescript
export const defaultStoreState = { /* copy de initialState */ }
export const resetStore = () => useRallyStore.setState(defaultStoreState)
```

2. Mettre à jour tous les tests utilisant le store :
```typescript
beforeEach(() => {
  resetStore()
  localStorage.clear()
})
```

3. Vérifier tests compo qui utilisent store : `StatsForm`, `RallyConfig`, etc.

**Critère de succès :**
```
✓ Tests exécutés dans n'importe quel ordre = résultat identique
✓ npm run test:watch — exécution répétée stable
```

### 2.3 – Renforcer les E2E avec vraies assertions métier

**Tâche :** Remplacer smoke tests par assertions fonctionnelles.

**Fichiers à consolider :**
- `e2e/bear-trap-calculator.spec.ts`
- `e2e/profiles.spec.ts`
- `e2e/user-data.spec.ts`

**Problèmes actuels :**
- `waitForTimeout(...)` au lieu de waitFor
- Assertions `pageText.length > 0` ou `> 100` sans vrai business logic
- Clics sans vérification post-action
- Assertions type `expect(isVisible).toBeTruthy()` sans contexte

**Actions :**

1. **Bear Trap Calculator :**
   - ✅ Remplir form (leader, widgets, troops)
   - ✅ Vérifier calcul affiche résultat > 0 (pas juste "existe")
   - ✅ Changer leader → résultat change
   - ✅ Ajouter joiner → participants += 1
   - ✅ Vérifier ratio pie affiche bonnes proportions

2. **Profiles :**
   - ✅ Créer profil, vérifier dans liste
   - ✅ Éditer profil (stats, widgets), vérifier save
   - ✅ Dupliquer profil, vérifier données copiées
   - ✅ Supprimer profil, vérifier disparu
   - ✅ Import/export JSON round-trip

3. **User Data :**
   - ✅ Créer hero roster, ajouter héros
   - ✅ Vérifier gear, level, stars editable
   - ✅ Affichage correct par génération
   - ✅ Navigation clavier (arrow keys)

**Remplacer :**
- `waitForTimeout(500)` → `page.waitForSelector()`
- `pageText.length > 100` → assertion sur texte spécifique ou nombre
- Assertions vacantes → assertions avec contexte métier

**Critère de succès :**
```
✓ npm run test:e2e — 15/15 passent
✓ Chaque E2E teste ≥ 1 scénario métier concret
✓ Pas de catch () {} ; erreurs visibles
✓ Temps tests < 2 min total
```

---

## Phase 3 : Refactoriser et améliorer la modularité (4–5 jours)

### 3.1 – Décomposer `useRallyStore` (260 lignes, 8+ responsabilités)

**Responsabilités actuelles à extraire :**
1. Chargement profils (persistence, localStorage)
2. Sélection profil actif
3. Configuration rally (stats, widgets, troops)
4. Calcul résultats
5. Gestion UI (activeView, activeTab)
6. Import/export profil
7. Suppression profil
8. Bootstrap initial

**Stratégie :**
- Créer `src/store/profileStorage.ts` — persistance + CRUD profil
- Créer `src/store/rallyCalculation.ts` — formules + calcul (pur)
- Garder `useRallyStore` comme orchestrateur mince

**Actions :**

1. **Créer `profileStorage.ts`** :
```typescript
export const loadProfiles = (): Profile[] => { /* localStorage + parse */ }
export const saveProfile = (p: Profile) => { /* localStorage.setItem */ }
export const deleteProfile = (id: string) => { /* splice et save */ }
```

2. **Créer `rallyCalculation.ts`** :
```typescript
export const computeRallyResults = (config: RallyConfig): Results => { 
  return {
    optimal: computeOptimalRatio(...),
    damage: computeDamageScore(...),
    // ...
  }
}
```

3. **Refactor `useRallyStore`** :
   - Émettre localStorage → appeler `profileStorage.load/save`
   - Émettre calcul → appeler `rallyCalculation.computeRallyResults`
   - Garder sélection et UI state

4. **Tester** : 
   - `npm run test` — store tests passent toujours
   - Nouvelle couverture sur `profileStorage` et `rallyCalculation`

**Critère de succès :**
```
✓ useRallyStore < 150 lignes
✓ profileStorage et rallyCalculation testés
✓ Responsabilités séparées clairement
✓ npm test — couverture stable
```

### 3.2 – Refactoriser `HeroRoster.tsx` (578 lignes, 4 sous-composants)

**Structure actuelle :**
- HeroRoster (main, 578 lignes)
  - SlideFilterBar (interne)
  - Tooltip (interne)
  - HeroCard (interne)
- HeroDetailPanel (externe, 381 lignes)

**Objectif :** < 250 lignes HeroRoster, tous sous-composants extrait externally.

**Actions :**

1. **Créer `src/components/Profiles/SlideFilterBar.tsx`** (cible: 50–70 lignes)
   - Props : `value: string`, `onChange: (v: string) => void`, `options: string[]`
   - Logique de filtrage sortie

2. **Créer `src/components/Profiles/HeroCard.tsx`** (cible: 60–80 lignes)
   - Props : `hero`, `isSelected`, `onClick`, `onHover`

3. **Créer `src/components/Profiles/HeroTooltip.tsx`** (cible: 40–60 lignes)
   - Affichage stats héros au hover

4. **Refactor `HeroRoster.tsx`** :
   - Import sous-composants
   - Utiliser `useHeroRosterNavigation` (déjà fait)
   - Réduire à logique de haut niveau + layout
   - Target < 250 lignes

5. **Tester** :
   - Ajouter tests pour `SlideFilterBar`, `HeroCard`
   - Vérifier HeroRoster toujours marche

**Critère de succès :**
```
✓ HeroRoster.tsx < 250 lignes
✓ SlideFilterBar, HeroCard, HeroTooltip existants et testés
✓ npm test — couverture composants améliorée
✓ Fonctionnalité identique (navigation, filtrage, selection)
```

---

## Phase 4 : Couvrir les zones critiques (3–4 jours)

### 4.1 – Ajouter couverture pour `HeroDetailPanel.tsx` (381 lignes, 0% couv)

**Complexité du composant :**
- Édition gear (dropdown multi-select)
- Édition étoiles (stars input)
- Affichage stats
- Widget selection
- Slider level
- SVG interactif

**Actions :**

1. Créer `src/components/Profiles/HeroDetailPanel.test.tsx` avec 8–10 tests :
   - ✅ Rendre avec hero data
   - ✅ Changer level → onChange appelé
   - ✅ Ajouter stars → onChange appelé
   - ✅ Sélectionner widget → onChange appelé
   - ✅ Sélectionner gear item → onChange appelé
   - ✅ Affichage stats correct
   - ✅ Désactivé si pas de hero
   - ✅ SVG interactive (click positions)

2. Utiliser React Testing Library pour rendre, fireEvent pour interactions

3. Mock `useRallyStore` comme nécessaire

**Critère de succès :**
```
✓ HeroDetailPanel.test.tsx existe, 8+ tests
✓ Couverture statements > 70%
✓ Tous les tests passent
```

### 4.2 – Ajouter couverture pour `JoinerRecommender.tsx` (0% couv)

**Logique :**
- Affichage recommandations joiners
- Classement par bonus
- Filtrage par type

**Actions :**

1. Créer `src/components/Results/JoinerRecommender.test.tsx` avec 5–6 tests :
   - ✅ Rendre avec data
   - ✅ Correct number de recommandations affichées
   - ✅ Classement par bonus (ordre correct)
   - ✅ Filtrage par type appliqué
   - ✅ No recommendations si vide
   - ✅ Click joiner → action

**Critère de succès :**
```
✓ JoinerRecommender.test.tsx existe
✓ 5+ tests
✓ Couverture statements > 60%
```

### 4.3 – Ajouter couverture pour `ParticipantGraph.tsx` (0% couv)

**Logique :**
- Chart rendering (chart.js ou recharts)
- Data transformation
- Légende

**Actions :**

1. Créer `src/components/Results/ParticipantGraph.test.tsx` :
   - Mock chart library (vitest.mock)
   - ✅ Rendre avec participants
   - ✅ Données transformées correctement
   - ✅ Axes, titres affichés
   - ✅ Cas vide (no data)

**Critère de succès :**
```
✓ ParticipantGraph.test.tsx existe
✓ 3–4 tests
✓ Couverture > 50%
```

### 4.4 – Ajouter couverture pour les hooks (0% couv)

**Fichiers :**
- `src/hooks/useAnimatedHeroPanel.ts` — animation state, timers
- `src/hooks/useHeroRosterNavigation.ts` — keyboard navigation

**Actions :**

1. `useAnimatedHeroPanel.test.ts` :
   - ✅ Animation starts/stops
   - ✅ Timeout cleanup

2. `useHeroRosterNavigation.test.ts` :
   - ✅ Arrow key handlers work
   - ✅ Selection moves up/down
   - ✅ Wrapping at boundaries
   - ✅ Event cleanup

**Critère de succès :**
```
✓ Chaque hook a 3–4 tests
✓ Couverture > 70% par hook
```

### 4.5 – Ajouter couverture pour `UserDataPage.tsx` (0% couv)

**Actions :**

1. `src/components/UserData/UserDataPage.test.tsx` :
   - ✅ Rendre page
   - ✅ Sections affichées (hero roster, gov data, static stats, troops)
   - ✅ Tab navigation fonctionne
   - ✅ Données s'affichent
   - ✅ Forms éditables

**Critère de succès :**
```
✓ UserDataPage.test.tsx existe, 5+ tests
✓ Couverture > 50%
```

---

## Vue d'ensemble des fichiers à créer / modifier

### Fichiers à créer

**Phase 1 :**
- (Tests seulement, pas de fichier structurel)

**Phase 2 :**
- `src/test/storeFixture.ts` — reset store pour tests

**Phase 3 :**
- `src/store/profileStorage.ts` — persistance profil
- `src/store/rallyCalculation.ts` — calcul résultats
- `src/components/Profiles/SlideFilterBar.tsx` — filtre héros
- `src/components/Profiles/HeroCard.tsx` — carte héros
- `src/components/Profiles/HeroTooltip.tsx` — tooltip héros

**Phase 4 :**
- `src/components/Profiles/HeroDetailPanel.test.tsx`
- `src/components/Results/JoinerRecommender.test.tsx`
- `src/components/Results/ParticipantGraph.test.tsx`
- `src/hooks/useAnimatedHeroPanel.test.ts`
- `src/hooks/useHeroRosterNavigation.test.ts`
- `src/components/UserData/UserDataPage.test.tsx`

### Fichiers à modifier (linting)

**Phase 1 :**
- `src/store/useRallyStore.ts` — supprimer `!` assertions
- `src/hooks/useHeroRosterNavigation.ts` — supprimer `!` assertions
- `src/components/Results/JoinerRecommender.tsx` — supprimer `!` assertions, patterns
- `src/components/Profiles/HeroDetailPanel.tsx` — fixes accessibilité
- Tests `.test.ts` — supprimer `!` assertions

### Fichiers à modifier (couverture)

**Phase 1 :**
- `src/lib/heroes.test.ts` — ajouter cas limites
- `src/lib/storage.test.ts` — ajouter recovery tests

### Fichiers à modifier (tests)

**Phase 2 :**
- Tous les tests composants (assertions)
- `src/store/useRallyStore.test.ts` — hermétique
- E2E tests (assertions métier)

---

## Checklist de validation par phase

### Phase 1 ✓
```
[ ] npm run lint — 0 warnings
[ ] npm run lint:ci — passe
[ ] npm run test:coverage — passe (100% branches heroes, storage)
```

### Phase 2 ✓
```
[ ] Tests composants ont assertions comportementales (2+)
[ ] Store hermétique (reset en beforeEach)
[ ] E2E tests 15/15 + assertions métier
[ ] npm test — 134 tests, tous verts
```

### Phase 3 ✓
```
[ ] profileStorage.ts créé et testé
[ ] rallyCalculation.ts créé et testé
[ ] useRallyStore refactorisé < 150 lignes
[ ] SlideFilterBar, HeroCard, HeroTooltip extraits
[ ] HeroRoster < 250 lignes
[ ] npm test — tous les tests passent
```

### Phase 4 ✓
```
[ ] HeroDetailPanel couvert (70%+)
[ ] JoinerRecommender couvert (60%+)
[ ] ParticipantGraph couvert (50%+)
[ ] Hooks couverts (70%+)
[ ] UserDataPage couvert (50%+)
[ ] npm run test:coverage — couverture globale > 40%
```

---

## Critères de succès finaux

| Métrique | Cible |
|----------|-------|
| `npm run build` | ✅ Passe |
| `npm run lint` | 0 warnings |
| `npm run lint:ci` | ✅ Passe |
| `npm run test:coverage` | ✅ Passe, seuils 100% (heroes, storage) |
| `npm run test` | 150+ tests, tous verts |
| `npm run test:e2e` | 15/15, assertions métier |
| Couverture composants | ≥ 20% (comportemental) |
| Couverture globale | ≥ 40% (tous les fichiers) |
| TypeScript warnings | 0 `!` assertions dans src/ |
| useRallyStore | < 150 lignes |
| HeroRoster | < 250 lignes |
| HeroDetailPanel | Couvert + documenté |

---

## Timeline estimée

| Phase | Durée | Semaine |
|-------|-------|---------|
| Phase 1 (Lint + Coverage) | 2–3 jours | Sem 1 |
| Phase 2 (Tests) | 3–4 jours | Sem 1–2 |
| Phase 3 (Refactor) | 4–5 jours | Sem 2–3 |
| Phase 4 (Couverture) | 3–4 jours | Sem 3 |
| **Total** | **12–16 jours** | **~2–3 semaines** |

---

## Ressources et dépendances

### Documentation à consulter
- `doc/architecture.md` — structure composants
- `doc/code-quality.md` — standards tests et linting
- `doc/kingshot-game.md` — logique métier
- `AGENTS.md` — conventions

### Outils
- `npm run lint` — Biome linting
- `npm run test` — Vitest + React Testing Library
- `npm run test:coverage` — Vue HTML coverage report
- `npm run test:e2e` — Playwright

### Communication requise
- Review architecturale après Phase 3 refactor

---

## Notes et considérations

1. **Ordre d'exécution critique :** Phases 1 → 2 → 3 → 4
   - Phase 1 débloque déploiement
   - Phase 2 assure fiabilité tests
   - Phase 3 restructure avant couverture
   - Phase 4 finalise coverage des zones critiques

2. **Réutilisabilité :** Les tests écrits en Phase 2 deviennent base pour Phase 4

3. **Revue recommandée :** Après Phase 1 et Phase 3 (points critiques)

4. **Données non branchées :** La décision produit concernant les données métier (bearLevel, ownedHeroes, etc.) est **hors scope** de ce plan mais peut être traitée indépendamment

5. **Optimisation bundle :** Déjà signalée mais **hors scope** de ce plan (peut être traité en Phase 5)

6. **TypeScript `strict` :** Aussi hors scope, mais peut suivre une fois lint/tests verts
