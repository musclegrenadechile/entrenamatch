import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanHistoryFuelToneAriaLabel,
  historyFuelAriaMatchesTone,
  HISTORY_FUEL_TONE_CLASS,
  resolveWeeklyPlanHistoryFuelToneClass,
} from './weeklyPlanFuelHistoryToneDisplay'

describe('weeklyPlanFuelHistoryToneDisplay', () => {
  it('resolveWeeklyPlanHistoryFuelToneClass trilogía', () => {
    expect(resolveWeeklyPlanHistoryFuelToneClass('under-fueled')).toBe(
      HISTORY_FUEL_TONE_CLASS['under-fueled']
    )
    expect(resolveWeeklyPlanHistoryFuelToneClass('surplus')).toContain('surplus')
    expect(resolveWeeklyPlanHistoryFuelToneClass(null)).toBeNull()
  })

  it('buildWeeklyPlanHistoryFuelToneAriaLabel y historyFuelAriaMatchesTone', () => {
    const hint = '🏆 PR en Press banca (5×80 kg) — sigue progresando'
    const aria = buildWeeklyPlanHistoryFuelToneAriaLabel(hint, 'surplus')
    expect(aria).toMatch(/Progreso reciente \(Superávit\)/)
    expect(aria).toMatch(/Press banca/)
    expect(historyFuelAriaMatchesTone(aria, 'surplus')).toBe(true)
    expect(historyFuelAriaMatchesTone(aria, 'deficit')).toBe(false)
  })
})