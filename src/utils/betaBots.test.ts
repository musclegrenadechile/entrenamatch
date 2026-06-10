import { describe, expect, it } from 'vitest'
import { isBetaBotId, isBetaBotProfile, BETA_BOT_BADGE_LABEL } from './betaBots'

describe('betaBots', () => {
  it('detects beta bot uids', () => {
    expect(isBetaBotId('beta_bot_01')).toBe(true)
    expect(isBetaBotId('p1')).toBe(false)
    expect(isBetaBotId(null)).toBe(false)
  })

  it('detects beta bot profiles', () => {
    expect(isBetaBotProfile({ id: 'beta_bot_03', isBetaBot: true })).toBe(true)
    expect(isBetaBotProfile({ id: 'u_real' })).toBe(false)
  })

  it('exports badge label', () => {
    expect(BETA_BOT_BADGE_LABEL).toContain('Beta')
  })
})
