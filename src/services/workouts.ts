/**
 * EntrenaLog — structured workout logging + auto-post to muro.
 * Path: workouts/{workoutId}, profilePosts/{postId} with postType workout
 */

import type { Firestore } from 'firebase/firestore'
import type {
  Workout,
  WorkoutExercise,
  WorkoutPreview,
  WorkoutStats,
  WorkoutType,
} from '../types'
import { WORKOUT_TYPE_LABELS } from '../data/exerciseLibrary'

export function computeWorkoutStats(
  exercises: WorkoutExercise[],
  durationMin: number
): WorkoutStats {
  let totalSets = 0
  let totalVolumeKg = 0
  for (const ex of exercises) {
    for (const set of ex.sets) {
      totalSets++
      totalVolumeKg += (set.reps || 0) * (set.weightKg || 0)
    }
  }
  return {
    totalSets,
    totalVolumeKg: Math.round(totalVolumeKg),
    durationMin: Math.max(1, durationMin),
    exerciseCount: exercises.length,
  }
}

export function formatVolumeLabel(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`
  return `${kg} kg`
}

export function buildWorkoutPreview(
  title: string,
  type: WorkoutType,
  exercises: WorkoutExercise[],
  stats: WorkoutStats
): WorkoutPreview {
  return {
    title,
    type,
    exerciseCount: stats.exerciseCount,
    totalSets: stats.totalSets,
    volumeLabel: formatVolumeLabel(stats.totalVolumeKg),
    durationMin: stats.durationMin,
    exercises: exercises.map((ex) => ({
      name: ex.name,
      setCount: ex.sets.length,
      topWeightKg: ex.sets.reduce((m, s) => Math.max(m, s.weightKg || 0), 0) || undefined,
    })),
  }
}

export function buildWorkoutPostText(
  title: string,
  type: WorkoutType,
  stats: WorkoutStats
): string {
  const typeLabel = WORKOUT_TYPE_LABELS[type] || type
  return `🏋️ ${title} · ${typeLabel} — ${stats.exerciseCount} ejercicios, ${stats.totalSets} sets, ${stats.durationMin} min (${formatVolumeLabel(stats.totalVolumeKg)})`
}

export type SaveWorkoutInput = {
  userId: string
  title: string
  type: WorkoutType
  exercises: WorkoutExercise[]
  durationMin: number
  source?: Workout['source']
  partnerId?: string
  syncSessionId?: string
}

export type SaveWorkoutResult = {
  workout: Workout
  postId: string
  postText: string
}

export async function saveWorkoutWithPost(
  db: Firestore,
  input: SaveWorkoutInput
): Promise<SaveWorkoutResult> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const now = Date.now()
  const stats = computeWorkoutStats(input.exercises, input.durationMin)
  const preview = buildWorkoutPreview(input.title, input.type, input.exercises, stats)
  const postText = buildWorkoutPostText(input.title, input.type, stats)

  const workoutData = {
    userId: input.userId,
    title: input.title.trim(),
    type: input.type,
    startedAt: now - input.durationMin * 60 * 1000,
    endedAt: now,
    exercises: input.exercises,
    stats,
    source: input.source || 'manual',
    partnerId: input.partnerId || null,
    syncSessionId: input.syncSessionId || null,
    createdAt: serverTimestamp(),
  }

  const workoutRef = await addDoc(collection(db, 'workouts'), workoutData)
  const workout: Workout = {
    id: workoutRef.id,
    userId: input.userId,
    title: workoutData.title,
    type: input.type,
    startedAt: workoutData.startedAt,
    endedAt: workoutData.endedAt,
    exercises: input.exercises,
    stats,
    source: workoutData.source as Workout['source'],
    partnerId: input.partnerId,
    syncSessionId: input.syncSessionId,
  }

  const postRef = await addDoc(collection(db, 'profilePosts'), {
    userId: input.userId,
    text: postText,
    timestamp: now,
    likes: [],
    reactions: {},
    pinned: false,
    postType: 'workout',
    workoutId: workoutRef.id,
    workoutPreview: preview,
    createdAt: serverTimestamp(),
  })

  return { workout, postId: postRef.id, postText }
}

function parseWorkoutDoc(id: string, d: Record<string, unknown>): Workout {
  return {
    id,
    userId: String(d.userId || ''),
    title: String(d.title || 'Entrenamiento'),
    type: (d.type as WorkoutType) || 'other',
    startedAt: Number(d.startedAt) || Date.now(),
    endedAt: Number(d.endedAt) || Date.now(),
    exercises: Array.isArray(d.exercises) ? d.exercises : [],
    stats: d.stats as WorkoutStats,
    source: (d.source as Workout['source']) || 'manual',
    partnerId: d.partnerId as string | undefined,
    syncSessionId: d.syncSessionId as string | undefined,
    participantIds: Array.isArray(d.participantIds) ? d.participantIds : undefined,
  }
}

export async function fetchRecentWorkouts(
  db: Firestore,
  userId: string,
  limitCount = 7
): Promise<Workout[]> {
  const { collection, query, where, orderBy, limit, getDocs } = await import(
    'firebase/firestore'
  )
  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', userId),
    orderBy('startedAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  const list: Workout[] = []
  snap.forEach((docSnap) => {
    list.push(parseWorkoutDoc(docSnap.id, docSnap.data() as Record<string, unknown>))
  })
  return list
}

/** Workouts whose endedAt falls on local date (FuelBalance phase 72). */
export async function fetchWorkoutsForDate(
  db: Firestore,
  userId: string,
  dateStr: string
): Promise<Workout[]> {
  const recent = await fetchRecentWorkouts(db, userId, 30)
  return recent.filter((w) => {
    const d = new Date(w.endedAt || w.startedAt)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` === dateStr
  })
}

