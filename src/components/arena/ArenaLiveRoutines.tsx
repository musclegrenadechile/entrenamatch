import type { WorkoutExercise } from '../../types'

export interface ArenaLiveRoutinesProps {
  selfLabel?: string
  partnerLabel: string
  selfActiveExercise: string
  partnerActiveExercise?: string | null
  selfExercises: WorkoutExercise[]
  partnerExercises?: WorkoutExercise[]
}

function ExerciseColumn({
  label,
  activeExercise,
  exercises,
  accent,
}: {
  label: string
  activeExercise: string
  exercises: WorkoutExercise[]
  accent: 'green' | 'orange'
}) {
  return (
    <div className={`arena-live-routines__col arena-live-routines__col--${accent}`}>
      <p className="arena-live-routines__who">{label}</p>
      <p className="arena-live-routines__active">{activeExercise || 'Sin ejercicio'}</p>
      {exercises.length === 0 ? (
        <p className="arena-live-routines__empty">Sin sets aún</p>
      ) : (
        <ul className="arena-live-routines__list">
          {exercises.map((ex) => (
            <li key={ex.name} className="arena-live-routines__item">
              <span className="arena-live-routines__name">{ex.name}</span>
              <span className="arena-live-routines__sets">
                {ex.sets
                  .map((s) => (s.weightKg > 0 ? `${s.reps}×${s.weightKg}kg` : `${s.reps}`))
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ArenaLiveRoutines({
  selfLabel = 'TÚ',
  partnerLabel,
  selfActiveExercise,
  partnerActiveExercise,
  selfExercises,
  partnerExercises = [],
}: ArenaLiveRoutinesProps) {
  return (
    <section className="arena-live-routines" aria-label="Rutinas en vivo">
      <ExerciseColumn
        label={selfLabel}
        activeExercise={selfActiveExercise}
        exercises={selfExercises}
        accent="green"
      />
      <ExerciseColumn
        label={partnerLabel}
        activeExercise={partnerActiveExercise || '—'}
        exercises={partnerExercises}
        accent="orange"
      />
    </section>
  )
}
