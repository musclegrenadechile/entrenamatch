import { describe, expect, it } from 'vitest'
import { isOpenPilotCity } from '../constants/pilotProgram'
import {
  pilotCohortDocId,
  pilotCohortProgress,
  shouldRegisterPilotMember,
} from './pilotCohort'

describe('pilotCohort', () => {
  it('registers only open pilot cities', () => {
    expect(shouldRegisterPilotMember('Viña del Mar')).toBe(true)
    expect(shouldRegisterPilotMember('Santiago')).toBe(true)
    expect(shouldRegisterPilotMember('Concepción')).toBe(false)
    expect(isOpenPilotCity('Valparaíso')).toBe(true)
  })

  it('builds cohort doc id', () => {
    expect(pilotCohortDocId('vina del mar')).toBe('vina_del_mar')
  })

  it('computes progress toward MAU target', () => {
    const low = pilotCohortProgress(12)
    expect(low.atTarget).toBe(false)
    expect(low.pct).toBe(24)

    const ok = pilotCohortProgress(55)
    expect(ok.atTarget).toBe(true)
  })
})
