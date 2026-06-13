import { describe, expect, it } from 'vitest'
import { countP0Rows, P0_BETA_QA_MATRIX, P0_BETA_QA_VERSION } from './p0BetaQaMatrix'

describe('p0BetaQaMatrix', () => {
  it('defines 12 P0 QA rows for current beta version', () => {
    expect(P0_BETA_QA_VERSION).toBe('0.1.376')
    expect(countP0Rows()).toBe(12)
    expect(P0_BETA_QA_MATRIX.every((r) => r.version === P0_BETA_QA_VERSION)).toBe(true)
  })
})
