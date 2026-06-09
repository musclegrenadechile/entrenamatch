import { afterEach, describe, expect, it, vi } from 'vitest'
import { recommendNextSessions } from '../domain/weeklyPlan/recommendNextSessions'
import { shareWeeklyPlanExternally } from './weeklyPlanShare'

const plan = recommendNextSessions({
  profile: { goal: 'maintain', weightKg: 72, level: 'Intermedio', targetKcal: 2200 },
  energy: {
    weekKey: '2026-W23',
    loggedDays: 3,
    totalConsumedKcal: 6000,
    totalBurnKcal: 1200,
    totalTargetKcal: 6600,
    weeklyDeltaKcal: -200,
    avgDailyDeltaKcal: -66,
  },
  load: {
    sessionsCount: 2,
    activeDays: 2,
    daysSinceLastSession: 1,
    lastWorkoutType: 'push',
    fatiguedMuscleGroups: [],
    suggestedWorkoutType: 'pull',
  },
})

describe('shareWeeklyPlanExternally', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })

    const outcome = await shareWeeklyPlanExternally(plan, {
      userName: 'Jorge',
      inviteUrl: 'https://app.test/?ref=u1',
    })

    expect(outcome).toBe('shared')
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'EntrenaPlan · EntrenaMatch',
        url: 'https://app.test/?ref=u1',
        text: expect.stringContaining('Jorge comparte su plan'),
      })
    )
  })

  it('copies to clipboard when share API is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const outcome = await shareWeeklyPlanExternally(plan, { userName: 'Ana' })

    expect(outcome).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Ana comparte su plan'))
  })
})
