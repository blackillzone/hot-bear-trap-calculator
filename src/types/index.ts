// ─── Troop Types ─────────────────────────────────────────────────────────────
export type TroopType = 'inf' | 'cav' | 'arc';

export type TroopTier = 'T1-T6' | 'T7-T9' | 'T10' | 'T11';

export type TGLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Individual troop levels (T1–T10 standard, TG1–TG8 Truegold grades) */
export type TroopLevel =
  | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'
  | 'T6' | 'T7' | 'T8' | 'T9' | 'T10'
  | 'TG1' | 'TG2' | 'TG3' | 'TG4'
  | 'TG5' | 'TG6' | 'TG7' | 'TG8';

export const TROOP_LEVELS: TroopLevel[] = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10',
  'TG1', 'TG2', 'TG3', 'TG4', 'TG5', 'TG6', 'TG7', 'TG8',
];

/** Number of troops per type per level */
export type TroopInventory = {
  inf: Record<TroopLevel, number>;
  cav: Record<TroopLevel, number>;
  arc: Record<TroopLevel, number>;
};

// ─── Hero Gear ────────────────────────────────────────────────────────────────
export type HeroGearSlot = 'helm' | 'gloves' | 'shroud' | 'greaves';

export const HERO_GEAR_SLOTS: HeroGearSlot[] = ['helm', 'gloves', 'shroud', 'greaves'];

export const HERO_GEAR_LABELS: Record<HeroGearSlot, string> = {
  helm: 'Helm',
  gloves: 'Gloves',
  shroud: 'Shroud',
  greaves: 'Greaves',
};

export interface HeroGearData {
  /** Enhancement level: 0–100 (Mythic), up to 200 (Red Gear post-Imbuement) */
  level: number;
  /** Mastery Forging level: 0–20 (Mythic only, requires gear level ≥ 20) */
  masteryLevel: number;
}

/** Data for a hero owned by the player */
export interface OwnedHeroData {
  owned: boolean;
  /** Hero level 0–80 */
  level: number;
  /** Star tier 0–5 */
  stars: number;
  /** Sub-level within the current star (1–6), meaningful only when stars ≥ 1 */
  starSubLevel: number;
  /** Widget (Exclusive Gear) level 0–10, only relevant if hero has widget_effect ≠ 'none' */
  widgetLevel: number;
  /** Hero Gear: Helm, Gloves, Shroud, Greaves */
  gear: Record<HeroGearSlot, HeroGearData>;
}

// ─── Governor Gear & Charms ───────────────────────────────────────────────────

/** Governor Gear: 4 pieces (same slot names as hero gear), each 0–26 */
export interface GovGearData {
  helm: number;
  gloves: number;
  shroud: number;
  greaves: number;
}

// ─── Static Bonuses ───────────────────────────────────────────────────────────

/**
 * Global stat bonuses entered by the player (total from research, alliance, island, pets…).
 * The player copies the value directly from the in-game stats screen.
 */
export interface StaticBonuses {
  // Squad-wide
  squad_atk: number;
  squad_def: number;
  squad_let: number;
  squad_hp: number;
  // Infantry-specific
  inf_atk: number;
  inf_def: number;
  inf_let: number;
  inf_hp: number;
  // Cavalry-specific
  cav_atk: number;
  cav_def: number;
  cav_let: number;
  cav_hp: number;
  // Archers-specific
  arc_atk: number;
  arc_def: number;
  arc_let: number;
  arc_hp: number;
}

// ─── Hero Types ───────────────────────────────────────────────────────────────
export type HeroName =
  | 'None'
  | 'Other'
  // Infantry lead heroes
  | 'Amadeus'
  | 'Zoe'
  | 'Hilde'
  | 'Eric'
  | 'Alcar'
  | 'Margot'
  | 'Rosa'
  | 'Howard'
  | 'Longfei'
  | 'Thrud'
  // Cavalry lead heroes
  | 'Jabel'
  | 'Petra'
  | 'Saul'
  | 'Gordon'
  | 'Helga'
  | 'Edwin'
  | 'Jaeger'
  | 'Fahd'
  // Archery lead heroes
  | 'Marlin'
  | 'Quinn'
  | 'Vivian'
  // Joiner / universal heroes
  | 'Amane'
  | 'Chenko'
  | 'Yeonwoo'
  | 'Diana'
  | 'Forrest'
  | 'Seth'
  | 'Olive';

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Global stats per troop type (ATK% and LET% as entered by the player) */
export interface TroopStats {
  inf_atk: number;
  inf_let: number;
  cav_atk: number;
  cav_let: number;
  arc_atk: number;
  arc_let: number;
}

/** Widget bonus per troop type (optional, added on top of global stats) */
export interface WidgetStats {
  inf_atk: number;
  inf_let: number;
  cav_atk: number;
  cav_let: number;
  arc_atk: number;
  arc_let: number;
}

/** Widget gear level per troop type (0 = not owned, 1–10) */
export interface WidgetLevels {
  inf: number;
  cav: number;
  arc: number;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface PlayerProfile {
  id: string;
  name: string;
  createdAt: string;
  stats: TroopStats;
  widgets: WidgetStats;
  heroes: {
    inf: HeroName;
    cav: HeroName;
    arc: HeroName;
  };
  troop_tier: TroopTier;
  tg_level: TGLevel;
  /** Rally capacity saved per profile (default: 2 000 000) */
  rally_capacity: number;
  /** Exclusive gear widget level per troop type (0 = not owned, 1–10) */
  widget_levels: WidgetLevels;
  /** Heroes owned by the player with levels, stars and gear */
  ownedHeroes: Partial<Record<HeroName, OwnedHeroData>>;
  /** Governor Gear levels (4 pieces, 0–26 each) */
  govGear: GovGearData;
  /** Governor Charm level (0–22) */
  govCharmLevel: number;
  /** Static bonuses (total from research, alliance, island, pets) */
  staticBonuses: StaticBonuses;
  /** Troop inventory per type and level */
  troops: TroopInventory;
}

// ─── Joiner Slot ─────────────────────────────────────────────────────────────
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

/** One joiner participant: which hero they bring and at what skill level */
export interface JoinerSlot {
  hero: HeroName;
  skillLevel: SkillLevel;
}

// ─── Rally Config ─────────────────────────────────────────────────────────────
export interface RallyConfig {
  /** Total troop capacity of the rally */
  capacity: number;
  /** Number of participants (1–15), equal split */
  participants: number;
  /** Bear Trap level (0–5). Default: 5 */
  bearLevel: 0 | 1 | 2 | 3 | 4 | 5;
  /** Up to 4 joiner heroes with their skill level */
  joiners: [JoinerSlot, JoinerSlot, JoinerSlot, JoinerSlot];
}

// ─── Calculation Results ──────────────────────────────────────────────────────
export interface OptimalRatio {
  inf: number; // 0–1
  cav: number; // 0–1
  arc: number; // 0–1
}

export interface TroopDistribution {
  troopsPerParticipant: number;
  inf: number;
  cav: number;
  arc: number;
  totalInf: number;
  totalCav: number;
  totalArc: number;
  total: number;
}

export interface FormationResult {
  ratio: OptimalRatio;
  distribution: TroopDistribution;
  damageScore: number;
  naiveScore: number;    // equal 33/33/33 for comparison
  maxScore: number;      // theoretical max (same as damageScore at optimal)
}

// ─── Participant Optimizer ───────────────────────────────────────────────────
export interface ParticipantDataPoint {
  participants: number;
  damageScore: number;
  troopsPerParticipant: number;
  fillRate: number; // 0–1, how well the rally is filled
}
