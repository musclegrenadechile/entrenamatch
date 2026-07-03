/** Hitos E2E entreno minimizado → FAB con chip sesión (oleada 388). */

export type E2EWorkoutFabStep = {
  id: string
  action: string
  expect: string
}

export const E2E_WORKOUT_FAB_FLOW_STEPS: readonly E2EWorkoutFabStep[] = [
  {
    id: 'fab-01',
    action: 'Abrir gym-log vía harness',
    expect: 'Dialog Entreno de Hoy visible',
  },
  {
    id: 'fab-02',
    action: 'Minimizar sesión (harness minimizeWorkoutModal)',
    expect: 'Modal cierra; FAB «Volver a Modo Entreno» visible',
  },
  {
    id: 'fab-03',
    action: 'Verificar chip sesión en FAB',
    expect: 'Status con series/volumen (oleada 387)',
  },
  {
    id: 'fab-04',
    action: 'Reanudar desde FAB (harness resumeWorkoutModal)',
    expect: 'Gym-log reabre con ejercicios intactos',
  },
] as const

export function countWorkoutFabFlowSteps(): number {
  return E2E_WORKOUT_FAB_FLOW_STEPS.length
}