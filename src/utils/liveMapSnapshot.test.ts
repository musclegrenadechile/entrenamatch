import { describe, expect, it } from 'vitest'
import { liveUsersSnapshotSignature, partnerLocationsSignature } from './liveMapSnapshot'

describe('liveMapSnapshot signatures', () => {
  it('is stable for identical live users', () => {
    const users = [
      { id: 'a', trainingNow: true, lat: -33.01, lng: -71.55, trainingNowSince: 100 },
      { id: 'b', trainingNow: false, lat: -33.02, lng: -71.56 },
    ]
    expect(liveUsersSnapshotSignature(users)).toBe(liveUsersSnapshotSignature(users))
  })

  it('changes when live motion updates', () => {
    const base = [{ id: 'a', trainingNow: true, lat: -33, lng: -71, liveMotionAt: 1 }]
    const next = [{ id: 'a', trainingNow: true, lat: -33, lng: -71, liveMotionAt: 2 }]
    expect(liveUsersSnapshotSignature(base)).not.toBe(liveUsersSnapshotSignature(next))
  })

  it('dedups partner locations by content', () => {
    const partners = [{ id: 'g1', name: 'Gym', lat: -33.1, lng: -71.5 }]
    expect(partnerLocationsSignature(partners)).toBe(partnerLocationsSignature([...partners]))
  })
})
