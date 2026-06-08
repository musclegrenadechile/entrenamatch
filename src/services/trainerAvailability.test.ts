import { describe, expect, it } from 'vitest'
import {
  calcBookingPrice,
  isWithinAvailability,
  timeToMin,
} from './trainerAvailability'
import type { TrainerProfile } from '../types'

function baseTrainer(overrides: Partial<TrainerProfile> = {}): TrainerProfile {
  return {
    userId: 'pt1',
    displayName: 'Coach',
    bio: '',
    specialties: ['fuerza'],
    hourlyRateClp: 30000,
    sessionDurationMin: 60,
    city: 'Santiago',
    region: 'RM',
    zones: [],
    paymentMethods: ['cash'],
    active: true,
    avgRating: 0,
    reviewCount: 0,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

describe('isWithinAvailability', () => {
  it('allows any time when no slots', () => {
    const t = baseTrainer()
    const mon10 = new Date('2026-06-08T10:00:00').getTime() // Monday
    expect(isWithinAvailability(t, mon10)).toBe(true)
  })

  it('checks slot boundaries', () => {
    const t = baseTrainer({
      availabilitySlots: [{ dow: 1, startMin: timeToMin('09:00'), endMin: timeToMin('12:00') }],
    })
    const mon10 = new Date('2026-06-08T10:00:00').getTime()
    const mon14 = new Date('2026-06-08T14:00:00').getTime()
    expect(isWithinAvailability(t, mon10)).toBe(true)
    expect(isWithinAvailability(t, mon14)).toBe(false)
  })
})

describe('calcBookingPrice', () => {
  it('single session price', () => {
    const t = baseTrainer({ hourlyRateClp: 30000, sessionDurationMin: 60 })
    expect(calcBookingPrice(t, null).totalPriceClp).toBe(30000)
  })

  it('applies package discount', () => {
    const t = baseTrainer({ hourlyRateClp: 30000, sessionDurationMin: 60 })
    const pkg = { id: 'p1', sessions: 3, discountPercent: 10 }
    expect(calcBookingPrice(t, pkg).totalPriceClp).toBe(81000)
  })
})