export async function fetchWorkoutById(
  db: Firestore,
  workoutId: string
): Promise<Workout | null> {
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'workouts', workoutId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id,
    userId: String(d.userId || ''),
    title: String(d.title || 'Entrenamiento'),
    type: (d.type as WorkoutType) || 'other',
    startedAt: Number(d.startedAt) || Date.now(),
    endedAt: Number(d.endedAt) || Date.now(),
    exercises: Array.isArray(d.exercises) ? d.exercises : [],
    stats: d.stats as WorkoutStats,
    source: (d.source as Workout['source']) || 'manual',
    partnerId: d.partnerId as string | undefined,
    syncSessionId: d.syncSessionId as string | undefined,
    participantIds: Array.isArray(d.participantIds) ? d.participantIds : undefined,
  }
}

export type SaveSyncWorkoutInput = SaveWorkoutInput & {
  partnerId: string
  syncSessionId: string
  partnerName: string
  startedAt?: number
}

/** Shared EntrenaSync workout — one log, post on finisher's muro (Phase 2). */
export async function saveSyncWorkoutWithPost(
  db: Firestore,
  input: SaveSyncWorkoutInput
): Promise<SaveWorkoutResult> {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
  const now = Date.now()
  const stats = computeWorkoutStats(input.exercises, input.durationMin)
  const title =
    input.title.trim() ||
    `Sync con ${input.partnerName.split(' ')[0]}`
  const preview = buildWorkoutPreview(title, input.type, input.exercises, stats)
  const typeLabel = WORKOUT_TYPE_LABELS[input.type] || input.type
  const postText = `🏋️ EntrenaSync · ${title} (${typeLabel}) — ${stats.exerciseCount} ejercicios, ${stats.totalSets} sets, ${stats.durationMin} min con @${input.partnerName.split(' ')[0]}`

  const participantIds = [input.userId, input.partnerId].sort()

  const workoutRef = await addDoc(collection(db, 'workouts'), {
    userId: input.userId,
    participantIds,
    title,
    type: input.type,
    startedAt: input.startedAt ?? now - input.durationMin * 60 * 1000,
    endedAt: now,
    exercises: input.exercises,
    stats,
    source: 'sync',
    partnerId: input.partnerId,
    syncSessionId: input.syncSessionId,
    createdAt: serverTimestamp(),
  })

  const workout: Workout = {
    id: workoutRef.id,
    userId: input.userId,
    title,
    type: input.type,
    startedAt: input.startedAt ?? now - input.durationMin * 60 * 1000,
    endedAt: now,
    exercises: input.exercises,
    stats,
    source: 'sync',
    partnerId: input.partnerId,
    syncSessionId: input.syncSessionId,
    participantIds,
  }

  const postRef = await addDoc(collection(db, 'profilePosts'), {
    userId: input.userId,
    text: postText,
    timestamp: now,
    likes: [],
    reactions: {},
    pinned: false,
    postType: 'workout',
    workoutId: workoutRef.id,
    workoutPreview: preview,
    createdAt: serverTimestamp(),
  })

  return { workout, postId: postRef.id, postText }
}
