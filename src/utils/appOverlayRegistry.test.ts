import { describe, expect, it } from 'vitest'
import { APP_GLOBAL_OVERLAY_IDS, countAppOverlays } from './appOverlayRegistry'

describe('appOverlayRegistry', () => {
  it('lists 12 global overlay ids including marketplace and trainerCoach', () => {
    expect(countAppOverlays()).toBe(14)
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('marketplace')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('trainerCoach')
  })
})
