import { useState, useRef, useEffect } from "react";
import type { HeroName } from "../types";

export type PanelState = "enter" | "exit" | "idle";

interface AnimatedHeroPanelResult {
  selectedHero: HeroName | null;
  renderedHero: HeroName | null;
  panelState: PanelState;
  panelDx: string;
  handleSelectHero: (hero: HeroName | null, dir?: "left" | "right") => void;
}

/**
 * useAnimatedHeroPanel — Gère l'animation d'entrée/sortie du panneau héros.
 *
 * Encapsule :
 * - L'état selectedHero / renderedHero (pour maintenir le montage durant l'exit)
 * - La direction d'animation (panelDx)
 * - Le timer de transition entre deux héros
 */
export function useAnimatedHeroPanel(): AnimatedHeroPanelResult {
  const [selectedHero, setSelectedHero] = useState<HeroName | null>(null);
  const [renderedHero, setRenderedHero] = useState<HeroName | null>(null);
  const [panelState, setPanelState] = useState<PanelState>("idle");
  const [panelDx, setPanelDx] = useState<string>("80px");
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: renderedHero est un état dérivé — l'inclure causerait des boucles infinies
  useEffect(() => {
    if (exitTimer.current) clearTimeout(exitTimer.current);

    if (selectedHero) {
      if (renderedHero && renderedHero !== selectedHero) {
        // Panneau déjà ouvert : jouer l'exit puis swapper
        setPanelState("exit");
        exitTimer.current = setTimeout(() => {
          setRenderedHero(selectedHero);
          setPanelState("enter");
        }, 180);
      } else {
        setRenderedHero(selectedHero);
        setPanelState("enter");
      }
    } else {
      if (renderedHero) {
        setPanelState("exit");
        exitTimer.current = setTimeout(() => {
          setRenderedHero(null);
          setPanelState("idle");
        }, 180);
      }
    }
  }, [selectedHero]); // renderedHero intentionnellement exclu : il est un état dérivé

  function handleSelectHero(hero: HeroName | null, dir?: "left" | "right") {
    if (dir) setPanelDx(dir === "left" ? "-80px" : "80px");
    setSelectedHero(hero);
  }

  return { selectedHero, renderedHero, panelState, panelDx, handleSelectHero };
}
