import { describe, expect, it } from 'vitest'
import {
  countTrainingPolishV1Utils,
  TRAINING_POLISH_V1_UTILS,
  trainingPolishV1BlockRange,
} from './trainingPolishV1Suite'

describe('trainingPolishV1Suite', () => {
  it('inventario pulido I oleadas 361–377', () => {
    expect(countTrainingPolishV1Utils()).toBe(10)
    expect(trainingPolishV1BlockRange()).toEqual({ from: 361, to: 377 })
    expect(TRAINING_POLISH_V1_UTILS.map((e) => e.oleada)).toContain(377)
    expect(TRAINING_POLISH_V1_UTILS.map((e) => e.module)).toContain('gymLogDuplicateSet')
  })
})