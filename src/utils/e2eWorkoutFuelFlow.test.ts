import { describe, expect, it } from 'vitest'
import { E2E_WORKOUT_FUEL_FLOW_IDS, isWorkoutFuelFlowComplete } from './e2eWorkoutFuelFlow'

describe('e2eWorkoutFuelFlow', () => {
  it('define 9 hitos entreno → Fuel', () => {
    expect(E2E_WORKOUT_FUEL_FLOW_IDS.length).toBe(9)
    expect(E2E_WORKOUT_FUEL_FLOW_IDS).toContain('fuel-prefill-harness')
    expect(E2E_WORKOUT_FUEL_FLOW_IDS).toContain('banner-fuel-balance')
    expect(E2E_WORKOUT_FUEL_FLOW_IDS).toContain('fuel-macro-prefill')
    expect(E2E_WORKOUT_FUEL_FLOW_IDS).toContain('fuel-prefill')
  })

  it('isWorkoutFuelFlowComplete', () => {
    expect(isWorkoutFuelFlowComplete(['workout-save'])).toBe(false)
    expect(isWorkoutFuelFlowComplete([...E2E_WORKOUT_FUEL_FLOW_IDS])).toBe(true)
  })
})