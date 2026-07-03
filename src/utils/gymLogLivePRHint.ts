import type { WorkoutPR } from './workoutPR'

/** Texto compacto «+5 kg vs 70 kg» o «Primer récord» para series PR en vivo. */
export function buildGymLogLivePRHint(pr: WorkoutPR | null | undefined): string {
  if (!pr) return ''

  if (!pr.previousBest) {
    return 'Primer récord en este ejercicio'
  }

  const prev = pr.previousBest
  if (pr.weightKg > prev.weightKg) {
    const delta = pr.weightKg - prev.weightKg
    const deltaStr = Number.isInteger(delta) ? String(delta) : delta.toFixed(1).replace(/\.0$/, '')
    return `+${deltaStr} kg vs ${prev.weightKg} kg`
  }

  if (pr.weightKg === prev.weightKg && pr.reps > prev.reps) {
    return `+${pr.reps - prev.reps} reps vs ${prev.reps}×${prev.weightKg} kg`
  }

  return 'Nuevo récord personal'
}