import { describe, expect, it } from 'vitest'
import { OperationTimeoutError, withTimeout } from './withTimeout'

describe('withTimeout', () => {
  it('resolves when promise finishes in time', async () => {
    await expect(withTimeout(Promise.resolve(42), 500, 'timeout')).resolves.toBe(42)
  })

  it('rejects on timeout', async () => {
    await expect(
      withTimeout(new Promise<number>(() => {}), 30, 'too slow')
    ).rejects.toBeInstanceOf(OperationTimeoutError)
  })
})
