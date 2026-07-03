/** Inventario E2E consolidado rotación EntrenaPlan — 3 specs (oleada 409). */

export type E2EPlanRotationCover =
  | 'history-hint'
  | 'rotation-detail'
  | 'rotation-chip'
  | 'rotation-aria'

export type E2EPlanRotationSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EPlanRotationCover[]
}

export const E2E_PLAN_ROTATION_SPECS: readonly E2EPlanRotationSpecEntry[] = [
  {
    id: 'workout-plan-history-flow',
    file: 'e2e/workout-plan-history-flow.spec.ts',
    oleada: 408,
    covers: ['history-hint', 'rotation-detail', 'rotation-chip', 'rotation-aria'],
  },
  {
    id: 'training-mega-flow',
    file: 'e2e/training-mega-flow.spec.ts',
    oleada: 408,
    covers: ['history-hint', 'rotation-detail', 'rotation-chip', 'rotation-aria'],
  },
  {
    id: 'workout-history-flow',
    file: 'e2e/workout-history-flow.spec.ts',
    oleada: 407,
    covers: ['history-hint', 'rotation-chip', 'rotation-aria'],
  },
] as const

const REQUIRED_ROTATION_COVERS: readonly E2EPlanRotationCover[] = [
  'history-hint',
  'rotation-chip',
  'rotation-aria',
]

export function countE2EPlanRotationSpecs(): number {
  return E2E_PLAN_ROTATION_SPECS.length
}

export function e2ePlanRotationBlockRange(): { from: number; to: number } {
  return { from: 407, to: 408 }
}

export function e2ePlanRotationSpecIds(): string[] {
  return E2E_PLAN_ROTATION_SPECS.map((s) => s.id)
}

export function isPlanRotationE2ECoverageComplete(
  covered: readonly E2EPlanRotationCover[]
): boolean {
  return REQUIRED_ROTATION_COVERS.every((c) => covered.includes(c))
}

export function unionPlanRotationCovers(): E2EPlanRotationCover[] {
  const all = new Set<E2EPlanRotationCover>()
  for (const spec of E2E_PLAN_ROTATION_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

/** Archivos Playwright ejecutados en CI e2e-smoke (oleada 410). */
export const E2E_PLAN_ROTATION_CI_FILES = E2E_PLAN_ROTATION_SPECS.map((s) => s.file)

export function rotationSpecFileBasenames(): string[] {
  return E2E_PLAN_ROTATION_CI_FILES.map((f) => f.replace(/^e2e\//, ''))
}