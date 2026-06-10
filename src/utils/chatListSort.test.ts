import { describe, expect, it } from 'vitest'
import {
  formatChatListTime,
  getChatLastTimestamp,
  sortProfilesByChatActivity,
} from './chatListSort'
import type { Message, Profile } from '../types'

const baseProfile = (id: string, name: string): Profile => ({
  id,
  name,
  age: 25,
  gender: 'hombre',
  city: 'Viña',
  country: 'Chile',
  lat: -33,
  lng: -71,
  bio: '',
  photos: [],
  trainingTypes: [],
  goals: [],
  level: 'Intermedio',
  availability: ['Tarde'],
})

describe('chatListSort', () => {
  it('sortProfilesByChatActivity puts most recent chat first', () => {
    const profiles = [baseProfile('a', 'Ana'), baseProfile('b', 'Bob'), baseProfile('c', 'Cata')]
    const messages: Record<string, Message[]> = {
      a: [{ id: '1', from: 'them', text: 'hola', timestamp: 1000 }],
      b: [{ id: '2', from: 'them', text: 'reciente', timestamp: 9000 }],
      c: [],
    }
    const sorted = sortProfilesByChatActivity(profiles, messages)
    expect(sorted.map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })

  it('getChatLastTimestamp picks max timestamp', () => {
    const msgs: Message[] = [
      { id: '1', from: 'me', text: 'a', timestamp: 100 },
      { id: '2', from: 'them', text: 'b', timestamp: 500 },
    ]
    expect(getChatLastTimestamp(msgs)).toBe(500)
  })

  it('formatChatListTime shows ahora for recent', () => {
    const now = Date.now()
    expect(formatChatListTime(now - 30_000, now)).toBe('ahora')
  })
})
