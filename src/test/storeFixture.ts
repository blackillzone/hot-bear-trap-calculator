/**
 * Store fixtures and utilities for testing
 *
 * Ensures proper isolation and reset of store state between tests
 * to prevent state leakage and intermittent test failures.
 */

import { useRallyStore } from "../store/useRallyStore";
import type { RallyStore } from "../types";

/**
 * Default store state - used to reset store between tests
 */
export function getDefaultStoreState(): RallyStore {
  return {
    profiles: useRallyStore.getState().profiles.length > 0 
      ? useRallyStore.getState().profiles 
      : [],
    activeProfileId: useRallyStore.getState().activeProfileId,
    activeProfile: useRallyStore.getState().activeProfile,
    rallyConfig: useRallyStore.getState().rallyConfig,
    result: useRallyStore.getState().result,
    activeView: "rally" as const,
    activeTab: "overview" as const,
    selectedJoiner: null,
    
    // Actions
    newProfile: useRallyStore.getState().newProfile,
    selectProfile: useRallyStore.getState().selectProfile,
    updateProfile: useRallyStore.getState().updateProfile,
    duplicateProfile: useRallyStore.getState().duplicateProfile,
    removeProfile: useRallyStore.getState().removeProfile,
    setActiveView: useRallyStore.getState().setActiveView,
    setActiveTab: useRallyStore.getState().setActiveTab,
    importProfile: useRallyStore.getState().importProfile,
    exportProfile: useRallyStore.getState().exportProfile,
    setStats: useRallyStore.getState().setStats,
    setWidgets: useRallyStore.getState().setWidgets,
    setHeroes: useRallyStore.getState().setHeroes,
    setTroops: useRallyStore.getState().setTroops,
    setJoiner: useRallyStore.getState().setJoiner,
    setSelectedJoiner: useRallyStore.getState().setSelectedJoiner,
  };
}

/**
 * Reset store to default state
 *
 * Use in beforeEach() to ensure clean state between tests
 * @example
 * beforeEach(() => {
 *   resetStore()
 *   localStorage.clear()
 * })
 */
export function resetStore(): void {
  // Load initial state from localStorage or use defaults
  const stored = localStorage.getItem("ks_profiles");
  const activeProfileId = localStorage.getItem("ks_active_profile");
  
  // Reset to initial state
  useRallyStore.setState({
    profiles: stored ? JSON.parse(stored) : [],
    activeProfileId: activeProfileId ?? null,
  });
}

/**
 * Create store snapshot for verification
 * Useful for comparing store before/after state
 */
export function captureStoreState() {
  const state = useRallyStore.getState();
  return {
    profiles: JSON.parse(JSON.stringify(state.profiles)),
    activeProfileId: state.activeProfileId,
    activeProfile: state.activeProfile ? JSON.parse(JSON.stringify(state.activeProfile)) : null,
    rallyConfig: JSON.parse(JSON.stringify(state.rallyConfig)),
  };
}
