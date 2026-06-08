/**
 * EntrenaCoach Uber-mode — dispatch on-demand con tarifa dinámica de mercado.
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
  type Firestore,
} from 'firebase/firestore'
import type {
  TrainerDispatchInput,
  TrainerDispatchPriceEstimate,
  TrainerDispatchRequest,
  TrainerProfile,
  TrainerSpecialty,
} from '../types'
import { TRAINER_PLATFORM_FEE_RATE } from './trainerCoach'

const DISPATCH = 'trainerDispatchRequests'
const DISPATCH_MAX_RADIUS_KM = 25
export const DISPATCH_OFFER_MS = 90_000

export const DISPATCH_STATUS_LABELS: Record<string, string> = {
  searching: 'Calculando tarifa y buscando entrenadores…',
  offering: 'Oferta enviada — esperando entrenador',
  matched: '¡Entrenador confirmado!',
  no_trainers: 'Sin entrenadores disponibles cerca',
  cancelled: 'Cancelado',
  expired: 'La búsqueda expiró',
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface TrainerWithCoords extends TrainerProfile {
  lat: number
  lng: number
  distanceKm: number
}

/** Entrenadores activos + disponibles Uber con coordenadas (perfil o dispatch). */
export function findNearbyDispatchTrainers(
  trainers: TrainerProfile[],
  profileCoords: Record<string, { lat: number; lng: number }>,
  specialty: TrainerSpecialty,
  clientLat: number,
  clientLng: number
): TrainerWithCoords[] {
  const list: TrainerWithCoords[] = []
  for (const t of trainers) {
    if (!t.active || !t.availableForDispatch) continue
    if (!t.specialties.includes(specialty)) continue
    const lat =
      typeof t.dispatchLat === 'number'
        ? t.dispatchLat
        : profileCoords[t.userId]?.lat
    const lng =
      typeof t.dispatchLng === 'number'
        ? t.dispatchLng
        : profileCoords[t.userId]?.lng
    if (typeof lat !== 'number' || typeof lng !== 'number') continue
    const distanceKm = haversineKm(clientLat, clientLng, lat, lng)
    if (distanceKm > DISPATCH_MAX_RADIUS_KM) continue
    list.push({ ...t, lat, lng, distanceKm })
  }
  return list.sort((a, b) => a.distanceKm - b.distanceKm)
}

/** Tarifa dinámica según oferta/demanda local (precio de mercado + surge). */
export function estimateDispatchPrice(
  nearby: TrainerWithCoords[],
  durationMin: number
): TrainerDispatchPriceEstimate {
  const fallbackHourly = 25000
  if (nearby.length === 0) {
    const offer = Math.round(fallbackHourly * (durationMin / 60))
    return {
      marketPriceClp: offer,
      offerPriceClp: offer,
      surgeFactor: 1,
      nearbyCount: 0,
      platformFeeClp: Math.round(offer * TRAINER_PLATFORM_FEE_RATE),
    }
  }
  const avgHourly =
    nearby.reduce((s, t) => s + (t.hourlyRateClp || fallbackHourly), 0) / nearby.length
  const marketPriceClp = Math.round(avgHourly * (durationMin / 60))
  let surgeFactor = 1
  if (nearby.length <= 2) surgeFactor = 1.2
  else if (nearby.length <= 5) surgeFactor = 1.08
  const offerPriceClp = Math.round(marketPriceClp * surgeFactor)
  return {
    marketPriceClp,
    offerPriceClp,
    surgeFactor,
    nearbyCount: nearby.length,
    platformFeeClp: Math.round(offerPriceClp * TRAINER_PLATFORM_FEE_RATE),
  }
}

