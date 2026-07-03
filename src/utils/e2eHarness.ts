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
