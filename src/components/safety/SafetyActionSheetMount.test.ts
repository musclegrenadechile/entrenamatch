import { describe, expect, it } from 'vitest'

describe('SafetyActionSheetMount', () => {
  it('registry includes safetyActionSheet overlay id', async () => {
    const { APP_GLOBAL_OVERLAY_IDS } = await import('../../utils/appOverlayRegistry')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('safetyActionSheet')
  })
})
