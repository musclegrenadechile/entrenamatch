/**
 * Admin analytics — métricas agregadas (marketplaceAdmins).
 */

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore'
import type { MarketplaceOrder, Profile, TrainerBooking } from '../types'
import { TRAINER_PLATFORM_FEE_RATE } from './trainerCoach'

export interface AdminMetrics {
  liveNow: number
  totalProfiles: number
  bookingsTotal: number
  bookingsPaid: number
  bookingVolumeClp: number
  platformFeesClp: number
  ordersTotal: number
  ordersPaid: number
  orderVolumeClp: number
  mpConfigured: boolean
}

export function computePlatformFeeFromBooking(b: TrainerBooking): number {
  if (typeof b.platformFeeClp === 'number' && b.platformFeeClp > 0) return b.platformFeeClp
  if (b.status === 'paid_card') return Math.round(b.priceClp * TRAINER_PLATFORM_FEE_RATE)
  return 0
}

export function computeAdminMetrics(
  profiles: Profile[],
  bookings: TrainerBooking[],
  orders: MarketplaceOrder[],
  mpConfigured = false
): AdminMetrics {
  const liveNow = profiles.filter((p) => p.trainingNow === true).length
  const paidBookings = bookings.filter((b) =>
    ['paid_card', 'paid_cash', 'completed'].includes(b.status)
  )
  const bookingVolumeClp = paidBookings.reduce((s, b) => s + (b.priceClp || 0), 0)
  const platformFeesClp = paidBookings.reduce(
    (s, b) => s + computePlatformFeeFromBooking(b),
    0
  )
  const paidOrders = orders.filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
  const orderVolumeClp = paidOrders.reduce((s, o) => s + o.priceClp, 0)

  return {
    liveNow,
    totalProfiles: profiles.length,
    bookingsTotal: bookings.length,
    bookingsPaid: paidBookings.length,
    bookingVolumeClp,
    platformFeesClp,
    ordersTotal: orders.length,
    ordersPaid: paidOrders.length,
    orderVolumeClp,
    mpConfigured,
  }
}

export function attachAllTrainerBookingsListener(
  db: Firestore,
  onUpdate: (bookings: TrainerBooking[]) => void
): () => void {
  const q = query(collection(db, 'trainerBookings'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const list: TrainerBooking[] = []
      snap.forEach((d) => {
        const data = d.data() as Record<string, unknown>
        if (typeof data.trainerId !== 'string') return
        list.push({
          id: d.id,
          trainerId: data.trainerId as string,
          trainerName: String(data.trainerName || ''),
          clientId: String(data.clientId || ''),
          clientName: String(data.clientName || ''),
          scheduledAt: Number(data.scheduledAt) || 0,
          durationMin: Number(data.durationMin) || 60,
          locationNote: String(data.locationNote || ''),
          priceClp: Number(data.priceClp) || 0,
          paymentMethod: data.paymentMethod === 'card' ? 'card' : 'cash',
          status: (data.status as TrainerBooking['status']) || 'requested',
          platformFeeClp: typeof data.platformFeeClp === 'number' ? data.platformFeeClp : undefined,
          createdAt: Number(data.createdAt) || 0,
          updatedAt: Number(data.updatedAt) || 0,
        })
      })
      onUpdate(list)
    },
    () => onUpdate([])
  )
}
