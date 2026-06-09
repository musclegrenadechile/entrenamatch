/**
 * Entreno de Hoy — gym routines from Firestore (oleada 5).
 * Collection: gymRoutines/{gymId} with routines[] templates.
 */

import type { Firestore } from 'firebase/firestore'
import type { WorkoutExercise, WorkoutType } from '../types'
import { getGymRoutineTemplates } from '../utils/gymPartnerRoutines'
import {
  cloneExercises,
  type WorkoutQuickTemplate,
} from '../utils/workoutTemplates'

export interface GymRoutineEntry {
  id?: string
  label: string
  type: WorkoutType
  durationMin: number
  exercises: WorkoutExercise[]
}

export interface GymRoutineDoc {
  gymId: string
  gymName?: string
  routines?: GymRoutineEntry[]
}

function parseRoutineEntry(r: GymRoutineEntry, index: number): WorkoutQuickTemplate | null {
  if (!r?.label?.trim() || !Array.isArray(r.exercises) || r.exercises.length === 0) return null
  return {
    id: `gym-fs-${r.id || index}`,
    label: r.label.trim(),
    type: r.type || 'full',
    durationMin: Math.max(5, r.durationMin || 45),
    exercises: cloneExercises(r.exercises),
  }
}

export async function fetchGymRoutinesFromFirestore(
  db: Firestore,
  gymId: string
): Promise<WorkoutQuickTemplate[]> {
  if (!gymId) return []
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, 'gymRoutines', gymId))
  if (!snap.exists()) return []
  const data = snap.data() as GymRoutineDoc
  const list: WorkoutQuickTemplate[] = []
  for (let i = 0; i < (data.routines?.length ?? 0); i++) {
    const parsed = parseRoutineEntry(data.routines![i], i)
    if (parsed) list.push(parsed)
  }
  return list
}

/** Firestore routines first, then local partner-type fallbacks. */
export function mergeGymRoutineTemplates(
  firestoreTemplates: WorkoutQuickTemplate[],
  fallbackOpts: { gymName?: string; partnerType?: string }
): WorkoutQuickTemplate[] {
  const fallback = getGymRoutineTemplates(fallbackOpts)
  const seen = new Set<string>()
  const merged: WorkoutQuickTemplate[] = []
  for (const t of [...firestoreTemplates, ...fallback]) {
    const key = t.label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(t)
  }
  return merged.slice(0, 6)
}
