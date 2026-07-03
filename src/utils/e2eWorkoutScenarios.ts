/**
 * Oleada 378 — checklist QA manual + Playwright workout-flow.spec.ts
 * Flujo: gym-log → guardar → (sync opcional) → reseña post-entreno.
 */

export type E2EWorkoutPhase = 'log' | 'sync' | 'close' | 'review'

export type E2EWorkoutStep = {
  id: string
  phase: E2EWorkoutPhase
  action: string
  expect: string
}

export const E2E_WORKOUT_FLOW_STEPS: E2EWorkoutStep[] = [
  {
    id: 'wo-01',
    phase: 'log',
    action: 'Abrir Entreno de Hoy vía harness (?e2e=1)',
    expect: 'Dialog gym-log visible con al menos 1 ejercicio',
  },
  {
    id: 'wo-02',
    phase: 'log',
    action: 'Verificar serie registrada o prefill E2E',
    expect: 'CTA «Terminar y publicar» habilitado',
  },
  {
    id: 'wo-02b',
    phase: 'log',
    action: 'Chip sesión + badge PR en vivo (oleada 384)',
    expect: 'Status con series/volumen; aria-label PR en serie récord',
  },
  {
    id: 'wo-02c',
    phase: 'log',
    action: 'Hint delta PR bajo serie (oleada 386)',
    expect: 'Texto «Primer récord» o «+X kg vs …» visible en gym-log',
  },
  {
    id: 'wo-03',
    phase: 'close',
    action: 'Guardar entreno',
    expect: 'Modal cierra; toast o banner post-guardar en demo',
  },
  {
    id: 'wo-03b',
    phase: 'close',
    action: 'Banner post-guardar en Hoy (oleada 390–391)',
    expect: 'Línea sessionSummary con series/volumen; harness getWorkoutSaveBannerSessionSummary',
  },
  {
    id: 'wo-04',
    phase: 'sync',
    action: 'EntrenaSync mock (training-full-flow.spec)',
    expect: 'Sala Sync visible; closeArena sin crash',
  },
  {
    id: 'wo-05',
    phase: 'review',
    action: 'Abrir reseña post-entreno (harness openReviewModal)',
    expect: 'Dialog reseña con estrellas y «Enviar reseña»',
  },
  {
    id: 'wo-05c',
    phase: 'review',
    action: 'Tono PR×reseña post-sync (training-full-flow oleada 450)',
    expect: 'Kicker récord personal; aria «récord personal» tras sync',
  },
  {
    id: 'wo-05b',
    phase: 'review',
    action: 'Hints dinámicos + envío bloqueado sin rating (oleada 390)',
    expect: '«Toca las estrellas»; CTA deshabilitado hasta 1–5 estrellas',
  },
  {
    id: 'wo-06',
    phase: 'review',
    action: 'Calificar y enviar reseña',
    expect: 'Modal cierra; app estable en Hoy',
  },
]

export function countStepsByPhase(
  steps: E2EWorkoutStep[]
): Record<E2EWorkoutPhase, number> {
  return steps.reduce(
    (acc, s) => {
      acc[s.phase] += 1
      return acc
    },
    { log: 0, sync: 0, close: 0, review: 0 }
  )
}