import { describe, expect, it } from 'vitest'
import { pickGymLogRecentSuggestions, shouldShowGymLogRecentSuggestions } from './gymLogLibraryDisplay'

describe('gymLogLibraryDisplay', () => {
  it('shouldShowGymLogRecentSuggestions', () => {
    expect(shouldShowGymLogRecentSuggestions('', true)).toBe(true)
    expect(shouldShowGymLogRecentSuggestions('press', true)).toBe(false)
    expect(shouldShowGymLogRecentSuggestions('', false)).toBe(false)
  })

  it('pickGymLogRecentSuggestions filtra sesión y músculo', () => {
    const recent = ['Press banca', 'Curl con mancuernas', 'Press banca inclinado']
    expect(pickGymLogRecentSuggestions(recent, ['Press banca'])).toEqual([
      'Curl con mancuernas',
      'Press banca inclinado',
    ])
    expect(pickGymLogRecentSuggestions(recent, [], 'Pecho', 2)).toEqual([
      'Press banca',
      'Press banca inclinado',
    ])
  })
})