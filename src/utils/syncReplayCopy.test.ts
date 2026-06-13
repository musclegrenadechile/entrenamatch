import { describe, expect, it } from 'vitest'
import {
  buildWitnessEchoPostText,
  formatSyncReplayCard,
  isSyncReplayPost,
} from './syncReplayCopy'

describe('syncReplayCopy', () => {
  it('isSyncReplayPost excludes workout posts', () => {
    expect(isSyncReplayPost({ postType: 'workout', text: 'ENTRENASYNC' } as any)).toBe(false)
    expect(
      isSyncReplayPost({ text: '🔥 ENTRENASYNC con Cote — 12 min', postType: 'sync' } as any)
    ).toBe(true)
  })

  it('formatSyncReplayCard extracts partner and minutes', () => {
    const card = formatSyncReplayCard({
      text: '🔥 ENTRENASYNC con Muscle User — 47 min · Sync 82%',
    } as any)
    expect(card.title).toContain('Muscle')
    expect(card.subtitle).toContain('47 min')
  })

  it('buildWitnessEchoPostText uses plain Spanish', () => {
    const text = buildWitnessEchoPostText({
      partnerName: 'Ana',
      minutes: 15,
      vibe: 70,
      actions: [{ emoji: '💪', label: 'Press banca' }],
    })
    expect(text).toContain('Destacado de Sesión Sync')
    expect(text).toContain('Conexión 70%')
    expect(text).not.toContain('HIGHLIGHT DE ENTRENASYNC')
  })
})
