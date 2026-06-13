import { describe, expect, it } from 'vitest'
import {
  mapFirestoreProfileDoc,
  mergeDiscoveryWithPinnedPartners,
  mergeProfileLists,
} from './profileDiscovery'

describe('profileDiscovery', () => {
  it('skips soft-deleted accounts', () => {
    expect(
      mapFirestoreProfileDoc('uid-del', {
        name: 'Cuenta eliminada',
        accountStatus: 'deleted',
        photos: [],
      })
    ).toBeNull()
  })

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

  it('does not let generic incoming profiles overwrite real names and photos', () => {
    const merged = mergeProfileLists(
      [
        {
          id: 'a',
          name: 'Jorge Erpel',
          age: 30,
          gender: 'hombre',
          city: 'Viña del Mar',
          country: 'Chile',
          lat: -33,
          lng: -71.5,
          bio: '',
          photos: ['https://example.com/jorge.jpg'],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio',
          availability: [],
        },
      ],
      [
        {
          id: 'a',
          name: 'un compañero de entreno',
          age: 25,
          gender: 'hombre',
          city: '',
          country: 'Chile',
          lat: -33,
          lng: -71,
          bio: '',
          photos: [],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio',
          availability: [],
        },
      ]
    )
    expect(merged[0].name).toBe('Jorge Erpel')
    expect(merged[0].photos).toEqual(['https://example.com/jorge.jpg'])
    expect(merged[0].city).toBe('Viña del Mar')
  })

  it('keeps pinned match partners when discovery snapshot refreshes', () => {
    const partner = {
      id: 'match-uid',
      name: 'Camila',
      age: 26,
      gender: 'mujer' as const,
      city: 'Santiago',
      country: 'Chile',
      lat: -33.4,
      lng: -70.6,
      bio: '',
      photos: ['https://example.com/c.jpg'],
      trainingTypes: ['Running'],
      goals: [],
      level: 'Intermedio' as const,
      availability: ['Tarde'],
    }
    const cityOnly = [
      {
        id: 'local-uid',
        name: 'Local',
        age: 25,
        gender: 'hombre' as const,
        city: 'Viña del Mar',
        country: 'Chile',
        lat: -33.0,
        lng: -71.5,
        bio: '',
        photos: [],
        trainingTypes: [],
        goals: [],
        level: 'Intermedio' as const,
        availability: ['Tarde'],
      },
    ]
    const merged = mergeDiscoveryWithPinnedPartners(cityOnly, [partner], ['match-uid'])
    expect(merged.map((p) => p.id).sort()).toEqual(['local-uid', 'match-uid'].sort())
    expect(merged.find((p) => p.id === 'match-uid')?.name).toBe('Camila')
  })
})
