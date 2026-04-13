# AGENTS.md — AI Agent Configuration

This file configures AI coding assistants (GitHub Copilot, Claude, ChatGPT, etc.) working on this repository.

## Required reading

Before working on this codebase, load these files to understand the project:

| File | When to read |
|---|---|
| `doc/architecture.md` | Always — component tree, data flow, store structure, types |
| `doc/kingshot-game.md` | When touching heroes, formulas, or game data |
| `doc/tech-stack.md` | When touching build config, styling, or charts |
| `doc/deployment.md` | When touching CI/CD, GitHub Actions, or vite.config.ts |

---

## Project overview

- **App:** HOT — Kingshot Tools (Bear Trap Rally calculator)
- **Live URL:** https://blackillzone.github.io/hot-bear-trap-calculator/
- **Repo:** https://github.com/blackillzone/hot-bear-trap-calculator
- **Type:** Static SPA — React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **Root:** `formation-calculator/` (the workspace subfolder contains the app)

---

## Key conventions

### File structure
- All types in `src/types/index.ts` — add new types here first
- All hero data in `src/lib/heroes.ts` — `HERO_DB` + lead lists + joiner list
- Game math in `src/lib/formulas.ts` — pure functions, no side effects
- Global state in `src/store/useRallyStore.ts` — Zustand with `subscribeWithSelector`
- UI primitives in `src/components/ui.tsx` — `SectionCard`, `Select<T>`, `Field`, `Label`

### Coding rules
- Do **not** add `overflow-hidden` to `SectionCard`'s outer div — it clips dropdown menus
- Use named Zustand selectors (`selectStats`, `selectWidgets`, etc.) to avoid unnecessary re-renders
- `HeroName` in `types/index.ts` must be updated when adding a new hero
- Widget dropdowns: active = `Select<number>`, inactive = `Select<string>` with `pointer-events-none opacity-40`
- HeroSelect outside-click detection uses `click` event with `capture: true` (not `mousedown`) to avoid blocking child clicks

### Styling
- Dark theme: `gray-900` background, `gray-800` cards, `orange-400/500/600` accent
- Troop type colors: Infantry `blue-500`, Cavalry `purple-500`, Archery `green-500`
- Generation badge colors: G1–G6 orange, Epic violet, Rare blue

### Adding a hero
1. Add the name to `HeroName` in `src/types/index.ts`
2. Add a `HeroData` entry to `HERO_DB` in `src/lib/heroes.ts`
3. Add to the appropriate lead list (`LEAD_INF/CAV/ARC_HEROES`) or joiner list
4. If it's a joiner with real bonuses, add to `CANDIDATES` in `JoinerRecommender.tsx`

---

## Build & dev commands

```bash
cd formation-calculator

npm run dev        # Dev server → http://localhost:5173
npm run build      # TypeScript check + Vite build → dist/
npm run lint       # ESLint
npm run preview    # Preview the production build locally
```

---

## Deployment

Push to `main` → GitHub Actions builds and deploys to `gh-pages` branch → GitHub Pages serves it.

The `base` in `vite.config.ts` must stay as `/hot-bear-trap-calculator/` for GitHub Pages assets to resolve correctly.

---

## Data sources for game values

- Hero types, widget effects, skill bonuses: https://kingshotdata.com
- Battle mechanics formulas: https://frakinator.streamlit.app/
- Cross-reference: https://kingshotsimulator.com
