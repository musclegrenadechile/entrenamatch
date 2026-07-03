import { describe, expect, it } from 'vitest'
import {
  buildE2EDemoFuelWeekMacros,
  e2eDemoFuelWeekScenarioMatches,
} from './demoFuelWeekLogs'
import { buildE2EDemoFuelProfile } from './demoFuelProfile'
import { computeWeeklyEnergySummary } from '../domain/weeklyPlan/computeWeeklyEnergySummary'

describe('demoFuelWeekLogs', () => {
  it('buildE2EDemoFuelWeekMacros — 7 slots con días recientes', () => {
    const macros = buildE2EDemoFuelWeekMacros('surplus')
    expect(macros).toHaveLength(7)
    expect(macros.filter((d) => d.logged)).toHaveLength(5)
    expect(macros.at(-1)?.logged).toBe(true)
    expect(macros.at(-1)?.kcal).toBe(4200)
  })

  it('escenarios demo alineados con EntrenaPlan', () => {
    expect(e2eDemoFuelWeekScenarioMatches('under-fueled', 'under_fueled')).toBe(true)
    expect(e2eDemoFuelWeekScenarioMatches('surplus', 'surplus')).toBe(true)
    expect(e2eDemoFuelWeekScenarioMatches('deficit', 'deficit')).toBe(true)
  })

  it('surplus supera umbral hint > 300 kcal', () => {
    const profile = buildE2EDemoFuelProfile()
    const energy = computeWeeklyEnergySummary({
      weekMacros: buildE2EDemoFuelWeekMacros('surplus'),
      dailyTargetKcal: profile.targetKcal,
    })
    expect(energy.loggedDays).toBeGreaterThanOrEqual(3)
    expect(energy.weeklyDeltaKcal).toBeGreaterThan(300)
  })
})