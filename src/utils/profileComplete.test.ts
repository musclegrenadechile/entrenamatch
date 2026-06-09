import { describe, expect, it } from 'vitest'
import { isProfileComplete } from './profileComplete'

const complete = {
  name: 'Ana',
  photos: ['https://example.com/p.jpg'],
  bio: 'Entreno fuerza 4x semana',
  city: 'Viña del Mar',
  trainingTypes: ['Fuerza'],
  legalConsents: { is18: true, isForTraining: true, sharesLocation: true },
}

describe('isProfileComplete', () => {
  it('requires full pilot profile', () => {
    expect(isProfileComplete(complete)).toBe(true)
    expect(isProfileComplete({ ...complete, bio: '' })).toBe(false)
    expect(isProfileComplete({ ...complete, city: 'Concepción' })).toBe(false)
    expect(isProfileComplete({ ...complete, trainingTypes: [] })).toBe(false)
    expect(
      isProfileComplete({
        ...complete,
        legalConsents: { is18: true, isForTraining: true, sharesLocation: false },
      })
    ).toBe(false)
  })

  it('rejects name-only google stub profiles', () => {
    expect(isProfileComplete({ name: 'Ana', photos: ['x'] })).toBe(false)
  })
})
