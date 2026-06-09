import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CHUNK_RELOAD_KEY,
  clearChunkReloadFlag,
  isStaleChunkError,
  reloadForNewBuild,
} from './chunkReload'

describe('chunkReload', () => {
  afterEach(() => {
    clearChunkReloadFlag()
    vi.unstubAllGlobals()
  })

  it('detects stale dynamic import errors', () => {
    expect(
      isStaleChunkError(
        new Error(
          'Failed to fetch dynamically imported module: https://example.com/assets/Matches-abc.js'
        )
      )
    ).toBe(true)
    expect(isStaleChunkError(new Error('Loading chunk 12 failed'))).toBe(true)
    expect(isStaleChunkError(new Error('Network timeout'))).toBe(false)
  })

  it('reloads only once per session (does not clear latch on second call)', () => {
    const reload = vi.fn()
    const storage: Record<string, string> = {}
    const makeStore = () => ({
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => {
        storage[k] = v
      },
      removeItem: (k: string) => {
        delete storage[k]
      },
    })
    vi.stubGlobal('sessionStorage', makeStore())
    vi.stubGlobal('localStorage', makeStore())
    vi.stubGlobal('window', {
      location: { reload },
      Capacitor: { isNativePlatform: () => false },
    })

    expect(reloadForNewBuild()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(storage[CHUNK_RELOAD_KEY]).toBeTruthy()

    expect(reloadForNewBuild()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
