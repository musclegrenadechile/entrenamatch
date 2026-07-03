import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  REST_PRESET_KEY,
  isValidRestPreset,
  loadDefaultRestPreset,
  saveDefaultRestPreset,
} from './gymRestPreset'

describe('gymRestPreset', () => {
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

  it('defaults to 90s when unset', () => {
    expect(loadDefaultRestPreset()).toBe(90)
  })

  it('loads saved preset', () => {
    localStorage.setItem(REST_PRESET_KEY, '120')
    expect(loadDefaultRestPreset()).toBe(120)
  })

  it('falls back to 90 for invalid stored value', () => {
    localStorage.setItem(REST_PRESET_KEY, '37')
    expect(loadDefaultRestPreset()).toBe(90)
  })

  it('validates preset whitelist', () => {
    expect(isValidRestPreset(60)).toBe(true)
    expect(isValidRestPreset(99)).toBe(false)
  })

  it('persists only valid presets', () => {
    saveDefaultRestPreset(45)
    expect(localStorage.getItem(REST_PRESET_KEY)).toBe('45')
    saveDefaultRestPreset(200)
    expect(localStorage.getItem(REST_PRESET_KEY)).toBe('45')
  })
})