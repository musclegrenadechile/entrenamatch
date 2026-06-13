// @ts-nocheck
import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Filters {
  minAge: number;
  maxAge: number;
  gender: 'todos' | 'hombre' | 'mujer';
  trainingTypes: string[];
  availability: string[];
  maxDistanceKm: number;
  onlyAvailableToday: boolean;
  onlyLiveTraining: boolean;
  onlyRealProfiles: boolean;
}

export const DISCOVERY_AGE_MIN = 18
export const DISCOVERY_AGE_MAX = 70
/** Slider value ≥ this means “sin límite” in Explorar. */
export const DISCOVERY_DISTANCE_UNLIMITED_KM = 100

export const defaultDiscoveryFilters: Filters = {
  minAge: DISCOVERY_AGE_MIN,
  maxAge: DISCOVERY_AGE_MAX,
  gender: 'todos',
  trainingTypes: [],
  availability: [],
  maxDistanceKm: DISCOVERY_DISTANCE_UNLIMITED_KM,
  onlyAvailableToday: false,
  onlyLiveTraining: false,
  onlyRealProfiles: false,
};

export function useFilters() {
  const [filters, setFilters] = useLocalStorage<Filters>('filters', defaultDiscoveryFilters);

  // One-time migration from pre-v0.1.381 defaults (50 km cap, edad máx 45–50).
  useEffect(() => {
    try {
      if (localStorage.getItem('filters_v381_migrated') === '1') return
      setFilters((prev) => {
        let next = prev
        if (prev.maxDistanceKm === 25 || prev.maxDistanceKm === 50) {
          next = { ...next, maxDistanceKm: DISCOVERY_DISTANCE_UNLIMITED_KM }
        }
        if (prev.maxAge <= 50) {
          next = { ...next, maxAge: DISCOVERY_AGE_MAX }
        }
        return next === prev ? prev : next
      })
      localStorage.setItem('filters_v381_migrated', '1')
    } catch { /* ignore */ }
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultDiscoveryFilters);
  }, [setFilters]);

  const toggleTrainingType = useCallback((type: string) => {
    setFilters(prev => ({
      ...prev,
      trainingTypes: prev.trainingTypes.includes(type)
        ? prev.trainingTypes.filter(t => t !== type)
        : [...prev.trainingTypes, type]
    }));
  }, [setFilters]);

  const toggleAvailability = useCallback((time: string) => {
    setFilters(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...prev.availability, time]
    }));
  }, [setFilters]);

  return {
    filters,
    setFilters,
    resetFilters,
    toggleTrainingType,
    toggleAvailability,
  };
}
