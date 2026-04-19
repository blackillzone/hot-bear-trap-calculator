# Plan de remédiation - Synthèse et recommandations finales

**État**: Phase 1.1 ✅ Complétée | Phase 1.2-1.3 ⏳ | Phase 2+ 🔄  
**Date**: 2026-04-19  
**Commits**: 3 (lint cleanup + non-null assertions + storeFixture)

---

## ✅ Réalisé en Phase 1

### 1.1 – Nettoyage Biome Warnings
- **Avant**: 39 violations (noNonNullAssertion, noArrayIndexKey, noStaticElementInteractions)
- **Après**: 3 warnings (noStaticElementInteractions - acceptable)
- **Actions**: 
  - Convertis `!` → `?.` (optional chaining)
  - Remplacis `[i]!` → `[i]?` dans tous les tests
  - Fixé noArrayIndexKey dans HeroDetailPanel, JoinerRecommender, HeroRoster
  
### Fichiers modifiés (Phase 1)
- `src/components/Profiles/HeroDetailPanel.tsx` (SVG stars key, role)
- `src/components/Profiles/HeroRoster.tsx` (Tooltip role)
- `src/components/Results/JoinerRecommender.tsx` (combinations, apply logic)
- `src/components/UserData/UserDataPage.tsx` (navigation)
- `src/hooks/useHeroRosterNavigation.ts` (keyboard navigation)
- `src/lib/storage.test.ts` (40 tests optionnal chaining)
- `src/lib/formulas.test.ts` (array access chaining)
- Tous les test files modifiés pour `!` → `?`

### Commits Phase 1
```
830889d : Initial cleanup - noStaticElementInteractions, noArrayIndexKey
d9e7122 : Eliminate noNonNullAssertion by converting ! to ?.
```

---

## ⏳ À faire - Phase 1.2-1.3 (Branch Coverage)

### heroes.ts : 83.33% → 100% branches
**Branches manquantes** (lignes 489, 501):
```typescript
if (!hero || hero.bonus_type !== "atk_all") return sum;
if (!hero || hero.bonus_type !== "let_all") return sum;
```

**Tests à ajouter** (dans `src/lib/heroes.test.ts` à la fin):
```typescript
describe("getJoinerAtkAllBonus - branch coverage", () => {
  it("should handle missing hero gracefully", () => {
    const joiners = [{ hero: "InvalidHero" as any, skillLevel: 5 }, ...];
    expect(getJoinerAtkAllBonus(joiners)).toBe(0);
  });
  
  it("should skip non-atk_all bonus types", () => {
    const joiners = [{ hero: "Chenko", skillLevel: 5 }, ...];
    expect(getJoinerAtkAllBonus(joiners)).toBe(0);
  });
});

describe("getJoinerLetAllBonus - branch coverage", () => {
  // Similar tests for let_all...
});
```

### storage.ts : 94.64% → 100% branches
**Branches manquantes** (lignes 36, 140, 272):
- Line 36: `catch {}` block in validateProfile
- Line 140: `loadProfiles()` error handling
- Line 272: Default values fallback

**Tests à ajouter** (dans `src/lib/storage.test.ts`):
```typescript
it("should handle corrupted profile data gracefully", () => {
  localStorage.setItem("ks_profiles", "{ invalid json");
  const profiles = loadProfiles();
  expect(profiles).toEqual([]);
});

it("should validate and filter invalid profiles", () => {
  const mixed = [
    { valid profile },
    { missing required fields },
    { valid profile }
  ];
  localStorage.setItem("ks_profiles", JSON.stringify(mixed));
  const loaded = loadProfiles();
  expect(loaded).toHaveLength(2);
});
```

**Validation**: `npm run test:coverage` doit passer avec 100% branches

---

## 🔄 À faire - Phase 2 (Test Reliability)

### 2.1 – Assertions comportementales

Créer fichier : [2026-04-19-phase-2-test-reliability.md](./2026-04-19-phase-2-test-reliability.md)

**Fichiers à corriger**:
- `src/components/LeaderStats/StatsForm.test.tsx` → 3-4 tests comportementaux
- `src/components/RallyConfig/RallyConfig.test.tsx` → 2-3 tests
- `src/components/Results/OptimalRatioPie.test.tsx` → 2-3 tests
- `src/components/Results/DamageScore.test.tsx` → 2-3 tests
- `src/components/Results/TroopTable.test.tsx` → 2-3 tests

**Critère**: Chaque test ≥ 2 assertions qui vérifient comportement (pas juste « render »)

### 2.2 – Store Hermétique

✅ Fichier créé: `src/test/storeFixture.ts`

