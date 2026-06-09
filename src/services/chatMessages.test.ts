import { describe, expect, it } from 'vitest'
import { dedupeWithOptimistic, docToDirectChatMsg } from './chatMessages'

describe('chatMessages', () => {
  it('docToDirectChatMsg maps read receipts', () => {
    const msg = docToDirectChatMsg(
      {
        id: 'abc123',
        data: () => ({
          from: 'u1',
          to: 'u2',
          text: 'hola',
          timestamp: 1000,
          read: true,
          readAt: 2000,
          clientId: 'c_local',
        }),
      },
      'u1'
    )
    expect(msg.from).toBe('me')
    expect(msg.read).toBe(true)
    expect(msg.readAt).toBe(2000)
    expect(msg.clientId).toBe('c_local')
    expect(msg.sendStatus).toBe('sent')
  })

  it('dedupeWithOptimistic drops local when server has same clientId', () => {
    const server = [
      {
        id: 'fs1',
        from: 'me' as const,
        text: 'hola',
        timestamp: 1000,
        clientId: 'c1',
        sendStatus: 'sent' as const,
      },
    ]
    const local = [
      {
        id: 'c1',
        from: 'me',
        text: 'hola',
        timestamp: 1000,
        clientId: 'c1',
        sendStatus: 'sending' as const,
      },
    ]
    const merged = dedupeWithOptimistic(server, local)
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('fs1')
    expect(merged[0].read).toBeUndefined()
  })
})
