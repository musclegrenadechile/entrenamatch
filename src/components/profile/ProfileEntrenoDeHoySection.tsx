import { Dumbbell, Copy, ChevronRight, Trash2 } from 'lucide-react'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'
import type { Workout } from '../../types'
import { formatVolumeLabel } from '../../services/workouts'
import { getTopExerciseProgress } from '../../utils/workoutProgress'
import { buildWorkoutHistoryBadges } from '../../utils/workoutHistoryBadges'
import {
  buildWorkoutHistoryRowSummary,
  buildWorkoutHistorySectionKicker,
  formatWorkoutHistoryBadgeDisplay,
  getWorkoutHistoryBadgeAriaLabel,
  WORKOUT_HISTORY_SUMMARY_CLASS,
} from '../../utils/workoutHistoryDisplay'
import { buildWorkoutHistorySparkline } from '../../utils/workoutHistorySparkline'
import { WorkoutHistorySparkline } from '../workout/WorkoutHistorySparkline'
import { ExerciseProgressBars } from '../workout/ExerciseProgressBars'

export interface ProfileEntrenoDeHoySectionProps {
  recentWorkouts: Workout[]
  loading?: boolean
  onOpenEntrenoDeHoy: () => void
  onCopyWorkout: (workout: Workout) => void
  onDeleteWorkout?: (workout: Workout) => void
}

export function ProfileEntrenoDeHoySection({
  recentWorkouts,
  loading = false,
  onOpenEntrenoDeHoy,
  onCopyWorkout,
  onDeleteWorkout,
}: ProfileEntrenoDeHoySectionProps) {
  const exerciseProgress = getTopExerciseProgress(recentWorkouts, 3)
  const historyKicker = buildWorkoutHistorySectionKicker(recentWorkouts)

  return (
    <div className="px-4 mt-4">
      <div className="em-v2-card em-v2-card--brand overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="em-v2-training__icon">
              <Dumbbell className="w-4 h-4 text-[#FF671F]" />
            </div>
            <div className="min-w-0">
              <p className="em-v2-card__title text-sm">Entreno de Hoy</p>
              <p className="em-v2-card__detail">{historyKicker}</p>
            </div>
          </div>
          <button type="button" onClick={onOpenEntrenoDeHoy} className="em-v2-card__cta text-[10px] px-3 py-1.5 shrink-0">
            + Nuevo
          </button>
        </div>

        {loading ? (
          <EmV2EmptyState compact title="Cargando historial…" body="Sincronizando tus entrenos." />
        ) : recentWorkouts.length === 0 ? (
          <EmV2EmptyState
            compact
            emoji="🏋️"
            title="Sin entrenos aún"
            body="Registra sets, peso y duración para ver tu progreso aquí."
          >
            <button type="button" onClick={onOpenEntrenoDeHoy} className="em-v2-hero-card__cta">
              Registrar primer entreno
            </button>
          </EmV2EmptyState>
        ) : (
          <ul className="em-v2-training-history">
            {recentWorkouts.slice(0, 5).map((w, index) => {
              const typeLabel = WORKOUT_TYPE_LABELS[w.type] || w.type
              const vol = w.stats?.totalVolumeKg
                ? formatVolumeLabel(w.stats.totalVolumeKg)
                : '—'
              const when = new Date(w.endedAt || w.startedAt)
              const dateStr = when.toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
              })
              const badges = buildWorkoutHistoryBadges(w, recentWorkouts.slice(index + 1))
              const sparkline = buildWorkoutHistorySparkline(recentWorkouts, index)
              const rowSummary = buildWorkoutHistoryRowSummary(w)

              return (
                <li key={w.id} className="em-v2-training-history__row">
                  <div className="em-v2-training-history__copy">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="em-v2-training-history__title truncate">{w.title}</p>
                      {badges.map((badge) => (
                        <span
                          key={`${w.id}-${badge.kind}`}
                          className={`em-v2-training-history__badge em-v2-training-history__badge--${badge.kind}`}
                          aria-label={getWorkoutHistoryBadgeAriaLabel(badge)}
                        >
                          {formatWorkoutHistoryBadgeDisplay(badge)}
                        </span>
                      ))}
                    </div>
                    <p className="em-v2-card__detail mt-0.5">
                      {dateStr} · {typeLabel} · {w.stats?.totalSets ?? 0} sets · {vol}
                    </p>
                    {rowSummary && (
                      <p className={WORKOUT_HISTORY_SUMMARY_CLASS}>{rowSummary}</p>
                    )}
                  </div>
                  <WorkoutHistorySparkline values={sparkline} />
                  <div className="em-v2-training-history__actions">
                    <button
                      type="button"
                      onClick={() => onCopyWorkout(w)}
                      className="em-v2-training-history__action em-v2-training-history__action--copy"
                      title="Repetir rutina"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {onDeleteWorkout && (
                      <button
                        type="button"
                        onClick={() => onDeleteWorkout(w)}
                        className="em-v2-training-history__action em-v2-training-history__action--delete"
                        title="Eliminar entreno"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!loading && exerciseProgress.length > 0 && (
          <div className="em-v2-training-progress__wrap">
            <ExerciseProgressBars entries={exerciseProgress} />
          </div>
        )}

        {recentWorkouts.length > 0 && (
          <button
            type="button"
            onClick={onOpenEntrenoDeHoy}
            className="em-v2-training-history__footer"
          >
            Abrir Entreno de Hoy <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
