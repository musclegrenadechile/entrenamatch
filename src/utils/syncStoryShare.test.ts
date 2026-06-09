import { describe, expect, it } from 'vitest'
import { buildSyncPostText, SYNC_STORY_APP_URL } from './syncStoryShare'

describe('syncStoryShare', () => {
  it('buildSyncPostText includes brand URL and hashtags', () => {
    const text = buildSyncPostText({
      selfName: 'Cote Test',
      partnerName: 'Muscle User',
      minutes: 47,
      vibe: 82,
    })
    expect(text).toContain('ENTRENASYNC')
    expect(text).toContain(SYNC_STORY_APP_URL)
    expect(text).toContain('#EntrenaMatch')
    expect(text).toContain('Cote')
    expect(text).toContain('Muscle')
  })
})
