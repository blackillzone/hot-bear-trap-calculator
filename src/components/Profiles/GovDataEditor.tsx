import { useRallyStore } from '../../store/useRallyStore';
import { HERO_GEAR_SLOTS, HERO_GEAR_LABELS } from '../../types';
import type { GovGearData, HeroName } from '../../types';
import { Field, NumberInput, SectionCard } from '../ui';
import { HeroRoster } from './HeroRoster';
import { StaticStatsEditor } from './StaticStatsEditor';
import { TroopEditor } from './TroopEditor';

type Tab = 'heroes' | 'gov-gear' | 'static-stats' | 'troops';

function GovernorGearEditor() {
  const activeProfile = useRallyStore(s => s.activeProfile);
  const updateProfile  = useRallyStore(s => s.updateProfile);

  if (!activeProfile) return null;

  const govGear = activeProfile.govGear;
  const govCharm = activeProfile.govCharmLevel;

  function updateGear(slot: keyof GovGearData, value: number) {
    updateProfile({ govGear: { ...govGear, [slot]: value } });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Équipement gouverneur">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HERO_GEAR_SLOTS.map(slot => (
            <Field key={slot} label={HERO_GEAR_LABELS[slot]}>
              <NumberInput
                value={govGear[slot]}
                onChange={v => updateGear(slot, v)}
                min={0} max={26} step={1}
              />
            </Field>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Charmes / Gemmes">
        <Field label="Niveau des charmes" row>
          <NumberInput
            value={govCharm}
            onChange={v => updateProfile({ govCharmLevel: v })}
            min={0} max={22} step={1}
            className="w-28"
          />
        </Field>
      </SectionCard>
    </div>
  );
}

export function GovDataEditor({
  selectedHero,
  setSelectedHero,
  onFilteredHeroesChange,
  activeTab,
}: {
  selectedHero: HeroName | null;
  setSelectedHero: (h: HeroName | null, dir?: 'left' | 'right') => void;
  onFilteredHeroesChange?: (heroes: HeroName[]) => void;
  activeTab: Tab;
}) {
  const activeProfile = useRallyStore(s => s.activeProfile);

  if (!activeProfile) return null;

  return (
    <div>
      {/* Tab content (sans tab bar — géré par le Header) */}
      <div>
        {activeTab === 'heroes'       && (
          <HeroRoster
            selectedHero={selectedHero}
            setSelectedHero={setSelectedHero}
            onFilteredHeroesChange={onFilteredHeroesChange}
          />
        )}
        {activeTab === 'gov-gear'     && <GovernorGearEditor />}
        {activeTab === 'static-stats' && (
          <SectionCard title="Stats statiques">
            <StaticStatsEditor />
          </SectionCard>
        )}
        {activeTab === 'troops'       && (
          <SectionCard title="Inventaire de troupes">
            <TroopEditor />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
