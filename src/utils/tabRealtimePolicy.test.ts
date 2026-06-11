import { describe, expect, it } from 'vitest'
import {
  shouldRunBackgroundProfilePoll,
  shouldRunCityEngagementListeners,
  shouldRunLiveListeners,
  shouldRunOwnProfileListener,
  shouldRunProfilesListener,
  shouldRunSquadsListener,
  shouldRunIncomingLikesListener,
} from './tabRealtimePolicy'

describe('tabRealtimePolicy', () => {
  it('pauses profiles when app hidden or on profile tab', () => {
    expect(shouldRunProfilesListener('explore', true)).toBe(true)
    expect(shouldRunProfilesListener('profile', true)).toBe(false)
    expect(shouldRunProfilesListener('home', false)).toBe(false)
  })

  it('runs live listeners on map/home/explore or when live', () => {
    expect(shouldRunLiveListeners('red', false, false, true)).toBe(false)
    expect(shouldRunLiveListeners('map', false, false, true)).toBe(true)
    expect(shouldRunLiveListeners('profile', false, true, true)).toBe(true)
  })

  it('scopes city and squads listeners', () => {
    expect(shouldRunCityEngagementListeners('home', true)).toBe(true)
    expect(shouldRunCityEngagementListeners('map', true)).toBe(false)
    expect(shouldRunSquadsListener('squads', true)).toBe(true)
    expect(shouldRunSquadsListener('home', true)).toBe(false)
  })

  it('polls profiles only on explore when visible', () => {
    expect(shouldRunBackgroundProfilePoll('explore', false, true)).toBe(true)
    expect(shouldRunBackgroundProfilePoll('home', false, true)).toBe(false)
    expect(shouldRunBackgroundProfilePoll('explore', true, true)).toBe(false)
  })

  it('gates incoming likes to explore and matches', () => {
    expect(shouldRunIncomingLikesListener('explore', true)).toBe(true)
    expect(shouldRunIncomingLikesListener('profile', true)).toBe(false)
  })

  it('keeps own profile listener when training or on home/map', () => {
    expect(shouldRunOwnProfileListener('profile', true, true)).toBe(true)
    expect(shouldRunOwnProfileListener('map', false, true)).toBe(true)
    expect(shouldRunOwnProfileListener('red', false, true)).toBe(false)
  })
})
