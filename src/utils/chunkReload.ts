/** Session flag to avoid infinite reload loops after a deploy. */
export const CHUNK_RELOAD_KEY = 'em-chunk-reload-attempt'

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
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return false
    }
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  } catch {
    /* private mode / quota */
  }
  window.location.reload()
  return true
}

export function clearChunkReloadFlag(): void {
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch {
    /* ignore */
  }
}

/** Vite + dynamic import failures after deploy → auto-reload. */
export function installChunkReloadHandlers(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    reloadForNewBuild()
  })
}
