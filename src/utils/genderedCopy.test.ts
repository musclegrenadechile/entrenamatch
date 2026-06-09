import { describe, expect, it } from 'vitest'
import {
  championAuraLabel,
  cityChampionLabel,
  gadgetDisplayName,
  winnerLabel,
} from './genderedCopy'

describe('genderedCopy', () => {
  it('uses feminine forms for mujer', () => {
    expect(cityChampionLabel('mujer', 'Viña del Mar')).toBe('Campeona Viña del Mar')
    expect(winnerLabel('mujer')).toBe('Ganadora')
    expect(championAuraLabel('mujer')).toBe('Aura de Campeona')
  })

  it('uses masculine forms for hombre and unknown', () => {
    expect(cityChampionLabel('hombre', 'Santiago')).toBe('Campeón Santiago')
    expect(winnerLabel('hombre')).toBe('Ganador')
    expect(winnerLabel(undefined)).toBe('Ganador')
    expect(gadgetDisplayName('Aura de Campeón', 'mujer')).toBe('Aura de Campeona')
  })
})
