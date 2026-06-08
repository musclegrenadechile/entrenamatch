/**
 * EntrenaCoach — MVP entrenadores personales (Fase 1).
 * Perfiles PT + reservas + reviews ligadas a booking.
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  getDoc,
  deleteField,
  type Firestore,
} from 'firebase/firestore'
import type {
  TrainerBooking,
  TrainerBookingInput,
  TrainerBookingStatus,
  TrainerProfile,
  TrainerProfileInput,
  TrainerSpecialty,
} from '../types'
import { calcBookingPrice, isWithinAvailability } from './trainerAvailability'

/** Comisión plataforma EntrenaCoach (Fase 2 — MP checkout). */
export const TRAINER_PLATFORM_FEE_RATE = 0.15
const PROFILES = 'trainerProfiles'
const BOOKINGS = 'trainerBookings'

export const TRAINER_SPECIALTIES: { id: TrainerSpecialty; label: string }[] = [
  { id: 'fuerza', label: 'Fuerza' },
  { id: 'hipertrofia', label: 'Hipertrofia' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'funcional', label: 'Funcional' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'rehab', label: 'Rehab / movilidad' },
  { id: 'nutricion', label: 'Nutrición deportiva' },
  { id: 'otro', label: 'Otro' },
]

export function formatTrainerRate(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function mapTrainerProfile(id: string, data: Record<string, unknown>): TrainerProfile | null {
  if (typeof data.displayName !== 'string') return null
  return {
    userId: id,
    displayName: data.displayName,
    bio: typeof data.bio === 'string' ? data.bio : '',
    specialties: Array.isArray(data.specialties) ? (data.specialties as TrainerSpecialty[]) : [],
    hourlyRateClp: typeof data.hourlyRateClp === 'number' ? data.hourlyRateClp : 0,
    sessionDurationMin: typeof data.sessionDurationMin === 'number' ? data.sessionDurationMin : 60,
    city: typeof data.city === 'string' ? data.city : '',
    region: typeof data.region === 'string' ? data.region : '',
    zones: Array.isArray(data.zones) ? (data.zones as string[]) : [],
    paymentMethods: Array.isArray(data.paymentMethods)
      ? (data.paymentMethods as TrainerProfile['paymentMethods'])
      : ['cash'],
    paymentUrl: typeof data.paymentUrl === 'string' ? data.paymentUrl : undefined,
    verified: data.verified === true,
    mpCollectorId: typeof data.mpCollectorId === 'string' ? data.mpCollectorId : undefined,
    availableForDispatch: data.availableForDispatch === true,
    dispatchLat: typeof data.dispatchLat === 'number' ? data.dispatchLat : undefined,
    dispatchLng: typeof data.dispatchLng === 'number' ? data.dispatchLng : undefined,
    availabilitySlots: Array.isArray(data.availabilitySlots)
      ? (data.availabilitySlots as TrainerProfile['availabilitySlots'])
      : undefined,
    packages: Array.isArray(data.packages)
      ? (data.packages as TrainerProfile['packages'])
      : undefined,
    active: data.active !== false,
    avgRating: typeof data.avgRating === 'number' ? data.avgRating : 0,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
  }
}

function mapBooking(id: string, data: Record<string, unknown>): TrainerBooking | null {
  if (typeof data.trainerId !== 'string' || typeof data.clientId !== 'string') return null
  return {
    id,
    trainerId: data.trainerId,
    trainerName: String(data.trainerName || 'Entrenador'),
    clientId: data.clientId,
    clientName: String(data.clientName || 'Cliente'),
    scheduledAt: Number(data.scheduledAt) || 0,
    durationMin: Number(data.durationMin) || 60,
    locationNote: String(data.locationNote || ''),
    priceClp: Number(data.priceClp) || 0,
    paymentMethod: data.paymentMethod === 'card' ? 'card' : 'cash',
    status: (data.status as TrainerBookingStatus) || 'requested',
    clientMessage: typeof data.clientMessage === 'string' ? data.clientMessage : undefined,
    reviewId: typeof data.reviewId === 'string' ? data.reviewId : undefined,
    syncSessionId: typeof data.syncSessionId === 'string' ? data.syncSessionId : undefined,
    mpPreferenceId: typeof data.mpPreferenceId === 'string' ? data.mpPreferenceId : undefined,
    mpPaymentId: typeof data.mpPaymentId === 'string' ? data.mpPaymentId : undefined,
    platformFeeClp: typeof data.platformFeeClp === 'number' ? data.platformFeeClp : undefined,
    packageId: typeof data.packageId === 'string' ? data.packageId : undefined,
    packageSessions: typeof data.packageSessions === 'number' ? data.packageSessions : undefined,
    packageDiscountPercent:
      typeof data.packageDiscountPercent === 'number' ? data.packageDiscountPercent : undefined,
    createdAt: Number(data.createdAt) || 0,
    updatedAt: Number(data.updatedAt) || 0,
  }
}

export function attachTrainerProfilesListener(
  db: Firestore,
  onUpdate: (profiles: TrainerProfile[]) => void
): () => void {
  const q = query(
    collection(db, PROFILES),
    where('active', '==', true),
    orderBy('updatedAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => {
      const list: TrainerProfile[] = []
      snap.forEach((d) => {
        const p = mapTrainerProfile(d.id, d.data() as Record<string, unknown>)
        if (p) list.push(p)
      })
      onUpdate(list)
    },
    (err) => {
      console.warn('trainerProfiles listener error', err)
      onUpdate([])
    }
  )
}

export function attachMyTrainerProfileListener(
  db: Firestore,
  uid: string,
  onUpdate: (profile: TrainerProfile | null) => void
): () => void {
  return onSnapshot(
    doc(db, PROFILES, uid),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null)
        return
      }
      onUpdate(mapTrainerProfile(snap.id, snap.data() as Record<string, unknown>))
    },
    () => onUpdate(null)
  )
}

