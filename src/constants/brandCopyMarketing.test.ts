import { describe, expect, it } from 'vitest'
import { BRAND_COPY } from './brandCopy'
import { generateDailyChallenge } from '../utils/dailyPulseCore'
import { buildWorkoutStoryPostText } from '../utils/workoutStoryShare'
import { buildSyncPostText } from '../utils/syncStoryShare'

describe('marketing copy — oleada 511+ (GTM piloto)', () => {
  it('BRAND_COPY hero and pilot geo focus costa central', () => {
    expect(BRAND_COPY.heroLine).toMatch(/LIVE/i)
    expect(BRAND_COPY.pilotGeo.focusLabel).toMatch(/Viña/i)
    expect(BRAND_COPY.pilotGeo.focusBadge).toMatch(/costa central/i)
    expect(BRAND_COPY.pitchShort).toMatch(/conecta/i)
    expect(BRAND_COPY.pitchShort).not.toMatch(/haz match/i)
  })

  it('activation guide prioritizes LIVE and pilot cities', () => {
    expect(BRAND_COPY.activation.subtitle).toMatch(/Viña.*Valparaíso.*Concón/i)
    expect(BRAND_COPY.activation.subtitle).toMatch(/activa LIVE/i)
  })
})

describe('marketing copy — oleada 501–510', () => {
  it('BRAND_COPY meta and manifest mention pilot + multi-país', () => {
    expect(BRAND_COPY.metaDescription).toMatch(/Viña.*Valparaíso.*Concón/i)
    expect(BRAND_COPY.metaDescription).toMatch(/multi-país/i)
    expect(BRAND_COPY.manifestDescription).toMatch(/costa central Chile/i)
    expect(BRAND_COPY.manifestDescription).not.toMatch(/Piloto Chile/i)
  })

  it('activation guide mentions multi-país beta', () => {
    expect(BRAND_COPY.activation.subtitle).toMatch(/Chile.*Perú.*México.*USA/)
  })

  it('daily challenges use Reto Comunidad, not GymPulse', () => {
    const ch = generateDailyChallenge({ id: 'u1' }, {}, [], 0)
    expect(ch.title).toMatch(/Reto Comunidad/i)
    expect(ch.title).not.toMatch(/GymPulse/i)
    expect(ch.description).not.toMatch(/GymPulse/i)
  })

  it('workout story share uses MapaLIVE hashtag, not GymPulse', () => {
    const text = buildWorkoutStoryPostText({
      userName: 'Test',
      userId: 'id-1',
      preview: {
        title: 'Leg day',
        type: 'strength',
        exerciseCount: 3,
        totalSets: 9,
        volumeLabel: '2k kg',
        durationMin: 40,
        prCount: 0,
        exercises: [],
      },
    })
    expect(text).toContain('#MapaLIVE')
    expect(text).not.toContain('GymPulse')
  })

  it('sync story share uses MapaLIVE hashtag, not GymPulse', () => {
    const text = buildSyncPostText({
      selfName: 'Ana Test',
      partnerName: 'Luis Test',
      minutes: 45,
      vibe: 92,
    })
    expect(text).toContain('#MapaLIVE')
    expect(text).not.toContain('GymPulse')
  })
})
