import { describe, expect, it } from 'vitest'
import {
  isPilotCityNorm,
  isRealFirebaseUid,
  pilotWeeklyDocId,
  resolvePilotCityForSync,
  sumPilotWeeklyMetrics,
  validatePilotSyncRecord,
} from './pilotSyncMetrics'

const UID_A = 'a'.repeat(28)
const UID_B = 'b'.repeat(28)

describe('pilotSyncMetrics', () => {
  it('detects real vs demo uids', () => {
    expect(isRealFirebaseUid(UID_A)).toBe(true)
    expect(isRealFirebaseUid('p1')).toBe(false)
    expect(isRealFirebaseUid('short')).toBe(false)
  })

  it('resolves pilot city from self or partner', () => {
    expect(resolvePilotCityForSync('Viña del Mar', 'Concepción')?.cityNorm).toBe('vina del mar')
    expect(resolvePilotCityForSync(null, 'Santiago')?.cityNorm).toBe('santiago')
    expect(resolvePilotCityForSync('Buenos Aires', 'Lima')).toBeNull()
    expect(resolvePilotCityForSync('Buenos Aires', 'Toronto')).toBeNull()
  })

  it('validates minimum duration and two real users', () => {
    expect(
      validatePilotSyncRecord({
        sessionId: 'sync_x_y',
        participantIds: [UID_A, UID_B],
        recorderUid: UID_A,
        selfCity: 'Viña del Mar',
        partnerCity: 'Santiago',
        durationMin: 5,
      })
    ).toBeNull()

    expect(
      validatePilotSyncRecord({
        sessionId: 'sync_x_y',
        participantIds: [UID_A, 'p1'],
        recorderUid: UID_A,
        selfCity: 'Viña del Mar',
        durationMin: 5,
      })
    ).toBe('demo_or_invalid_uid')

    expect(
      validatePilotSyncRecord({
        sessionId: 'sync_x_y',
        participantIds: [UID_A, UID_B],
        recorderUid: UID_A,
        selfCity: 'Viña del Mar',
        durationMin: 1,
      })
    ).toBe('duration_too_short')
  })

  it('builds weekly doc id', () => {
    expect(pilotWeeklyDocId('vina del mar', '2026-06-02')).toContain('vina')
  })

  it('sums weekly metrics', () => {
    const sum = sumPilotWeeklyMetrics(
      [
        {
          cityNorm: 'vina del mar',
          cityLabel: 'Viña del Mar',
          weekKey: '2026-06-02',
          realSyncCount: 2,
          totalSyncMinutes: 30,
          lastSyncAt: 1,
        },
        {
          cityNorm: 'santiago',
          cityLabel: 'Santiago',
          weekKey: '2026-06-02',
          realSyncCount: 1,
          totalSyncMinutes: 15,
          lastSyncAt: 2,
        },
      ],
      '2026-06-02'
    )
    expect(sum.totalSyncs).toBe(3)
    expect(sum.totalMinutes).toBe(45)
    expect(isPilotCityNorm('santiago')).toBe(true)
  })
})
