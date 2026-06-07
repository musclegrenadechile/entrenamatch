/**
 * Fuel AI — profile, daily logs, optional muro posts.
 * Paths: fuelProfiles/{userId}, fuelLogs/{logId}
 */

import type { Firestore } from 'firebase/firestore'
import type {
  FuelDayTotals,
  FuelLogEntry,
  FuelProfile,
  NutritionPreview,
} from '../types'
import { toLocalDateStr } from '../utils/fuelCalculator'

export type AnalyzeFoodResult = {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  label: string
  tip: string
  source: 'gemini' | 'heuristic'
}

export function emptyFuelDayTotals(): FuelDayTotals {
  return { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 }
}

/** Firestore rejects undefined field values — strip before setDoc/addDoc. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

export function sumFuelLogs(entries: FuelLogEntry[]): FuelDayTotals {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.kcal || 0),
      proteinG: acc.proteinG + (e.proteinG || 0),
      carbsG: acc.carbsG + (e.carbsG || 0),
      fatG: acc.fatG + (e.fatG || 0),
      entryCount: acc.entryCount + 1,
    }),
    emptyFuelDayTotals()
  )
}

export async function loadFuelProfile(
  db: Firestore,
  userId: string
): Promise<FuelProfile | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'fuelProfiles', userId))
  if (!snap.exists()) return null
  return snap.data() as FuelProfile
}

export async function saveFuelProfile(
  db: Firestore,
  userId: string,
  profile: Omit<FuelProfile, 'updatedAt'>
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(
    doc(db, 'fuelProfiles', userId),
    stripUndefined({ ...profile, updatedAt: serverTimestamp() }),
    { merge: true }
  )
}

export async function fetchFuelLogsForDate(
  db: Firestore,
  userId: string,
  date: string = toLocalDateStr()
): Promise<FuelLogEntry[]> {
  const { collection, query, where, getDocs, orderBy, limit } = await import(
    'firebase/firestore'
  )
  const q = query(
    collection(db, 'fuelLogs'),
    where('userId', '==', userId),
    where('date', '==', date),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  const list: FuelLogEntry[] = []
  snap.forEach((docSnap) => {
    const d = docSnap.data()
    list.push({
      id: docSnap.id,
      userId: String(d.userId || ''),
      date: String(d.date || date),
      mealLabel: String(d.mealLabel || 'Comida'),
      kcal: Number(d.kcal) || 0,
      proteinG: Number(d.proteinG) || 0,
      carbsG: Number(d.carbsG) || 0,
      fatG: Number(d.fatG) || 0,
      photoUrl: d.photoUrl as string | undefined,
      source: (d.source as FuelLogEntry['source']) || 'manual',
      createdAt: Number(d.createdAt) || Date.now(),
    })
  })
  return list
}

export async function saveFuelLog(
  db: Firestore,
  entry: Omit<FuelLogEntry, 'id' | 'createdAt'> & { createdAt?: number }
): Promise<FuelLogEntry> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const createdAt = entry.createdAt ?? Date.now()
  const ref = await addDoc(collection(db, 'fuelLogs'), stripUndefined({
    ...entry,
    createdAt,
    serverTimestamp: serverTimestamp(),
  }))
  return { ...entry, id: ref.id, createdAt }
}

export function buildNutritionPostText(preview: NutritionPreview): string {
  return `🍽 Fuel check — ${preview.mealLabel}: ${preview.kcal} kcal · P${preview.proteinG} C${preview.carbsG} G${preview.fatG}`
}

export async function createNutritionPost(
  db: Firestore,
  userId: string,
  preview: NutritionPreview,
  photoUrl?: string
): Promise<string> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const ref = await addDoc(collection(db, 'profilePosts'), {
    userId,
    text: buildNutritionPostText(preview),
    timestamp: Date.now(),
    likes: [],
    reactions: {},
    pinned: false,
    postType: 'nutrition',
    nutritionPreview: preview,
    photo: photoUrl || null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function analyzeFoodWithAi(input: {
  imageBase64?: string
  mealDescription?: string
}): Promise<AnalyzeFoodResult> {
  const { app: firebaseApp } = await import('./firebase')
  if (!firebaseApp) throw new Error('Firebase not initialized')
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const functions = getFunctions(firebaseApp, 'us-central1')
  const fn = httpsCallable<
    { imageBase64?: string; mealDescription?: string },
    AnalyzeFoodResult
  >(functions, 'analyzeFood')
  const payload: { imageBase64?: string; mealDescription?: string } = {}
  if (input.imageBase64?.trim()) payload.imageBase64 = input.imageBase64.trim()
  if (input.mealDescription?.trim()) payload.mealDescription = input.mealDescription.trim()
  if (!payload.imageBase64 && !payload.mealDescription) {
    throw new Error('Foto o descripción requerida para Fuel AI')
  }
  const res = await fn(payload)
  return res.data
}
