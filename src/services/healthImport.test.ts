import { describe, it, expect } from 'vitest'
import { mergeHealthBurnWithBalance } from './healthImport'

describe('mergeHealthBurnWithBalance', () => {
  it('uses health when higher than MET', () => {
    expect(mergeHealthBurnWithBalance(350, 420)).toBe(420)
  })

  it('keeps MET when health is zero', () => {
    expect(mergeHealthBurnWithBalance(350, 0)).toBe(350)
  })
})
