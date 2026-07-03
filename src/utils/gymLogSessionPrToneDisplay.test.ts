import { describe, expect, it } from 'vitest'
import {
  buildGymLogSessionPrToneAriaLabel,
  GYM_LOG_SESSION_PR_TONE_CLASS,
  resolveGymLogSessionPrToneClass,
  sessionPrAriaMatchesLivePr,
} from './gymLogSessionPrToneDisplay'

describe('gymLogSessionPrToneDisplay', () => {
  it('resolveGymLogSessionPrToneClass', () => {
    expect(resolveGymLogSessionPrToneClass(1)).toBe(GYM_LOG_SESSION_PR_TONE_CLASS)
    expect(resolveGymLogSessionPrToneClass(0)).toBeNull()
  })

  it('buildGymLogSessionPrToneAriaLabel y sessionPrAriaMatchesLivePr', () => {
    const aria = buildGymLogSessionPrToneAriaLabel('1 ejercicio · 🏆 1 PR', 1)
    expect(aria).toMatch(/Sesión activa \(1 PR en vivo\)/)
    expect(aria).toMatch(/🏆 1 PR/)
    expect(sessionPrAriaMatchesLivePr(aria)).toBe(true)
    expect(sessionPrAriaMatchesLivePr('Sesión activa: sin PR')).toBe(false)
  })
})