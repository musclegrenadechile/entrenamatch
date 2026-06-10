import { describe, expect, it } from 'vitest'
import { applyReadReceiptInference, dedupeWithOptimistic, docToDirectChatMsg } from './chatMessages'

describe('chatMessages', () => {
  it('docToDirectChatMsg maps workout share payload', () => {
    const msg = docToDirectChatMsg(
      {
        id: 'w1',
        data: () => ({
          from: 'u1',
          to: 'u2',
          text: '🏋️ Push',
          timestamp: 1000,
          workoutId: 'wk1',
          workoutPreview: {
            title: 'Push',
            type: 'push',
            exerciseCount: 2,
            totalSets: 6,
            volumeLabel: '1.2t',
            durationMin: 45,
          },
        }),
      },
      'u1'
    )
    expect(msg.workoutId).toBe('wk1')
    expect(msg.workoutPreview?.title).toBe('Push')
  })

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

  it('applyReadReceiptInference marks outgoing read when partner replied after', () => {
    const inferred = applyReadReceiptInference([
      {
        id: '1',
        from: 'me',
        text: 'hola',
        timestamp: 1000,
        sendStatus: 'sent',
      },
      {
        id: '2',
        from: 'them',
        text: 'voy',
        timestamp: 2000,
        sendStatus: 'sent',
      },
    ])
    expect(inferred[0].read).toBe(true)
    expect(inferred[0].readAt).toBe(2000)
  })
})
