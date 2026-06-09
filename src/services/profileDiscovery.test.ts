import { describe, expect, it } from 'vitest'
import { mapFirestoreProfileDoc, mergeProfileLists } from './profileDiscovery'

describe('profileDiscovery', () => {
  it('maps Firestore profile docs', () => {
    const p = mapFirestoreProfileDoc('uid1', {
      name: 'Jorge Erpel',
      city: 'Viña del Mar',
      photos: ['https://example.com/a.jpg'],
      trainingTypes: ['Pesas/Gym'],
    })
    expect(p?.id).toBe('uid1')
    expect(p?.name).toBe('Jorge Erpel')
    expect(p?.photos).toHaveLength(1)
  })

  it('merges profile lists by id', () => {
    const merged = mergeProfileLists(
      [{ id: 'a', name: 'Old', age: 20, gender: 'hombre', city: '', country: 'Chile', lat: 0, lng: 0, bio: '', photos: [], trainingTypes: [], goals: [], level: 'Intermedio', availability: [] }],
      [{ id: 'a', name: 'New', age: 30, gender: 'hombre', city: 'Santiago', country: 'Chile', lat: 0, lng: 0, bio: 'bio', photos: [], trainingTypes: ['Run'], goals: [], level: 'Intermedio', availability: [] }]
    )
    expect(merged).toHaveLength(1)
    expect(merged[0].name).toBe('New')
    expect(merged[0].city).toBe('Santiago')
  })
})
