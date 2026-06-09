import { describe, expect, it } from 'vitest'
import {
  buildFuelProfileFromWizard,
  defaultWizardAnswers,
  inferActivityFromTraining,
  inferGoalFromProfile,
} from './fuelWizardDefaults'

describe('fuelWizardDefaults (fase 92)', () => {
  it('infers activity from weekly training count', () => {
    expect(inferActivityFromTraining(0)).toBe('light')
    expect(inferActivityFromTraining(3)).toBe('moderate')
    expect(inferActivityFromTraining(5)).toBe('very_active')
  })

  it('infers goal from profile goals text', () => {
    expect(inferGoalFromProfile(['Perder grasa'])).toBe('lose')
    expect(inferGoalFromProfile(['Ganar músculo'])).toBe('muscle')
  })

  it('builds a full fuel profile from 3 wizard answers', () => {
    const answers = defaultWizardAnswers({ age: 30, gender: 'hombre', weekTrainedCount: 4 })
    const profile = buildFuelProfileFromWizard(answers, { age: 30, gender: 'hombre' })
    expect(profile.weightKg).toBe(75)
    expect(profile.targetKcal).toBeGreaterThan(1200)
    expect(profile.tdee).toBeGreaterThan(1200)
  })
})
