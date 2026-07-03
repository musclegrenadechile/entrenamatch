import { describe, expect, it } from 'vitest'
import {
  formatWeeklyPlanDelta,
  resolveWeeklyPlanScenarioClass,
  shouldRenderWeeklyPlanEmpty,
  shouldShowWeeklyPlanFuelRow,
} from './weeklyPlanCardDisplay'

describe('weeklyPlanCardDisplay', () => {
  it('maps fuel scenarios to plan CSS classes', () => {
    expect(resolveWeeklyPlanScenarioClass('surplus')).toBe('em-v2-plan--surplus')
    expect(resolveWeeklyPlanScenarioClass('under_fueled')).toBe('em-v2-plan--under-fueled')
    expect(resolveWeeklyPlanScenarioClass('on_track')).toBe('em-v2-plan--on-track')
  })

  it('shows fuel row when profile or delta is present', () => {
    expect(shouldShowWeeklyPlanFuelRow(false, null)).toBe(false)
    expect(shouldShowWeeklyPlanFuelRow(false, undefined)).toBe(false)
    expect(shouldShowWeeklyPlanFuelRow(true, null)).toBe(true)
    expect(shouldShowWeeklyPlanFuelRow(false, -320)).toBe(true)
  })

  it('formats weekly delta with sign', () => {
    expect(formatWeeklyPlanDelta(420)).toBe('Δ +420 kcal semana')
    expect(formatWeeklyPlanDelta(-180)).toBe('Δ -180 kcal semana')
    expect(formatWeeklyPlanDelta(0)).toBe('Δ 0 kcal semana')
  })

  it('empty state only when allowed', () => {
    expect(shouldRenderWeeklyPlanEmpty(null, true)).toBe(true)
    expect(shouldRenderWeeklyPlanEmpty(null, false)).toBe(false)
  })
})