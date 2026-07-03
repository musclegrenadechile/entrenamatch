import { describe, expect, it } from 'vitest'
import {
  buildGymLogSearchEmptyMessage,
  shouldShowGymLogSearchEmpty,
  shouldShowGymLogSuggestions,
} from './gymLogSearchDisplay'

describe('gymLogSearchDisplay', () => {
  it('buildGymLogSearchEmptyMessage', () => {
    expect(buildGymLogSearchEmptyMessage('')).toBe('')
    expect(buildGymLogSearchEmptyMessage('  press  ')).toBe('Sin resultados para «press»')
    expect(buildGymLogSearchEmptyMessage('curl', 'Bíceps')).toBe('Sin resultados para «curl» en Bíceps')
  })

  it('shouldShowGymLogSuggestions', () => {
    expect(shouldShowGymLogSuggestions('', 3)).toBe(false)
    expect(shouldShowGymLogSuggestions('press', 0)).toBe(false)
    expect(shouldShowGymLogSuggestions('press', 2)).toBe(true)
  })

  it('shouldShowGymLogSearchEmpty', () => {
    expect(shouldShowGymLogSearchEmpty('', 0)).toBe(false)
    expect(shouldShowGymLogSearchEmpty('xyz', 0)).toBe(true)
    expect(shouldShowGymLogSearchEmpty('press', 1)).toBe(false)
  })
})