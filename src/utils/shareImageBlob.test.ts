import { afterEach, describe, expect, it, vi } from 'vitest'
import { sharePngBlob } from './shareImageBlob'

describe('sharePngBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('uses Web Share API with files when available', async () => {
    const blob = new Blob(['png'], { type: 'image/png' })
    const share = vi.fn().mockResolvedValue(undefined)
    const click = vi.fn()

    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    })
    vi.stubGlobal('document', {
      createElement: () => ({ click }),
    })

    const outcome = await sharePngBlob(blob, 'story.png', { title: 'Derby' })

    expect(outcome).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
    expect(click).not.toHaveBeenCalled()
  })

  it('falls back to download when share is unavailable', async () => {
    const blob = new Blob(['png'], { type: 'image/png' })
    const click = vi.fn()

    vi.stubGlobal('navigator', {})
    vi.stubGlobal('document', {
      createElement: () => ({ click }),
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const outcome = await sharePngBlob(blob, 'story.png')

    expect(outcome).toBe('downloaded')
    expect(click).toHaveBeenCalledOnce()
  })
})
