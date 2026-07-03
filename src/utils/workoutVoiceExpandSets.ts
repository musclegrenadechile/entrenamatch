type VoiceSet = {
  reps: number
  weightKg: number
  minutesMin?: number
  intensity?: number
}

type VoiceExercise = {
  name: string
  sets: VoiceSet[]
  setCount?: number
  series?: number
  seriesCount?: number
}

/** Expand "3 series" with one template set → 3 identical sets. */
export function expandVoiceExerciseSets<T extends VoiceExercise>(ex: T): T {
  const sets = Array.isArray(ex.sets) ? ex.sets.map((s) => ({ ...s })) : []
  const hinted =
    Number(ex.setCount) ||
    Number(ex.series) ||
    Number(ex.seriesCount) ||
    parseSeriesFromSetsMeta(sets)

  if (hinted > 1 && sets.length === 1) {
    const template = sets[0]!
    const count = Math.min(20, Math.max(1, Math.round(hinted)))
    return {
      ...ex,
      sets: Array.from({ length: count }, () => ({ ...template })),
    }
  }

  if (sets.length === 0 && hinted > 0) {
    return {
      ...ex,
      sets: Array.from({ length: Math.min(20, hinted) }, () => ({
        reps: 10,
        weightKg: 0,
      })),
    }
  }

  return { ...ex, sets }
}

function parseSeriesFromSetsMeta(sets: VoiceSet[]): number {
  const meta = sets[0] as VoiceSet & { series?: number; setCount?: number }
  return Number(meta?.series) || Number(meta?.setCount) || 0
}

export function expandAllVoiceExercises<T extends VoiceExercise>(exercises: T[]): T[] {
  return exercises.map((ex) => expandVoiceExerciseSets(ex))
}
