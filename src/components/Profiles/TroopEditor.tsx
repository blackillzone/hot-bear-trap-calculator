import { useRallyStore } from "../../store/useRallyStore";
import { TROOP_LEVELS } from "../../types";
import type { TroopLevel, TroopType, TroopInventory } from "../../types";
import { NumberInput } from "../ui";

const TROOP_TYPES: { type: TroopType; label: string }[] = [
  { type: "inf", label: "Infantry" },
  { type: "cav", label: "Cavalry" },
  { type: "arc", label: "Archers" },
];

const TYPE_COLOR: Record<TroopType, string> = {
  inf: "text-red-400",
  cav: "text-yellow-400",
  arc: "text-blue-400",
};

const TIER_SEPARATOR_BEFORE = "TG1"; // Draw a visual separator before TG tiers

export function TroopEditor() {
  const activeProfile = useRallyStore((s) => s.activeProfile);
  const updateProfile = useRallyStore((s) => s.updateProfile);

  if (!activeProfile) return null;

  const troops = activeProfile.troops;

  function updateTroop(type: TroopType, level: TroopLevel, value: number) {
    const updated: TroopInventory = {
      ...troops,
      [type]: { ...troops[type], [level]: value },
    };
    updateProfile({ troops: updated });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 pr-3 w-12">
              Tier
            </th>
            {TROOP_TYPES.map(({ type, label }) => (
              <th
                key={type}
                className={`text-center text-xs font-semibold uppercase tracking-wider pb-2 px-2 ${TYPE_COLOR[type]}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TROOP_LEVELS.map((level) => (
            <tr
              key={level}
              className={
                level === TIER_SEPARATOR_BEFORE
                  ? "border-t border-orange-500/30"
                  : ""
              }
            >
              <td className="py-1 pr-3">
                <span
                  className={`text-xs font-bold ${level.startsWith("TG") ? "text-orange-400" : "text-gray-400"}`}
                >
                  {level}
                </span>
              </td>
              {TROOP_TYPES.map(({ type }) => (
                <td key={type} className="py-1 px-2">
                  <NumberInput
                    value={troops[type][level]}
                    onChange={(v) => updateTroop(type, level, v)}
                    min={0}
                    step={1000}
                    className="text-center"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-600 mt-3">
        Les niveaux TG (Truegold) sont surlignés en orange.
      </p>
    </div>
  );
}
