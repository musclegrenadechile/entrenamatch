/** Mega-inventario pulido PR v2 oleadas 436–444 (oleada 444 cierre global). */
import { trainingPolishGymLogV2Range } from './trainingPolishGymLogV2Suite'
import { trainingPolishPostWorkoutV2Range } from './trainingPolishPostWorkoutV2Suite'
import { trainingPolishPrV2GlobalRange } from './trainingPolishPrV2GlobalSuite'
import { trainingPolishWorkoutHistoryV2Range } from './trainingPolishWorkoutHistoryV2Suite'

export type TrainingPrV2BlockId =
  | 'gym-log-v2'
  | 'post-workout-v2'
  | 'history-v2'
  | 'pr-v2-global'

export type TrainingPrV2BlockEntry = {
  id: TrainingPrV2BlockId
  range: { from: number; to: number }
  suiteModule: string
  closedOleada: number
}

export const TRAINING_PR_V2_BLOCKS: readonly TrainingPrV2BlockEntry[] = [
  {
    id: 'gym-log-v2',
    range: trainingPolishGymLogV2Range(),
    suiteModule: 'trainingPolishGymLogV2Suite',
    closedOleada: 438,
  },
  {
    id: 'post-workout-v2',
    range: trainingPolishPostWorkoutV2Range(),
    suiteModule: 'trainingPolishPostWorkoutV2Suite',
    closedOleada: 442,
  },
  {
    id: 'history-v2',
    range: trainingPolishWorkoutHistoryV2Range(),
    suiteModule: 'trainingPolishWorkoutHistoryV2Suite',
    closedOleada: 443,
  },
  {
    id: 'pr-v2-global',
    range: trainingPolishPrV2GlobalRange(),
    suiteModule: 'trainingPolishPrV2GlobalSuite',
    closedOleada: 444,
  },
] as const

export const TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA = 444

export function trainingPrV2FullRange(): { from: number; to: number } {
  return { from: 436, to: 444 }
}

export function countTrainingPrV2Blocks(): number {
  return TRAINING_PR_V2_BLOCKS.length
}

export function countTrainingPrV2Oleadas(): number {
  return 8
}

export function trainingPrV2BlockById(
  id: TrainingPrV2BlockId
): TrainingPrV2BlockEntry | undefined {
  return TRAINING_PR_V2_BLOCKS.find((b) => b.id === id)
}

export function isTrainingPrV2GlobalClosed(
  oleada = TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA
}

export function areAllTrainingPrV2SubBlocksClosed(
  oleada = TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  return TRAINING_PR_V2_BLOCKS.every((b) => b.closedOleada <= oleada)
}

export function isTrainingPrV2FullyClosed(
  oleada = TRAINING_PR_V2_GLOBAL_CLOSED_OLEADA
): boolean {
  return areAllTrainingPrV2SubBlocksClosed(oleada) && isTrainingPrV2GlobalClosed(oleada)
}