/** Mega-inventario pulido entrenamiento oleadas 383–409 (oleada 410 cierre). */
import { entrenaPlanTrainingBlockRange } from './entrenaPlanTrainingSuite'
import { gymLogTrainingBlockRange } from './gymLogTrainingSuite'
import { postWorkoutTrainingBlockRange } from './postWorkoutTrainingSuite'
import { workoutHistoryTrainingBlockRange } from './workoutHistoryTrainingSuite'

export type TrainingPolishBlockId =
  | 'gym-log-live'
  | 'fab-session'
  | 'post-workout'
  | 'history'
  | 'entrena-plan'

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
  {
    id: 'entrena-plan',
    range: entrenaPlanTrainingBlockRange(),
    suiteModule: 'entrenaPlanTrainingSuite',
    closedOleada: 409,
  },
] as const

export function trainingPolishMegaRange(): { from: number; to: number } {
  return { from: 383, to: 409 }
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

export const TRAINING_POLISH_CLOSED_OLEADA = 410

export function isTrainingPolishBlockClosed(
  oleada = TRAINING_POLISH_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_POLISH_CLOSED_OLEADA
}

export function areTrainingPolishSubBlocksClosed(
  oleada = TRAINING_POLISH_CLOSED_OLEADA
): boolean {
  return TRAINING_POLISH_BLOCKS.every((b) => b.closedOleada <= oleada)
}