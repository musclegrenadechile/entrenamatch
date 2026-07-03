/** Mega-inventario total pulido entrenamiento oleadas 361–402 (oleada 403). */
import { entrenaPlanTrainingBlockRange } from './entrenaPlanTrainingSuite'
import { trainingE2EBlockRange } from './e2eTrainingSuite'
import { trainingPolishMegaRange } from './trainingPolishSuite'

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
    range: { from: 361, to: 377 },
    suiteModule: 'gym-log + EntrenaPlan + FAB + PR (oleadas 361–377)',
    closedOleada: 377,
  },
  {
    id: 'e2e',
    range: trainingE2EBlockRange(),
    suiteModule: 'e2eTrainingSuite',
    closedOleada: 405,
  },
  {
    id: 'polish-v2',
    range: trainingPolishMegaRange(),
    suiteModule: 'trainingPolishSuite',
    closedOleada: 398,
  },
  {
    id: 'entrena-plan',
    range: entrenaPlanTrainingBlockRange(),
    suiteModule: 'entrenaPlanTrainingSuite',
    closedOleada: 405,
  },
] as const

export function trainingFullMegaRange(): { from: number; to: number } {
  return { from: 361, to: 405 }
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