/** Session flag to avoid infinite reload loops after a deploy. */
export const CHUNK_RELOAD_KEY = 'em-chunk-reload-attempt'

/** In-memory latch when WebView storage is unavailable (Capacitor cold start). */
let memoryReloadLatch = false

function isNativeCapacitor(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !!cap?.isNativePlatform?.()
}

/** APK/AAB ships all assets locally — auto-reload on "stale chunk" causes infinite boot loops. */
export function shouldAutoReloadForChunks(): boolean {
  return !isNativeCapacitor()
}

function hasReloadLatch(): boolean {
  if (memoryReloadLatch) return true
  try {
    return (
      !!sessionStorage.getItem(CHUNK_RELOAD_KEY) || !!localStorage.getItem(CHUNK_RELOAD_KEY)
    )
  } catch {
    return memoryReloadLatch
  }
}

function setReloadLatch(): void {
  memoryReloadLatch = true
  try {
    const stamp = String(Date.now())
    sessionStorage.setItem(CHUNK_RELOAD_KEY, stamp)
    localStorage.setItem(CHUNK_RELOAD_KEY, stamp)
  } catch {
    /* private mode / quota — memory latch still protects */
  }
}

/** True when the browser has an old bundle and the new deploy removed hashed chunks. */
export function isStaleChunkError(reason: unknown): boolean {
  const msg = reason instanceof Error ? reason.message : String(reason ?? '')
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Unable to preload CSS/i.test(msg)
  )
}

/** Hard reload once so the client picks up the latest index.html + chunk hashes. */
export function reloadForNewBuild(): boolean {
  if (!shouldAutoReloadForChunks()) {
    console.warn('[chunkReload] Skipping auto-reload on native Capacitor build')
    return false
  }
  if (hasReloadLatch()) {
    return false
  }
  setReloadLatch()
  window.location.reload()
  return true
}

export function clearChunkReloadFlag(): void {
  memoryReloadLatch = false
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    localStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch {
    /* ignore */
  }
}

/** Vite + dynamic import failures after deploy → auto-reload (web only). */
export function installChunkReloadHandlers(): void {
  if (!shouldAutoReloadForChunks()) return
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    reloadForNewBuild()
  })
}
