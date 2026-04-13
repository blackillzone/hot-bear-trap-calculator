# Architecture de l'application

## Vue d'ensemble

HOT - Kingshot Tools est une Single Page Application (SPA) qui calcule la formation optimale pour un rally Bear Trap dans Kingshot. Elle est entièrement statique (pas de backend), toutes les données sont gérées localement dans le navigateur.

```
formation-calculator/
├── public/              # Assets statiques (favicon, icônes SVG)
├── src/
│   ├── assets/          # Images (hero.png)
│   ├── components/      # Composants React (voir détail ci-dessous)
│   ├── lib/             # Logique métier pure (formules, héros, storage)
│   ├── store/           # État global Zustand
│   ├── types/           # Types TypeScript centralisés
│   ├── index.css        # Styles globaux (Tailwind v4 import)
│   └── main.tsx         # Point d'entrée React
├── doc/                 # Cette documentation
├── .github/workflows/   # GitHub Actions CI/CD
├── index.html           # Shell HTML principal
├── vite.config.ts       # Configuration Vite
└── tsconfig.json        # Configuration TypeScript
```

---

## Composants (`src/components/`)

```
components/
├── App.tsx                        # Routeur par onglet (formation / participants / profiles / guide)
├── Guide.tsx                      # Onglet Guide — explications textuelles du calcul
├── ui.tsx                         # Primitives réutilisables : SectionCard, Field, Select, Label
├── Layout/
│   ├── Header.tsx                 # Barre de navigation + sélecteur de profil
│   └── Footer.tsx                 # Liens de sources (Frakinator, Kingshot Simulator)
├── LeaderStats/
│   ├── StatsForm.tsx              # Grille 5×3 INF/CAV/ARC : ATK%, LET%, Widget, Lead Hero
│   └── HeroSelect.tsx             # Dropdown Lead Hero avec badges de génération colorés
├── Profiles/
│   └── ProfileManager.tsx         # Création / sélection / suppression de profils
├── RallyConfig/
│   └── RallyConfig.tsx            # Capacité du rally, participants, niveau du Bear Trap
└── Results/
    ├── OptimalRatioPie.tsx        # Camembert Recharts — répartition optimale INF/CAV/ARC
    ├── TroopTable.tsx             # Tableau de distribution des troupes par participant
    ├── DamageScore.tsx            # Score de dommage estimé + barre de fill
    ├── ParticipantGraph.tsx       # BarChart Recharts — damage vs nombre de participants
    └── JoinerRecommender.tsx      # Recommandations de héros joiners (top 3, cliquables)
```

### Composants UI primitifs (`ui.tsx`)

| Composant | Rôle |
|---|---|
| `SectionCard` | Bloc avec header coloré et contenu, sans `overflow-hidden` sur l'outer div (requis pour les dropdowns) |
| `Field` | Wrapper label + input |
| `Select<T>` | `<select>` typé générique avec styles cohérents |
| `Label` | Label de formulaire |

---

## Logique métier (`src/lib/`)

### `formulas.ts` — Calculs principaux

| Fonction | Description |
|---|---|
| `attackFactor(atk, let)` | Calcule `(1 + atk/100) × (1 + let/100)` — facteur d'attaque combiné |
| `archerTierMultiplier(tier, tg)` | Multiplicateur archers : `1.1` de base, `×1.1` si T7+ et TG3+ |
| `computeOptimalRatio(stats, widgets, tier, tg, joiners)` | Multiplicateurs de Lagrange : calcule les fractions optimales INF/CAV/ARC |
| `computeDamageScore(...)` | Score relatif de dommage pour une distribution donnée |
| `computeFormation(...)` | Résultat complet : ratio + distribution + score |
| `computeParticipantCurve(...)` | Courbe de damage en fonction du nombre de participants (1–15) |

**Formule de ratio optimal** (Multiplicateurs de Lagrange) :
```
α = A_inf / 3
β = A_cav
γ = (4.4 / 3) × A_arc × archerMult

f_inf = α² / (α² + β² + γ²)
f_cav = β² / (α² + β² + γ²)
f_arc = γ² / (α² + β² + γ²)
```

### `heroes.ts` — Base de données des héros

- Interface `HeroData` : `name`, `type`, `atk_bonus`, `let_bonus`, `skill_bonuses[5]`, `bonus_type`, `widget_effect`, `generation`, `skill`, `description`
- `HERO_DB` : dictionnaire complet de tous les héros modélisés
- `LEAD_INF/CAV/ARC_HEROES` : listes ordonnées (G1 → G2 → … → Epic → Rare → None/Other)
- `JOINER_HEROES` : pool de héros utilisables comme joiners

**Types de bonus joiner :**
- `atk_all` : ajoute X% ATK à tous les types de troupes (ex: Amane)
- `let_all` : ajoute X% LET à tous les types de troupes (ex: Chenko, Yeonwoo, Amadeus)
- `none` : pas d'effet joiner modélisé

**Effets widget :**
- `rally_atk` : le widget augmente l'ATK des troupes du rally
- `rally_let` : le widget augmente la LET des troupes du rally
- `none` : widget sans effet rally

### `storage.ts` — Persistance localStorage

- `loadProfiles()` / `saveProfiles()` : sérialisation JSON + migration des anciens profils (ajout de `widget_levels` si absent)
- `createProfile(name)` : crée un profil avec stats/widgets à 0
- `defaultStats()`, `defaultWidgets()`, `defaultWidgetLevels()` : valeurs par défaut

---

## État global (`src/store/useRallyStore.ts`)

Zustand avec `subscribeWithSelector`. L'état se synchronise automatiquement avec le `localStorage` via un subscriber.

**Slices de l'état :**

| Slice | Description |
|---|---|
| `profiles[]` | Liste des profils joueur |
| `activeProfileId` | ID du profil actif |
| `activeProfile` | Profil actif (calculé) |
| `rallyConfig` | Capacité, participants, Bear Trap level, 4 slots joiner |
| `result` | Résultat calculé (ratio, distribution, score) |
| `activeTab` | Onglet courant |

**Actions principales :**
- `newProfile(name)` / `selectProfile(id)` / `updateProfile(partial)` / `removeProfile(id)`
- `setRallyConfig(partial)` — met à jour la config rally
- `setJoiner(slot, update)` — met à jour un slot joiner (0–3)
- `setActiveTab(tab)` — navigation par onglet

---

## Types (`src/types/index.ts`)

```typescript
TroopType = 'inf' | 'cav' | 'arc'
TroopTier = 'T1-T6' | 'T7-T9' | 'T10' | 'T11'
TGLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

TroopStats      // ATK% et LET% par type de troupe (inf_atk, inf_let, ...)
WidgetStats     // Bonus widget par type de troupe
WidgetLevels    // Niveau de widget par type (0 = non possédé, 1–10)
PlayerProfile   // Profil complet : stats + widgets + hero leads + tier + TG
RallyConfig     // Capacité + participants + bear level + 4 joiners
JoinerSlot      // { hero: HeroName, skillLevel: 1–5 }
OptimalRatio    // { inf: number, cav: number, arc: number }
FormationResult // ratio + troop distribution + damage score
```

---

## Flux de données

```
User input (StatsForm / RallyConfig)
         │
         ▼
  useRallyStore (Zustand)
         │  auto-save localStorage
         │
         ▼
  computeFormation() [formulas.ts]
         │
         ▼
  result: FormationResult
         │
    ┌────┴────────────────┐
    ▼                     ▼
OptimalRatioPie     TroopTable / DamageScore
(Recharts PieChart) (chiffres + barres)
                          │
                    JoinerRecommender
                    (top 3 combos)
```
