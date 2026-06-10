import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'

export type GymRestTimerMode = 'stopwatch' | 'countdown'

export type GymRestTimerRef = {
  startCountdown: (seconds?: number) => void
  startStopwatch: () => void
}

const REST_PRESETS_SEC = [45, 60, 90, 120, 180] as const
const REST_PRESET_KEY = 'entrenamatch_rest_preset'

function loadDefaultPreset(): number {
  try {
    const raw = localStorage.getItem(REST_PRESET_KEY)
    const n = raw ? parseInt(raw, 10) : 90
    return REST_PRESETS_SEC.includes(n as (typeof REST_PRESETS_SEC)[number]) ? n : 90
  } catch {
    return 90
  }
}

function saveDefaultPreset(sec: number): void {
  try {
    localStorage.setItem(REST_PRESET_KEY, String(sec))
  } catch {
    /* ignore */
  }
}

function formatRestMs(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatPresetLabel(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec % 60 === 0) return `${sec / 60}m`
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function buzzRestDone(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([180, 80, 180])
    }
  } catch {
    /* ignore */
  }
}

type GymRestTimerProps = {
  className?: string
}

export const GymRestTimer = forwardRef<GymRestTimerRef, GymRestTimerProps>(function GymRestTimer(
  { className = '' },
  ref
) {
  const [mode, setMode] = useState<GymRestTimerMode>('countdown')
  const [presetSec, setPresetSec] = useState(loadDefaultPreset)
  const [running, setRunning] = useState(false)
  const [doneFlash, setDoneFlash] = useState(false)
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null)
  /** Stopwatch: ms accumulated. Countdown: ms left when paused. */
  const [frozenMs, setFrozenMs] = useState(0)
  const [tick, setTick] = useState(0)

  const reset = () => {
    setRunning(false)
    setRunStartedAt(null)
    setFrozenMs(0)
    setDoneFlash(false)
  }

  const startCountdown = (seconds = presetSec) => {
    const sec = Math.max(5, Math.min(600, seconds))
    setMode('countdown')
    setPresetSec(sec)
    saveDefaultPreset(sec)
    setDoneFlash(false)
    setFrozenMs(sec * 1000)
    setRunStartedAt(Date.now())
    setRunning(true)
  }

  const startStopwatch = () => {
    setMode('stopwatch')
    setDoneFlash(false)
    setFrozenMs(0)
    setRunStartedAt(Date.now())
    setRunning(true)
  }

  useImperativeHandle(ref, () => ({
    startCountdown,
    startStopwatch,
  }))

  useEffect(() => {
    if (!running || !runStartedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 200)
    return () => clearInterval(id)
  }, [running, runStartedAt])

  useEffect(() => {
    if (!running || mode !== 'countdown' || !runStartedAt) return
    const elapsed = Date.now() - runStartedAt
    const remaining = frozenMs - elapsed
    if (remaining <= 0) {
      setRunning(false)
      setRunStartedAt(null)
      setFrozenMs(0)
      setDoneFlash(true)
      buzzRestDone()
      window.setTimeout(() => setDoneFlash(false), 2400)
    }
  }, [tick, running, mode, runStartedAt, frozenMs])

  void tick

  const isCountdownDone = mode === 'countdown' && doneFlash

  const displayMs = (() => {
    if (isCountdownDone) return 0
    if (mode === 'stopwatch') {
      if (running && runStartedAt) return frozenMs + (Date.now() - runStartedAt)
      return frozenMs
    }
    if (running && runStartedAt) return Math.max(0, frozenMs - (Date.now() - runStartedAt))
    return frozenMs > 0 ? frozenMs : presetSec * 1000
  })()

  const toggleRun = () => {
    if (!running) {
      if (mode === 'countdown') {
        if (frozenMs > 0 && frozenMs < presetSec * 1000) {
          setRunStartedAt(Date.now())
          setRunning(true)
        } else {
          startCountdown(presetSec)
        }
      } else if (frozenMs > 0) {
        setRunStartedAt(Date.now())
        setRunning(true)
      } else {
        startStopwatch()
      }
      return
    }
    if (!runStartedAt) return
    const elapsed = Date.now() - runStartedAt
    if (mode === 'stopwatch') {
      setFrozenMs((p) => p + elapsed)
    } else {
      setFrozenMs((p) => Math.max(0, p - elapsed))
    }
    setRunStartedAt(null)
    setRunning(false)
  }

  const canResume = !running && (mode === 'stopwatch' ? frozenMs > 0 : frozenMs > 0 && frozenMs < presetSec * 1000)

  return (
    <div className={`gym-rest-timer ${className}`.trim()}>
      <div className="gym-rest-timer-head">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
          <Timer className="w-3.5 h-3.5 text-[#FF671F]" />
          Descanso entre series
        </div>
        <div className="gym-rest-mode-toggle">
          <button
            type="button"
            className={mode === 'countdown' ? 'active' : ''}
            onClick={() => {
              setMode('countdown')
              reset()
            }}
          >
            Timer
          </button>
          <button
            type="button"
            className={mode === 'stopwatch' ? 'active' : ''}
            onClick={() => {
              setMode('stopwatch')
              reset()
            }}
          >
            Cronómetro
          </button>
        </div>
      </div>

      <div
        className={`gym-rest-display ${running ? 'running' : ''} ${isCountdownDone ? 'done' : ''}`}
        aria-live="polite"
      >
        {isCountdownDone ? '¡A entrenar!' : formatRestMs(displayMs)}
      </div>

      {mode === 'countdown' && (
        <div className="gym-rest-presets">
          {REST_PRESETS_SEC.map((sec) => (
            <button
              key={sec}
              type="button"
              className={presetSec === sec ? 'active' : ''}
              onClick={() => {
                setPresetSec(sec)
                saveDefaultPreset(sec)
                if (running) startCountdown(sec)
              }}
            >
              {formatPresetLabel(sec)}
            </button>
          ))}
        </div>
      )}

      <div className="gym-rest-controls">
        <button type="button" className="gym-rest-btn gym-rest-btn--primary" onClick={toggleRun}>
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? 'Pausar' : canResume ? 'Reanudar' : mode === 'countdown' ? 'Iniciar timer' : 'Iniciar'}
        </button>
        <button type="button" className="gym-rest-btn" onClick={reset} aria-label="Reiniciar">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
})
