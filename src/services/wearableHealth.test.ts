import { describe, expect, it } from 'vitest'
import { wearableAuthReadTypes } from './wearableHealth'
import { wearableConnectedFromAuth } from '../utils/wearableDayMetrics'

describe('wearableHealth', () => {
  it('requests iOS-specific exerciseTime scope', () => {
    expect(wearableAuthReadTypes('ios')).toContain('exerciseTime')
    expect(wearableAuthReadTypes('ios')).toContain('calories')
  })

  it('omits exerciseTime on Android Health Connect', () => {
    const android = wearableAuthReadTypes('android')
    expect(android).toContain('calories')
    expect(android).toContain('steps')
    expect(android).not.toContain('exerciseTime')
  })

  it('treats calories or workouts auth as connected', () => {
    expect(wearableConnectedFromAuth({ readAuthorized: ['calories'] }, 'android')).toBe(true)
    expect(wearableConnectedFromAuth({ readAuthorized: ['workouts'] }, 'android')).toBe(true)
    expect(wearableConnectedFromAuth({ readAuthorized: ['exerciseTime'] }, 'ios')).toBe(true)
    expect(wearableConnectedFromAuth({ readAuthorized: [] }, 'android')).toBe(false)
  })
})
