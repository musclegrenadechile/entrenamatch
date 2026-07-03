import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Plus,
  Search,
  Timer,
  Trash2,
  X,
  Star,
  MapPin,
} from 'lucide-react'
import { GymRestTimer, type GymRestTimerRef } from './GymRestTimer'
import {
  WORKOUT_TYPE_LABELS,
  MUSCLE_GROUPS,
  countExercisesByMuscle,
  filterExercises,
  filterLibraryByMuscleTab,
  isTimedCardioExercise,
} from '../../data/exerciseLibrary'
import type { Workout, WorkoutExercise, WorkoutSet, WorkoutType } from '../../types'
import {
  clampIntensity,
  emptyCardioSet,
  emptyExerciseEntry,
  normalizeWorkoutExercise,
  normalizeWorkoutSet,
} from '../../utils/workoutSetFields'
import { GymSoundWorkoutBar } from '../music/GymSoundWorkoutBar'
import { PastWorkoutPicker } from './PastWorkoutPicker'
import { WorkoutVoiceDictationBar } from './WorkoutVoiceDictationBar'
import {
  BUILTIN_WORKOUT_TEMPLATES,
  cloneExercises,
  loadFavoriteTemplates,
  saveFavoriteTemplate,
  type WorkoutQuickTemplate,
  workoutToTemplate,
} from '../../utils/workoutTemplates'
import {
  allowWorkoutDraftPersistence,
  clearWorkoutDraft,
  elapsedWorkoutMinutes,
  loadRecentExerciseNames,
  loadWorkoutDraft,
  pushRecentExerciseNames,
  resolveDraftStartedAt,
  saveWorkoutDraft,
} from '../../utils/workoutDraft'
import { formatWorkoutDraftRecoveredMessage } from '../../utils/workoutDraftRecoveredCopy'
import {
  buildGymLogSearchEmptyMessage,
  shouldShowGymLogSearchEmpty,
  shouldShowGymLogSuggestions,
} from '../../utils/gymLogSearchDisplay'
import { buildExerciseSetSummary, isGymLogSetComplete } from '../../utils/gymLogSetDisplay'
import { useCompactMobile } from '../../hooks/useCompactMobile'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'

export interface EntrenoDeHoyModalProps {
  open: boolean
  onClose: () => void
  /** Minimiza la sesión — borrador queda activo y aparece el gadget flotante. */
  onMinimize?: () => void
  onSave: (payload: {
    title: string
    type: WorkoutType
    exercises: WorkoutExercise[]
    durationMin: number
  }) => Promise<void>
  userId?: string | null
  /** When true (copy/repeat), ignore stored draft */
  skipDraftRestore?: boolean
  /** Descarta borrador activo y cierra la sesión */
  onDiscardSession?: () => void
  defaultTitle?: string
  saving?: boolean
  initialExercises?: WorkoutExercise[]
  initialType?: WorkoutType
  initialDurationMin?: number
  /** Entrenos recientes del usuario — para repetir desde historial */
  recentWorkouts?: Workout[]
  /** Abre el selector de historial al entrar (p. ej. desde Reto del día) */
  expandPastWorkouts?: boolean
  liveDurationMin?: number
  gymRoutineTemplates?: WorkoutQuickTemplate[]
  gymRoutineLabel?: string
  /** Partner name when logging from chat — workout is sent on save */
  shareToChatName?: string
  /** GymSound — connect / share while logging exercises */
  gymSoundUser?: import('../../types').Profile
  isLive?: boolean
  onGymSoundSave?: (user: import('../../types').Profile) => void | Promise<void>
}

/** @deprecated use EntrenoDeHoyModalProps */
export type EntrenaLogModalProps = EntrenoDeHoyModalProps

const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'full', 'cardio', 'other']

