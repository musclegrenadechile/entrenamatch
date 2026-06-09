import { useEffect, useMemo, useState } from 'react'
import { Dumbbell, Plus, Trash2, X, Copy, Star, MapPin } from 'lucide-react'
import {
  EXERCISE_LIBRARY,
  WORKOUT_TYPE_LABELS,
  MUSCLE_GROUPS,
  filterExercises,
} from '../../data/exerciseLibrary'
import type { Workout, WorkoutExercise, WorkoutSet, WorkoutType } from '../../types'
import {
  BUILTIN_WORKOUT_TEMPLATES,
  cloneExercises,
  loadFavoriteTemplates,
  saveFavoriteTemplate,
  type WorkoutQuickTemplate,
  workoutToTemplate,
} from '../../utils/workoutTemplates'

export interface EntrenoDeHoyModalProps {
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
  initialExercises?: WorkoutExercise[]
  initialType?: WorkoutType
  initialDurationMin?: number
  lastWorkout?: Workout | null
  liveDurationMin?: number
  gymRoutineTemplates?: WorkoutQuickTemplate[]
  gymRoutineLabel?: string
}

/** @deprecated use EntrenoDeHoyModalProps */
export type EntrenaLogModalProps = EntrenoDeHoyModalProps

const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'full', 'cardio', 'other']

function emptySet(): WorkoutSet {
  return { reps: 10, weightKg: 0 }
}

function emptyExercise(name: string): WorkoutExercise {
  return { name, sets: [emptySet()] }
}

function SetInputs({
  set,
  setIdx,
  exIdx,
  canRemove,
  onUpdate,
  onRemove,
}: {
  set: WorkoutSet
  setIdx: number
  exIdx: number
  canRemove: boolean
  onUpdate: (exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) => void
  onRemove: (exIdx: number, setIdx: number) => void
}) {
  const [repsDraft, setRepsDraft] = useState(String(set.reps || ''))
  const [weightDraft, setWeightDraft] = useState(
    set.weightKg > 0 ? String(set.weightKg) : ''
  )

  useEffect(() => {
    setRepsDraft(String(set.reps || ''))
    setWeightDraft(set.weightKg > 0 ? String(set.weightKg) : '')
  }, [set.reps, set.weightKg])

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-[#6B7280] font-bold">{setIdx + 1}</span>
      <input
        type="text"
        inputMode="numeric"
        value={repsDraft}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          setRepsDraft(raw)
          onUpdate(exIdx, setIdx, { reps: raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0) })
        }}
        className="w-14 px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
        placeholder="reps"
        aria-label={`Reps set ${setIdx + 1}`}
      />
      <span className="text-[#6B7280]">×</span>
      <input
        type="text"
        inputMode="decimal"
        value={weightDraft}
        onChange={(e) => {
          const raw = e.target.value.replace(',', '.')
          if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return
          setWeightDraft(raw)
          if (raw === '' || raw === '.') {
            onUpdate(exIdx, setIdx, { weightKg: 0 })
            return
          }
          const n = parseFloat(raw)
          if (!Number.isNaN(n)) onUpdate(exIdx, setIdx, { weightKg: Math.max(0, n) })
        }}
        className="w-16 px-2 py-1.5 rounded-lg bg-[#1a1a22] border border-white/10 text-white text-center"
        placeholder="kg"
        aria-label={`Peso set ${setIdx + 1}`}
      />
      <span className="text-[#6B7280]">kg</span>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(exIdx, setIdx)}
          className="ml-auto text-[#6B7280] active:text-red-400 px-1"
          aria-label="Quitar set"
        >
          ×
        </button>
      )}
    </div>
  )
}