**Utilisation dans tous les tests**:
```typescript
import { resetStore } from "../test/storeFixture";

beforeEach(() => {
  resetStore();
  localStorage.clear();
});
```

### 2.3 – E2E Consolidation

`e2e/` tests doivent utiliser :
- `page.waitForSelector()` au lieu de `waitForTimeout()`
- Assertions spécifiques au lieu de `.length > 100`
- Post-action assertions (vérifier le résultat)

---

## 🚀 À faire - Phase 3-4 (Architecture)

### Phase 3.1 – Décomposer useRallyStore

`src/store/useRallyStore.ts` (260 lignes, 8+ responsabilités)

**Extraire**:
- `src/store/profileStorage.ts` (persist + CRUD)
- `src/store/rallyCalculation.ts` (formulas)
- Garder `useRallyStore` comme orchestrateur mince < 150 lignes

### Phase 3.2 – Refactoriser HeroRoster

`src/components/Profiles/HeroRoster.tsx` (578 lignes)

**Extraire**:
- `SlideFilterBar.tsx` (50-70 lignes)
- `HeroCard.tsx` (60-80 lignes)
- `HeroTooltip.tsx` (40-60 lignes)
- Target: < 250 lignes pour HeroRoster

### Phase 4 – Component Coverage

Ajouter tests:
- `HeroDetailPanel.test.tsx` (70%+ coverage)
- `JoinerRecommender.test.tsx` (60%+ coverage)
- `ParticipantGraph.test.tsx` (50%+ coverage)
- `useAnimatedHeroPanel.test.ts` (70%+ coverage)
- `useHeroRosterNavigation.test.ts` (70%+ coverage)

---

## 📋 Checklist pour complétion

### Phase 1 Final (2-3 jours)
- [ ] Ajouter 4-5 tests pour heroes.ts branches
- [ ] Ajouter 4-5 tests pour storage.ts branches
- [ ] Valider: `npm run test:coverage` passe ✅
- [ ] Commit Phase 1 complet

### Phase 2 (3-5 jours)
- [ ] Remplir assertions dans 5 test files
- [ ] Utiliser `resetStore()` dans store + compo tests
- [ ] Consolider E2E assertions
- [ ] Valider: `npm test && npm run test:e2e` passent ✅
- [ ] Commit Phase 2 complet

### Phase 3 (4-5 jours)
- [ ] Extraire profileStorage.ts, rallyCalculation.ts
- [ ] Refactoriser useRallyStore < 150 lignes
- [ ] Créer SlideFilterBar, HeroCard, HeroTooltip
- [ ] Valider: HeroRoster < 250 lignes, tests passent ✅
- [ ] Commit Phase 3 complet

### Phase 4 (3-4 jours)
- [ ] Ajouter tests pour HeroDetailPanel (70%+)
- [ ] Ajouter tests pour JoinerRecommender (60%+)
- [ ] Ajouter tests pour ParticipantGraph (50%+)
- [ ] Ajouter tests pour hooks (70%+)
- [ ] Valider: `npm run test:coverage` couverture globale > 40% ✅
- [ ] Commit Phase 4 complet

---

## 💡 Recommandations

1. **Prioriser Phase 2** : Assertions comportementales = plus d'impact qu'augmenter couverture
2. **Tester atomiquement** : 1 fonction = 1 test FIXABLE
3. **Utiliser `resetStore()`** : Prévient 90% des intermittent tests
4. **Éviter `!` assertions** : Utiliser `?.` ou vérifications défensives
5. **E2E testent métier** : Post-action assertions, pas just smoke tests

---

## 📊 Métriques finales (Cibles)

| Métrique | Cible | Status |
|----------|-------|--------|
| npm run lint | 0 warnings | ⏳ 3 remaining (noStaticElementInteractions) |
| npm run test | 150+ tests, all green | ✅ ~134 passing |
| npm run test:coverage | 100% (heroes, storage) | ⏳ Need 4-8 more tests |
| Component tests | ≥ 20% behavioral | ⏳ In progress |
| E2E tests | 15/15 passing | ⏳ Need refactor |
| useRallyStore | < 150 lines | ⏳ Phase 3 |
| HeroRoster | < 250 lines | ⏳ Phase 3 |

---

## 📝 Notes finales

**Pour contribuer au plan**:
1. Cloner la branche
2. Créer branche feature: `git checkout -b phase-X-feature`
3. Implémenter changes atomiquement
4. Exécuter tests localement: `npm test`
5. Commit avec message clair
6. Push et PR

**Questions?** Voir AGENTS.md, doc/architecture.md, doc/code-quality.md
