import { describe, expect, it } from 'vitest'
import {
  buildFuelLogPrefillPrToneAriaLabel,
  fuelPrefillPrAriaMatchesPr,
  resolveFuelLogPrefillPrToneClass,
  FUEL_LOG_PREFILL_PR_TONE_CLASS,
} from './fuelLogPrefillPrToneDisplay'

describe('fuelLogPrefillPrToneDisplay', () => {
  it('resolveFuelLogPrefillPrToneClass', () => {
    expect(resolveFuelLogPrefillPrToneClass(true)).toBe(FUEL_LOG_PREFILL_PR_TONE_CLASS)
    expect(resolveFuelLogPrefillPrToneClass(false)).toBeNull()
  })

  it('buildFuelLogPrefillPrToneAriaLabel y fuelPrefillPrAriaMatchesPr', () => {
    const chip = 'Sugerido del entreno · ~320 kcal · 24g proteína'
    const aria = buildFuelLogPrefillPrToneAriaLabel(chip, true)
    expect(aria).toMatch(/récord personal/)
    expect(aria).toContain(chip)
    expect(fuelPrefillPrAriaMatchesPr(aria)).toBe(true)
    expect(fuelPrefillPrAriaMatchesPr(buildFuelLogPrefillPrToneAriaLabel(chip, false))).toBe(false)
  })
})