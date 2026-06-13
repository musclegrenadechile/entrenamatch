import { describe, expect, it } from 'vitest'
import {
  filterPersistablePhotos,
  isDataUrlPhoto,
  resolveProfilePhotos,
  resolvePhotosForFirestoreSave,
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

  it('keeps pending data URLs from cache when remote is empty', () => {
    const pending = ['data:image/jpeg;base64,abc']
    expect(resolveProfilePhotos(pending, [])).toEqual(pending)
  })

  it('does not wipe persisted photos when incoming still has data URLs', () => {
    const prior = ['https://firebasestorage.googleapis.com/v0/b/x/o/me.jpg']
    const incoming = ['data:image/jpeg;base64,newshot']
    expect(resolvePhotosForFirestoreSave(incoming, prior)).toEqual(prior)
  })

  it('allows explicit gallery clear on save', () => {
    const prior = ['https://firebasestorage.googleapis.com/v0/b/x/o/me.jpg']
    expect(resolvePhotosForFirestoreSave([], prior)).toEqual([])
  })

  it('persists newly uploaded http photos', () => {
    const prior = ['https://firebasestorage.googleapis.com/v0/b/x/o/old.jpg']
    const incoming = ['https://firebasestorage.googleapis.com/v0/b/x/o/new.jpg']
    expect(resolvePhotosForFirestoreSave(incoming, prior)).toEqual(incoming)
  })
})
