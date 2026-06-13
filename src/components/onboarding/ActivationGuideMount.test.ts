import { describe, expect, it } from 'vitest'
import { buildDiscoveryCityQueryTerms } from '../../services/profileDiscoveryQuery'

describe('ActivationGuideMount', () => {
  it('registry includes activationGuide overlay id', async () => {
    const { APP_GLOBAL_OVERLAY_IDS } = await import('../../utils/appOverlayRegistry')
    expect(APP_GLOBAL_OVERLAY_IDS).toContain('activationGuide')
  })

  it('multi-country discovery terms include canonical labels', () => {
    expect(buildDiscoveryCityQueryTerms('Monterrey')).toContain('Monterrey')
    expect(buildDiscoveryCityQueryTerms('Los Ángeles')).toContain('Los Ángeles')
  })
})
