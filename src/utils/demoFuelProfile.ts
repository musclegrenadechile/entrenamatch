import type { FuelProfile } from '../types'
import { buildFuelProfile } from './fuelCalculator'

/** Perfil Fuel mínimo para E2E EntrenaPlan (oleada 402). */
export function buildE2EDemoFuelProfile(): FuelProfile {
  return {
    ...buildFuelProfile({
      weightKg: 75,
      heightCm: 175,
      age: 28,
      gender: 'hombre',
      goal: 'muscle',
      activityLevel: 'moderate',
    }),
    updatedAt: Date.now(),
  }
}