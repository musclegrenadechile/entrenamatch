/** Inventario Playwright del bloque E2E entrenamiento (oleadas 378–400). */
export type E2ETrainingCover =
  | 'gym-log'
  | 'fuel'
  | 'sync'
  | 'review'
  | 'fab'
  | 'banner'
  | 'fuel-prefill'
  | 'history'
  | 'plan-history'

export type E2ETrainingSpecEntry = {
  id: string
  file: string
  covers: readonly E2ETrainingCover[]
}

export const E2E_TRAINING_PLAYWRIGHT_SPECS: readonly E2ETrainingSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    covers: ['gym-log', 'review', 'banner'],
  },
  {
    id: 'training-full-flow',
    file: 'e2e/training-full-flow.spec.ts',
    covers: ['gym-log', 'sync', 'review'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    covers: ['gym-log', 'fuel', 'banner', 'fuel-prefill'],
  },
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    covers: ['gym-log', 'fuel', 'sync', 'review', 'banner', 'fuel-prefill'],
  },
  {
    id: 'workout-fab-flow',
    file: 'e2e/workout-fab-flow.spec.ts',
    covers: ['gym-log', 'fab'],
  },
  {
    id: 'workout-history-flow',
    file: 'e2e/workout-history-flow.spec.ts',
    covers: ['history'],
  },
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    covers: ['gym-log', 'plan-history'],
  },
] as const

export function trainingE2EBlockRange(): { from: number; to: number } {
  return { from: 378, to: 402 }
}

export function countTrainingE2ESpecs(): number {
  return E2E_TRAINING_PLAYWRIGHT_SPECS.length
}

export function trainingMegaSpecEntry(): E2ETrainingSpecEntry {
  const mega = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'training-mega-flow')
  if (!mega) throw new Error('training-mega-flow spec missing')
  return mega
}