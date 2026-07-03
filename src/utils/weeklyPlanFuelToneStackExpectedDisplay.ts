import { computeWeeklyEnergySummary } from '../domain/weeklyPlan'
import { buildE2EDemoFuelProfile } from './demoFuelProfile'
import {
  buildE2EDemoFuelWeekMacros,
  type E2EDemoFuelWeekScenario,
} from './demoFuelWeekLogs'
import {
  buildWeeklyPlanFuelToneStackExpected,
  fuelToneStackSnapshotMatchesExpected,
  type WeeklyPlanFuelToneStackExpected,
  type WeeklyPlanFuelToneStackSnapshot,
} from './weeklyPlanFuelToneStackDisplay'
import type { PlanScenario } from '../domain/weeklyPlan/types'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

const DEMO_TO_PLAN_SCENARIO: Record<E2EDemoFuelWeekScenario, PlanScenario> = {
  'under-fueled': 'under_fueled',
  surplus: 'surplus',
  deficit: 'deficit',
}

const TONE_TO_DEMO: Record<FuelWeekHintTone, E2EDemoFuelWeekScenario> = {
  'under-fueled': 'under-fueled',
  surplus: 'surplus',
  deficit: 'deficit',
}

/** Stack tono Fuel esperado para escenarios demo E2E (oleada 425). */
export function buildE2EDemoFuelToneStackExpected(
  scenario: E2EDemoFuelWeekScenario
): WeeklyPlanFuelToneStackExpected | null {
  const profile = buildE2EDemoFuelProfile()
  const macros = buildE2EDemoFuelWeekMacros(scenario)
  const energy = computeWeeklyEnergySummary({
    weekMacros: macros,
    dailyTargetKcal: profile.targetKcal,
  })
  return buildWeeklyPlanFuelToneStackExpected(DEMO_TO_PLAN_SCENARIO[scenario], energy)
}

export function e2eDemoFuelToneStackReady(scenario: E2EDemoFuelWeekScenario): boolean {
  return buildE2EDemoFuelToneStackExpected(scenario) !== null
}

export function fuelToneStackMatchesDemoExpected(
  snapshot: WeeklyPlanFuelToneStackSnapshot,
  tone: FuelWeekHintTone
): boolean {
  const expected = buildE2EDemoFuelToneStackExpected(TONE_TO_DEMO[tone])
  if (!expected) return false
  return fuelToneStackSnapshotMatchesExpected(snapshot, expected)
}