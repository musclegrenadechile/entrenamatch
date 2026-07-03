/**
 * Oleada 402 — E2E guardar entreno → hint PR en EntrenaPlan (sin seed historial).
 */

export type E2EWeeklyPlanHistoryStep = {
  id: string
  action: string
  expect: string
}

export const E2E_WEEKLY_PLAN_HISTORY_FLOW_STEPS: readonly E2EWeeklyPlanHistoryStep[] = [
  {
    id: 'ph-01',
    action: 'Activar Fuel demo (seedDemoFuelProfile) para mostrar EntrenaPlan',
    expect: 'Card EntrenaPlan visible en Hoy',
  },
  {
    id: 'ph-02',
    action: 'Guardar gym-log E2E (openWorkoutModal → Terminar y publicar)',
    expect: 'Historial demo actualizado sin seedDemoWorkoutHistory',
  },
  {
    id: 'ph-03',
    action: 'Verificar hint PR en EntrenaPlan (oleada 401)',
    expect: '.em-v2-plan__history-hint con Press banca; harness getWeeklyPlanHistoryHint',
  },
  {
    id: 'ph-04',
    action: 'Nota rotación PR en detalle (oleada 404–405)',
    expect: 'Detalle con «Tras PR» / «rotación»; harness getWeeklyPlanDetail',
  },
  {
    id: 'ph-05',
    action: 'Chip rotación PR visible + aria (oleada 408)',
    expect: '.em-v2-plan__rotation-chip; harness getWeeklyPlanRotationChip + aria-label',
  },
] as const

export function countE2EWeeklyPlanHistoryFlowSteps(): number {
  return E2E_WEEKLY_PLAN_HISTORY_FLOW_STEPS.length
}