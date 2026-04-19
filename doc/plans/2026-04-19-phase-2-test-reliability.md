# Phase 2 : Renforcer la fiabilité des tests — Plan détaillé

## Objectifs
- ✅ Remplacer assertions vacantes par assertions comportementales
- ✅ Assurer hermétique du store (pas de fuite d'état)
- ✅ Consolider E2E tests avec assertions métier

---

## 2.1 – Assertions comportementales (5–6 fichiers)

### Fichiers à corriger

| Fichier | Problème actuel | Solution |
|---------|------------------|----------|
| `StatsForm.test.tsx` | `expect(container).toBeDefined()` | ✅ Rendre form, tester inputs, onChange, values |
| `RallyConfig.test.tsx` | `expect(document.querySelector()).toBeDefined()` | ✅ Tester widget selection, participants update |
| `OptimalRatioPie.test.tsx` | Pas d'assertions sur valeurs affichées | ✅ Vérifier data prop, calcul ratio, SVG |
| `DamageScore.test.tsx` | Assertion générique `/\+/` | ✅ Vérifier damage value, formatting, %  |
| `TroopTable.test.tsx` | Smoke test léger | ✅ Vérifier rows count, cellules, données |

### Critères pour chaque test

- **Rendre** : Composant affiche sans erreur
- **Interagir** : Inputs, buttons, selects changent state/store
- **Vérifier** : Outputs reflètent inputs (changement → re-render)
- **Assert** : ≥ 2 assertions comportementales (non juste "exist")

---

## 2.2 – Hermétique du store

### Action
1. Créer `src/test/storeFixture.ts`
   ```typescript
   export const resetStore = () => useRallyStore.setState(defaultStoreState)
   ```

2. Ajouter `beforeEach` dans tous les tests store/compo:
   ```typescript
   beforeEach(() => {
     resetStore()
     localStorage.clear()
   })
   ```

3. Vérifier que tests exécutés dans n'importe quel ordre = même résultat

---

## 2.3 – E2E tests (assertions métier)

### Fichiers à consolidar
- `e2e/bear-trap-calculator.spec.ts`
- `e2e/profiles.spec.ts`
- `e2e/user-data.spec.ts`

### Actions
- Remplacer `waitForTimeout(500)` → `page.waitForSelector()`
- Remplacer assertions vagues (`> 100`) → assertions spécifiques
- Ajouter post-action assertions (calculé, modifié, supprimé)
- Supprimer `catch (){}` silencieux

---

## Checklist par fichier

### StatsForm.test.tsx
- [ ] Rendre form avec props
- [ ] Changer inf_atk slider
- [ ] Vérifier onChange appelé avec value
- [ ] Vérifier form re-render avec nouveau value

### RallyConfig.test.tsx
- [ ] Rendre config
- [ ] Sélectionner widget
- [ ] Vérifier participants count change
- [ ] Vérifier joiner selection

### OptimalRatioPie.test.tsx
- [ ] Rendre avec data
- [ ] Vérifier pourcentages calculés
- [ ] Vérifier SVG path drawn
- [ ] Vérifier légende

### DamageScore.test.tsx
- [ ] Rendre avec damage value
- [ ] Vérifier texte « Damage: XYZ »
- [ ] Vérifier amélioration %
- [ ] Tester edge cases (0%, 100%)

### TroopTable.test.tsx
- [ ] Rendre avec participants
- [ ] Vérifier rows count = participants
- [ ] Vérifier données affichées
- [ ] Vérifier formatage (%, niveau)

---

## Succès pour Phase 2

```bash
✅ npm test — tous tests passent
✅ Chaque test compo a ≥ 2 assertions comportementales
✅ Store hermétique (beforeEach reset)
✅ E2E tests 15/15 passent
✅ Pas de catch () {} silencieux
```
