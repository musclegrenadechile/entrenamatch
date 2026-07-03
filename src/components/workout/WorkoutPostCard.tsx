import { useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'
import type { WorkoutPreview } from '../../types'
import { WorkoutReactionBar } from './WorkoutReactionBar'

const FEED_EXERCISE_PREVIEW = 4

export interface WorkoutPostCardProps {
  preview: WorkoutPreview
  text?: string
  compact?: boolean
  onCopyRoutine?: () => void
  onShareStory?: () => void
  copyLabel?: string
  postId?: string
  reactions?: Record<string, string[]>
  feedReactions?: Record<string, number>
  effectiveUserId?: string
  onReact?: (emoji: string) => void
  showReactions?: boolean
}

export function WorkoutPostCard({
  preview,
  text,
  compact = false,
  onCopyRoutine,
  onShareStory,
  copyLabel = 'Copiar rutina',
  postId,
  reactions,
  feedReactions,
  effectiveUserId,
  onReact,
  showReactions = true,
}: WorkoutPostCardProps) {
  const exercises = preview.exercises ?? []
  const hasWorkoutContent = exercises.length > 0 || (preview.exerciseCount ?? 0) > 0
  const hasMoreExercises = exercises.length > FEED_EXERCISE_PREVIEW
  const [expanded, setExpanded] = useState(!compact || !hasMoreExercises)
  const visibleExercises = expanded ? exercises : exercises.slice(0, FEED_EXERCISE_PREVIEW)
  const typeLabel = WORKOUT_TYPE_LABELS[preview.type] || preview.type

  return (
    <div className="em-v2-card em-v2-card--brand em-v2-workout-post overflow-hidden p-0">
      <div className="em-v2-workout-post__body">
        <div className="em-v2-workout-post__head">
          <div className="em-v2-training__icon">
            <Dumbbell className="w-4 h-4 text-[#FF671F]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="em-v2-training__eyebrow">
              Entreno de Hoy · {typeLabel}
            </p>
            <p className="em-v2-card__title text-sm truncate">{preview.title}</p>
            <div className="em-v2-workout-post__meta">
              <span>{preview.exerciseCount} ejercicios</span>
              <span>·</span>
              <span>{preview.totalSets} sets</span>
              <span>·</span>
              <span>{preview.durationMin} min</span>
              <span>·</span>
              <span className="text-[#FFD700]">{preview.volumeLabel}</span>
              {(preview.prCount ?? 0) > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#FFD700]">🏆 {preview.prCount} PR</span>
                </>
              )}
            </div>
          </div>
          {hasMoreExercises && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="em-v2-workout-post__expand shrink-0"
              aria-label={expanded ? 'Colapsar rutina' : 'Ver rutina completa'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {visibleExercises.length > 0 && (
          <ul className="em-v2-workout-post__exercises">
            {visibleExercises.map((ex) => (
              <li key={ex.name} className="em-v2-workout-post__exercise-row">
                <span className="em-v2-workout-post__exercise-name truncate">{ex.name}</span>
                <span className="em-v2-workout-post__exercise-meta shrink-0 tabular-nums">
                  {ex.setCount}×
                  {ex.topWeightKg && ex.topWeightKg > 0 ? ` · ${ex.topWeightKg} kg` : ''}
                  {ex.setSummary ? ` · ${ex.setSummary}` : ''}
                </span>
              </li>
            ))}
            {!expanded && hasMoreExercises && (
              <li className="text-[10px] text-[#9CA3AF] font-medium pt-0.5">
                +{exercises.length - FEED_EXERCISE_PREVIEW} ejercicios más
              </li>
            )}
          </ul>
        )}

        {text && (
          <p className="em-v2-workout-post__text line-clamp-3 whitespace-pre-wrap">
            {text}
          </p>
        )}

        {(onCopyRoutine || onShareStory) && hasWorkoutContent && (
          <div className="em-v2-workout-post__actions">
            {onCopyRoutine && (
              <button
                type="button"
                onClick={onCopyRoutine}
                className={`em-v2-card__cta--outline text-[10px] ${onShareStory ? 'flex-1' : 'w-full'}`}
              >
                📋 {copyLabel}
              </button>
            )}
            {onShareStory && (
              <button
                type="button"
                onClick={onShareStory}
                className={`em-v2-sync-memory__cta em-v2-sync-memory__cta--gold text-[10px] ${onCopyRoutine ? 'flex-1' : 'w-full'}`}
              >
                📸 Instagram
              </button>
            )}
          </div>
        )}

        {showReactions && onReact && postId && (
          <WorkoutReactionBar
            postId={postId}
            reactions={reactions}
            optimisticCounts={feedReactions}
            effectiveUserId={effectiveUserId}
            onReact={onReact}
          />
        )}
      </div>
    </div>
  )
}
