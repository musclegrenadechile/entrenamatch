/** Playwright harness — active when `?e2e=1` is in the URL. */

import type { FuelLogPrefillMacros } from './fuelLogPrefill'
import type { WorkoutExercise } from '../types'

export type EntrenamatchE2EApi = {
  enableLive: () => Promise<void>
  startMockSync: (partnerId: string, partnerName: string) => Promise<void>
  isArenaOpen: () => boolean
  openMapTab: () => void
  /** Abre gym-log con prefill mínimo para E2E. */
  openWorkoutModal: (opts?: { exercises?: WorkoutExercise[] }) => void
  isWorkoutModalOpen: () => boolean
  /** Texto chip sesión gym-log (oleada 436). */
  getGymLogSessionChipText: () => string | null
  getGymLogSessionChipAriaLabel: () => string | null
  /** Modificador tono PR en chip sesión (oleada 436). */
  getGymLogSessionChipToneClass: () => string | null
  isGymLogSessionPrToneAriaExpected: () => boolean
  /** Texto chip sesión FAB minimizado (oleada 437). */
  getGymLogFabSessionChipText: () => string | null
  getGymLogFabSessionChipAriaLabel: () => string | null
  /** Modificador tono PR en chip sesión FAB (oleada 437). */
  getGymLogFabSessionChipToneClass: () => string | null
  isGymLogFabSessionPrToneAriaExpected: () => boolean
  /** Simula reseña post-entreno con un partner seed. */
  openReviewModal: (partnerId?: string) => void
  isReviewModalOpen: () => boolean
  /** Cierra/minimiza la Sala Sync sin terminar la sesión mock. */
  closeArena: () => void
  goToHomeTab: () => void
  isWorkoutSaveBannerVisible: () => boolean
  /** Resumen compacto de sesión en banner post-guardar (oleada 391). */
  getWorkoutSaveBannerSessionSummary: () => string | null
  /** Hint Fuel sugerido en banner post-guardar (oleada 392). */
  getWorkoutSaveBannerFuelHint: () => string | null
  /** Abre Fuel log con prefill del banner post-guardar (si está activo). */
  openFuelFromWorkoutSave: () => void
  /** Macros sugeridos del prefill Fuel activo (oleada 394). */
  getFuelLogPrefillMacros: () => FuelLogPrefillMacros | null
  isFuelLogModalOpen: () => boolean
  closeFuelLogModal: () => void
  /** Minimiza gym-log dejando borrador activo (FAB). */
  minimizeWorkoutModal: () => void
  isWorkoutFabVisible: () => boolean
  /** Reabre gym-log desde borrador (sin prefill E2E). */
  resumeWorkoutModal: () => void
  /** Navega a Perfil (oleada 400). */
  goToProfileTab: () => void
  /** Sembra historial demo en Perfil para E2E historial. */
  seedDemoWorkoutHistory: () => void
  getWorkoutHistorySectionKicker: () => string | null
  getWorkoutHistoryRowSummaries: () => string[]
  countWorkoutHistoryPrBadges: () => number
  getWorkoutHistorySparklineAriaLabels: () => string[]
  /** Activa Fuel demo para mostrar EntrenaPlan en E2E (oleada 402). */
  seedDemoFuelProfile: () => void
  getWeeklyPlanHistoryHint: () => string | null
  getWeeklyPlanDetail: () => string | null
  /** Chip rotación PR visible en card (oleada 407). */
  getWeeklyPlanRotationChip: () => string | null
  /** aria-label del chip rotación (oleada 408). */
  getWeeklyPlanRotationAriaLabel: () => string | null
  /** Hint semanal Fuel×EntrenaPlan (oleada 412). */
  getWeeklyPlanFuelWeekHint: () => string | null
  /** aria-label del hint Fuel semanal (oleada 412). */
  getWeeklyPlanFuelWeekAriaLabel: () => string | null
  /** Modificador de tono del hint Fuel semanal (oleada 412). */
  getWeeklyPlanFuelWeekToneClass: () => string | null
  /** Chip Δ kcal semanal en superávit/déficit (oleada 413). */
  getWeeklyPlanFuelWeekChip: () => string | null
  /** Chip escenario Fuel junto al headline (oleada 418). */
  getWeeklyPlanFuelHeadlineChip: () => string | null
  /** aria-label del chip headline Fuel (oleada 418). */
  getWeeklyPlanFuelHeadlineChipAriaLabel: () => string | null
  /** Modificador de tono del chip headline Fuel (oleada 419). */
  getWeeklyPlanFuelHeadlineChipToneClass: () => string | null
  /** Clase borde escenario Fuel en card EntrenaPlan (oleada 421). */
  getWeeklyPlanScenarioClass: () => string | null
  /** Modificador de tono de la fila Fuel×entreno (oleada 422). */
  getWeeklyPlanFuelRowToneClass: () => string | null
  /** Snapshot de tonos Fuel en card (oleada 423). */
  getWeeklyPlanFuelToneStack: () => {
    border: string | null
    hint: string | null
    headline: string | null
    row: string | null
    chip: string | null
  }
  /** Stack tono Fuel alineado en todas las capas (oleada 423). */
  isWeeklyPlanFuelToneStackAligned: () => boolean
  /** Stack tono Fuel coincide con escenario esperado (oleada 424). */
  isWeeklyPlanFuelToneStackExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** Stack DOM coincide capa a capa con demo E2E (oleada 425). */
  isWeeklyPlanFuelToneStackFullyExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** Nota nutricional Fuel×plan en card (oleada 415). */
  getWeeklyPlanNutritionNote: () => string | null
  /** Modificador de tono nota nutricional (oleada 424). */
  getWeeklyPlanNutritionToneClass: () => string | null
  /** aria-label fila Fuel×entreno (oleada 426). */
  getWeeklyPlanFuelRowAriaLabel: () => string | null
  /** aria-labels del stack Fuel alineados al tono (oleada 426). */
  isWeeklyPlanFuelToneAriaAligned: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** aria-label nota nutricional (oleada 416). */
  getWeeklyPlanNutritionAriaLabel: () => string | null
  /** Sembra macros Fuel semanales demo para E2E (oleada 413). */
  seedDemoFuelWeekLogs: (scenario?: 'under-fueled' | 'surplus' | 'deficit') => void
  isWeeklyPlanCardVisible: () => boolean
  /** aria-label card EntrenaPlan con tono Fuel (oleada 427). */
  getWeeklyPlanCardAriaLabel: () => string | null
  isWeeklyPlanFuelCardToneAriaExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** Card + stack visual + aria sincronizados al tono (oleada 428). */
  isWeeklyPlanFuelToneStackFullySynced: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** aria-label hint PR EntrenaPlan (oleada 430). */
  getWeeklyPlanHistoryAriaLabel: () => string | null
  /** Modificador tono Fuel en hint historial (oleada 430). */
  getWeeklyPlanHistoryToneClass: () => string | null
  isWeeklyPlanHistoryFuelToneAriaExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** Modificador tono Fuel en chip rotación (oleada 431). */
  getWeeklyPlanRotationToneClass: () => string | null
  isWeeklyPlanRotationFuelToneAriaExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
  /** Texto footer energía semanal EntrenaPlan (oleada 433). */
  getWeeklyPlanEnergySummaryText: () => string | null
  getWeeklyPlanEnergySummaryAriaLabel: () => string | null
  /** Modificador tono Fuel en footer energía (oleada 433). */
  getWeeklyPlanEnergySummaryToneClass: () => string | null
  isWeeklyPlanEnergySummaryFuelToneAriaExpected: (
    tone: 'under-fueled' | 'surplus' | 'deficit'
  ) => boolean
}

declare global {
  interface Window {
    __entrenamatchE2E?: EntrenamatchE2EApi
  }
}

const E2E_SESSION_KEY = 'entrenamatch_e2e'

export function isE2EHarnessActive(search?: string): boolean {
  const resolvedSearch =
    search !== undefined
      ? search
      : typeof window !== 'undefined'
        ? window.location.search
        : ''
  const fromQuery = new URLSearchParams(resolvedSearch).get('e2e') === '1'
  if (fromQuery) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(E2E_SESSION_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    return true
  }
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(E2E_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function installE2EHarness(api: EntrenamatchE2EApi): void {
  if (!isE2EHarnessActive()) return
  window.__entrenamatchE2E = api
}
