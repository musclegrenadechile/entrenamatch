import { describe, expect, it } from 'vitest'

describe('oleada H mounts — registry', () => {
  it('includes legal, report, verification, moderation, trainingReview overlays', async () => {
    const { APP_GLOBAL_OVERLAY_IDS } = await import('../../utils/appOverlayRegistry')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('legalPages')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('reportModal')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('verificationFlow')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('moderationPanel')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('trainingReview')
  })
})
