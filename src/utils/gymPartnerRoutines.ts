/**
 * Entreno de Hoy — suggested routines from gym check-in / partner type (oleada 3).
 */

import type { WorkoutQuickTemplate } from './workoutTemplates'
import { cloneExercises } from './workoutTemplates'
import { isTimedCardioExercise } from '../data/exerciseLibrary'
import { emptyCardioSet } from './workoutSetFields'

function ex(
  name: string,
  sets: Array<{ reps?: number; weightKg?: number; minutesMin?: number; intensity?: number }>
) {
  if (isTimedCardioExercise(name)) {
    return {
      name,
      sets: sets.map((s) => ({
        ...emptyCardioSet(),
        minutesMin: s.minutesMin ?? s.reps ?? 15,
        intensity: s.intensity ?? 6,
      })),
    }
  }
  return {
    name,
    sets: sets.map((s) => ({ reps: s.reps ?? 10, weightKg: s.weightKg ?? 0 })),
  }
}

const GYM_FULL: WorkoutQuickTemplate = {
  id: 'gym-full-body',
  label: 'Full body en el gym',
  type: 'full',
  durationMin: 50,
  builtin: true,
  exercises: [
    ex('Sentadilla libre', [{ reps: 10, weightKg: 40 }, { reps: 8, weightKg: 50 }]),
    ex('Press banca', [{ reps: 10, weightKg: 40 }, { reps: 8, weightKg: 45 }]),
    ex('Remo con barra', [{ reps: 10, weightKg: 35 }, { reps: 8, weightKg: 40 }]),
    ex('Press militar', [{ reps: 10, weightKg: 25 }, { reps: 8, weightKg: 30 }]),
  ],
}

const CROSSFIT_WOD: WorkoutQuickTemplate = {
  id: 'gym-crossfit-wod',
  label: 'WOD funcional',
  type: 'cardio',
  durationMin: 40,
  builtin: true,
  exercises: [
    ex('Burpees', [{ reps: 15 }, { reps: 12 }]),
    ex('Kettlebell swing', [{ reps: 20, weightKg: 16 }, { reps: 15, weightKg: 20 }]),
    ex('Box jumps', [{ reps: 12 }, { reps: 10 }]),
    ex('Remo en máquina', [{ reps: 500 }, { reps: 400 }]),
  ],
}

const GYM_QUICK: WorkoutQuickTemplate = {
  id: 'gym-quick-session',
  label: 'Sesión express',
  type: 'full',
  durationMin: 35,
  builtin: true,
  exercises: [
    ex('Prensa 45°', [{ reps: 12, weightKg: 80 }, { reps: 10, weightKg: 100 }]),
    ex('Jalón al pecho', [{ reps: 12, weightKg: 45 }, { reps: 10, weightKg: 50 }]),
    ex('Fondos en paralelas', [{ reps: 12 }, { reps: 10 }]),
  ],
}

const STORE_CARDIO: WorkoutQuickTemplate = {
  id: 'gym-store-cardio',
  label: 'Cardio + movilidad',
  type: 'cardio',
  durationMin: 30,
  builtin: true,
  exercises: [
    ex('Cinta / caminadora', [{ minutesMin: 15, intensity: 6 }, { minutesMin: 10, intensity: 7 }]),
    ex('Elíptica', [{ minutesMin: 12, intensity: 6 }]),
  ],
}

export function getGymRoutineTemplates(opts: {
  gymName?: string
  partnerType?: string
}): WorkoutQuickTemplate[] {
  const type = (opts.partnerType || 'gym').toLowerCase()
  const name = opts.gymName?.trim()

  let templates: WorkoutQuickTemplate[]
  if (type === 'crossfit' || name?.toLowerCase().includes('crossfit')) {
    templates = [CROSSFIT_WOD, GYM_QUICK]
  } else if (type === 'store') {
    templates = [STORE_CARDIO, GYM_QUICK]
  } else {
    templates = [GYM_FULL, GYM_QUICK]
  }

  return templates.map((t) => ({
    ...t,
    id: `gym-${t.id}`,
    label: name ? `${t.label}` : t.label,
    exercises: cloneExercises(t.exercises),
  }))
}
