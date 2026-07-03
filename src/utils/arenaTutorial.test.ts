import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hasSeenArenaSyncTutorial, markArenaSyncTutorialSeen } from './arenaTutorial'

describe('arenaTutorial', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k])
      },
    })
  })

  it('starts unseen', () => {
    expect(hasSeenArenaSyncTutorial()).toBe(false)
  })

  it('marks seen after dismiss', () => {
    markArenaSyncTutorialSeen()
    expect(hasSeenArenaSyncTutorial()).toBe(true)
  })
})