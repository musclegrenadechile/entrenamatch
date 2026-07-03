import { describe, expect, it } from 'vitest'
import {
  ARENA_HIGHLIGHT_VIBE,
  isArenaHighlightUnlocked,
  resolveArenaLastWaveLabel,
} from './arenaSyncDisplay'

describe('arenaSyncDisplay', () => {
  it('desbloquea highlight al umbral de vibe', () => {
    expect(ARENA_HIGHLIGHT_VIBE).toBe(80)
    expect(isArenaHighlightUnlocked(79)).toBe(false)
    expect(isArenaHighlightUnlocked(80)).toBe(true)
  })

  it('resuelve etiqueta de onda desde acciones', () => {
    expect(resolveArenaLastWaveLabel([], 1)).toBeUndefined()
    expect(
      resolveArenaLastWaveLabel([{ label: 'Onda #2 · Set listo' }], 2)
    ).toBe('Set listo')
    expect(resolveArenaLastWaveLabel([{ label: 'PR logrado' }], 1)).toBe('PR logrado')
  })
})