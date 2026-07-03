import type { PlanScenario, WeeklyEnergySummary } from '../domain/weeklyPlan/types'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  type FuelWeekHintTone,
} from './weeklyPlanFuelWeekToneDisplay'
import { resolveWeeklyPlanFuelScenarioBorderClass } from './weeklyPlanFuelScenarioSync'
import { resolveWeeklyPlanFuelHeadlineChipToneClass } from './weeklyPlanHeadlineFuelDisplay'
import { resolveWeeklyPlanFuelRowToneClass } from './weeklyPlanFuelRowToneDisplay'
import { resolveWeeklyPlanNutritionToneClass } from './weeklyPlanNutritionToneDisplay'
import { resolveWeeklyPlanFuelWeekChipToneClass } from './weeklyPlanFuelWeekChipDisplay'
import { resolveWeeklyPlanFuelWeekHintToneClass } from './weeklyPlanFuelWeekToneDisplay'

export type WeeklyPlanFuelToneStackSnapshot = {
  border: string | null
  hint: string | null
  headline: string | null
  row: string | null
  chip: string | null
  nutrition: string | null
}

export type WeeklyPlanFuelToneStackExpected = {
  tone: FuelWeekHintTone
  border: string
  hint: string
  headline: string
  row: string
  chip: string | null
  nutrition: string
}

/** Inferir tono Fuel desde sufijo de clase CSS (oleada 423). */
export function inferFuelToneFromClassSuffix(className: string | null): FuelWeekHintTone | null {
  if (!className) return null
  if (className.includes('under-fueled')) return 'under-fueled'
  if (className.includes('surplus')) return 'surplus'
  if (className.includes('deficit')) return 'deficit'
  return null
}

export function buildWeeklyPlanFuelToneStackExpected(
  scenario: PlanScenario,
  energy: WeeklyEnergySummary
): WeeklyPlanFuelToneStackExpected | null {
  const tone = resolveWeeklyPlanFuelWeekHintTone(scenario, energy)
  if (!tone) return null
  const hintClass = resolveWeeklyPlanFuelWeekHintToneClass(tone)
  const headlineClass = resolveWeeklyPlanFuelHeadlineChipToneClass(scenario, energy)
  const rowClass = resolveWeeklyPlanFuelRowToneClass(scenario, energy)
  if (!hintClass || !headlineClass || !rowClass) return null
  const nutritionClass = resolveWeeklyPlanNutritionToneClass(scenario, energy)
  if (!nutritionClass) return null
  return {
    tone,
    border: resolveWeeklyPlanFuelScenarioBorderClass(tone),
    hint: hintClass,
    headline: headlineClass,
    row: rowClass,
    chip: resolveWeeklyPlanFuelWeekChipToneClass(scenario, energy),
    nutrition: nutritionClass,
  }
}

/** Todas las capas con tono visible comparten el mismo escenario Fuel. */
export function isWeeklyPlanFuelToneStackConsistent(
  snapshot: WeeklyPlanFuelToneStackSnapshot
): boolean {
  const tones = [
    inferFuelToneFromClassSuffix(snapshot.border),
    inferFuelToneFromClassSuffix(snapshot.hint),
    inferFuelToneFromClassSuffix(snapshot.headline),
    inferFuelToneFromClassSuffix(snapshot.row),
    inferFuelToneFromClassSuffix(snapshot.chip),
    inferFuelToneFromClassSuffix(snapshot.nutrition),
  ].filter((t): t is FuelWeekHintTone => t !== null)
  if (tones.length < 3) return false
  const first = tones[0]
  return tones.every((t) => t === first)
}

export function fuelToneStackMatchesExpected(
  snapshot: WeeklyPlanFuelToneStackSnapshot,
  expectedTone: FuelWeekHintTone
): boolean {
  if (!isWeeklyPlanFuelToneStackConsistent(snapshot)) return false
  return inferFuelToneFromClassSuffix(snapshot.hint) === expectedTone
}

/** Valida que cada capa visible coincide con el stack esperado (oleada 424). */
export function fuelToneStackSnapshotMatchesExpected(
  snapshot: WeeklyPlanFuelToneStackSnapshot,
  expected: WeeklyPlanFuelToneStackExpected
): boolean {
  if (!fuelToneStackMatchesExpected(snapshot, expected.tone)) return false
  if (snapshot.border !== expected.border) return false
  if (snapshot.hint !== expected.hint) return false
  if (snapshot.headline !== expected.headline) return false
  if (snapshot.row !== expected.row) return false
  if (expected.chip !== null && snapshot.chip !== expected.chip) return false
  if (snapshot.nutrition !== expected.nutrition) return false
  return true
}