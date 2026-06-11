import { describe, expect, it } from 'vitest'
import { isDeletedProfile, isDeletedProfileData } from './deletedProfile'

describe('deletedProfile', () => {
  it('detects accountStatus deleted', () => {
    expect(isDeletedProfileData({ name: 'Ana', accountStatus: 'deleted' })).toBe(true)
    expect(isDeletedProfile({ name: 'Ana', accountStatus: 'deleted' })).toBe(true)
  })

  it('detects placeholder name', () => {
    expect(isDeletedProfileData({ name: 'Cuenta eliminada' })).toBe(true)
  })

  it('allows active profiles', () => {
    expect(isDeletedProfileData({ name: 'María', accountStatus: 'active' })).toBe(false)
    expect(isDeletedProfile({ name: 'María' })).toBe(false)
  })
})
