import { useMemo } from 'react'
import { ChevronDown, ChevronUp, History, Play } from 'lucide-react'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'
import type { Workout } from '../../types'
import { getYesterdayWorkout } from '../../utils/homeHero'

export interface PastWorkoutPickerProps {
  workouts: Workout[]
  open: boolean
  onToggle: () => void
  onSelect: (workout: Workout) => void
  maxItems?: number
}

function localDateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatWorkoutWhen(w: Workout, now = Date.now()): string {
  const ts = w.endedAt || w.startedAt
  const day = localDateStr(ts)
  const today = localDateStr(now)
  if (day === today) return 'Hoy'
  const yesterday = localDateStr(now - 86_400_000)
  if (day === yesterday) return 'Ayer'
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export function PastWorkoutPicker({
  workouts,
  open,
  onToggle,
  onSelect,
  maxItems = 8,
}: PastWorkoutPickerProps) {
  const list = useMemo(
    () =>
      workouts
        .filter((w) => w.exercises?.length)
        .slice(0, maxItems),
    [workouts, maxItems]
  )
  const yesterday = useMemo(() => getYesterdayWorkout(workouts), [workouts])

  if (!list.length) return null

  const countLabel =
    list.length === 1 ? '1 rutina guardada' : `${list.length} rutinas en tu historial`

  return (
    <div className="em-v2-past-picker">
      <button type="button" onClick={onToggle} className="em-v2-past-picker__toggle">
        <div className="em-v2-past-picker__toggle-main">
          <History className="w-4 h-4 shrink-0 text-[#FF671F]" />
          <div className="min-w-0 text-left">
            <p className="em-v2-past-picker__title">Repetir un entreno</p>
            <p className="em-v2-past-picker__sub">{countLabel}</p>
          </div>
        </div>
        <span className="em-v2-past-picker__count">{list.length}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-[#9CA3AF]" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-[#9CA3AF]" />
        )}
      </button>

      {open && (
        <ul className="em-v2-past-picker__list">
          {list.map((w) => {
            const typeLabel = WORKOUT_TYPE_LABELS[w.type] || w.type
            const when = formatWorkoutWhen(w)
            const isYesterday = yesterday?.id === w.id
            const exerciseCount = w.stats?.exerciseCount ?? w.exercises.length
            return (
              <li key={w.id} className="em-v2-past-picker__item">
                <button
                  type="button"
                  onClick={() => onSelect(w)}
                  className="em-v2-past-picker__item-btn"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="em-v2-past-picker__item-title truncate">{w.title}</p>
                      {isYesterday && <span className="em-v2-past-picker__badge">Ayer</span>}
                    </div>
                    <p className="em-v2-past-picker__item-meta">
                      {when} · {typeLabel} · {exerciseCount} ejercicio
                      {exerciseCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="em-v2-past-picker__use">
                    <Play className="w-3 h-3" />
                    Usar
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}