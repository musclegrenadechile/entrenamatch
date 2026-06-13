/**
 * Access Capacitor native plugins loaded via capacitor-plugins.ts (CAPACITOR builds only).
 * Avoids runtime dynamic imports of bare `@capacitor/*` specifiers in the WebView bundle.
 */

import { loadCapacitorPlugins } from '@capacitor-plugins-loader'
import { withTimeout } from './withTimeout'

type PluginBag = Record<string, unknown>

function pluginBag(): PluginBag | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { __CAPACITOR_PLUGINS__?: PluginBag }).__CAPACITOR_PLUGINS__
}

const PLUGIN_LOAD_TIMEOUT_MS = 5_000

export async function ensureCapacitorPlugins(): Promise<void> {
  if (pluginBag()?.App && pluginBag()?.Health) return
  await withTimeout(loadCapacitorPlugins(), PLUGIN_LOAD_TIMEOUT_MS, 'capacitor plugins load')
}

/** Ensures @capgo/capacitor-health is loaded before wearable import/connect. */
export async function ensureHealthPluginReady(): Promise<void> {
  if (getCapacitorHealth()) return
  await ensureCapacitorPlugins()
  if (!getCapacitorHealth()) {
    throw new Error('Plugin de salud no cargado. Cierra y abre EntrenaMatch.')
  }
}

type PluginListener = { remove: () => void }

export function getCapacitorBrowser(): {
  open: (opts: { url: string; presentationStyle?: string }) => Promise<void>
  close: () => Promise<void>
  addListener: (event: string, cb: () => void) => Promise<PluginListener>
} | null {
  const Browser = pluginBag()?.Browser
  if (!Browser || typeof Browser !== 'object') return null
  const b = Browser as { open?: unknown; close?: unknown; addListener?: unknown }
  if (typeof b.open !== 'function' || typeof b.close !== 'function') return null
  return Browser as {
    open: (opts: { url: string; presentationStyle?: string }) => Promise<void>
    close: () => Promise<void>
    addListener: (event: string, cb: () => void) => Promise<PluginListener>
  }
}

export function getCapacitorHealth(): {
  isAvailable: () => Promise<{ available: boolean; reason?: string; platform?: string }>
  requestAuthorization: (opts: {
    read?: string[]
    write?: string[]
  }) => Promise<{ readAuthorized: string[]; readDenied: string[] }>
  checkAuthorization: (opts: {
    read?: string[]
    write?: string[]
  }) => Promise<{ readAuthorized: string[]; readDenied: string[] }>
  readSamples: (opts: Record<string, unknown>) => Promise<{
    samples: Array<{ value: number; startDate?: string }>
  }>
  queryAggregated: (opts: Record<string, unknown>) => Promise<{ samples: Array<{ value: number; unit?: string }> }>
  queryWorkouts: (opts: Record<string, unknown>) => Promise<{
    workouts: Array<{ sourceName?: string }>
  }>
  showPrivacyPolicy: () => Promise<void>
  openHealthConnectSettings: () => Promise<void>
} | null {
  const Health = pluginBag()?.Health
  if (!Health || typeof Health !== 'object') return null
  const h = Health as {
    isAvailable?: unknown
    requestAuthorization?: unknown
    checkAuthorization?: unknown
    readSamples?: unknown
    queryAggregated?: unknown
    queryWorkouts?: unknown
  }
  if (
    typeof h.isAvailable !== 'function' ||
    typeof h.requestAuthorization !== 'function' ||
    typeof h.checkAuthorization !== 'function' ||
    typeof h.readSamples !== 'function' ||
    typeof h.queryAggregated !== 'function' ||
    typeof h.queryWorkouts !== 'function'
  ) {
    return null
  }
  return Health as ReturnType<typeof getCapacitorHealth>
}

export type WearableDayProbeResult = {
  steps: number
  activeCaloriesKcal: number
  exerciseMinutes: number
  workoutCount: number
  sources: string[]
  exerciseError?: string
  stepsError?: string
  caloriesError?: string
}

export function getEntrenamatchHealth(): {
  hasGrantedHealthPermissions: () => Promise<{
    granted: boolean
    canReadActivity?: boolean
    steps?: boolean
    exercise?: boolean
    calories?: boolean
    totalCalories?: boolean
    heartRate?: boolean
  }>
  probeWearableDay: (opts: {
    startDate: string
    endDate: string
  }) => Promise<WearableDayProbeResult>
  openHealthConnectSettings: () => Promise<void>
  openAppHealthPermissions: () => Promise<void>
} | null {
  const plugin = pluginBag()?.EntrenamatchHealth
  if (!plugin || typeof plugin !== 'object') return null
  const p = plugin as {
    hasGrantedHealthPermissions?: unknown
    probeWearableDay?: unknown
    openHealthConnectSettings?: unknown
    openAppHealthPermissions?: unknown
  }
  if (
    typeof p.hasGrantedHealthPermissions !== 'function' ||
    typeof p.probeWearableDay !== 'function' ||
    typeof p.openHealthConnectSettings !== 'function' ||
    typeof p.openAppHealthPermissions !== 'function'
  ) {
    return null
  }
  return plugin as ReturnType<typeof getEntrenamatchHealth>
}

export function getCapacitorApp(): {
  addListener: (
    event: string,
    cb: (data: { url?: string; isActive?: boolean }) => void
  ) => Promise<PluginListener>
  getLaunchUrl: () => Promise<{ url: string } | undefined>
  exitApp: () => Promise<void>
} | null {
  const App = pluginBag()?.App
  if (!App || typeof App !== 'object') return null
  const a = App as { addListener?: unknown; getLaunchUrl?: unknown; exitApp?: unknown }
  if (typeof a.addListener !== 'function') return null
  return App as {
    addListener: (
      event: string,
      cb: (data: { url?: string; isActive?: boolean }) => void
    ) => Promise<PluginListener>
    getLaunchUrl: () => Promise<{ url: string } | undefined>
    exitApp: () => Promise<void>
  }
}
