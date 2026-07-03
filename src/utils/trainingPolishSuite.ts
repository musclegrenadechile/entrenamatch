/** Mega-inventario pulido entrenamiento oleadas 383–397 (oleada 398). */
import { gymLogTrainingBlockRange } from './gymLogTrainingSuite'
import { postWorkoutTrainingBlockRange } from './postWorkoutTrainingSuite'
import { workoutHistoryTrainingBlockRange } from './workoutHistoryTrainingSuite'

export type TrainingPolishBlockId = 'gym-log-live' | 'fab-session' | 'post-workout' | 'history'

export type TrainingPolishBlockEntry = {
  id: TrainingPolishBlockId
  range: { from: number; to: number }
  suiteModule: string
  closedOleada: number
}

export const TRAINING_POLISH_BLOCKS: readonly TrainingPolishBlockEntry[] = [
  {
    id: 'gym-log-live',
    range: gymLogTrainingBlockRange(),
    suiteModule: 'gymLogTrainingSuite',
    closedOleada: 387,
  },
  {
    id: 'fab-session',
    range: { from: 387, to: 389 },
    suiteModule: 'workoutFabDraftMeta + e2eWorkoutFabFlow',
    closedOleada: 389,
  },
  {
    id: 'post-workout',
    range: postWorkoutTrainingBlockRange(),
    suiteModule: 'postWorkoutTrainingSuite',
    closedOleada: 394,
  },
  {
    id: 'history',
    range: workoutHistoryTrainingBlockRange(),
    suiteModule: 'workoutHistoryTrainingSuite',
    closedOleada: 397,
  },
] as const

export function trainingPolishMegaRange(): { from: number; to: number } {
  return { from: 383, to: 397 }
}

export function countTrainingPolishBlocks(): number {
  return TRAINING_POLISH_BLOCKS.length
}

export function countTrainingPolishOleadas(): number {
  const { from, to } = trainingPolishMegaRange()
  return to - from + 1
}

export function trainingPolishBlockById(
  id: TrainingPolishBlockId
): TrainingPolishBlockEntry | undefined {
  return TRAINING_POLISH_BLOCKS.find((b) => b.id === id)
}