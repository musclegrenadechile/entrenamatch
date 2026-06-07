/**
 * Smoke tests: Fuel calculator + heuristic (run: node scripts/test-fuel-ai.mjs)
 */
import assert from 'node:assert/strict'
import {
  buildFuelProfile,
  buildFuelAnalyzeContext,
  calculateTdee,
  estimateMacrosFromDescription,
  getFuelCoachingTip,
  getFuelMealSuggestion,
  macroTargetsFromKcal,
  targetKcalFromGoal,
  toLocalDateStr,
} from '../src/utils/fuelCalculator.ts'
import {
  buildLast7DaySlots,
  computeFuelWeekFromDates,
} from '../src/services/fuel.ts'

// TDEE hombre 75kg, 175cm, 28a, moderate
const tdee = calculateTdee({
  weightKg: 75,
  heightCm: 175,
  age: 28,
  gender: 'hombre',
  activityLevel: 'moderate',
})
assert.ok(tdee > 2000 && tdee < 3500, `TDEE out of range: ${tdee}`)

const muscleKcal = targetKcalFromGoal(tdee, 'muscle')
assert.ok(muscleKcal > tdee, 'muscle goal should add calories')

const macros = macroTargetsFromKcal(muscleKcal, 'muscle')
assert.ok(macros.targetProteinG > 0 && macros.targetCarbsG > 0 && macros.targetFatG > 0)

const profile = buildFuelProfile({
  weightKg: 75,
  heightCm: 175,
  age: 28,
  gender: 'hombre',
  goal: 'muscle',
  activityLevel: 'moderate',
  restrictions: 'sin lactosa',
})
assert.equal(profile.restrictions, 'sin lactosa')
assert.equal(profile.targetKcal, muscleKcal)

const ensalada = estimateMacrosFromDescription('ensalada con pollo')
assert.ok(ensalada.kcal < 500, 'ensalada should be lower kcal')
assert.ok(ensalada.proteinG > 0)

const pizza = estimateMacrosFromDescription('pizza hamburguesa')
assert.ok(pizza.kcal > ensalada.kcal)

const dateStr = toLocalDateStr(new Date('2026-06-07T12:00:00'))
assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/)

const ctx = buildFuelAnalyzeContext(profile, { kcal: 800, proteinG: 40, carbsG: 90, fatG: 20 })
assert.equal(ctx?.goal, 'muscle')
assert.equal(ctx?.remainingKcal, profile.targetKcal - 800)

const tip = getFuelCoachingTip(profile, { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 })
assert.ok(tip?.includes('Objetivo hoy'))

const suggestion = getFuelMealSuggestion(profile, {
  kcal: 1200,
  proteinG: 60,
  entryCount: 2,
})
assert.ok(suggestion?.includes('proteína'))

const week = computeFuelWeekFromDates(new Set([toLocalDateStr()]))
assert.equal(week.length, 7)
assert.equal(week[6].isToday, true)
assert.ok(buildLast7DaySlots().length === 7)

console.log('✅ Fuel AI smoke tests passed')
