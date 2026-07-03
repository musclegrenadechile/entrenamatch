/** Inventario Playwright del bloque E2E entrenamiento (oleadas 378–382). */
export type E2ETrainingSpecEntry = {
  id: string
  file: string
  covers: readonly ('gym-log' | 'fuel' | 'sync' | 'review' | 'fab')[]
}

export const E2E_TRAINING_PLAYWRIGHT_SPECS: readonly E2ETrainingSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    covers: ['gym-log', 'review'],
  },
  {
    id: 'training-full-flow',
    file: 'e2e/training-full-flow.spec.ts',
    covers: ['gym-log', 'sync', 'review'],
  },
  {
    id: 'workout-fuel-flow',
    file: 'e2e/workout-fuel-flow.spec.ts',
    covers: ['gym-log', 'fuel'],
  },
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    covers: ['gym-log', 'fuel', 'sync', 'review'],
  },
  {
    id: 'workout-fab-flow',
    file: 'e2e/workout-fab-flow.spec.ts',
    covers: ['gym-log', 'fab'],
  },
] as const

export function trainingE2EBlockRange(): { from: number; to: number } {
  return { from: 378, to: 389 }
}

export function countTrainingE2ESpecs(): number {
  return E2E_TRAINING_PLAYWRIGHT_SPECS.length
}

export function trainingMegaSpecEntry(): E2ETrainingSpecEntry {
  const mega = E2E_TRAINING_PLAYWRIGHT_SPECS.find((s) => s.id === 'training-mega-flow')
  if (!mega) throw new Error('training-mega-flow spec missing')
  return mega
}