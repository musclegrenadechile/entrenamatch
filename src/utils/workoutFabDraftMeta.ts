import type { Workout } from '../types'
import { buildGymLogSessionChipCompact } from './gymLogSessionDisplay'
import type { WorkoutDraft } from './workoutDraft'
import { formatDraftAge } from './workoutDraft'

export type WorkoutFabDraftMeta = {
  setCount: number
  ageLabel: string
  blocksLabel: string
  sessionChip: string
}

export type WorkoutFabDraftMetaOpts = {
  history?: Workout[]
}

/** Meta compacta para el gadget de sesión activa (FAB). */
export function buildWorkoutFabDraftMeta(
  draft: WorkoutDraft,
  _now = Date.now(),
  opts?: WorkoutFabDraftMetaOpts
): WorkoutFabDraftMeta {
  const setCount = draft.exercises.reduce((n, e) => n + e.sets.length, 0)
  return {
    setCount,
    ageLabel: formatDraftAge(draft.updatedAt),
    blocksLabel: setCount === 1 ? '1 bloque' : `${setCount} bloques`,
    sessionChip: buildGymLogSessionChipCompact(draft.exercises, { history: opts?.history }),
  }
}