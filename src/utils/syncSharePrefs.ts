/** Local preference — skip auto/offered post-sync feed publish (device-level). */

const KEY = 'entrenamatch_sync_share_opt_out'

export function getSyncShareOptOut(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setSyncShareOptOut(optOut: boolean): void {
  try {
    if (optOut) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
