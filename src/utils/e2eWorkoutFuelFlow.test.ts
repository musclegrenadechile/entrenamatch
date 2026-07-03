import { describe, expect, it } from 'vitest'
import { E2E_WORKOUT_FUEL_FLOW_IDS, isWorkoutFuelFlowComplete } from './e2eWorkoutFuelFlow'

describe('e2eWorkoutFuelFlow', () => {
  it('define 5 hitos entreno → Fuel', () => {
    expect(E2E_WORKOUT_FUEL_FLOW_IDS.length).toBe(5)
    expect(E2E_WORKOUT_FUEL_FLOW_IDS).toContain('fuel-prefill')
  })

  it('isWorkoutFuelFlowComplete', () => {
    expect(isWorkoutFuelFlowComplete(['workout-save'])).toBe(false)
    expect(isWorkoutFuelFlowComplete([...E2E_WORKOUT_FUEL_FLOW_IDS])).toBe(true)
  })
})