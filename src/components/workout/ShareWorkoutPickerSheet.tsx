import { useEffect, useState } from 'react'
import { Dumbbell, Plus, X } from 'lucide-react'
import type { Workout } from '../../types'
import { WorkoutPostCard } from './WorkoutPostCard'
import { workoutToPreview } from '../../services/workouts'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'

export interface ShareWorkoutPickerSheetProps {
  open: boolean
  partnerName?: string
  loading?: boolean
  workouts: Workout[]
  onClose: () => void
  onShareWorkout: (workout: Workout) => void | Promise<void>
  onLogNew: () => void
}

function formatWorkoutTime(endedAt: number): string {
  return new Date(endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ShareWorkoutPickerSheet({
  open,
  partnerName,
  loading = false,
  workouts,
  onClose,
  onShareWorkout,
  onLogNew,
}: ShareWorkoutPickerSheetProps) {
  const [sharingId, setSharingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setSharingId(null)
  }, [open])

  if (!open) return null

  const handleShare = async (workout: Workout) => {
    setSharingId(workout.id)
    try {
      await onShareWorkout(workout)
      onClose()
    } finally {
      setSharingId(null)
    }
  }

  return (
    <div className="share-workout-sheet" role="dialog" aria-label="Compartir entreno">
      <button type="button" className="share-workout-sheet__backdrop" onClick={onClose} aria-label="Cerrar" />
      <div className="share-workout-sheet__panel">
        <div className="share-workout-sheet__header">
          <div>
            <p className="share-workout-sheet__title">Compartir entreno</p>
            <p className="share-workout-sheet__sub">
              {partnerName
                ? `Envía tu log de hoy a ${partnerName.split(' ')[0]}`
                : 'Envía tu log de hoy al chat'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="share-workout-sheet__close" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <button type="button" className="share-workout-sheet__new" onClick={() => { onLogNew(); onClose() }}>
          <Plus size={18} />
          Registrar entreno nuevo
        </button>

        {loading ? (
          <p className="share-workout-sheet__hint">Cargando entrenos de hoy…</p>
        ) : workouts.length === 0 ? (
          <div className="share-workout-sheet__empty">
            <Dumbbell size={28} className="text-[#FF671F]/60" />
            <p className="text-sm text-[#e9edef] font-semibold mt-2">Sin entrenos guardados hoy</p>
            <p className="text-xs text-[#8696a0] mt-1">
              Registra uno nuevo o termina un entreno que tengas en borrador.
            </p>
          </div>
        ) : (
          <div className="share-workout-sheet__list">
            <p className="share-workout-sheet__list-label">Entrenos de hoy</p>
            {workouts.map((w) => {
              const preview = workoutToPreview(w)
              const typeLabel = WORKOUT_TYPE_LABELS[w.type] || w.type
              return (
                <div key={w.id} className="share-workout-sheet__row">
                  <div className="share-workout-sheet__row-meta">
                    <span className="share-workout-sheet__time">{formatWorkoutTime(w.endedAt || w.startedAt)}</span>
                    <span className="share-workout-sheet__type">{typeLabel}</span>
                  </div>
                  <WorkoutPostCard preview={preview} compact />
                  <button
                    type="button"
                    disabled={sharingId === w.id}
                    onClick={() => void handleShare(w)}
                    className="share-workout-sheet__send"
                  >
                    {sharingId === w.id ? 'Enviando…' : 'Enviar al chat'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
