import { describe, expect, it } from 'vitest'
import { buildFuelLogPrefillFromWorkoutSave, suggestPostWorkoutMacros } from './fuelLogPrefill'

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
})