/** Mega-inventario total pulido entrenamiento oleadas 361–409 (oleada 409). */
import { entrenaPlanTrainingBlockRange } from './entrenaPlanTrainingSuite'
import { trainingE2EBlockRange } from './e2eTrainingSuite'
import { trainingPolishMegaRange } from './trainingPolishSuite'
import { trainingPolishV1BlockRange } from './trainingPolishV1Suite'

export type TrainingMegaBlockId = 'polish-v1' | 'e2e' | 'polish-v2' | 'entrena-plan'

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
    closedOleada: 409,
  },
  {
    id: 'polish-v2',
    range: trainingPolishMegaRange(),
    suiteModule: 'trainingPolishSuite',
    closedOleada: 409,
  },
  {
    id: 'entrena-plan',
    range: entrenaPlanTrainingBlockRange(),
    suiteModule: 'entrenaPlanTrainingSuite',
    closedOleada: 409,
  },
] as const

export function trainingFullMegaRange(): { from: number; to: number } {
  return { from: 361, to: 409 }
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