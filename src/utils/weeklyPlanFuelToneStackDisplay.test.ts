import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanFuelToneStackExpected,
  fuelToneStackMatchesExpected,
  fuelToneStackSnapshotMatchesExpected,
  inferFuelToneFromClassSuffix,
  isWeeklyPlanFuelToneStackConsistent,
} from './weeklyPlanFuelToneStackDisplay'
import type { WeeklyEnergySummary } from '../domain/weeklyPlan/types'

const baseEnergy: WeeklyEnergySummary = {
  weekKey: '2026-W27',
  loggedDays: 5,
  totalConsumedKcal: 21000,
  totalBurnKcal: 1200,
  totalTargetKcal: 19600,
  weeklyDeltaKcal: 450,
  avgDailyDeltaKcal: 90,
}

describe('weeklyPlanFuelToneStackDisplay', () => {
  it('inferFuelToneFromClassSuffix', () => {
    expect(inferFuelToneFromClassSuffix('em-v2-plan__fuel-week-hint--surplus')).toBe(
      'surplus'
    )
    expect(inferFuelToneFromClassSuffix('em-v2-plan__fuel-row--deficit')).toBe('deficit')
  })

  it('buildWeeklyPlanFuelToneStackExpected surplus', () => {
    const stack = buildWeeklyPlanFuelToneStackExpected('surplus', baseEnergy)
    expect(stack?.tone).toBe('surplus')
    expect(stack?.border).toBe('em-v2-plan--surplus')
    expect(stack?.hint).toBe('em-v2-plan__fuel-week-hint--surplus')
  })

  it('isWeeklyPlanFuelToneStackConsistent', () => {
    const aligned = {
      border: 'em-v2-plan--surplus',
      hint: 'em-v2-plan__fuel-week-hint--surplus',
      headline: 'em-v2-plan__headline-fuel--surplus',
      row: 'em-v2-plan__fuel-row--surplus',
      chip: 'em-v2-plan__fuel-week-chip--surplus',
      nutrition: 'em-v2-plan__nutrition--surplus',
    }
    expect(isWeeklyPlanFuelToneStackConsistent(aligned)).toBe(true)
    expect(fuelToneStackMatchesExpected(aligned, 'surplus')).toBe(true)
    const expected = buildWeeklyPlanFuelToneStackExpected('surplus', baseEnergy)
    expect(expected).not.toBeNull()
    expect(fuelToneStackSnapshotMatchesExpected(aligned, expected!)).toBe(true)
    expect(
      isWeeklyPlanFuelToneStackConsistent({ ...aligned, hint: 'em-v2-plan__fuel-week-hint--deficit' })
    ).toBe(false)
  })
})