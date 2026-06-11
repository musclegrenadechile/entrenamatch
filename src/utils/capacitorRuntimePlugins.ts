/**
 * Access Capacitor native plugins loaded via capacitor-plugins.ts (CAPACITOR builds only).
 * Avoids runtime dynamic imports of bare `@capacitor/*` specifiers in the WebView bundle.
 */

import { loadCapacitorPlugins } from '@capacitor-plugins-loader'

type PluginBag = Record<string, unknown>

function pluginBag(): PluginBag | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { __CAPACITOR_PLUGINS__?: PluginBag }).__CAPACITOR_PLUGINS__
}

export async function ensureCapacitorPlugins(): Promise<void> {
  if (pluginBag()?.App) return
  await loadCapacitorPlugins()
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
  queryAggregated: (opts: Record<string, unknown>) => Promise<{ samples: Array<{ value: number; unit?: string }> }>
  queryWorkouts: (opts: Record<string, unknown>) => Promise<{
    workouts: Array<{ sourceName?: string }>
  }>
  showPrivacyPolicy: () => Promise<void>
  openHealthConnectSettings: () => Promise<void>
} | null {
  const Health = pluginBag()?.Health
  if (!Health || typeof Health !== 'object') return null
  const h = Health as { isAvailable?: unknown; requestAuthorization?: unknown }
  if (typeof h.isAvailable !== 'function' || typeof h.requestAuthorization !== 'function') {
    return null
  }
  return Health as ReturnType<typeof getCapacitorHealth>
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
