import { describe, expect, it } from 'vitest'
import { parseGymIdFromSearch, resolvePartnerGymById } from './deepLinkGym'

describe('deepLinkGym (fase 86)', () => {
  it('parses gym id from query', () => {
    expect(parseGymIdFromSearch('?tab=map&gym=gym-vina-1')).toBe('gym-vina-1')
    expect(parseGymIdFromSearch('?tab=home')).toBeNull()
  })

  it('resolves partner by id', () => {
    const partners = [
      { id: 'a', name: 'Gym A', lat: 1, lng: 2, type: 'gym' as const },
    ]
    expect(resolvePartnerGymById('a', partners)?.name).toBe('Gym A')
    expect(resolvePartnerGymById('missing', partners)).toBeNull()
  })
})