export function attachTrainerBookingsListener(
  db: Firestore,
  uid: string,
  onUpdate: (bookings: TrainerBooking[]) => void
): () => void {
  const asClient = query(
    collection(db, BOOKINGS),
    where('clientId', '==', uid),
    orderBy('scheduledAt', 'desc')
  )
  const asTrainer = query(
    collection(db, BOOKINGS),
    where('trainerId', '==', uid),
    orderBy('scheduledAt', 'desc')
  )

  let clientList: TrainerBooking[] = []
  let trainerList: TrainerBooking[] = []

  const merge = () => {
    const byId = new Map<string, TrainerBooking>()
    ;[...clientList, ...trainerList].forEach((b) => byId.set(b.id, b))
    onUpdate(
      Array.from(byId.values()).sort((a, b) => b.scheduledAt - a.scheduledAt)
    )
  }

  const unsubClient = onSnapshot(
    asClient,
    (snap) => {
      clientList = []
      snap.forEach((d) => {
        const b = mapBooking(d.id, d.data() as Record<string, unknown>)
        if (b) clientList.push(b)
      })
      merge()
    },
    (err) => {
      console.warn('trainerBookings client listener error', err)
      clientList = []
      merge()
    }
  )

  const unsubTrainer = onSnapshot(
    asTrainer,
    (snap) => {
      trainerList = []
      snap.forEach((d) => {
        const b = mapBooking(d.id, d.data() as Record<string, unknown>)
        if (b) trainerList.push(b)
      })
      merge()
    },
    (err) => {
      console.warn('trainerBookings trainer listener error', err)
      trainerList = []
      merge()
    }
  )

  return () => {
    unsubClient()
    unsubTrainer()
  }
}

export async function getTrainerProfile(
  db: Firestore,
  userId: string
): Promise<TrainerProfile | null> {
  const snap = await getDoc(doc(db, PROFILES, userId))
  if (!snap.exists()) return null
  return mapTrainerProfile(snap.id, snap.data() as Record<string, unknown>)
}

