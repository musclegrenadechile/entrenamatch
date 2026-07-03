import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanRotationFuelToneAriaLabel,
  ROTATION_FUEL_TONE_CLASS,
  resolveWeeklyPlanRotationFuelToneClass,
  rotationFuelAriaMatchesTone,
} from './weeklyPlanFuelRotationToneDisplay'

describe('weeklyPlanFuelRotationToneDisplay', () => {
  it('resolveWeeklyPlanRotationFuelToneClass trilogía', () => {
    expect(resolveWeeklyPlanRotationFuelToneClass('deficit')).toBe(
      ROTATION_FUEL_TONE_CLASS.deficit
    )
    expect(resolveWeeklyPlanRotationFuelToneClass('surplus')).toContain('surplus')
    expect(resolveWeeklyPlanRotationFuelToneClass(null)).toBeNull()
  })

  it('buildWeeklyPlanRotationFuelToneAriaLabel y rotationFuelAriaMatchesTone', () => {
    const note = 'Tras PR en Pecho — rotación a Pull.'
    const aria = buildWeeklyPlanRotationFuelToneAriaLabel(note, 'under-fueled')
    expect(aria).toMatch(/Rotación de plan tras PR en Pecho \(Afinar Fuel\)/)
    expect(aria).toMatch(/Pull/)
    expect(rotationFuelAriaMatchesTone(aria, 'under-fueled')).toBe(true)
    expect(rotationFuelAriaMatchesTone(aria, 'surplus')).toBe(false)
  })
})