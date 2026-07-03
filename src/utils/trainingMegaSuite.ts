/** Mega-inventario total pulido entrenamiento oleadas 361–420 (oleada 420 cierre III). */
import { entrenaPlanTrainingBlockRange } from './entrenaPlanTrainingSuite'
import { fuelPlanTrainingBlockRange } from './fuelPlanTrainingSuite'
import { trainingE2EBlockRange } from './e2eTrainingSuite'
import { trainingPolishMegaRange } from './trainingPolishSuite'
import { trainingPolishPostMegaRange } from './trainingPolishPostMegaSuite'
import { trainingPolishV1BlockRange } from './trainingPolishV1Suite'

export type TrainingMegaBlockId =
  | 'polish-v1'
  | 'e2e'
  | 'polish-v2'
  | 'entrena-plan'
  | 'fuel-plan'
  | 'polish-post-mega'

export type TrainingMegaBlockEntry = {
  id: TrainingMegaBlockId
  range: { from: number; to: number }
  suiteModule: string
  closedOleada: number
}

export const TRAINING_MEGA_BLOCKS: readonly TrainingMegaBlockEntry[] = [
  {
    id: 'polish-v1',
    range: trainingPolishV1BlockRange(),
    suiteModule: 'trainingPolishV1Suite',
    closedOleada: 377,
  },
  {
    id: 'e2e',
    range: trainingE2EBlockRange(),
    suiteModule: 'e2eTrainingSuite',
    closedOleada: 410,
  },
  {
    id: 'polish-v2',
    range: trainingPolishMegaRange(),
    suiteModule: 'trainingPolishSuite',
    closedOleada: 410,
  },
  {
    id: 'entrena-plan',
    range: entrenaPlanTrainingBlockRange(),
    suiteModule: 'entrenaPlanTrainingSuite',
    closedOleada: 409,
  },
  {
    id: 'fuel-plan',
    range: fuelPlanTrainingBlockRange(),
    suiteModule: 'fuelPlanTrainingSuite',
    closedOleada: 414,
  },
  {
    id: 'polish-post-mega',
    range: trainingPolishPostMegaRange(),
    suiteModule: 'trainingPolishPostMegaSuite',
    closedOleada: 420,
  },
] as const

export const TRAINING_MEGA_PHASE1_CLOSED_OLEADA = 411
export const TRAINING_MEGA_CLOSED_OLEADA = 414
export const TRAINING_MEGA_PHASE3_CLOSED_OLEADA = 420

export function trainingFullMegaRange(): { from: number; to: number } {
  return { from: 361, to: 420 }
}

export function isTrainingMegaPhase3Closed(
  oleada = TRAINING_MEGA_PHASE3_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_PHASE3_CLOSED_OLEADA
}

export function isTrainingMegaBlockClosed(
  oleada = TRAINING_MEGA_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_CLOSED_OLEADA
}

export function isTrainingMegaPhase1Closed(
  oleada = TRAINING_MEGA_PHASE1_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_PHASE1_CLOSED_OLEADA
}

export function isTrainingMegaFullyClosed(
  oleada = TRAINING_MEGA_CLOSED_OLEADA
): boolean {
  return (
    isTrainingMegaBlockClosed(oleada) && areAllTrainingMegaSubBlocksClosed(oleada)
  )
}

export function areAllTrainingMegaSubBlocksClosed(
  oleada = TRAINING_MEGA_CLOSED_OLEADA
): boolean {
  return TRAINING_MEGA_BLOCKS.every((b) => b.closedOleada <= oleada)
}

export function countTrainingMegaBlocks(): number {
  return TRAINING_MEGA_BLOCKS.length
}

export function countTrainingMegaOleadas(): number {
  const { from, to } = trainingFullMegaRange()
  return to - from + 1
}

export function trainingMegaBlockById(
  id: TrainingMegaBlockId
): TrainingMegaBlockEntry | undefined {
  return TRAINING_MEGA_BLOCKS.find((b) => b.id === id)
}