import { describe, expect, it } from 'vitest'
import { GYM_LOG_WEIGHT_STEP, stepGymLogValue } from './gymLogSetStep'

describe('stepGymLogValue', () => {
  it('respeta min/max enteros', () => {
    expect(stepGymLogValue(10, -1, { min: 0, max: 100, integer: true })).toBe(9)
    expect(stepGymLogValue(0, -1, { min: 0, max: 100, integer: true })).toBe(0)
    expect(stepGymLogValue(100, 1, { min: 0, max: 100, integer: true })).toBe(100)
  })

  it('pasos decimales para peso', () => {
    expect(stepGymLogValue(60, GYM_LOG_WEIGHT_STEP, { min: 0, max: 500 })).toBe(62.5)
    expect(stepGymLogValue(1.25, GYM_LOG_WEIGHT_STEP, { min: 0, max: 500 })).toBe(3.8)
  })
})