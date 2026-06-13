import { describe, expect, it } from 'vitest'
import { filterLiveNearUsers, sortLiveNearUsers } from './LiveNearModalMount'

describe('LiveNearModalMount', () => {
  it('sorts live users by distance by default', () => {
    const sorted = sortLiveNearUsers(
      [
        { id: 'a', distance: 10 } as any,
        { id: 'b', distance: 2 } as any,
      ],
      'distance',
      {}
    )
    expect(sorted.map((u) => u.id)).toEqual(['b', 'a'])
  })

  it('filters live users by search query', () => {
    const filtered = filterLiveNearUsers(
      [
        { id: 'a', name: 'Camila', trainingTypes: ['Running'] } as any,
        { id: 'b', name: 'Diego', trainingTypes: ['Pesas/Gym'] } as any,
      ],
      'cami'
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('a')
  })
})
