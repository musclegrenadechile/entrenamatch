/** Puente E2E Playwright ↔ oleadas pulido entrenamiento (oleada 399). */
import { trainingFullMegaRange } from './trainingMegaSuite'

export type E2ETrainingPolishBridgeEntry = {
  polishOleada: number
  e2eSpecId: string
  feature: string
}

/** Oleadas de pulido validadas por specs E2E existentes. */
export const E2E_TRAINING_POLISH_BRIDGE: readonly E2ETrainingPolishBridgeEntry[] = [
  { polishOleada: 384, e2eSpecId: 'workout-flow', feature: 'PR badge en gym-log' },
  { polishOleada: 386, e2eSpecId: 'workout-flow', feature: 'hint delta PR' },
  { polishOleada: 388, e2eSpecId: 'workout-fab-flow', feature: 'minimizar FAB y reanudar' },
  { polishOleada: 391, e2eSpecId: 'workout-flow', feature: 'banner sessionSummary + hints reseña' },
  { polishOleada: 392, e2eSpecId: 'workout-fuel-flow', feature: 'fuel balance hint en banner' },
  {
    polishOleada: 393,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'chip macros + prefill Fuel',
  },
  {
    polishOleada: 393,
    e2eSpecId: 'training-mega-flow',
    feature: 'chip macros + prefill Fuel',
  },
  {
    polishOleada: 394,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'harness getFuelLogPrefillMacros',
  },
  {
    polishOleada: 395,
    e2eSpecId: 'workout-history-flow',
    feature: 'kicker + resumen + badges PR historial',
  },
  {
    polishOleada: 396,
    e2eSpecId: 'workout-history-flow',
    feature: 'sparkline puntos dorados PR',
  },
  {
    polishOleada: 397,
    e2eSpecId: 'workout-history-flow',
    feature: 'aria-label sparkline historial',
  },
  {
    polishOleada: 401,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'hint PR EntrenaPlan tras guardar entreno',
  },
  {
    polishOleada: 404,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'nota rotación PR en detalle EntrenaPlan',
  },
  {
    polishOleada: 405,
    e2eSpecId: 'training-mega-flow',
    feature: 'EntrenaPlan hint PR en mega-flujo',
  },
  {
    polishOleada: 406,
    e2eSpecId: 'training-mega-flow',
    feature: 'nota rotación PR en mega-flujo',
  },
  {
    polishOleada: 407,
    e2eSpecId: 'workout-history-flow',
    feature: 'EntrenaPlan hint + chip rotación tras guardar desde Perfil',
  },
  {
    polishOleada: 408,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'chip rotación PR + aria en EntrenaPlan',
  },
  {
    polishOleada: 408,
    e2eSpecId: 'training-mega-flow',
    feature: 'chip rotación PR + aria en mega-flujo',
  },
  {
    polishOleada: 409,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre E2E rotación EntrenaPlan (3 specs)',
  },
  {
    polishOleada: 409,
    e2eSpecId: 'training-mega-flow',
    feature: 'cierre E2E rotación EntrenaPlan (3 specs)',
  },
  {
    polishOleada: 409,
    e2eSpecId: 'workout-history-flow',
    feature: 'cierre E2E rotación EntrenaPlan (3 specs)',
  },
  {
    polishOleada: 410,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre pulido II 383–409 + CI e2ePlanRotationCoverage',
  },
  {
    polishOleada: 411,
    e2eSpecId: 'training-mega-flow',
    feature: 'hint semanal Fuel×EntrenaPlan en card',
  },
  {
    polishOleada: 412,
    e2eSpecId: 'training-mega-flow',
    feature: 'harness fuel week hint + tono under-fueled',
  },
  {
    polishOleada: 413,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'seedDemoFuelWeekLogs surplus + chip Δ kcal + hint Superávit',
  },
  {
    polishOleada: 414,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'seedDemoFuelWeekLogs deficit + chip Δ kcal + hint Déficit',
  },
  {
    polishOleada: 415,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'nota nutricional Fuel×plan en déficit',
  },
  {
    polishOleada: 416,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'nota nutricional surplus + aria en plan-history',
  },
] as const

export function trainingMegaBlockRange(): { from: number; to: number } {
  return trainingFullMegaRange()
}

export function countE2ETrainingPolishBridgeEntries(): number {
  return E2E_TRAINING_POLISH_BRIDGE.length
}

export function uniqueE2EValidatedPolishOleadas(): number[] {
  return [...new Set(E2E_TRAINING_POLISH_BRIDGE.map((e) => e.polishOleada))].sort(
    (a, b) => a - b
  )
}

export function e2eBridgeEntriesForOleada(oleada: number): E2ETrainingPolishBridgeEntry[] {
  return E2E_TRAINING_POLISH_BRIDGE.filter((e) => e.polishOleada === oleada)
}