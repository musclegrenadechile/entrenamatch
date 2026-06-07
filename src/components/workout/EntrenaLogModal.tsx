import { useMemo, useState } from 'react'
import { Dumbbell, Plus, Trash2, X } from 'lucide-react'
import {
  EXERCISE_LIBRARY,
  WORKOUT_TYPE_LABELS,
  filterExercises,
} from '../../data/exerciseLibrary'
import type { WorkoutExercise, WorkoutSet, WorkoutType } from '../../types'

export interface EntrenaLogModalProps {
  open: boolean
  onClose: () => void
  onSave: (payload: {
    title: string
    type: WorkoutType
    exercises: WorkoutExercise[]
    durationMin: number
  }) => Promise<void>
  defaultTitle?: string
  saving?: boolean
}

const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'full', 'cardio', 'other']

function emptySet(): WorkoutSet {
  return { reps: 10, weightKg: 0 }
}

function emptyExercise(name: string): WorkoutExercise {
  return { name, sets: [emptySet()] }
}

export function EntrenaLogModal({
  open,
  onClose,
  onSave,
  defaultTitle = 'Entrenamiento de hoy',
  saving = false,
}: EntrenaLogModalProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [type, setType] = useState<WorkoutType>('full')
  const [durationMin, setDurationMin] = useState(45)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [search, setSearch] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const suggestions = useMemo(() => filterExercises(search, 6), [search])

  if (!open) return null

  const addExercise = (name: string) => {
    if (exercises.some((e) => e.name === name)) return
    setExercises((prev) => [...prev, emptyExercise(name)])
    setSearch('')
    setShowPicker(false)
  }

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)),
            }
      )
    )
  }

  const addSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: [...ex.sets, { ...ex.sets[ex.sets.length - 1] }] }
      )
    )
  }

  const removeSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
      )
    )
  }

  const removeExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx))
  }

  const canSave = exercises.length > 0 && exercises.every((e) => e.sets.length > 0)

  const handleSave = async () => {
    if (!canSave || saving) return
    await onSave({ title: title.trim() || defaultTitle, type, exercises, durationMin })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#12121a] border border-[#2F2F35] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#FF671F]" />
            <div>
              <p className="text-sm font-black text-white">EntrenaLog</p>
              <p className="text-[10px] text-[#9CA3AF]">Registra tu rutina — se publica en el muro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-[#9CA3AF] active:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Nombre
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm"
              placeholder="Ej. Push con @socio"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Tipo
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-full font-bold transition ${
                    type === t
                      ? 'bg-[#FF671F] text-black'
                      : 'bg-white/5 text-[#9CA3AF] border border-white/10'
                  }`}
                >
                  {WORKOUT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Duración (min)
            </label>
            <input
              type="number"
              min={5}
              max={240}
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(5, Number(e.target.value) || 45))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
              Ejercicios
            </label>
            <div className="mt-1.5 relative">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setShowPicker(true)
                }}
                onFocus={() => setShowPicker(true)}
                placeholder="Buscar ejercicio…"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm"
              />
              {showPicker && (search || suggestions.length > 0) && (
                <ul className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-xl bg-[#1e1e28] border border-white/10 shadow-lg">
                  {(search ? suggestions : EXERCISE_LIBRARY.slice(0, 6)).map((ex) => (
                    <li key={ex.name}>
                      <button
                        type="button"
                        onClick={() => addExercise(ex.name)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 flex justify-between"
                      >
                        <span>{ex.name}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{ex.muscle}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {exercises.length === 0 ? (
            <p className="text-center text-sm text-[#9CA3AF] py-6">
              Añade al menos un ejercicio para guardar tu rutina.
            </p>
          ) : (
            <ul className="space-y-3">
              {exercises.map((ex, exIdx) => (
                <li
                  key={`${ex.name}-${exIdx}`}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{ex.name}</span>
                    <button
                      type="button"
                      onClick={() => removeExercise(exIdx)}
                      className="p-1 text-red-400/80 active:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-[#6B7280] font-bold">{setIdx + 1}</span>
                        <input
                          type="number"
                          min={0}
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, { reps: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="w-14 px-2 py-1 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
                          placeholder="reps"
                        />
                        <span className="text-[#6B7280]">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={set.weightKg}
                          onChange={(e) =>
                            updateSet(exIdx, setIdx, {
                              weightKg: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-16 px-2 py-1 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
                          placeholder="kg"
                        />
                        <span className="text-[#6B7280]">kg</span>
                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(exIdx, setIdx)}
                            className="ml-auto text-[#6B7280] active:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addSet(exIdx)}
                    className="mt-2 text-[10px] text-[#FF671F] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Añadir set
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/8 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-white/15 text-[#9CA3AF] font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSave || saving}
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#e85a10] text-black font-extrabold text-sm disabled:opacity-40"
          >
            {saving ? 'Guardando…' : 'Guardar y publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
