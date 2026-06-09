import { describe, expect, it } from 'vitest'
import { isStaleChunkError } from './chunkReload'

describe('chunkReload', () => {
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
})