function formatTimer(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function CardioSetInputs({
  exerciseName,
  set,
  setIdx,
  exIdx,
  canRemove,
  onUpdate,
  onRemove,
}: {
  exerciseName: string
  set: WorkoutSet
  setIdx: number
  exIdx: number
  canRemove: boolean
  onUpdate: (exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) => void
  onRemove: (exIdx: number, setIdx: number) => void
}) {
  const normalized = normalizeWorkoutSet(exerciseName, set)
  const [minutesDraft, setMinutesDraft] = useState(String(normalized.minutesMin || ''))
  const [intensityDraft, setIntensityDraft] = useState(
    normalized.intensity ? String(normalized.intensity) : ''
  )

  useEffect(() => {
    const n = normalizeWorkoutSet(exerciseName, set)
    setMinutesDraft(String(n.minutesMin || ''))
    setIntensityDraft(n.intensity ? String(n.intensity) : '')
  }, [exerciseName, set.minutesMin, set.intensity, set.reps])

  const done = isGymLogSetComplete(exerciseName, set)

  return (
    <div className={`gym-log-set-row${done ? ' gym-log-set-row--done' : ''}`}>
      <span className="gym-log-set-num">{setIdx + 1}</span>
      <input
        type="text"
        inputMode="numeric"
        value={minutesDraft}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          setMinutesDraft(raw)
          onUpdate(exIdx, setIdx, {
            minutesMin: raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0),
            reps: 0,
            weightKg: 0,
          })
        }}
        className="gym-log-set-input"
        placeholder="min"
        aria-label={`Minutos intervalo ${setIdx + 1}`}
      />
      <span className="gym-log-set-unit">min</span>
      <input
        type="text"
        inputMode="numeric"
        value={intensityDraft}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          setIntensityDraft(raw)
          if (raw === '') {
            onUpdate(exIdx, setIdx, { intensity: 0, reps: 0, weightKg: 0 })
            return
          }
          onUpdate(exIdx, setIdx, {
            intensity: clampIntensity(parseInt(raw, 10) || 0),
            reps: 0,
            weightKg: 0,
          })
        }}
        className="gym-log-set-input"
        placeholder="1-10"
        aria-label={`Intensidad intervalo ${setIdx + 1}`}
      />
      {canRemove && (
        <button type="button" onClick={() => onRemove(exIdx, setIdx)} className="gym-log-set-remove" aria-label="Quitar">
          ×
        </button>
      )}
    </div>
  )
}

function SetInputs({
  exerciseName,
  set,
  setIdx,
  exIdx,
  canRemove,
  onUpdate,
  onRemove,
}: {
  exerciseName: string
  set: WorkoutSet
  setIdx: number
  exIdx: number
  canRemove: boolean
  onUpdate: (exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) => void
  onRemove: (exIdx: number, setIdx: number) => void
}) {
  const [repsDraft, setRepsDraft] = useState(String(set.reps || ''))
  const [weightDraft, setWeightDraft] = useState(set.weightKg > 0 ? String(set.weightKg) : '')

  useEffect(() => {
    setRepsDraft(String(set.reps || ''))
    setWeightDraft(set.weightKg > 0 ? String(set.weightKg) : '')
  }, [set.reps, set.weightKg])

  const done = isGymLogSetComplete(exerciseName, set)

  return (
    <div className={`gym-log-set-row${done ? ' gym-log-set-row--done' : ''}`}>
      <span className="gym-log-set-num">{setIdx + 1}</span>
      <input
        type="text"
        inputMode="numeric"
        value={repsDraft}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          setRepsDraft(raw)
          onUpdate(exIdx, setIdx, { reps: raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0) })
        }}
        className="gym-log-set-input"
        placeholder="reps"
        aria-label={`Reps set ${setIdx + 1}`}
      />
      <span className="gym-log-set-unit">×</span>
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
        className="gym-log-set-input gym-log-set-input--wide"
        placeholder="kg"
        aria-label={`Peso set ${setIdx + 1}`}
      />
      {canRemove && (
        <button type="button" onClick={() => onRemove(exIdx, setIdx)} className="gym-log-set-remove" aria-label="Quitar">
          ×
        </button>
      )}
    </div>
  )
}

