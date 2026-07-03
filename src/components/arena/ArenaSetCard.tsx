import { Minus, Plus } from 'lucide-react'
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

function Stepper({
  label,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  step: number
  min: number
  max: number
}) {
  return (
    <div className="arena-set-stepper">
      <span className="arena-set-stepper__label">{label}</span>
      <div className="arena-set-stepper__controls">
        <button
          type="button"
          className="arena-set-stepper__btn"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={`Menos ${label}`}
        >
          <Minus size={16} />
        </button>
        <span className="arena-set-stepper__value tabular-nums">
          {step % 1 !== 0 && value % 1 !== 0 ? value.toFixed(1) : value}
        </span>
        <button
          type="button"
          className="arena-set-stepper__btn"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label={`Más ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
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
    <section className="em-v2-arena-set arena-set-card" aria-label="Set activo compartido">
      {partnerState && (
        <div className="arena-set-card__partner-bar">
          <span className="arena-set-card__partner-dot" aria-hidden />
          <span>
            <strong>{partnerFirst}</strong> · {partnerState.activeExercise || '—'} ·{' '}
            {partnerState.pendingReps} reps
            {partnerState.pendingWeightKg > 0 ? ` · ${partnerState.pendingWeightKg}kg` : ''}
          </span>
        </div>
      )}

      <ArenaExercisePicker
        value={selfExercise}
        onChange={onExerciseChange}
        extraOptions={exerciseOptions}
      />

      <div className="arena-set-card__steppers">
        <Stepper
          label="Reps"
          value={selfReps}
          onChange={onRepsChange}
          step={1}
          min={1}
          max={100}
        />
        <Stepper
          label="Kg"
          value={selfWeightKg}
          onChange={onWeightChange}
          step={2.5}
          min={0}
          max={500}
        />
      </div>

      <div className="arena-set-card__footer-row">
        {selfSetCount > 0 && (
          <span className="arena-set-card__count">{selfSetCount} sets logueados</span>
        )}
        <span className="arena-set-card__hint">
          <strong>Set listo</strong> → {partnerFirst} lo ve al instante
        </span>
      </div>
    </section>
  )
}
