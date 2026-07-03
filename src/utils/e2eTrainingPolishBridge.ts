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
  {
    polishOleada: 417,
    e2eSpecId: 'training-mega-flow',
    feature: 'nota nutricional under-fueled + trilogía E2E nutrición',
  },
  {
    polishOleada: 418,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'chip headline Fuel Superávit + e2eFuelPlanNutritionCoverage',
  },
  {
    polishOleada: 419,
    e2eSpecId: 'training-mega-flow',
    feature: 'chip headline Afinar Fuel + tono under-fueled',
  },
  {
    polishOleada: 419,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'chip headline Déficit + e2eFuelPlanHeadlineCoverage trilogía',
  },
  {
    polishOleada: 420,
    e2eSpecId: 'training-mega-flow',
    feature: 'mega cierre III 361–419 + e2eFuelPlanFullCoverage 3 suites',
  },
  {
    polishOleada: 421,
    e2eSpecId: 'training-mega-flow',
    feature: 'borde escenario Fuel + harness getWeeklyPlanScenarioClass',
  },
  {
    polishOleada: 421,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'borde surplus + e2eFuelPlanScenarioCoverage',
  },
  {
    polishOleada: 421,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'borde déficit + trainingPolishPostFullSuite',
  },
  {
    polishOleada: 422,
    e2eSpecId: 'training-mega-flow',
    feature: 'tono fila Fuel under-fueled + harness getWeeklyPlanFuelRowToneClass',
  },
  {
    polishOleada: 422,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'tono fila Fuel surplus en plan-history',
  },
  {
    polishOleada: 422,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'tono fila Fuel déficit en fuel-flow',
  },
  {
    polishOleada: 423,
    e2eSpecId: 'training-mega-flow',
    feature: 'stack tono Fuel under-fueled + harness isWeeklyPlanFuelToneStackAligned',
  },
  {
    polishOleada: 423,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'stack tono Fuel surplus + e2eFuelPlanToneCoverage',
  },
  {
    polishOleada: 423,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'stack tono Fuel déficit + weeklyPlanFuelToneStackDisplay',
  },
  {
    polishOleada: 424,
    e2eSpecId: 'training-mega-flow',
    feature: 'tono nutrición under-fueled + isWeeklyPlanFuelToneStackExpected',
  },
  {
    polishOleada: 424,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'tono nutrición surplus + getWeeklyPlanNutritionToneClass',
  },
  {
    polishOleada: 424,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'tono nutrición déficit + fuel-nutrition-tone E2E',
  },
  {
    polishOleada: 425,
    e2eSpecId: 'training-mega-flow',
    feature: 'stack Fuel esperado under-fueled + isWeeklyPlanFuelToneStackFullyExpected',
  },
  {
    polishOleada: 425,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'stack Fuel esperado surplus + weeklyPlanFuelToneStackExpectedDisplay',
  },
  {
    polishOleada: 425,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'stack Fuel esperado déficit + fuel-tone-expected E2E',
  },
  {
    polishOleada: 426,
    e2eSpecId: 'training-mega-flow',
    feature: 'aria stack Fuel under-fueled + isWeeklyPlanFuelToneAriaAligned',
  },
  {
    polishOleada: 426,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'aria stack Fuel surplus + weeklyPlanFuelToneStackAriaDisplay',
  },
  {
    polishOleada: 426,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'aria stack Fuel déficit + fuel-tone-aria E2E',
  },
  {
    polishOleada: 427,
    e2eSpecId: 'training-mega-flow',
    feature: 'card aria under-fueled + isWeeklyPlanFuelCardToneAriaExpected',
  },
  {
    polishOleada: 427,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'card aria surplus + e2eFuelPlanPostFullCoverage',
  },
  {
    polishOleada: 427,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'card aria déficit + fuel-tone-card E2E cierre post-full',
  },
  {
    polishOleada: 428,
    e2eSpecId: 'training-mega-flow',
    feature: 'stack Fuel full sync under-fueled + isWeeklyPlanFuelToneStackFullySynced',
  },
  {
    polishOleada: 428,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'stack Fuel full sync surplus + weeklyPlanFuelToneStackFullDisplay',
  },
  {
    polishOleada: 428,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'stack Fuel full sync déficit + fuel-tone-full E2E',
  },
  {
    polishOleada: 429,
    e2eSpecId: 'training-mega-flow',
    feature: 'cierre post-stack under-fueled + e2eFuelPlanPostStackCoverage',
  },
  {
    polishOleada: 429,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre post-stack surplus + trainingPolishPostStackSuite',
  },
  {
    polishOleada: 429,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'cierre post-stack déficit + mega cierre V',
  },
  {
    polishOleada: 430,
    e2eSpecId: 'training-mega-flow',
    feature: 'tono Fuel×historial under-fueled + isWeeklyPlanHistoryFuelToneAriaExpected',
  },
  {
    polishOleada: 430,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'tono Fuel×historial surplus + weeklyPlanFuelHistoryToneDisplay',
  },
  {
    polishOleada: 431,
    e2eSpecId: 'training-mega-flow',
    feature: 'tono Fuel×rotación under-fueled + isWeeklyPlanRotationFuelToneAriaExpected',
  },
  {
    polishOleada: 431,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'tono Fuel×rotación surplus + weeklyPlanFuelRotationToneDisplay',
  },
  {
    polishOleada: 432,
    e2eSpecId: 'training-mega-flow',
    feature: 'cierre post-fuel under-fueled + e2eFuelPlanPostFuelCoverage',
  },
  {
    polishOleada: 432,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre post-fuel surplus + trainingPolishPostFuelSuite',
  },
  {
    polishOleada: 432,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'cierre post-fuel déficit + mega cierre VI',
  },
  {
    polishOleada: 433,
    e2eSpecId: 'training-mega-flow',
    feature: 'tono Fuel×energía under-fueled + isWeeklyPlanEnergySummaryFuelToneAriaExpected',
  },
  {
    polishOleada: 433,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'tono Fuel×energía surplus + weeklyPlanFuelEnergySummaryToneDisplay',
  },
  {
    polishOleada: 434,
    e2eSpecId: 'training-mega-flow',
    feature: 'cierre post-energy under-fueled + e2eFuelPlanPostEnergyCoverage',
  },
  {
    polishOleada: 434,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre post-energy surplus + trainingPolishPostEnergySuite',
  },
  {
    polishOleada: 434,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'cierre post-energy déficit + mega cierre VII',
  },
  {
    polishOleada: 435,
    e2eSpecId: 'training-mega-flow',
    feature: 'cierre mega global under-fueled + trainingMegaGlobalClosure',
  },
  {
    polishOleada: 435,
    e2eSpecId: 'workout-plan-history-flow',
    feature: 'cierre mega global surplus + e2eTrainingMegaGlobalCoverage',
  },
  {
    polishOleada: 435,
    e2eSpecId: 'workout-fuel-flow',
    feature: 'cierre mega global déficit + trainingPolishMegaGlobalSuite',
  },
  {
    polishOleada: 436,
    e2eSpecId: 'workout-flow',
    feature: 'tono PR×chip sesión gym-log + gymLogSessionPrToneDisplay',
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