function mapDispatch(id: string, data: Record<string, unknown>): TrainerDispatchRequest | null {
  if (typeof data.clientId !== 'string') return null
  return {
    id,
    clientId: data.clientId,
    clientName: String(data.clientName || 'Cliente'),
    specialty: (data.specialty as TrainerSpecialty) || 'funcional',
    durationMin: Number(data.durationMin) || 60,
    lat: Number(data.lat) || 0,
    lng: Number(data.lng) || 0,
    locationNote: String(data.locationNote || ''),
    paymentMethod: data.paymentMethod === 'card' ? 'card' : 'cash',
    marketPriceClp: Number(data.marketPriceClp) || 0,
    offerPriceClp: Number(data.offerPriceClp) || 0,
    surgeFactor: Number(data.surgeFactor) || 1,
    platformFeeClp: Number(data.platformFeeClp) || 0,
    status: (data.status as TrainerDispatchRequest['status']) || 'searching',
    candidateTrainerIds: Array.isArray(data.candidateTrainerIds)
      ? (data.candidateTrainerIds as string[])
      : [],
    passedTrainerIds: Array.isArray(data.passedTrainerIds)
      ? (data.passedTrainerIds as string[])
      : [],
    currentTrainerId:
      typeof data.currentTrainerId === 'string' ? data.currentTrainerId : undefined,
    currentTrainerName:
      typeof data.currentTrainerName === 'string' ? data.currentTrainerName : undefined,
    offerExpiresAt: typeof data.offerExpiresAt === 'number' ? data.offerExpiresAt : undefined,
    matchedTrainerId:
      typeof data.matchedTrainerId === 'string' ? data.matchedTrainerId : undefined,
    bookingId: typeof data.bookingId === 'string' ? data.bookingId : undefined,
    createdAt: Number(data.createdAt) || 0,
    updatedAt: Number(data.updatedAt) || 0,
  }
}

export function attachClientDispatchListener(
  db: Firestore,
  clientId: string,
  onUpdate: (req: TrainerDispatchRequest | null) => void
): () => void {
  const q = query(
    collection(db, DISPATCH),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => {
      const active = snap.docs
        .map((d) => mapDispatch(d.id, d.data() as Record<string, unknown>))
        .filter(Boolean) as TrainerDispatchRequest[]
      const live = active.find((r) =>
        ['searching', 'offering', 'matched'].includes(r.status)
      )
      onUpdate(live || null)
    },
    () => onUpdate(null)
  )
}

export function attachTrainerDispatchOfferListener(
  db: Firestore,
  trainerId: string,
  onUpdate: (req: TrainerDispatchRequest | null) => void
): () => void {
  const q = query(
    collection(db, DISPATCH),
    where('currentTrainerId', '==', trainerId),
    where('status', '==', 'offering')
  )
  return onSnapshot(
    q,
    (snap) => {
      const first = snap.docs[0]
      if (!first) {
        onUpdate(null)
        return
      }
      onUpdate(mapDispatch(first.id, first.data() as Record<string, unknown>))
    },
    () => onUpdate(null)
  )
}

export async function createTrainerDispatchRequest(
  db: Firestore,
  clientId: string,
  clientName: string,
  input: TrainerDispatchInput,
  estimate: TrainerDispatchPriceEstimate,
  candidateTrainerIds: string[]
): Promise<string> {
  if (!input.locationNote.trim()) throw new Error('Indica dónde entrenar')
  if (candidateTrainerIds.length === 0) {
    throw new Error('No hay entrenadores disponibles cerca para esta especialidad')
  }

  const id = `td_${Date.now()}_${clientId.slice(0, 6)}`
  const now = Date.now()
  await setDoc(doc(db, DISPATCH, id), {
    clientId,
    clientName,
    specialty: input.specialty,
    durationMin: input.durationMin,
    lat: input.lat,
    lng: input.lng,
    locationNote: input.locationNote.trim(),
    paymentMethod: input.paymentMethod,
    marketPriceClp: estimate.marketPriceClp,
    offerPriceClp: estimate.offerPriceClp,
    surgeFactor: estimate.surgeFactor,
    platformFeeClp: estimate.platformFeeClp,
    status: 'searching',
    candidateTrainerIds,
    passedTrainerIds: [],
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export async function cancelTrainerDispatch(
  db: Firestore,
  dispatchId: string
): Promise<void> {
  await updateDoc(doc(db, DISPATCH, dispatchId), {
    status: 'cancelled',
    updatedAt: Date.now(),
  })
}

export async function respondToDispatchOffer(
  dispatchId: string,
  trainerId: string,
  action: 'accept' | 'pass'
): Promise<void> {
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const { app } = await import('./firebase')
  if (!app) throw new Error('Firebase no inicializado')
  const functions = getFunctions(app, 'us-central1')
  const fn = httpsCallable<
    { dispatchId: string; action: 'accept' | 'pass' },
    { ok: boolean; bookingId?: string }
  >(functions, 'respondToTrainerDispatch')
  await fn({ dispatchId, action })
}

export async function advanceExpiredDispatch(dispatchId: string): Promise<void> {
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const { app } = await import('./firebase')
  if (!app) return
  const functions = getFunctions(app, 'us-central1')
  const fn = httpsCallable<{ dispatchId: string }, { ok: boolean }>(
    functions,
    'advanceTrainerDispatch'
  )
  await fn({ dispatchId })
}
