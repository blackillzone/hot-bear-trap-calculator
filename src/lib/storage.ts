import type {
  PlayerProfile, TroopStats, WidgetStats, WidgetLevels,
  OwnedHeroData, HeroGearSlot, GovGearData, StaticBonuses, TroopInventory, TroopLevel,
} from '../types';
import { TROOP_LEVELS } from '../types';

const PROFILES_KEY = 'ks_profiles';
const ACTIVE_KEY = 'ks_active_profile';
const MAX_PROFILES = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultWidgetLevels(): WidgetLevels {
  return { inf: 0, cav: 0, arc: 0 };
}

function defaultHeroGear(): Record<HeroGearSlot, { level: number; masteryLevel: number }> {
  return {
    helm:    { level: 0, masteryLevel: 0 },
    gloves:  { level: 0, masteryLevel: 0 },
    shroud:  { level: 0, masteryLevel: 0 },
    greaves: { level: 0, masteryLevel: 0 },
  };
}

function defaultGovGear(): GovGearData {
  return { helm: 0, gloves: 0, shroud: 0, greaves: 0 };
}

function defaultStaticBonuses(): StaticBonuses {
  return {
    squad_atk: 0, squad_def: 0, squad_let: 0, squad_hp: 0,
    inf_atk:   0, inf_def:   0, inf_let:   0, inf_hp:   0,
    cav_atk:   0, cav_def:   0, cav_let:   0, cav_hp:   0,
    arc_atk:   0, arc_def:   0, arc_let:   0, arc_hp:   0,
  };
}

function defaultTroops(): TroopInventory {
  const emptyTierRecord = () =>
    Object.fromEntries(TROOP_LEVELS.map(l => [l, 0])) as Record<TroopLevel, number>;
  return {
    inf: emptyTierRecord(),
    cav: emptyTierRecord(),
    arc: emptyTierRecord(),
  };
}


// ─── Profile CRUD ─────────────────────────────────────────────────────────────

export function loadProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const profiles = raw ? (JSON.parse(raw) as PlayerProfile[]) : [];
    // Migrate: ensure every profile has all fields from newer versions
    return profiles.map(p => ({
      ...p,
      widget_levels:  p.widget_levels  ?? defaultWidgetLevels(),
      ownedHeroes:    p.ownedHeroes    ?? {},
      govGear:        p.govGear        ?? defaultGovGear(),
      govCharmLevel:  p.govCharmLevel  ?? 0,
      staticBonuses:  p.staticBonuses  ?? defaultStaticBonuses(),
      troops:         p.troops         ?? defaultTroops(),
    }));
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: PlayerProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function createProfile(name: string): PlayerProfile {
  return {
    id: generateId(),
    name: name || 'My Profile',
    createdAt: new Date().toISOString(),
    stats: defaultStats(),
    widgets: defaultWidgets(),
    widget_levels: defaultWidgetLevels(),
    heroes: { inf: 'None', cav: 'None', arc: 'None' },
    troop_tier: 'T10',
    tg_level: 0,
    rally_capacity: 2_000_000,
    ownedHeroes: {},
    govGear: defaultGovGear(),
    govCharmLevel: 0,
    staticBonuses: defaultStaticBonuses(),
    troops: defaultTroops(),
  };
}

export function upsertProfile(profiles: PlayerProfile[], profile: PlayerProfile): PlayerProfile[] {
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    const next = [...profiles];
    next[idx] = profile;
    return next;
  }
  if (profiles.length >= MAX_PROFILES) {
    // Remove the oldest if at limit
    return [...profiles.slice(1), profile];
  }
  return [...profiles, profile];
}

export function deleteProfile(profiles: PlayerProfile[], id: string): PlayerProfile[] {
  return profiles.filter(p => p.id !== id);
}

// ─── Active Profile ───────────────────────────────────────────────────────────

export function loadActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportProfile(profile: PlayerProfile): void {
  const json = JSON.stringify(profile, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kingshot-profile-${profile.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProfileFromJson(json: string): PlayerProfile | null {
  try {
    const obj = JSON.parse(json) as Partial<PlayerProfile>;
    if (!obj.stats || !obj.heroes) return null;
    return {
      ...createProfile(obj.name ?? 'Imported Profile'),
      ...obj,
      id: generateId(), // always give a new ID on import
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultStats(): TroopStats {
  return {
    inf_atk: 0, inf_let: 0,
    cav_atk: 0, cav_let: 0,
    arc_atk: 0, arc_let: 0,
  };
}

export function defaultWidgets(): WidgetStats {
  return {
    inf_atk: 0, inf_let: 0,
    cav_atk: 0, cav_let: 0,
    arc_atk: 0, arc_let: 0,
  };
}

export function defaultOwnedHeroData(): OwnedHeroData {
  return {
    owned: false,
    level: 1,
    stars: 0,
    starSubLevel: 1,
    widgetLevel: 0,
    gear: defaultHeroGear(),
  };
}









