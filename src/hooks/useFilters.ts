// @ts-nocheck
import { useCallback } from 'react';
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
}

const defaultFilters: Filters = {
  minAge: 18,
  maxAge: 50,
  gender: 'todos',
  trainingTypes: [],
  availability: [],
  maxDistanceKm: 50,
  onlyAvailableToday: false,
  onlyLiveTraining: false,
};

export function useFilters() {
  const [filters, setFilters] = useLocalStorage<Filters>('filters', defaultFilters);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
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
