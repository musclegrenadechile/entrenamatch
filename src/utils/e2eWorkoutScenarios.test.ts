import { describe, expect, it } from 'vitest'
import { countStepsByPhase, E2E_WORKOUT_FLOW_STEPS } from './e2eWorkoutScenarios'

describe('e2eWorkoutScenarios', () => {
  it('define 7 pasos del flujo entreno → reseña', () => {
    expect(E2E_WORKOUT_FLOW_STEPS.length).toBe(7)
    const counts = countStepsByPhase(E2E_WORKOUT_FLOW_STEPS)
    expect(counts.log).toBe(3)
    expect(counts.close).toBe(1)
    expect(counts.sync).toBe(1)
    expect(counts.review).toBe(2)
  })
})