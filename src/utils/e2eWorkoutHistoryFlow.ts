/**
 * Oleada 400 — checklist E2E historial Perfil (oleadas pulido 395–397).
 */

export type E2EWorkoutHistoryStep = {
  id: string
  action: string
  expect: string
}

export const E2E_WORKOUT_HISTORY_FLOW_STEPS: readonly E2EWorkoutHistoryStep[] = [
  {
    id: 'wh-01',
    action: 'Sembrar historial demo vía harness seedDemoWorkoutHistory',
    expect: '2 filas en Perfil con volumen 500/600 kg',
  },
  {
    id: 'wh-02',
    action: 'Ir a Perfil (goToProfileTab)',
    expect: 'Card Entreno de Hoy visible con kicker «Últimos 2 · N con PR»',
  },
  {
    id: 'wh-03',
    action: 'Resumen compacto por fila (oleada 395)',
    expect: 'Líneas .em-v2-training-history__summary con series/volumen',
  },
  {
    id: 'wh-04',
    action: 'Badge PR en fila (oleada 395)',
    expect: 'Al menos un badge .em-v2-training-history__badge--pr',
  },
  {
    id: 'wh-05',
    action: 'Sparkline con puntos PR (oleada 396–397)',
    expect: 'SVG --has-pr y aria-label con «PR»',
  },
] as const

export function countE2EWorkoutHistoryFlowSteps(): number {
  return E2E_WORKOUT_HISTORY_FLOW_STEPS.length
}