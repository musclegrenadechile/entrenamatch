/**
 * Smoke tests: Fuel calculator + heuristic (run: node scripts/test-fuel-ai.mjs)
 */
import assert from 'node:assert/strict'
import {
  buildFuelProfile,
  calculateTdee,
  estimateMacrosFromDescription,
  macroTargetsFromKcal,
  targetKcalFromGoal,
  toLocalDateStr,
} from '../src/utils/fuelCalculator.ts'

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

console.log('✅ Fuel AI smoke tests passed')
