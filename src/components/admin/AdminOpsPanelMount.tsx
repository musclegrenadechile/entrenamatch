import type { Firestore } from 'firebase/firestore'
import type { MarketplaceOrder, Profile, TrainerBooking, TrainerProfile } from '../../types'
import { computeAdminMetrics } from '../../services/adminAnalytics'
import {
  setTrainerVerified,
  updateMarketplaceOrderStatus,
} from '../../services/adminOps'
import { markTrainerPayoutStatus, type MpHealthResult } from '../../services/adminMp'
import { AdminOpsPanel } from './AdminOpsPanel'

export type AdminOpsPanelMountProps = {
  open: boolean
  onClose: () => void
  db: Firestore | null
  orders: MarketplaceOrder[]
  bookings: TrainerBooking[]
  trainers: TrainerProfile[]
  realProfiles: Profile[]
  mpHealth: MpHealthResult | null
  liveNowTotal: number
}

/** Fase 371 — marketplace/trainer ops admin + Firestore handlers extracted from App.tsx. */
export function AdminOpsPanelMount({
  open,
  onClose,
  db,
  orders,
  bookings,
  trainers,
  realProfiles,
  mpHealth,
  liveNowTotal,
}: AdminOpsPanelMountProps) {
  return (
    <AdminOpsPanel
      open={open}
      onClose={onClose}
      orders={orders}
      bookings={bookings}
      trainers={trainers}
      mpHealth={mpHealth}
      liveNowTotal={liveNowTotal}
      db={db}
      metrics={computeAdminMetrics(
        realProfiles,
        bookings,
        orders,
        !!mpHealth?.configured,
        !!mpHealth?.live
      )}
      onUpdateOrderStatus={async (orderId, status) => {
        if (!db) throw new Error('db')
        await updateMarketplaceOrderStatus(db, orderId, status)
      }}
      onSetTrainerVerified={async (trainerUserId, verified) => {
        if (!db) throw new Error('db')
        await setTrainerVerified(db, trainerUserId, verified)
      }}
      onMarkTrainerPayout={async (bookingId, status) => {
        await markTrainerPayoutStatus(bookingId, status)
      }}
    />
  )
}
