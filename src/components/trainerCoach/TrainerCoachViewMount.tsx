import type { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'
import type {
  TrainerBooking,
  TrainerDispatchRequest,
  TrainerProfile,
  TrainerProfileInput,
} from '../../types'
import type { DailyEnergyBalance } from '../../domain/fuelBalance'
import type { WeeklyPlanResult } from '../../domain/weeklyPlan'
import {
  createTrainerBooking,
  linkBookingSyncSession,
  saveTrainerProfile,
  updateTrainerBookingStatus,
} from '../../services/trainerCoach'
import {
  cancelTrainerDispatch,
  createTrainerDispatchRequest,
  estimateDispatchPrice,
  findNearbyDispatchTrainers,
} from '../../services/trainerDispatch'
import { payTrainerBooking, openTrainerPaymentCheckout } from '../../services/trainerPayments'
import { buildSyncSessionId } from '../../services/syncSessions'
import { TrainerCoachView } from './TrainerCoachView'

export type TrainerCoachViewMountProps = {
  open: boolean
  onClose: () => void
  onDispatchMatched: () => void
  trainers: TrainerProfile[]
  myTrainerProfile: TrainerProfile | null
  bookings: TrainerBooking[]
  userUid?: string
  userName?: string
  isDemoMode: boolean
  preselectedTrainerId?: string | null
  initialTab?: 'explore' | 'now' | 'sessions' | 'trainer'
  userLat?: number
  userLng?: number
  profileCoords: Record<string, { lat: number; lng: number }>
  activeDispatch?: TrainerDispatchRequest | null
  incomingDispatchOffer?: TrainerDispatchRequest | null
  clientDispatchHistory: TrainerDispatchRequest[]
  trainerDispatchHistory: TrainerDispatchRequest[]
  clientFuelBalance: DailyEnergyBalance | null
  clientWeeklyPlan: WeeklyPlanResult | null
  userLocation: { lat: number; lng: number } | null
  db: Firestore | null
  onRequestLocation: () => void | Promise<void>
  onRequestReview: (trainerId: string, bookingId: string) => void
  onStartSync: (partnerId: string, partnerName: string) => Promise<void>
}

/** Fase 366 — EntrenaCoach modal + service handlers extracted from App.tsx. */
export function TrainerCoachViewMount({
  open,
  onClose,
  onDispatchMatched,
  trainers,
  myTrainerProfile,
  bookings,
  userUid,
  userName,
  isDemoMode,
  preselectedTrainerId,
  initialTab,
  userLat,
  userLng,
  profileCoords,
  activeDispatch,
  incomingDispatchOffer,
  clientDispatchHistory,
  trainerDispatchHistory,
  clientFuelBalance,
  clientWeeklyPlan,
  userLocation,
  db,
  onRequestLocation,
  onRequestReview,
  onStartSync,
}: TrainerCoachViewMountProps) {
  const clientName = userName || 'Cliente'

  return (
    <TrainerCoachView
      open={open}
      onClose={onClose}
      trainers={trainers}
      myTrainerProfile={myTrainerProfile}
      bookings={bookings}
      userUid={userUid}
      userName={userName}
      isDemoMode={isDemoMode}
      preselectedTrainerId={preselectedTrainerId}
      initialTab={initialTab}
      userLat={userLat}
      userLng={userLng}
      profileCoords={profileCoords}
      activeDispatch={activeDispatch}
      incomingDispatchOffer={incomingDispatchOffer}
      onRequestLocation={onRequestLocation}
      clientDispatchHistory={clientDispatchHistory}
      trainerDispatchHistory={trainerDispatchHistory}
      clientFuelBalance={clientFuelBalance}
      clientWeeklyPlan={clientWeeklyPlan}
      onCreateDispatch={async (input, candidateIds) => {
        if (!db || !userUid) throw new Error('auth')
        const nearby = findNearbyDispatchTrainers(
          trainers,
          profileCoords,
          input.specialty,
          input.lat,
          input.lng
        )
        const estimate = estimateDispatchPrice(nearby, input.durationMin)
        return createTrainerDispatchRequest(db, userUid, clientName, input, estimate, candidateIds)
      }}
      onCancelDispatch={async (dispatchId) => {
        if (!db) throw new Error('db')
        await cancelTrainerDispatch(db, dispatchId)
      }}
      onDispatchMatched={onDispatchMatched}
      onSaveTrainerProfile={async (input: TrainerProfileInput) => {
        if (!db || !userUid) throw new Error('auth')
        const name = userName || 'Entrenador'
        const coords = input.availableForDispatch && userLocation ? userLocation : null
        if (input.availableForDispatch && !userLocation) {
          toast.info('Activa GPS para recibir ofertas cerca de ti')
        }
        await saveTrainerProfile(db, userUid, name, input, coords)
      }}
      onCreateBooking={async (trainer, input) => {
        if (!db || !userUid) throw new Error('auth')
        return createTrainerBooking(db, userUid, clientName, trainer, input)
      }}
      onUpdateBookingStatus={async (bookingId, status) => {
        if (!db) throw new Error('db')
        try {
          await updateTrainerBookingStatus(db, bookingId, status)
          toast.success('Sesión actualizada')
        } catch (e) {
          console.warn(e)
          toast.error('No se pudo actualizar la sesión')
          throw e
        }
      }}
      onOpenPayment={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
      onRequestReview={onRequestReview}
      onStartEntrenaSync={async (booking) => {
        if (!userUid) return
        const partnerId = booking.trainerId === userUid ? booking.clientId : booking.trainerId
        const partnerName =
          booking.trainerId === userUid ? booking.clientName : booking.trainerName
        onClose()
        await onStartSync(partnerId, partnerName)
        if (db) {
          await linkBookingSyncSession(db, booking.id, buildSyncSessionId(userUid, partnerId))
        }
      }}
      onPayWithMercadoPago={async (booking) => {
        try {
          const result = await payTrainerBooking(booking.id)
          openTrainerPaymentCheckout(result)
          toast.success('Pago seguro EntrenaMatch', {
            description: `Pagas a EntrenaMatch. Tras confirmar, liquidamos ${(
              booking.priceClp - result.platformFeeClp
            ).toLocaleString('es-CL')} CLP al entrenador (comisión ${result.platformFeeClp.toLocaleString('es-CL')} CLP).`,
          })
        } catch (e) {
          console.warn(e)
          const msg = e instanceof Error ? e.message : 'Intenta de nuevo'
          toast.error('No se pudo iniciar el pago', {
            description: msg.includes('EntrenaMatch') || msg.includes('Mercado Pago')
              ? 'Los pagos con tarjeta los procesa EntrenaMatch. Intenta más tarde o elige efectivo.'
              : msg,
          })
          throw e
        }
      }}
    />
  )
}