export function EntrenoDeHoyModal({
  open,
  onClose,
  onSave,
  defaultTitle = 'Entreno de hoy',
  saving = false,
  initialExercises,
  initialType,
  initialDurationMin,
  lastWorkout,
  liveDurationMin,
  gymRoutineTemplates = [],
  gymRoutineLabel,
}: EntrenoDeHoyModalProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [type, setType] = useState<WorkoutType>('full')
  const [durationMin, setDurationMin] = useState(45)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string | undefined>()
  const [showPicker, setShowPicker] = useState(false)
  const [favorites, setFavorites] = useState<WorkoutQuickTemplate[]>(() => loadFavoriteTemplates())

  useEffect(() => {
    if (!open) return
    setTitle(defaultTitle)
    setType(initialType || 'full')
    const dur =
      initialDurationMin ??
      (liveDurationMin && liveDurationMin >= 5 ? liveDurationMin : undefined) ??
      45
    setDurationMin(dur)
    setExercises(initialExercises?.length ? initialExercises.map((e) => ({ ...e, sets: [...e.sets] })) : [])
    setSearch('')
    setMuscleFilter(undefined)
    setShowPicker(false)
    setFavorites(loadFavoriteTemplates())
  }, [open, defaultTitle, initialExercises, initialType, initialDurationMin, liveDurationMin])

  const applyTemplate = (tpl: WorkoutQuickTemplate) => {
    setTitle(tpl.label)
    setType(tpl.type)
    setDurationMin(tpl.durationMin)
    setExercises(cloneExercises(tpl.exercises))
  }

  const quickTemplates = useMemo(() => {
    const items: WorkoutQuickTemplate[] = []
    if (lastWorkout?.exercises?.length) {
      items.push(workoutToTemplate(lastWorkout, 'Último entreno'))
    }
    for (const g of gymRoutineTemplates) {
      if (!items.some((t) => t.id === g.id)) items.push(g)
    }
    items.push(...favorites)
    for (const b of BUILTIN_WORKOUT_TEMPLATES) {
      if (!items.some((t) => t.id === b.id)) items.push(b)
    }
    return items.slice(0, 8)
  }, [lastWorkout, favorites, gymRoutineTemplates])

  const suggestions = useMemo(
    () => filterExercises(search, 14, muscleFilter),
    [search, muscleFilter]
  )

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
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        return {
          ...ex,
          sets: [...ex.sets, { reps: last?.reps || 10, weightKg: last?.weightKg || 0 }],
        }
      })
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
              <p className="text-sm font-black text-white">Entreno de Hoy</p>
              <p className="text-[10px] text-[#9CA3AF]">
                {EXERCISE_LIBRARY.length} ejercicios · registra sets en vivo
              </p>
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
          {gymRoutineLabel && gymRoutineTemplates.length > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[10px] text-[#22c55e]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                Rutina del gym · <strong className="text-white">{gymRoutineLabel}</strong>
              </span>
            </div>
          )}

          {quickTemplates.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                Inicio rápido
              </label>
              <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className={`shrink-0 text-[10px] px-2.5 py-1.5 rounded-full font-bold border active:bg-[#FF671F]/20 active:border-[#FF671F]/40 flex items-center gap-1 ${
                      tpl.id.startsWith('gym-')
                        ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30'
                        : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    {tpl.id.startsWith('gym-') ? (
                      <MapPin className="w-3 h-3" />
                    ) : tpl.id.startsWith('copy-') || tpl.id.startsWith('fav-') ? (
                      <Copy className="w-3 h-3 text-[#FF671F]" />
                    ) : null}
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
            <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setMuscleFilter(undefined)}
                className={`shrink-0 text-[9px] px-2 py-1 rounded-full font-bold ${
                  !muscleFilter ? 'bg-[#FF671F] text-black' : 'bg-white/5 text-[#9CA3AF]'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMuscleFilter(m === muscleFilter ? undefined : m)}
                  className={`shrink-0 text-[9px] px-2 py-1 rounded-full font-bold ${
                    muscleFilter === m ? 'bg-[#FF671F] text-black' : 'bg-white/5 text-[#9CA3AF]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
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
              {showPicker && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-[#1e1e28] border border-white/10 shadow-lg">
                  {suggestions.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-[#9CA3AF]">Sin resultados</li>
                  ) : (
                    suggestions.map((ex) => (
                      <li key={ex.name}>
                        <button
                          type="button"
                          onClick={() => addExercise(ex.name)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 flex justify-between gap-2"
                        >
                          <span>{ex.name}</span>
                          <span className="text-[10px] text-[#9CA3AF] shrink-0">{ex.muscle}</span>
                        </button>
                      </li>
                    ))
                  )}
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
                      <SetInputs
                        key={setIdx}
                        set={set}
                        setIdx={setIdx}
                        exIdx={exIdx}
                        canRemove={ex.sets.length > 1}
                        onUpdate={updateSet}
                        onRemove={removeSet}
                      />
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

        <div className="px-4 py-3 border-t border-white/8 shrink-0 space-y-2">
          {canSave && (
            <button
              type="button"
              onClick={() => {
                const next = saveFavoriteTemplate({
                  label: title.trim() || 'Mi rutina',
                  type,
                  durationMin,
                  exercises,
                })
                setFavorites(next)
              }}
              className="w-full py-2 rounded-xl border border-[#FFD700]/30 text-[10px] font-bold text-[#FFD700] flex items-center justify-center gap-1 active:bg-[#FFD700]/10"
            >
              <Star className="w-3.5 h-3.5" /> Guardar como favorita (máx. 3)
            </button>
          )}
          <div className="flex gap-2">
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
            {saving ? 'Guardando…' : 'Guardar entreno'}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** @deprecated use EntrenoDeHoyModal */
export const EntrenaLogModal = EntrenoDeHoyModal