export function EntrenoDeHoyModal({
  open,
  onClose,
  onMinimize,
  onSave,
  userId = null,
  skipDraftRestore = false,
  onDiscardSession,
  defaultTitle = 'Entreno de hoy',
  saving = false,
  initialExercises,
  initialType,
  initialDurationMin,
  recentWorkouts = [],
  expandPastWorkouts = false,
  liveDurationMin,
  gymRoutineTemplates = [],
  gymRoutineLabel,
  shareToChatName,
  gymSoundUser,
  isLive = false,
  onGymSoundSave,
}: EntrenoDeHoyModalProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [type, setType] = useState<WorkoutType>('full')
  const [durationMin, setDurationMin] = useState(45)
  const [durationTouched, setDurationTouched] = useState(false)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState<string | undefined>()
  const [showPicker, setShowPicker] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [draftRecovered, setDraftRecovered] = useState(false)
  const [timerWasReset, setTimerWasReset] = useState(false)
  const [pastWorkoutsOpen, setPastWorkoutsOpen] = useState(false)
  /** Oleada 347 — biblioteca colapsada cuando ya hay ejercicios en sesión */
  const [libraryOpen, setLibraryOpen] = useState(true)
  const [extrasOpen, setExtrasOpen] = useState(false)
  const [footerExpanded, setFooterExpanded] = useState(false)
  const compactMobile = useCompactMobile()
  const [tick, setTick] = useState(0)
  const [favorites, setFavorites] = useState<WorkoutQuickTemplate[]>(() => loadFavoriteTemplates())
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const restTimerRef = useRef<GymRestTimerRef>(null)
  /** Evita que flushDraft en cleanup re-guarde tras descartar sesión. */
  const persistDraftRef = useRef(true)

  const buildDraft = useCallback(
    () => ({
      title,
      type,
      durationMin,
      exercises,
      startedAt,
      updatedAt: Date.now(),
    }),
    [title, type, durationMin, exercises, startedAt]
  )

  const flushDraft = useCallback(() => {
    if (!persistDraftRef.current || !userId || !exercises.length) return
    saveWorkoutDraft(userId, buildDraft())
  }, [userId, exercises.length, buildDraft])

  const applyState = useCallback(
    (opts: {
      title: string
      type: WorkoutType
      durationMin: number
      exercises: WorkoutExercise[]
      startedAt: number | null
    }) => {
      setTitle(opts.title)
      setType(opts.type)
      setDurationMin(opts.durationMin)
      setExercises(opts.exercises.map((e) => normalizeWorkoutExercise({ ...e, sets: [...e.sets] })))
      setStartedAt(opts.startedAt)
      setDurationTouched(false)
      setSearch('')
      setMuscleFilter(undefined)
      setShowPicker(false)
      setDetailsOpen(false)
      setFavorites(loadFavoriteTemplates())
    },
    []
  )

  useEffect(() => {
    if (!open) return
    persistDraftRef.current = true

    if (skipDraftRestore) {
      if (userId) allowWorkoutDraftPersistence(userId)
      const dur =
        initialDurationMin ??
        (liveDurationMin && liveDurationMin >= 5 ? liveDurationMin : undefined) ??
        45
      applyState({
        title: defaultTitle,
        type: initialType || 'full',
        durationMin: dur,
        exercises: initialExercises?.length
          ? initialExercises.map((e) => normalizeWorkoutExercise({ ...e, sets: [...e.sets] }))
          : [],
        startedAt: initialExercises?.length ? Date.now() : null,
      })
      setDraftRecovered(false)
      setTimerWasReset(false)
      return
    }

    const stored = userId ? loadWorkoutDraft(userId) : null
    if (stored?.exercises?.length) {
      if (userId) allowWorkoutDraftPersistence(userId)
      const { startedAt: resolvedStart, timerReset } = resolveDraftStartedAt(stored)
      applyState({
        title: stored.title || defaultTitle,
        type: stored.type || 'full',
        durationMin: stored.durationMin || 45,
        exercises: stored.exercises,
        startedAt: resolvedStart,
      })
      setDraftRecovered(true)
      setTimerWasReset(timerReset)
      return
    }

    if (userId) allowWorkoutDraftPersistence(userId)
    const dur =
      initialDurationMin ??
      (liveDurationMin && liveDurationMin >= 5 ? liveDurationMin : undefined) ??
      45
    applyState({
      title: defaultTitle,
      type: initialType || 'full',
      durationMin: dur,
      exercises: initialExercises?.length
        ? initialExercises.map((e) => normalizeWorkoutExercise({ ...e, sets: [...e.sets] }))
        : [],
      startedAt: null,
    })
    setDraftRecovered(false)
    setTimerWasReset(false)
  }, [
    open,
    skipDraftRestore,
    userId,
    defaultTitle,
    initialExercises,
    initialType,
    initialDurationMin,
    liveDurationMin,
    applyState,
  ])

  useEffect(() => {
    if (!open) {
      setPastWorkoutsOpen(false)
      setLibraryOpen(true)
      setExtrasOpen(false)
      return
    }
    if (expandPastWorkouts && recentWorkouts.some((w) => w.exercises?.length)) {
      setPastWorkoutsOpen(true)
      setExtrasOpen(true)
    }
  }, [open, expandPastWorkouts, recentWorkouts])

  useEffect(() => {
    if (exercises.length === 0) {
      setLibraryOpen(true)
    } else if (exercises.length === 1) {
      setLibraryOpen(false)
      setShowPicker(false)
    }
  }, [exercises.length])

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!open || !userId || !exercises.length) return
    const t = window.setTimeout(flushDraft, 350)
    return () => clearTimeout(t)
  }, [open, userId, title, type, durationMin, exercises, startedAt, flushDraft])

  useEffect(() => {
    if (!open || !userId) return
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushDraft()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flushDraft)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flushDraft)
      flushDraft()
    }
  }, [open, userId, flushDraft])

  useEffect(() => {
    if (!open || exercises.length === 0) {
      void wakeLockRef.current?.release()
      wakeLockRef.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        /* unsupported or denied */
      }
      if (cancelled) void wakeLockRef.current?.release()
    })()
    return () => {
      cancelled = true
      void wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [open, exercises.length])

  const applyTemplate = (tpl: WorkoutQuickTemplate) => {
    applyState({
      title: tpl.label,
      type: tpl.type,
      durationMin: tpl.durationMin,
      exercises: cloneExercises(tpl.exercises).map(normalizeWorkoutExercise),
      startedAt: Date.now(),
    })
    setDraftRecovered(false)
    setTimerWasReset(false)
  }

  const handleDiscardSession = () => {
    if (!exercises.length) return
    if (!window.confirm('¿Descartar esta sesión? Se borrará el borrador y el cronómetro.')) return
    persistDraftRef.current = false
    if (userId) clearWorkoutDraft(userId)
    applyState({
      title: defaultTitle,
      type: 'full',
      durationMin: 45,
      exercises: [],
      startedAt: null,
    })
    setDraftRecovered(false)
    setTimerWasReset(false)
    if (onDiscardSession) onDiscardSession()
    else onClose()
  }

  const repeatFromWorkout = (w: Workout) => {
    applyTemplate(workoutToTemplate(w, `Repetir · ${w.title}`))
    setPastWorkoutsOpen(false)
  }

  const quickTemplates = useMemo(() => {
    const items: WorkoutQuickTemplate[] = []
    for (const g of gymRoutineTemplates) {
      if (!items.some((t) => t.id === g.id)) items.push(g)
    }
    items.push(...favorites)
    for (const b of BUILTIN_WORKOUT_TEMPLATES) {
      if (!items.some((t) => t.id === b.id)) items.push(b)
    }
    return items.slice(0, 6)
  }, [favorites, gymRoutineTemplates])

  const quickExerciseNames = useMemo(() => {
    const names: string[] = []
    const source = recentWorkouts.find((w) => w.exercises?.length)
    if (source?.exercises?.length) {
      for (const ex of source.exercises) {
        if (!names.includes(ex.name)) names.push(ex.name)
      }
    }
    if (userId) {
      for (const n of loadRecentExerciseNames(userId)) {
        if (!names.includes(n)) names.push(n)
      }
    }
    return names.slice(0, 8)
  }, [recentWorkouts, userId, open])

  const suggestionLimit = search.trim() ? 32 : muscleFilter ? 48 : 20
  const suggestions = useMemo(
    () => filterExercises(search, suggestionLimit, muscleFilter),
    [search, muscleFilter, suggestionLimit]
  )

  const muscleBrowse = useMemo(
    () => (muscleFilter && !search.trim() ? filterLibraryByMuscleTab(muscleFilter) : []),
    [muscleFilter, search]
  )

  const timerLabel = startedAt ? formatTimer(Date.now() - startedAt) : null
  void tick

  if (!open) return null

  const addExercise = (name: string) => {
    if (exercises.some((e) => e.name === name)) return
    setExercises((prev) => [...prev, emptyExerciseEntry(name)])
    if (!startedAt) setStartedAt(Date.now())
    setSearch('')
    setShowPicker(false)
    setLibraryOpen(false)
  }

  const openLibrary = () => {
    setLibraryOpen(true)
    setShowPicker(true)
    window.setTimeout(() => searchRef.current?.focus(), 50)
  }

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<WorkoutSet>) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) }
      )
    )
  }

  const startRestAfterSet = () => {
    restTimerRef.current?.startCountdown()
  }

  const addSet = (exIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex
        const last = ex.sets[ex.sets.length - 1]
        if (isTimedCardioExercise(ex.name)) {
          const base = last ? normalizeWorkoutSet(ex.name, last) : emptyCardioSet()
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                reps: 0,
                weightKg: 0,
                minutesMin: base.minutesMin || 15,
                intensity: base.intensity || 6,
              },
            ],
          }
        }
        return { ...ex, sets: [...ex.sets, { reps: last?.reps || 10, weightKg: last?.weightKg || 0 }] }
      })
    )
    startRestAfterSet()
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

  const resolveDurationMin = (): number => {
    if (!durationTouched && startedAt) {
      return Math.min(240, Math.max(5, elapsedWorkoutMinutes(startedAt)))
    }
    return Math.min(240, Math.max(5, durationMin))
  }

  const handleSave = async () => {
    if (!canSave || saving) return
    const dur = resolveDurationMin()
    if (userId) {
      pushRecentExerciseNames(
        userId,
        exercises.map((e) => e.name)
      )
      clearWorkoutDraft(userId)
    }
    await onSave({
      title: title.trim() || defaultTitle,
      type,
      exercises,
      durationMin: dur,
    })
  }

  const handleDismiss = () => {
    if (exercises.length > 0) {
      const at = startedAt ?? Date.now()
      if (userId) {
        saveWorkoutDraft(userId, {
          title,
          type,
          durationMin,
          exercises,
          startedAt: at,
          updatedAt: Date.now(),
        })
      }
      if (onMinimize) onMinimize()
      else onClose()
      return
    }
    onClose()
  }

  const showExtrasPanel =
    (gymSoundUser && onGymSoundSave) ||
    recentWorkouts.some((w) => w.exercises?.length) ||
    shareToChatName ||
    (gymRoutineLabel && gymRoutineTemplates.length > 0)

  const useCompactFooter = compactMobile && exercises.length > 0 && !footerExpanded

  const modal = (
    <div className="em-visual-v2 em-v2-workout gym-log-overlay">
      <div className="gym-log-sheet">
        <header className="gym-log-header em-v2-workout__header">
          <button
            type="button"
            onClick={handleDismiss}
            className="gym-log-icon-btn em-v2-workout__icon-btn"
            aria-label={exercises.length > 0 ? 'Minimizar sesión' : 'Cerrar'}
          >
            {exercises.length > 0 ? <ChevronDown className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="em-v2-workout__title">Entreno de Hoy</p>
            <p className="em-v2-workout__sub">
              {exercises.length === 0
                ? 'Registra series mientras entrenas'
                : `${exercises.length} ejercicio${exercises.length !== 1 ? 's' : ''} · autosave activo`}
            </p>
          </div>
          {timerLabel && (
            <div className="gym-log-timer em-v2-workout__timer" title="Tiempo de sesión">
              <Clock className="w-3.5 h-3.5" />
              {timerLabel}
            </div>
          )}
        </header>

        <div className="gym-log-body">
          {draftRecovered && (
            <div className="em-v2-draft-recovered" role="status">
              <span className="em-v2-draft-recovered__text">
                {formatWorkoutDraftRecoveredMessage(timerWasReset)}
              </span>
              {onDiscardSession && (
                <button
                  type="button"
                  onClick={handleDiscardSession}
                  className="em-v2-draft-recovered__discard"
                >
                  Descartar
                </button>
              )}
            </div>
          )}

          {exercises.length === 0 && shareToChatName && (
            <div className="gym-log-share-chat">
              Se enviará a <strong>{shareToChatName}</strong> al terminar
            </div>
          )}

          {exercises.length === 0 && gymRoutineLabel && gymRoutineTemplates.length > 0 && (
            <div className="gym-log-gym-badge">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              Rutina de <strong>{gymRoutineLabel}</strong>
            </div>
          )}

          {exercises.length === 0 && gymSoundUser && onGymSoundSave && (
            <GymSoundWorkoutBar
              currentUser={gymSoundUser}
              isLive={isLive}
              saveUser={onGymSoundSave}
            />
          )}

          {exercises.length === 0 && (
            <PastWorkoutPicker
              workouts={recentWorkouts}
              open={pastWorkoutsOpen}
              onToggle={() => setPastWorkoutsOpen((v) => !v)}
              onSelect={repeatFromWorkout}
            />
          )}

          {exercises.length > 0 && showExtrasPanel && (
            <button
              type="button"
              onClick={() => setExtrasOpen((v) => !v)}
              className={`em-v2-workout-more-toggle ${extrasOpen ? 'em-v2-workout-more-toggle--open' : ''}`}
              aria-expanded={extrasOpen}
            >
              <span>{extrasOpen ? 'Menos opciones' : 'Más opciones'}</span>
              {extrasOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {exercises.length > 0 && extrasOpen && (
            <div className="em-v2-workout-extras">
              {shareToChatName && (
                <div className="gym-log-share-chat">
                  Se enviará a <strong>{shareToChatName}</strong> al terminar
                </div>
              )}

              {gymRoutineLabel && gymRoutineTemplates.length > 0 && (
                <div className="gym-log-gym-badge">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  Rutina de <strong>{gymRoutineLabel}</strong>
                </div>
              )}

              {gymSoundUser && onGymSoundSave && (
                <GymSoundWorkoutBar
                  currentUser={gymSoundUser}
                  isLive={isLive}
                  saveUser={onGymSoundSave}
                />
              )}

              <PastWorkoutPicker
                workouts={recentWorkouts}
                open={pastWorkoutsOpen}
                onToggle={() => setPastWorkoutsOpen((v) => !v)}
                onSelect={repeatFromWorkout}
              />
            </div>
          )}

          <WorkoutVoiceDictationBar
            enabled={!!userId}
            recentExerciseNames={quickExerciseNames}
            onApply={(payload) => {
              const merged =
                payload.exercises.length > 0
                  ? exercises.length > 0
                    ? [...exercises, ...payload.exercises.map((e) => normalizeWorkoutExercise({ ...e, sets: [...e.sets] }))]
                    : payload.exercises.map((e) => normalizeWorkoutExercise({ ...e, sets: [...e.sets] }))
                  : exercises
              const at = startedAt ?? Date.now()
              applyState({
                title: payload.title || title,
                type: payload.type,
                durationMin: payload.durationMin,
                exercises: merged,
                startedAt: at,
              })
              setDurationTouched(true)
              if (!startedAt) setStartedAt(at)
            }}
          />

          {exercises.length > 0 && !libraryOpen && (
            <button type="button" onClick={openLibrary} className="em-v2-workout-library-toggle">
              <Search className="w-4 h-4" aria-hidden />
              Añadir otro ejercicio
            </button>
          )}

          {libraryOpen && (
            <div className="em-v2-workout-library">
              {quickExerciseNames.length > 0 && (
                <div className="gym-log-quick em-v2-workout-library__quick">
                  <p className="gym-log-quick-label em-v2-workout-library__label">Añadir rápido</p>
                  <div className="gym-log-quick-row em-v2-workout-library__chips">
                    {quickExerciseNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        disabled={exercises.some((e) => e.name === name)}
                        onClick={() => addExercise(name)}
                        className="gym-log-quick-chip"
                      >
                        + {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="gym-log-muscle-filters em-v2-workout-library__filters">
                <button
                  type="button"
                  onClick={() => {
                    setMuscleFilter(undefined)
                    setShowPicker(true)
                  }}
                  className={`gym-log-muscle-chip ${!muscleFilter ? 'active' : ''}`}
                >
                  Todos
                </button>
                {MUSCLE_GROUPS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMuscleFilter(m === muscleFilter ? undefined : m)
                      setShowPicker(true)
                    }}
                    className={`gym-log-muscle-chip ${muscleFilter === m ? 'active' : ''}`}
                  >
                    {m}
                    <span className="gym-log-muscle-count">{countExercisesByMuscle(m)}</span>
                  </button>
                ))}
              </div>

              <div className="gym-log-search-wrap em-v2-workout__search">
                <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setShowPicker(true)
                  }}
                  onFocus={() => setShowPicker(true)}
                  placeholder={muscleFilter ? `Buscar en ${muscleFilter}…` : 'Buscar ejercicio…'}
                  className="gym-log-search"
                />
                {showPicker && shouldShowGymLogSuggestions(search, suggestions.length) && (
                  <ul className="gym-log-suggestions">
                    {suggestions.map((ex) => (
                      <li key={ex.name}>
                        <button type="button" onClick={() => addExercise(ex.name)} className="gym-log-suggestion-item">
                          <span>{ex.name}</span>
                          <span className="text-[11px] text-[#9CA3AF]">{ex.muscle}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {showPicker && shouldShowGymLogSearchEmpty(search, suggestions.length) && (
                  <div className="gym-log-search-empty em-v2-gym-search-empty" role="status">
                    <p>{buildGymLogSearchEmptyMessage(search, muscleFilter)}</p>
                    <p className="em-v2-gym-search-empty__hint">Prueba otro nombre o cambia el filtro de músculo</p>
                  </div>
                )}
              </div>

              {muscleBrowse.length > 0 && (
                <div className="gym-log-browse em-v2-workout-library__browse">
                  <p className="gym-log-quick-label em-v2-workout-library__label">
                    {muscleFilter} · {muscleBrowse.length} ejercicios
                  </p>
                  <ul className="gym-log-browse-list">
                    {muscleBrowse.map((ex) => (
                      <li key={ex.name}>
                        <button
                          type="button"
                          disabled={exercises.some((e) => e.name === ex.name)}
                          onClick={() => addExercise(ex.name)}
                          className="gym-log-browse-item"
                        >
                          <span>{ex.name}</span>
                          <Plus className="w-3.5 h-3.5 shrink-0 text-[#FF671F]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {quickTemplates.length > 0 && exercises.length === 0 && (
                <div className="gym-log-templates em-v2-workout-library__templates">
                  <p className="gym-log-quick-label em-v2-workout-library__label">Plantillas</p>
                  <div className="gym-log-quick-row em-v2-workout-library__chips">
                    {quickTemplates.map((tpl) => (
                      <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)} className="gym-log-tpl-chip">
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {exercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setLibraryOpen(false)
                    setShowPicker(false)
                    setSearch('')
                  }}
                  className="em-v2-workout-library-close"
                >
                  Listo — volver a la sesión
                </button>
              )}
            </div>
          )}

          {exercises.length === 0 && libraryOpen ? (
            <div className="em-v2-workout-empty">
              <EmV2EmptyState
                compact
                emoji="🏋️"
                title="Empieza ahora"
                body="Toca un ejercicio arriba o búscalo. Registra cada serie entre descansos."
              />
            </div>
          ) : exercises.length > 0 ? (
            <ul className="gym-log-exercises">
              {exercises.map((ex, exIdx) => (
                <li key={`${ex.name}-${exIdx}`} className="gym-log-exercise-card em-v2-workout-exercise">
                  <div className="gym-log-exercise-head">
                    <div className="gym-log-exercise-head-main min-w-0">
                      <span className="gym-log-exercise-name">{ex.name}</span>
                      <span className="gym-log-exercise-summary">{buildExerciseSetSummary(ex.name, ex.sets)}</span>
                    </div>
                    <button type="button" onClick={() => removeExercise(exIdx)} className="text-red-400/80 p-1 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="gym-log-set-headers" aria-hidden>
                    <span className="gym-log-set-headers__spacer" />
                    {isTimedCardioExercise(ex.name) ? (
                      <>
                        <span>min</span>
                        <span className="gym-log-set-headers__gap" />
                        <span>int.</span>
                      </>
                    ) : (
                      <>
                        <span>reps</span>
                        <span className="gym-log-set-headers__gap" />
                        <span>kg</span>
                      </>
                    )}
                  </div>
                  <div className="gym-log-sets">
                    {ex.sets.map((set, setIdx) =>
                      isTimedCardioExercise(ex.name) ? (
                        <CardioSetInputs
                          key={setIdx}
                          exerciseName={ex.name}
                          set={set}
                          setIdx={setIdx}
                          exIdx={exIdx}
                          canRemove={ex.sets.length > 1}
                          onUpdate={updateSet}
                          onRemove={removeSet}
                        />
                      ) : (
                        <SetInputs
                          key={setIdx}
                          exerciseName={ex.name}
                          set={set}
                          setIdx={setIdx}
                          exIdx={exIdx}
                          canRemove={ex.sets.length > 1}
                          onUpdate={updateSet}
                          onRemove={removeSet}
                        />
                      )
                    )}
                  </div>
                  <div className="gym-log-set-actions">
                    <button type="button" onClick={() => addSet(exIdx)} className="gym-log-add-set">
                      <Plus className="w-3.5 h-3.5" />
                      {isTimedCardioExercise(ex.name) ? 'Otro intervalo' : 'Otra serie'}
                    </button>
                    <button
                      type="button"
                      onClick={startRestAfterSet}
                      className="gym-log-rest-btn"
                      title="Cronometrar descanso"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      Descanso
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="gym-log-details-toggle"
          >
            {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Detalles del entreno
            {!durationTouched && startedAt && (
              <span className="text-[#9CA3AF] font-normal ml-1">
                · {resolveDurationMin()} min auto
              </span>
            )}
          </button>

          {detailsOpen && (
            <div className="gym-log-details space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="gym-log-field"
                placeholder="Nombre del entreno"
              />
              <div className="em-v2-workout-library__types">
                {WORKOUT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`gym-log-type-chip ${type === t ? 'active' : ''}`}
                  >
                    {WORKOUT_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <label className="text-[10px] text-[#9CA3AF] font-bold uppercase">Duración (min)</label>
              <input
                type="text"
                inputMode="numeric"
                value={String(durationMin)}
                onChange={(e) => {
                  setDurationTouched(true)
                  const raw = e.target.value.replace(/\D/g, '')
                  if (raw === '') return
                  const n = parseInt(raw, 10)
                  if (!Number.isNaN(n)) setDurationMin(Math.min(240, n))
                }}
                className="gym-log-field"
              />
            </div>
          )}
        </div>

        {exercises.length > 0 && (
          <GymRestTimer ref={restTimerRef} className="em-v2-rest-timer--dock" />
        )}

        <footer
          className={`gym-log-footer em-v2-workout__footer ${useCompactFooter ? 'em-v2-workout__footer--compact' : ''}`}
        >
          {useCompactFooter ? (
            <div className="em-v2-workout__footer-compact">
              <button
                type="button"
                onClick={openLibrary}
                className="em-v2-workout__footer-icon"
                aria-label="Añadir ejercicio"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={!canSave || saving}
                onClick={handleSave}
                className="gym-log-save em-v2-workout__save em-v2-workout__save--compact"
              >
                {saving
                  ? 'Guardando…'
                  : shareToChatName
                    ? 'Terminar y compartir'
                    : 'Terminar y publicar'}
              </button>
              <button
                type="button"
                onClick={() => setFooterExpanded(true)}
                className="em-v2-workout__footer-icon"
                aria-label="Más acciones"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              {compactMobile && exercises.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFooterExpanded(false)}
                  className="em-v2-workout__footer-collapse"
                  aria-label="Ocultar acciones"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Menos</span>
                </button>
              )}
              <button
                type="button"
                onClick={openLibrary}
                className="gym-log-add-exercise em-v2-workout__add-btn"
              >
                <Plus className="w-5 h-5" />
                Añadir ejercicio
              </button>
              <div className="flex gap-2 items-center">
                {exercises.length > 0 && onDiscardSession && (
                  <button
                    type="button"
                    onClick={handleDiscardSession}
                    className="gym-log-discard-btn"
                    title="Descartar sesión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {canSave && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = saveFavoriteTemplate({
                        label: title.trim() || 'Mi rutina',
                        type,
                        durationMin: resolveDurationMin(),
                        exercises,
                      })
                      setFavorites(next)
                    }}
                    className="gym-log-fav-btn"
                    title="Guardar como favorita"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  className="gym-log-save em-v2-workout__save"
                >
                  {saving
                    ? 'Guardando…'
                    : shareToChatName
                      ? 'Terminar y compartir'
                      : 'Terminar y publicar'}
                </button>
              </div>
            </>
          )}
        </footer>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal
}

/** @deprecated use EntrenoDeHoyModal */
export const EntrenaLogModal = EntrenoDeHoyModal
