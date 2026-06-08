import { describe, expect, it } from 'vitest'
import { likeDocId, matchDocId } from './matching'

describe('matching ids', () => {
  it('builds like doc id from liker and liked', () => {
    expect(likeDocId('alice', 'bob')).toBe('alice_bob')
  })

  it('builds stable match doc id regardless of order', () => {
    expect(matchDocId('bob', 'alice')).toBe('alice_bob')
    expect(matchDocId('alice', 'bob')).toBe('alice_bob')
  })
})
