export const ARENA_HIGHLIGHT_VIBE = 80

export function isArenaHighlightUnlocked(syncVibe: number): boolean {
  return syncVibe >= ARENA_HIGHLIGHT_VIBE
}

type WaveAction = { label?: string }

/** Etiqueta corta de la última onda para el strip FOMO. */
export function resolveArenaLastWaveLabel(
  actions: WaveAction[],
  waveCount: number
): string | undefined {
  if (waveCount <= 0) return undefined
  const wave = actions.find((a) => /onda/i.test(a.label || ''))
  if (wave?.label) {
    const trimmed = wave.label.replace(/^Onda\s*#?\d*\s*[·\-]?\s*/i, '').trim()
    return trimmed || wave.label
  }
  return actions[0]?.label?.trim() || undefined
}