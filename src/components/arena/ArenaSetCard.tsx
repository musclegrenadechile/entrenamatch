import { ArenaExercisePicker } from './ArenaExercisePicker'
import type { ArenaParticipantLiveState } from '../../utils/arenaSyncState'

export interface ArenaSetCardProps {
  selfExercise: string
  selfReps: number
  selfWeightKg: number
  selfSetCount: number
  exerciseOptions: string[]
  onExerciseChange: (name: string) => void
  onRepsChange: (reps: number) => void
  onWeightChange: (kg: number) => void
  partnerState: ArenaParticipantLiveState | null
  partnerFirst: string
}

export function ArenaSetCard({
  selfExercise,
  selfReps,
  selfWeightKg,
  selfSetCount,
  exerciseOptions,
  onExerciseChange,
  onRepsChange,
  onWeightChange,
  partnerState,
  partnerFirst,
}: ArenaSetCardProps) {
  return (
    <section className="arena-set-card" aria-label="Set activo compartido">
      <div className="arena-set-card__grid">
        <div className="arena-set-card__self">
          <p className="arena-set-card__who">Tu set</p>
          <ArenaExercisePicker
            options={exerciseOptions}
            value={selfExercise}
            onChange={onExerciseChange}
          />
          <div className="arena-set-card__inputs">
            <label>
              <span>Reps</span>
              <input
                type="number"
                min={1}
                max={100}
                value={selfReps}
                onChange={(e) => onRepsChange(Math.max(1, Number(e.target.value) || 10))}
              />
            </label>
            <label>
              <span>Kg</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={selfWeightKg}
                onChange={(e) => onWeightChange(Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
          </div>
          {selfSetCount > 0 && (
            <p className="arena-set-card__count">{selfSetCount} sets logueados</p>
          )}
        </div>

        {partnerState && (
          <div className="arena-set-card__partner">
            <p className="arena-set-card__who arena-set-card__who--partner">{partnerFirst}</p>
            <p className="arena-set-card__partner-ex">{partnerState.activeExercise || '—'}</p>
            <p className="arena-set-card__partner-meta">
              {partnerState.pendingReps} reps
              {partnerState.pendingWeightKg > 0 ? ` · ${partnerState.pendingWeightKg}kg` : ''}
            </p>
            {(partnerState.setCount ?? 0) > 0 && (
              <p className="arena-set-card__partner-sets">{partnerState.setCount} sets</p>
            )}
          </div>
        )}
      </div>
      <p className="arena-set-card__hint">
        <strong>Set listo</strong> envía tu serie por el canal — {partnerFirst} la ve al instante
      </p>
    </section>
  )
}
