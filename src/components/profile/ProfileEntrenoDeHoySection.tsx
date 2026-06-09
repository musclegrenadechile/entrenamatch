import { Dumbbell, Copy, ChevronRight, TrendingUp } from 'lucide-react'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'
import type { Workout } from '../../types'
import { formatVolumeLabel } from '../../services/workouts'
import { getTopExerciseProgress } from '../../utils/workoutProgress'

export interface ProfileEntrenoDeHoySectionProps {
  recentWorkouts: Workout[]
  loading?: boolean
  onOpenEntrenoDeHoy: () => void
  onCopyWorkout: (workout: Workout) => void
}

export function ProfileEntrenoDeHoySection({
  recentWorkouts,
  loading = false,
  onOpenEntrenoDeHoy,
  onCopyWorkout,
}: ProfileEntrenoDeHoySectionProps) {
  const exerciseProgress = getTopExerciseProgress(recentWorkouts, 3)

  return (
    <div className="px-4 mt-4">
      <div className="rounded-2xl border border-[#FF671F]/25 bg-gradient-to-br from-[#FF671F]/8 via-[#141418] to-[#0f0f12] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF671F]/20 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-[#FF671F]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">Entreno de Hoy</p>
              <p className="text-[10px] text-[#9CA3AF]">Tu bitácora de entrenamientos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenEntrenoDeHoy}
            className="text-[10px] px-3 py-1.5 rounded-full bg-[#FF671F] text-black font-bold shrink-0"
          >
            + Nuevo
          </button>
        </div>

        {loading ? (
          <p className="px-4 py-6 text-center text-xs text-[#9CA3AF]">Cargando historial…</p>
        ) : recentWorkouts.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-xs text-[#9CA3AF] mb-3">Aún no registras entrenos estructurados.</p>
            <button
              type="button"
              onClick={onOpenEntrenoDeHoy}
              className="text-[11px] px-4 py-2 rounded-xl border border-[#FF671F]/40 text-[#FF671F] font-bold"
            >
              Registrar primer entreno
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-white/6">
            {recentWorkouts.slice(0, 5).map((w) => {
              const typeLabel = WORKOUT_TYPE_LABELS[w.type] || w.type
              const vol = w.stats?.totalVolumeKg
                ? formatVolumeLabel(w.stats.totalVolumeKg)
                : '—'
              const when = new Date(w.endedAt || w.startedAt)
              const dateStr = when.toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
              })
              return (
                <li key={w.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{w.title}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                      {dateStr} · {typeLabel} · {w.stats?.totalSets ?? 0} sets · {vol}
                      {w.source === 'sync' ? ' · Sync' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyWorkout(w)}
                    className="shrink-0 p-2 rounded-xl bg-white/5 text-[#FF671F] active:bg-[#FF671F]/15"
                    title="Repetir rutina"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {!loading && exerciseProgress.length > 0 && (
          <div className="px-4 py-3 border-t border-white/8 bg-black/20">
            <p className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Progreso por ejercicio
            </p>
            <ul className="space-y-2">
              {exerciseProgress.map((ex) => {
                const maxW = Math.max(1, ...ex.points.map((p) => p.weightKg))
                return (
                  <li key={ex.name}>
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-white font-semibold truncate pr-2">{ex.name}</span>
                      <span className="text-[#FFD700] font-bold shrink-0">
                        {ex.trend === 'up' ? '↑' : ex.trend === 'down' ? '↓' : '→'}{' '}
                        {ex.bestWeightKg > 0 ? `${ex.bestWeightKg} kg` : `${ex.bestReps} reps`}
                      </span>
                    </div>
                    <div className="flex items-end gap-0.5 h-6">
                      {ex.points.map((p, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-[#FF671F]/70 min-h-[3px]"
                          style={{
                            height: `${Math.max(15, Math.round((p.weightKg / maxW) * 100))}%`,
                          }}
                          title={`${p.weightKg}kg × ${p.reps}`}
                        />
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {recentWorkouts.length > 0 && (
          <button
            type="button"
            onClick={onOpenEntrenoDeHoy}
            className="w-full py-2.5 text-[10px] font-bold text-[#FF671F] border-t border-white/8 flex items-center justify-center gap-1 active:bg-white/5"
          >
            Abrir Entreno de Hoy <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
