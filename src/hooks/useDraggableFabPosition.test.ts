import { describe, expect, it } from 'vitest'
import { measureSafeAreaInsets } from './useDraggableFabPosition'

describe('useDraggableFabPosition safe area', () => {
  it('measureSafeAreaInsets returns stable numeric insets', () => {
    const first = measureSafeAreaInsets()
    const second = measureSafeAreaInsets()
    expect(typeof first.top).toBe('number')
    expect(typeof first.bottom).toBe('number')
    expect(second).toEqual(first)
  })
})