export async function saveTrainerProfile(
  db: Firestore,
  uid: string,
  displayName: string,
  input: TrainerProfileInput,
  dispatchCoords?: { lat: number; lng: number } | null
): Promise<void> {
  const now = Date.now()
  const existing = await getDoc(doc(db, PROFILES, uid))
  const existingData = existing.exists() ? (existing.data() as Record<string, unknown>) : null
  const zones = input.zones
    .split(',')
    .map((z) => z.trim())
    .filter(Boolean)

  const payload = {
    displayName,
    bio: input.bio.trim(),
    specialties: input.specialties,
    hourlyRateClp: Math.max(0, input.hourlyRateClp),
    sessionDurationMin: Math.max(30, Math.min(180, input.sessionDurationMin || 60)),
    city: input.city.trim(),
    region: input.region.trim(),
    zones,
    paymentMethods: input.paymentMethods.length ? input.paymentMethods : ['cash'],
    ...(input.paymentUrl?.trim() ? { paymentUrl: input.paymentUrl.trim() } : {}),
    active: input.active !== false,
    availableForDispatch: input.availableForDispatch === true,
    ...(input.availableForDispatch && dispatchCoords
      ? { dispatchLat: dispatchCoords.lat, dispatchLng: dispatchCoords.lng }
      : input.availableForDispatch === false
        ? { dispatchLat: deleteField(), dispatchLng: deleteField() }
        : {}),
    ...(input.availabilitySlots?.length
      ? { availabilitySlots: input.availabilitySlots }
      : { availabilitySlots: deleteField() }),
    ...(input.packages?.length ? { packages: input.packages } : { packages: deleteField() }),
    updatedAt: now,
    createdAt: typeof existingData?.createdAt === 'number' ? existingData.createdAt : now,
    avgRating: typeof existingData?.avgRating === 'number' ? existingData.avgRating : 0,
    reviewCount: typeof existingData?.reviewCount === 'number' ? existingData.reviewCount : 0,
    verified: existingData?.verified === true,
  }

  await setDoc(doc(db, PROFILES, uid), payload, { merge: true })
}

export async function createTrainerBooking(
  db: Firestore,
  clientId: string,
  clientName: string,
  trainer: TrainerProfile,
  input: TrainerBookingInput
): Promise<string> {
  if (!input.locationNote.trim()) throw new Error('Indica dónde será la sesión')
  if (input.scheduledAt < Date.now() - 60000) throw new Error('El horario debe ser futuro')
  if (!trainer.paymentMethods.includes(input.paymentMethod)) {
    throw new Error('Método de pago no disponible para este entrenador')
  }
  if (!isWithinAvailability(trainer, input.scheduledAt)) {
    throw new Error('El entrenador no está disponible en ese horario')
  }

  const selectedPackage = input.packageId
    ? trainer.packages?.find((p) => p.id === input.packageId)
    : undefined
  const pricing = calcBookingPrice(trainer, selectedPackage ?? null)

  const id = `tb_${Date.now()}_${clientId.slice(0, 6)}`
  const now = Date.now()
  const durationMin = trainer.sessionDurationMin || 60

  await setDoc(doc(db, BOOKINGS, id), {
    trainerId: trainer.userId,
    trainerName: trainer.displayName,
    clientId,
    clientName,
    scheduledAt: input.scheduledAt,
    durationMin,
    locationNote: input.locationNote.trim(),
    priceClp: pricing.totalPriceClp,
    paymentMethod: input.paymentMethod,
    status: 'requested' as TrainerBookingStatus,
    clientMessage: input.clientMessage?.trim() || null,
    ...(pricing.packageId
      ? {
          packageId: pricing.packageId,
          packageSessions: pricing.sessionCount,
          packageDiscountPercent: pricing.discountPercent,
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  })

  return id
}

export async function updateTrainerBookingStatus(
  db: Firestore,
  bookingId: string,
  status: TrainerBookingStatus,
  extra?: { reviewId?: string }
): Promise<void> {
  await updateDoc(doc(db, BOOKINGS, bookingId), {
    status,
    updatedAt: Date.now(),
    ...(extra?.reviewId ? { reviewId: extra.reviewId } : {}),
  })
}

export async function linkBookingSyncSession(
  db: Firestore,
  bookingId: string,
  syncSessionId: string
): Promise<void> {
  await updateDoc(doc(db, BOOKINGS, bookingId), {
    syncSessionId,
    updatedAt: Date.now(),
  })
}

export async function linkReviewToBooking(
  db: Firestore,
  bookingId: string,
  reviewId: string,
  _rating: number
): Promise<void> {
  await updateDoc(doc(db, BOOKINGS, bookingId), {
    reviewId,
    updatedAt: Date.now(),
  })
  // avgRating on trainerProfiles: Phase 2 Cloud Function (secure aggregate)
}

export const BOOKING_STATUS_LABELS: Record<TrainerBookingStatus, string> = {
  requested: 'Solicitud enviada',
  accepted: 'Confirmada',
  declined: 'Rechazada',
  in_progress: 'En sesión',
  completed: 'Completada',
  cancelled: 'Cancelada',
  paid_cash: 'Pagada (efectivo)',
  paid_card: 'Pagada (tarjeta)',
}
