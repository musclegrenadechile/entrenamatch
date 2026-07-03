/** Mega-inventario total pulido entrenamiento oleadas 361–435 (oleada 435 cierre mega global). */
import { entrenaPlanTrainingBlockRange } from './entrenaPlanTrainingSuite'
import { fuelPlanTrainingBlockRange } from './fuelPlanTrainingSuite'
import { trainingE2EBlockRange } from './e2eTrainingSuite'
import { trainingPolishMegaRange } from './trainingPolishSuite'
import { trainingPolishPostFullRange } from './trainingPolishPostFullSuite'
import { trainingPolishPostMegaRange } from './trainingPolishPostMegaSuite'
import { trainingPolishPostFuelRange } from './trainingPolishPostFuelSuite'
import { trainingPolishPostEnergyRange } from './trainingPolishPostEnergySuite'
import { trainingPolishMegaGlobalRange } from './trainingPolishMegaGlobalSuite'
import { trainingPolishPostStackRange } from './trainingPolishPostStackSuite'
import { trainingPolishV1BlockRange } from './trainingPolishV1Suite'

export type TrainingMegaBlockId =
  | 'polish-v1'
  | 'e2e'
  | 'polish-v2'
  | 'entrena-plan'
  | 'fuel-plan'
  | 'polish-post-mega'
  | 'polish-post-full'
  | 'polish-post-stack'
  | 'polish-post-fuel'
  | 'polish-post-energy'
  | 'mega-global'

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
  {
    id: 'polish-post-full',
    range: trainingPolishPostFullRange(),
    suiteModule: 'trainingPolishPostFullSuite',
    closedOleada: 427,
  },
  {
    id: 'polish-post-stack',
    range: trainingPolishPostStackRange(),
    suiteModule: 'trainingPolishPostStackSuite',
    closedOleada: 429,
  },
  {
    id: 'polish-post-fuel',
    range: trainingPolishPostFuelRange(),
    suiteModule: 'trainingPolishPostFuelSuite',
    closedOleada: 432,
  },
  {
    id: 'polish-post-energy',
    range: trainingPolishPostEnergyRange(),
    suiteModule: 'trainingPolishPostEnergySuite',
    closedOleada: 434,
  },
  {
    id: 'mega-global',
    range: trainingPolishMegaGlobalRange(),
    suiteModule: 'trainingPolishMegaGlobalSuite',
    closedOleada: 435,
  },
] as const

export const TRAINING_MEGA_PHASE1_CLOSED_OLEADA = 411
export const TRAINING_MEGA_CLOSED_OLEADA = 414
export const TRAINING_MEGA_PHASE3_CLOSED_OLEADA = 420
export const TRAINING_MEGA_PHASE4_CLOSED_OLEADA = 429
export const TRAINING_MEGA_PHASE5_CLOSED_OLEADA = 432
export const TRAINING_MEGA_PHASE6_CLOSED_OLEADA = 434
export const TRAINING_MEGA_GLOBAL_CLOSED_OLEADA = 435

export function trainingFullMegaRange(): { from: number; to: number } {
  return { from: 361, to: 435 }
}

export function isTrainingMegaGlobalClosed(
  oleada = TRAINING_MEGA_GLOBAL_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_GLOBAL_CLOSED_OLEADA
}

export function isTrainingMegaPhase6Closed(
  oleada = TRAINING_MEGA_PHASE6_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_PHASE6_CLOSED_OLEADA
}

export function isTrainingMegaPhase5Closed(
  oleada = TRAINING_MEGA_PHASE5_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_PHASE5_CLOSED_OLEADA
}

export function isTrainingMegaPhase4Closed(
  oleada = TRAINING_MEGA_PHASE4_CLOSED_OLEADA
): boolean {
  return oleada >= TRAINING_MEGA_PHASE4_CLOSED_OLEADA
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