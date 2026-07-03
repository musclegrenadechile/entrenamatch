import { describe, expect, it } from 'vitest'
import {
  buildE2EDemoFuelToneStackExpected,
  e2eDemoFuelToneStackReady,
  fuelToneStackMatchesDemoExpected,
} from './weeklyPlanFuelToneStackExpectedDisplay'

describe('weeklyPlanFuelToneStackExpectedDisplay', () => {
  it('buildE2EDemoFuelToneStackExpected trilogía demo', () => {
    const under = buildE2EDemoFuelToneStackExpected('under-fueled')
    expect(under?.tone).toBe('under-fueled')
    expect(under?.border).toBe('em-v2-plan--under-fueled')
    const surplus = buildE2EDemoFuelToneStackExpected('surplus')
    expect(surplus?.tone).toBe('surplus')
    expect(surplus?.chip).toBe('em-v2-plan__fuel-week-chip--surplus')
    const deficit = buildE2EDemoFuelToneStackExpected('deficit')
    expect(deficit?.tone).toBe('deficit')
    expect(deficit?.nutrition).toBe('em-v2-plan__nutrition--deficit')
  })

  it('e2eDemoFuelToneStackReady', () => {
    expect(e2eDemoFuelToneStackReady('under-fueled')).toBe(true)
    expect(e2eDemoFuelToneStackReady('surplus')).toBe(true)
    expect(e2eDemoFuelToneStackReady('deficit')).toBe(true)
  })

  it('fuelToneStackMatchesDemoExpected', () => {
    const expected = buildE2EDemoFuelToneStackExpected('surplus')
    expect(expected).not.toBeNull()
    const snapshot = {
      border: expected!.border,
      hint: expected!.hint,
      headline: expected!.headline,
      row: expected!.row,
      chip: expected!.chip,
      nutrition: expected!.nutrition,
    }
    expect(fuelToneStackMatchesDemoExpected(snapshot, 'surplus')).toBe(true)
    expect(
      fuelToneStackMatchesDemoExpected(
        { ...snapshot, hint: 'em-v2-plan__fuel-week-hint--deficit' },
        'surplus'
      )
    ).toBe(false)
  })
})