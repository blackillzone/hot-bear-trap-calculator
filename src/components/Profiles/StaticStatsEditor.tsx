import { useRallyStore } from "../../store/useRallyStore";
import type { StaticBonuses } from "../../types";
import { Field, NumberInput, SectionCard } from "../ui";

type BonusKey = keyof StaticBonuses;

interface StatGroup {
  label: string;
  keys: { key: BonusKey; label: string }[];
}

const STAT_GROUPS: StatGroup[] = [
  {
    label: "Squad (tous types)",
    keys: [
      { key: "squad_atk", label: "ATK %" },
      { key: "squad_def", label: "DEF %" },
      { key: "squad_let", label: "LET %" },
      { key: "squad_hp", label: "HP %" },
    ],
  },
  {
    label: "Infantry",
    keys: [
      { key: "inf_atk", label: "ATK %" },
      { key: "inf_def", label: "DEF %" },
      { key: "inf_let", label: "LET %" },
      { key: "inf_hp", label: "HP %" },
    ],
  },
  {
    label: "Cavalry",
    keys: [
      { key: "cav_atk", label: "ATK %" },
      { key: "cav_def", label: "DEF %" },
      { key: "cav_let", label: "LET %" },
      { key: "cav_hp", label: "HP %" },
    ],
  },
  {
    label: "Archers",
    keys: [
      { key: "arc_atk", label: "ATK %" },
      { key: "arc_def", label: "DEF %" },
      { key: "arc_let", label: "LET %" },
      { key: "arc_hp", label: "HP %" },
    ],
  },
];

export function StaticStatsEditor() {
  const activeProfile = useRallyStore((s) => s.activeProfile);
  const updateProfile = useRallyStore((s) => s.updateProfile);

  if (!activeProfile) return null;

  const bonuses = activeProfile.staticBonuses;

  function updateStat(key: BonusKey, value: number) {
    updateProfile({ staticBonuses: { ...bonuses, [key]: value } });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Valeurs totales des stats affichées directement dans le jeu (recherche +
        alliance + île + animaux cumulés).
      </p>
      {STAT_GROUPS.map((group) => (
        <SectionCard key={group.label} title={group.label}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {group.keys.map(({ key, label }) => (
              <Field key={key} label={label}>
                <NumberInput
                  value={bonuses[key]}
                  onChange={(v) => updateStat(key, v)}
                  min={0}
                  step={0.1}
                  suffix="%"
                />
              </Field>
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
