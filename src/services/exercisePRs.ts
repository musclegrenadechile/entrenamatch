/**
 * Fase 95 — exercise PR records (local + Firestore doc per user).
 * Path: exercisePRs/{userId} → { records: { [exerciseKey]: ExercisePRRecord } }
 */

import type { Firestore } from 'firebase/firestore'
import type { WorkoutPR } from '../utils/workoutPR'

export interface ExercisePRRecord {
  exerciseKey: string
  exerciseName: string
  weightKg: number
  reps: number
  achievedAt: number
  workoutId?: string
}

export type ExercisePRMap = Record<string, ExercisePRRecord>

const LOCAL_KEY = 'entrenamatch_exercise_prs_v1'

function exerciseKey(name: string): string {
  return name.trim().toLowerCase()
}

export function mergePRsIntoMap(
  existing: ExercisePRMap,
  prs: WorkoutPR[],
  workoutId?: string,
  achievedAt = Date.now()
): { map: ExercisePRMap; updated: ExercisePRRecord[] } {
  const map = { ...existing }
  const updated: ExercisePRRecord[] = []

  for (const pr of prs) {
    const key = exerciseKey(pr.exercise)
    const prev = map[key]
    const beats =
      !prev ||
      pr.weightKg > prev.weightKg ||
      (pr.weightKg === prev.weightKg && pr.reps > prev.reps)
    if (!beats) continue
    const record: ExercisePRRecord = {
      exerciseKey: key,
      exerciseName: pr.exercise,
      weightKg: pr.weightKg,
      reps: pr.reps,
      achievedAt,
      workoutId,
    }
    map[key] = record
    updated.push(record)
  }

  return { map, updated }
}

export function loadExercisePRsLocal(userId: string): ExercisePRMap {
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY}_${userId}`)
    if (!raw) return {}
    return JSON.parse(raw) as ExercisePRMap
  } catch {
    return {}
  }
}

export function saveExercisePRsLocal(userId: string, map: ExercisePRMap): void {
  try {
    localStorage.setItem(`${LOCAL_KEY}_${userId}`, JSON.stringify(map))
  } catch {
    /* quota */
  }
}

export async function loadExercisePRs(
  db: Firestore,
  userId: string
): Promise<ExercisePRMap> {
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snap = await getDoc(doc(db, 'exercisePRs', userId))
    if (!snap.exists()) return loadExercisePRsLocal(userId)
    const data = snap.data()
    const records = (data.records || {}) as ExercisePRMap
    saveExercisePRsLocal(userId, records)
    return records
  } catch {
    return loadExercisePRsLocal(userId)
  }
}

export async function syncExercisePRs(
  db: Firestore,
  userId: string,
  prs: WorkoutPR[],
  workoutId?: string
): Promise<ExercisePRRecord[]> {
  if (!prs.length) return []
  const existing = await loadExercisePRs(db, userId)
  const { map, updated } = mergePRsIntoMap(existing, prs, workoutId)
  if (!updated.length) return []

  saveExercisePRsLocal(userId, map)
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    await setDoc(
      doc(db, 'exercisePRs', userId),
      { records: map, updatedAt: serverTimestamp() },
      { merge: true }
    )
  } catch (e) {
    console.warn('syncExercisePRs Firestore failed', e)
  }
  return updated
}

export function topExercisePRs(map: ExercisePRMap, limit = 5): ExercisePRRecord[] {
  return Object.values(map)
    .sort((a, b) => b.achievedAt - a.achievedAt || b.weightKg - a.weightKg)
    .slice(0, limit)
}

export function formatExercisePRLine(record: ExercisePRRecord): string {
  const w = record.weightKg > 0 ? `${record.weightKg}kg` : ''
  return w
    ? `${record.exerciseName} · ${record.reps}×${w}`
    : `${record.exerciseName} · ${record.reps} reps`
}
