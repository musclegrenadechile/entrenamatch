import { describe, expect, it } from 'vitest'
import { buildFuelWizardHints } from './FuelOverlaysMount'

describe('FuelOverlaysMount', () => {
  it('buildFuelWizardHints maps profile fields for wizard defaults', () => {
    const hints = buildFuelWizardHints(
      { age: 28, gender: 'hombre', goals: ['Perder grasa'] },
      3
    )
    expect(hints.age).toBe(28)
    expect(hints.gender).toBe('hombre')
    expect(hints.weekTrainedCount).toBe(3)
    expect(hints.goals).toEqual(['Perder grasa'])
  })

  it('buildFuelWizardHints tolerates missing user', () => {
    expect(buildFuelWizardHints(null, 0)).toEqual({
      age: undefined,
      gender: undefined,
      weekTrainedCount: 0,
      goals: undefined,
    })
  })
})
