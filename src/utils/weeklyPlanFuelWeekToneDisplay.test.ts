import { describe, expect, it } from 'vitest'
import {
  FUEL_WEEK_HINT_TONE_CLASS,
  resolveWeeklyPlanFuelWeekHintTone,
  resolveWeeklyPlanFuelWeekHintToneClass,
} from './weeklyPlanFuelWeekToneDisplay'
import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'

const baseEnergy: WeeklyEnergySummary = {
  weekKey: '2026-W27',
  loggedDays: 5,
  totalConsumedKcal: 14000,
  totalBurnKcal: 1200,
  totalTargetKcal: 14000,
  weeklyDeltaKcal: 2200,
  avgDailyDeltaKcal: 440,
}

describe('weeklyPlanFuelWeekToneDisplay', () => {
  it('FUEL_WEEK_HINT_TONE_CLASS', () => {
    expect(FUEL_WEEK_HINT_TONE_CLASS['under-fueled']).toBe(
      'em-v2-plan__fuel-week-hint--under-fueled'
    )
    expect(FUEL_WEEK_HINT_TONE_CLASS.surplus).toBe('em-v2-plan__fuel-week-hint--surplus')
    expect(FUEL_WEEK_HINT_TONE_CLASS.deficit).toBe('em-v2-plan__fuel-week-hint--deficit')
  })

  it('tono under-fueled cuando faltan días Fuel', () => {
    const tone = resolveWeeklyPlanFuelWeekHintTone('under_fueled', {
      ...baseEnergy,
      loggedDays: 1,
    })
    expect(tone).toBe('under-fueled')
    expect(resolveWeeklyPlanFuelWeekHintToneClass(tone)).toBe(
      'em-v2-plan__fuel-week-hint--under-fueled'
    )
  })

  it('tono surplus con delta alto', () => {
    const tone = resolveWeeklyPlanFuelWeekHintTone('surplus', {
      ...baseEnergy,
      weeklyDeltaKcal: 450,
    })
    expect(tone).toBe('surplus')
    expect(resolveWeeklyPlanFuelWeekHintToneClass(tone)).toContain('surplus')
  })

  it('tono deficit con delta bajo', () => {
    const tone = resolveWeeklyPlanFuelWeekHintTone('deficit', {
      ...baseEnergy,
      weeklyDeltaKcal: -320,
    })
    expect(tone).toBe('deficit')
    expect(resolveWeeklyPlanFuelWeekHintToneClass(tone)).toContain('deficit')
  })

  it('null sin hint activo', () => {
    expect(resolveWeeklyPlanFuelWeekHintTone('on_track', baseEnergy)).toBeNull()
    expect(resolveWeeklyPlanFuelWeekHintToneClass(null)).toBeNull()
  })
})