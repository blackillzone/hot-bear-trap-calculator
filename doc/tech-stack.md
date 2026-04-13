# Stack technologique

## Vue d'ensemble

| Technologie | Version | Rôle |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Build tool & dev server |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 4 | Styles utilitaires |
| Zustand | 5 | État global |
| Recharts | 3 | Graphiques |
| Lucide React | 1 | Icônes |
| clsx | 2 | Composition de classes CSS |

---

## React 19

**Pourquoi React ?**  
Framework SPA mature, large écosystème, adapté à une UI réactive basée sur un état global calculé. React 19 apporte les améliorations de performance du compilateur React et une meilleure gestion des refs.

**Pattern utilisé :** composants fonctionnels uniquement, hooks (`useState`, `useMemo`, `useEffect`, `useRef`).

**Pas de routing :** la navigation entre onglets (Formation / Participants / Profiles / Guide) est gérée par un simple état `activeTab` dans le store Zustand — pas besoin de React Router pour une application mono-page aussi simple.

---

## Vite 8

**Pourquoi Vite ?**  
- Build ultra-rapide grâce à Rolldown (Rust)
- Hot Module Replacement (HMR) instantané en développement
- Configuration minimale pour un projet React+TypeScript

**Configuration clé (`vite.config.ts`) :**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/hot-bear-trap-calculator/',  // requis pour GitHub Pages
})
```

Le plugin `@tailwindcss/vite` (Tailwind v4) remplace la configuration via `postcss.config.js` — plus besoin de fichier de config séparé.

---

## TypeScript

Typage strict sur l'ensemble du projet. Les types centralisés dans `src/types/index.ts` garantissent la cohérence entre les formules, le store et les composants.

**Points importants :**
- `TroopTier` et `TGLevel` sont des union types étroits — toute valeur invalide est une erreur de compilation
- `HeroName` liste explicitement tous les héros — ajouter un héros nécessite de l'ajouter ici en premier
- Les génériques (`Select<T>`) permettent des composants UI type-safe

---

## Tailwind CSS v4

**Pourquoi Tailwind v4 et pas v3 ?**  
Tailwind v4 utilise un processeur CSS natif (oxide) beaucoup plus rapide et supprime le fichier `tailwind.config.js`. La configuration se fait directement dans le CSS via `@theme`.

**Conventions utilisées dans le projet :**
- Classes utilitaires directement dans le JSX (pas de classes custom sans raison)
- `clsx()` pour les classes conditionnelles
- Palette : `gray-800/900` (fond), `orange-400/500/600` (accent), `green/purple/blue` (types de troupes)
- Pas de `overflow-hidden` sur les conteneurs qui ont des dropdowns enfants (ex: `SectionCard`)

**Note sur `overflow-hidden` :**  
Un problème connu en Tailwind+React : un `overflow-hidden` sur un ancêtre coupe les dropdowns en `position:absolute`. Dans ce projet, `SectionCard` n'a pas `overflow-hidden` sur le div externe — seulement sur le header.

---

## Zustand 5

**Pourquoi Zustand ?**  
- API minimaliste (pas de boilerplate Redux)
- Compatible avec `subscribeWithSelector` pour réagir à des changements de sous-état précis
- Pas de Provider React — le store est importé directement

**Pattern de persistance :**
```typescript
// Subscription qui sauvegarde automatiquement à chaque changement
useRallyStore.subscribe(
  s => s.profiles,
  profiles => saveProfiles(profiles)
);
```

**Selectors nommés** pour éviter les re-renders inutiles :
```typescript
export const selectStats = (s: RallyStore) => s.activeProfile?.stats ?? defaultStats();
export const selectWidgets = (s: RallyStore) => s.activeProfile?.widgets ?? defaultWidgets();
```

---

## Recharts 3

Recharts est une librairie de graphiques React basée sur D3, avec une API déclarative en JSX.

### `OptimalRatioPie` — PieChart

```tsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height="100%">
  <PieChart>
    <Pie data={data} dataKey="value" labelLine={false} label={CustomLabel}>
      {data.map(entry => (
        <Cell key={entry.name} fill={COLORS[entry.name]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

**Couleurs des types de troupes :**
| Type | Couleur | Code |
|---|---|---|
| Infantry | Bleu | `#3b82f6` |
| Cavalry | Violet | `#a855f7` |
| Archery | Vert | `#22c55e` |

**Label personnalisé :** calculé avec trigonométrie (angle midpoint de chaque segment) pour afficher le pourcentage au centre de chaque portion.

### `ParticipantGraph` — BarChart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

<ResponsiveContainer width="100%" height="100%">
  <BarChart data={normalized}>
    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
    <XAxis dataKey="participants" />
    <YAxis tickFormatter={v => `${v}%`} />
    <ReferenceLine x={config.participants} stroke="#f97316" />
    <Bar dataKey="normalizedScore">
      {normalized.map((entry, i) => (
        <Cell key={i} fill={entry.participants === config.participants ? '#f97316' : '#374151'} />
      ))}
    </Bar>
    <Tooltip content={<CustomTooltip />} />
  </BarChart>
</ResponsiveContainer>
```

**Points clés :**
- `ResponsiveContainer` : adapte le graphique à la largeur du conteneur parent
- `ReferenceLine` : ligne verticale orange sur le participant count courant
- `Cell` : permet de coloriser individuellement chaque barre
- `normalizedScore` : le score brut est normalisé sur 100 pour l'affichage (la barre la plus haute = 100%)
- Tooltip personnalisé avec fond `bg-gray-800` pour correspondre au thème dark

**Avertissement Recharts connu :**  
```
The width(-1) and height(-1) of chart should be greater than 0
```
Ce warning apparaît quand `ResponsiveContainer` est dans un conteneur caché (onglet inactif). C'est bénin — Recharts re-render correctement une fois l'onglet affiché.

---

## Lucide React

Icônes SVG en composants React. Utilisé pour les icônes de section (`Lightbulb`, `TrendingUp`, `PieChart`, `Grid`, etc.) et les icônes de navigation.

```tsx
import { Lightbulb } from 'lucide-react';
<Lightbulb size={15} />
```

---

## Dépendances de développement

| Package | Rôle |
|---|---|
| `@vitejs/plugin-react` | Support JSX/Fast Refresh pour React dans Vite |
| `@tailwindcss/vite` | Intégration Tailwind v4 dans le pipeline Vite |
| `eslint` + `eslint-plugin-react-hooks` | Linting — détection des règles des hooks |
| `typescript-eslint` | Linting TypeScript |
| `@types/react`, `@types/react-dom` | Types TypeScript pour React |
