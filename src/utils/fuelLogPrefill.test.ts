import { describe, expect, it } from 'vitest'
import {
  buildFuelLogPrefillFromWorkoutSave,
  buildWorkoutFuelPrefillChipLabel,
  extractFuelLogPrefillMacros,
  hasWorkoutFuelMacroPrefill,
  suggestPostWorkoutMacros,
} from './fuelLogPrefill'

describe('fuelLogPrefill', () => {
  it('builds post-workout meal prefill from banner context', () => {
    const prefill = buildFuelLogPrefillFromWorkoutSave({
      title: 'Push día',
      burnKcal: 420,
      fuelTip: 'Prioriza proteína en la próxima comida',
    })
    expect(prefill.mealLabel).toBe('Post-entreno')
    expect(prefill.description).toContain('420 kcal')
    expect(prefill.description).toContain('Push día')
    expect(prefill.contextHint).toBe('Prioriza proteína en la próxima comida')
    expect(prefill.suggestedKcal).toBe(320)
    expect(prefill.suggestedProteinG).toBeGreaterThan(0)
  })

  it('suggestPostWorkoutMacros returns empty without burn', () => {
    expect(suggestPostWorkoutMacros()).toEqual({})
    expect(suggestPostWorkoutMacros(0)).toEqual({})
  })

  it('works without burn kcal', () => {
    const prefill = buildFuelLogPrefillFromWorkoutSave({
      title: 'Cardio',
      fuelTip: 'Hidrata bien',
    })
    expect(prefill.description).toContain('Entreno «Cardio»')
    expect(prefill.description).toContain('Hidrata bien')
  })

  it('incluye sessionSummary y fuelBalanceHint (oleada 393)', () => {
    const prefill = buildFuelLogPrefillFromWorkoutSave({
      title: 'Push',
      burnKcal: 400,
      sessionSummary: '1 serie · 600 kg',
      fuelBalanceHint: 'Fuel sugerido: ~320 kcal · 24g proteína',
      fuelTip: 'Post torso: combina proteína + carbohidratos',
    })
    expect(prefill.description).toContain('1 serie')
    expect(prefill.description).toContain('Fuel sugerido')
    expect(prefill.contextHint).toContain('Fuel sugerido')
    expect(hasWorkoutFuelMacroPrefill(prefill)).toBe(true)
  })

  it('hasWorkoutFuelMacroPrefill', () => {
    expect(hasWorkoutFuelMacroPrefill(null)).toBe(false)
    expect(hasWorkoutFuelMacroPrefill({ mealLabel: 'X' })).toBe(false)
    expect(hasWorkoutFuelMacroPrefill({ suggestedKcal: 320 })).toBe(true)
  })

  it('extractFuelLogPrefillMacros y chip label (oleada 394)', () => {
    const prefill = buildFuelLogPrefillFromWorkoutSave({ title: 'Push', burnKcal: 400 })
    expect(extractFuelLogPrefillMacros(prefill)?.kcal).toBe(320)
    expect(extractFuelLogPrefillMacros(prefill)?.proteinG).toBeGreaterThan(0)
    expect(buildWorkoutFuelPrefillChipLabel(prefill)).toContain('Sugerido del entreno')
    expect(buildWorkoutFuelPrefillChipLabel(prefill)).toContain('320 kcal')
  })
})