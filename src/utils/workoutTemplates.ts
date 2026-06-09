/**
 * Entreno de Hoy — quick templates & favorites (oleada 1).
 */

import type { Workout, WorkoutExercise, WorkoutType } from '../types'

export interface WorkoutQuickTemplate {
  id: string
  label: string
  type: WorkoutType
  durationMin: number
  exercises: WorkoutExercise[]
  builtin?: boolean
}

const STORAGE_KEY = 'entrenamatch_entreno_hoy_favorites'
const MAX_FAVORITES = 3

function setWithDefaults(reps: number, weightKg = 0): WorkoutExercise['sets'][0] {
  return { reps, weightKg }
}

function ex(name: string, sets: Array<{ reps: number; weightKg?: number }>): WorkoutExercise {
  return { name, sets: sets.map((s) => setWithDefaults(s.reps, s.weightKg ?? 0)) }
}

export const BUILTIN_WORKOUT_TEMPLATES: WorkoutQuickTemplate[] = [
  {
    id: 'builtin-push',
    label: 'Push clásico',
    type: 'push',
    durationMin: 50,
    builtin: true,
    exercises: [
      ex('Press banca', [{ reps: 10, weightKg: 40 }, { reps: 8, weightKg: 50 }, { reps: 6, weightKg: 55 }]),
      ex('Press inclinado mancuernas', [{ reps: 10, weightKg: 16 }, { reps: 10, weightKg: 18 }]),
      ex('Fondos en paralelas', [{ reps: 12 }, { reps: 10 }]),
      ex('Elevaciones laterales', [{ reps: 15, weightKg: 8 }, { reps: 12, weightKg: 10 }]),
    ],
  },
  {
    id: 'builtin-pull',
    label: 'Pull espalda',
    type: 'pull',
    durationMin: 50,
    builtin: true,
    exercises: [
      ex('Dominadas', [{ reps: 8 }, { reps: 6 }, { reps: 5 }]),
      ex('Remo con barra', [{ reps: 10, weightKg: 40 }, { reps: 8, weightKg: 45 }]),
      ex('Jalón al pecho', [{ reps: 12, weightKg: 45 }, { reps: 10, weightKg: 50 }]),
      ex('Curl bíceps barra', [{ reps: 12, weightKg: 20 }, { reps: 10, weightKg: 22 }]),
    ],
  },
  {
    id: 'builtin-legs',
    label: 'Piernas',
    type: 'legs',
    durationMin: 55,
    builtin: true,
    exercises: [
      ex('Sentadilla libre', [{ reps: 10, weightKg: 50 }, { reps: 8, weightKg: 60 }, { reps: 6, weightKg: 70 }]),
      ex('Prensa 45°', [{ reps: 12, weightKg: 100 }, { reps: 10, weightKg: 120 }]),
      ex('Peso muerto rumano', [{ reps: 10, weightKg: 40 }, { reps: 8, weightKg: 50 }]),
      ex('Extensiones de cuádriceps', [{ reps: 15, weightKg: 25 }, { reps: 12, weightKg: 30 }]),
    ],
  },
]

export function cloneExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises.map((e) => ({
    name: e.name,
    sets: e.sets.map((s) => ({ reps: s.reps, weightKg: s.weightKg ?? 0 })),
  }))
}

export function workoutToTemplate(w: Workout, label?: string): WorkoutQuickTemplate {
  return {
    id: `copy-${w.id}`,
    label: label || w.title || 'Último entreno',
    type: w.type,
    durationMin: w.stats?.durationMin || 45,
    exercises: cloneExercises(w.exercises || []),
  }
}

export function loadFavoriteTemplates(): WorkoutQuickTemplate[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WorkoutQuickTemplate[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_FAVORITES) : []
  } catch {
    return []
  }
}

export function saveFavoriteTemplate(template: Omit<WorkoutQuickTemplate, 'id' | 'builtin'>): WorkoutQuickTemplate[] {
  const entry: WorkoutQuickTemplate = {
    ...template,
    id: `fav-${Date.now()}`,
    exercises: cloneExercises(template.exercises),
  }
  const prev = loadFavoriteTemplates().filter((t) => t.label !== entry.label)
  const next = [entry, ...prev].slice(0, MAX_FAVORITES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

export function removeFavoriteTemplate(id: string): WorkoutQuickTemplate[] {
  const next = loadFavoriteTemplates().filter((t) => t.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}
