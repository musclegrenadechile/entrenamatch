import { describe, expect, it } from 'vitest'
import {
  buildGymLogFabSessionPrToneAriaLabel,
  fabSessionPrAriaMatchesLivePr,
  GYM_LOG_FAB_SESSION_PR_TONE_CLASS,
  resolveGymLogFabSessionPrToneClass,
  resolveGymLogFabStripPrToneClass,
} from './gymLogFabSessionPrToneDisplay'

describe('gymLogFabSessionPrToneDisplay', () => {
  it('resolveGymLogFabSessionPrToneClass y strip', () => {
    expect(resolveGymLogFabSessionPrToneClass(1)).toBe(GYM_LOG_FAB_SESSION_PR_TONE_CLASS)
    expect(resolveGymLogFabSessionPrToneClass(0)).toBeNull()
    expect(resolveGymLogFabStripPrToneClass(2)).toMatch(/--has-pr$/)
    expect(resolveGymLogFabStripPrToneClass(0)).toBeNull()
  })

  it('buildGymLogFabSessionPrToneAriaLabel y fabSessionPrAriaMatchesLivePr', () => {
    const aria = buildGymLogFabSessionPrToneAriaLabel('1 ejercicio · 🏆 1 PR', 1)
    expect(aria).toMatch(/Sesión activa \(1 PR en vivo\)/)
    expect(fabSessionPrAriaMatchesLivePr(aria)).toBe(true)
    expect(fabSessionPrAriaMatchesLivePr('Sesión activa: sin PR')).toBe(false)
  })
})