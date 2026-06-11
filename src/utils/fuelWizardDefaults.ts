/** Fase 92 — Fuel wizard: ≤3 preguntas + defaults desde perfil EntrenaMatch. */

import type { FuelGoal, FuelProfile, ProfileGender } from '../types'
import { buildFuelProfile } from './fuelCalculator'

export interface FuelWizardHints {
  age?: number
  gender?: ProfileGender
  weekTrainedCount?: number
  goals?: string[]
}

export interface FuelWizardAnswers {
  goal: FuelGoal
  activityLevel: FuelProfile['activityLevel']
  weightKg: number
}

export function inferActivityFromTraining(
  weekTrainedCount = 0
): FuelProfile['activityLevel'] {
  if (weekTrainedCount >= 5) return 'very_active'
  if (weekTrainedCount >= 4) return 'active'
  if (weekTrainedCount >= 2) return 'moderate'
  return 'light'
}

export function inferGoalFromProfile(goals?: string[]): FuelGoal {
  if (!goals?.length) return 'muscle'
  const text = goals.join(' ').toLowerCase()
  if (text.includes('perder') || text.includes('grasa') || text.includes('pérdida')) return 'lose'
  if (text.includes('mantener')) return 'maintain'
  if (text.includes('subir peso')) return 'gain'
  if (text.includes('ganar músculo') || text.includes('fuerza')) return 'muscle'
  return 'muscle'
}

export function defaultWizardAnswers(hints: FuelWizardHints = {}): FuelWizardAnswers {
  return {
    goal: inferGoalFromProfile(hints.goals),
    activityLevel: inferActivityFromTraining(hints.weekTrainedCount),
    weightKg:
      hints.gender === 'mujer' ? 62 : hints.gender === 'otro' ? 68 : 75,
  }
}

export function buildFuelProfileFromWizard(
  answers: FuelWizardAnswers,
  hints: FuelWizardHints = {}
): Omit<FuelProfile, 'updatedAt'> {
  const gender = hints.gender ?? 'hombre'
  return buildFuelProfile({
    weightKg: answers.weightKg,
    heightCm: gender === 'mujer' ? 163 : gender === 'otro' ? 169 : 175,
    age: hints.age ?? 28,
    gender,
    goal: answers.goal,
    activityLevel: answers.activityLevel,
  })
}
