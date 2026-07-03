/** Cierre mega global entrenamiento oleadas 361–434 (oleada 435). */
import { countE2ETrainingPolishBridgeEntries } from './e2eTrainingPolishBridge'
import {
  countFuelPlanCoverageSuites,
  isFuelPlanFullE2ECoverageComplete,
} from './e2eFuelPlanFullCoverage'
import { countTrainingE2ESpecs } from './e2eTrainingSuite'
import {
  areAllTrainingMegaSubBlocksClosed,
  countTrainingMegaBlocks,
  countTrainingMegaOleadas,
  isTrainingMegaFullyClosed,
  isTrainingMegaPhase6Closed,
  TRAINING_MEGA_BLOCKS,
  trainingFullMegaRange,
} from './trainingMegaSuite'

export const TRAINING_MEGA_GLOBAL_CLOSED_OLEADA = 435

export const TRAINING_MEGA_GLOBAL_PHASE_CLOSURES = [
  { phase: 'I', oleada: 411 },
  { phase: 'II', oleada: 415 },
  { phase: 'III', oleada: 420 },
  { phase: 'IV', oleada: 427 },
  { phase: 'V', oleada: 429 },
  { phase: 'VI', oleada: 432 },
  { phase: 'VII', oleada: 434 },
] as const

export function trainingMegaGlobalBlockRange(): { from: number; to: number } {
  return { from: 361, to: TRAINING_MEGA_GLOBAL_CLOSED_OLEADA }
}

export function countTrainingMegaGlobalPhaseClosures(): number {
  return TRAINING_MEGA_GLOBAL_PHASE_CLOSURES.length
}

export function isTrainingMegaGlobalClosureComplete(
  oleada = TRAINING_MEGA_GLOBAL_CLOSED_OLEADA
): boolean {
  if (oleada < TRAINING_MEGA_GLOBAL_CLOSED_OLEADA) return false
  const { from, to } = trainingFullMegaRange()
  return (
    from === 361 &&
    to === 435 &&
    countTrainingMegaBlocks() === 11 &&
    countTrainingMegaOleadas() === 75 &&
    TRAINING_MEGA_BLOCKS.length === 11 &&
    areAllTrainingMegaSubBlocksClosed(435) &&
    isTrainingMegaFullyClosed(435) &&
    isTrainingMegaPhase6Closed(434) &&
    isFuelPlanFullE2ECoverageComplete() &&
    countFuelPlanCoverageSuites() === 12 &&
    countE2ETrainingPolishBridgeEntries() >= 75 &&
    countTrainingE2ESpecs() === 7
  )
}