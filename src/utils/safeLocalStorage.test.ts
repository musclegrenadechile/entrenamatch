import { describe, expect, it } from 'vitest'
import {
  pruneIdArray,
  pruneSeenIdMap,
  pruneStringIdList,
  trimSetToMax,
} from './safeLocalStorage'

describe('safeLocalStorage pruning', () => {
  it('pruneIdArray keeps the most recent ids', () => {
    const ids = Array.from({ length: 100 }, (_, i) => `m${i}`)
    expect(pruneIdArray(ids, 80)).toEqual(ids.slice(-80))
  })

  it('pruneSeenIdMap caps per-thread and thread count', () => {
    const raw: Record<string, string[]> = {}
    for (let t = 0; t < 50; t++) {
      raw[`chat${t}`] = Array.from({ length: 120 }, (_, i) => `id-${t}-${i}`)
    }
    const pruned = pruneSeenIdMap(raw, 80, 40)
    expect(Object.keys(pruned).length).toBe(40)
    expect(pruned.chat49.length).toBe(80)
    expect(pruned.chat49[0]).toBe('id-49-40')
  })

  it('pruneStringIdList caps flat id lists', () => {
    const ids = Array.from({ length: 400 }, (_, i) => `u${i}`)
    expect(pruneStringIdList(ids, 300)).toEqual(ids.slice(-300))
  })

  it('trimSetToMax drops oldest entries', () => {
    const set = new Set(['a', 'b', 'c', 'd', 'e'])
    trimSetToMax(set, 3)
    expect(Array.from(set)).toEqual(['c', 'd', 'e'])
  })
})
