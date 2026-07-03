/** Inventario EntrenaPlan × historial (oleada 401–409). */
export type EntrenaPlanTrainingCover = 'history-hint' | 'aria' | 'card' | 'rotation-chip'

export type EntrenaPlanTrainingUtilEntry = {
  id: string
  module: string
  oleada: number
  covers: readonly EntrenaPlanTrainingCover[]
}

export const ENTRENA_PLAN_TRAINING_UTILS: readonly EntrenaPlanTrainingUtilEntry[] = [
  {
    id: 'plan-history-hint',
    module: 'weeklyPlanHistoryDisplay',
    oleada: 401,
    covers: ['history-hint', 'aria'],
  },
  {
    id: 'plan-card-history',
    module: 'WeeklyPlanCard',
    oleada: 401,
    covers: ['card', 'history-hint'],
  },
  {
    id: 'plan-history-e2e',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 402,
    covers: ['history-hint'],
  },
  {
    id: 'plan-pr-rotation',
    module: 'weeklyPlanPrRotation',
    oleada: 404,
    covers: ['history-hint'],
  },
  {
    id: 'plan-rotation-e2e',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 405,
    covers: ['history-hint'],
  },
  {
    id: 'plan-mega-rotation',
    module: 'e2eTrainingMegaFlow',
    oleada: 406,
    covers: ['history-hint'],
  },
  {
    id: 'plan-rotation-chip',
    module: 'weeklyPlanRotationDisplay',
    oleada: 407,
    covers: ['rotation-chip', 'aria', 'card'],
  },
  {
    id: 'plan-history-profile-e2e',
    module: 'e2eWorkoutHistoryFlow',
    oleada: 407,
    covers: ['history-hint', 'rotation-chip'],
  },
  {
    id: 'plan-rotation-aria',
    module: 'weeklyPlanRotationDisplay',
    oleada: 408,
    covers: ['rotation-chip', 'aria'],
  },
  {
    id: 'plan-rotation-chip-e2e',
    module: 'e2eWeeklyPlanHistoryFlow',
    oleada: 408,
    covers: ['rotation-chip', 'aria'],
  },
  {
    id: 'plan-rotation-e2e-suite',
    module: 'e2ePlanRotationCoverage',
    oleada: 409,
    covers: ['history-hint', 'rotation-chip', 'aria'],
  },
  {
    id: 'plan-block-closure',
    module: 'entrenaPlanTrainingSuite',
    oleada: 409,
    covers: ['history-hint', 'rotation-chip', 'aria', 'card'],
  },
] as const

export const ENTRENA_PLAN_TRAINING_CLOSED_OLEADA = 409

export function countEntrenaPlanTrainingUtils(): number {
  return ENTRENA_PLAN_TRAINING_UTILS.length
}

export function entrenaPlanTrainingBlockRange(): { from: number; to: number } {
  return { from: 401, to: 409 }
}

export function countEntrenaPlanTrainingOleadas(): number {
  const { from, to } = entrenaPlanTrainingBlockRange()
  return to - from + 1
}

export function isEntrenaPlanTrainingBlockClosed(
  oleada = ENTRENA_PLAN_TRAINING_CLOSED_OLEADA
): boolean {
  return oleada >= ENTRENA_PLAN_TRAINING_CLOSED_OLEADA
}