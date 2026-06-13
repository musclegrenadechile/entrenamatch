import { describe, expect, it, beforeEach, vi } from 'vitest'
import { demoStorage, DEMO_KEYS } from '../services/demoStorage'
import { clearCachedProfile, profileCacheKey, readCachedProfile, writeCachedProfile } from './profileLocalCache'

const store = new Map<string, string>()

vi.stubGlobal('localStorage', {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value)
  },
  removeItem: (key: string) => {
    store.delete(key)
  },
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() {
    return store.size
  },
})

describe('profileLocalCache', () => {
  beforeEach(() => {
    store.clear()
    clearCachedProfile('uid-a')
    clearCachedProfile('uid-b')
    demoStorage.remove(DEMO_KEYS.PROFILE)
  })

  it('stores profile per uid', () => {
    writeCachedProfile('uid-a', { id: 'me', name: 'Ana' } as any)
    writeCachedProfile('uid-b', { id: 'me', name: 'Luis' } as any)
    expect(readCachedProfile('uid-a')?.name).toBe('Ana')
    expect(readCachedProfile('uid-b')?.name).toBe('Luis')
    expect(demoStorage.get(DEMO_KEYS.PROFILE)).toBeNull()
  })

  it('clears scoped cache', () => {
    writeCachedProfile('uid-a', { id: 'me', name: 'Ana' } as any)
    clearCachedProfile('uid-a')
    expect(demoStorage.get(profileCacheKey('uid-a'))).toBeNull()
  })
})
