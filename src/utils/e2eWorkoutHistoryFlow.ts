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
  {
    id: 'wh-06',
    action: 'Guardar entreno desde Perfil (65 kg Press banca)',
    expect: 'Historial actualizado; modal cierra tras publicar',
  },
  {
    id: 'wh-07',
    action: 'EntrenaPlan hint + chip rotación en Hoy (oleada 407)',
    expect: '.em-v2-plan__history-hint + .em-v2-plan__rotation-chip; harness getters',
  },
] as const

export function countE2EWorkoutHistoryFlowSteps(): number {
  return E2E_WORKOUT_HISTORY_FLOW_STEPS.length
}