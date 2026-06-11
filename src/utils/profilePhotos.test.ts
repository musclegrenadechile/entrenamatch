import { describe, expect, it } from 'vitest'
import {
  filterPersistablePhotos,
  isDataUrlPhoto,
  resolveProfilePhotos,
} from './profilePhotos'

describe('profilePhotos', () => {
  it('filters data URLs from persistable photos', () => {
    expect(
      filterPersistablePhotos([
        'data:image/jpeg;base64,abc',
        'https://firebasestorage.googleapis.com/v0/b/x/o/y.jpg',
      ])
    ).toEqual(['https://firebasestorage.googleapis.com/v0/b/x/o/y.jpg'])
  })

  it('prefers newer photosUpdatedAt on hydrate', () => {
    const cached = ['https://firebasestorage.googleapis.com/v0/b/x/o/new.jpg']
    const remote = ['https://lh3.googleusercontent.com/old']
    expect(resolveProfilePhotos(cached, remote, 2000, 1000)).toEqual(cached)
    expect(resolveProfilePhotos(cached, remote, 1000, 2000)).toEqual(remote)
  })

  it('prefers firebase storage over google avatar when no timestamps', () => {
    const cached = ['https://firebasestorage.googleapis.com/v0/b/x/o/me.jpg']
    const remote = ['https://lh3.googleusercontent.com/a/avatar']
    expect(resolveProfilePhotos(cached, remote)).toEqual(cached)
  })

  it('detects data URLs', () => {
    expect(isDataUrlPhoto('data:image/png;base64,x')).toBe(true)
    expect(isDataUrlPhoto('https://x.com/a.jpg')).toBe(false)
  })
})
