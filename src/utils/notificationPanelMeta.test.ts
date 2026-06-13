import { describe, expect, it } from 'vitest'
import { getNotificationPanelMeta } from './notificationPanelMeta'
import type { Notification } from '../types'

const base: Notification = {
  id: 'n1',
  title: 'Test',
  body: 'Body',
  timestamp: Date.now(),
  read: false,
  type: 'message',
  relatedId: 'u1',
}

describe('getNotificationPanelMeta', () => {
  it('marks network message with star icon', () => {
    const meta = getNotificationPanelMeta(base, { u1: { bondLevel: 2 } })
    expect(meta.typeIcon).toBe('⭐')
    expect(meta.isNetworkNotif).toBe(true)
    expect(meta.rowClassName).toContain('network-notif')
  })

  it('uses chat icon for non-network message', () => {
    const meta = getNotificationPanelMeta(base, {})
    expect(meta.typeIcon).toBe('💬')
    expect(meta.isNetworkNotif).toBe(false)
  })

  it('flags daily pulse styling', () => {
    const meta = getNotificationPanelMeta({ ...base, type: 'daily_pulse' }, {})
    expect(meta.typeIcon).toBe('🌅')
    expect(meta.isDailyPulse).toBe(true)
    expect(meta.rowClassName).toContain('border-[#FF671F]')
  })
})
