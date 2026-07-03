import { Mic, Square, Loader2, Check, X, RotateCcw, Settings } from 'lucide-react'
import { useEffect } from 'react'

import { useWorkoutVoiceDictation } from '../../hooks/useWorkoutVoiceDictation'

import { openMicrophoneAppSettings } from '../../utils/microphoneAccess'
import { prewarmWorkoutVoicePipeline } from '../../utils/workoutVoiceWarmup'

import { applyWorkoutVoiceParse } from '../../utils/workoutVoiceApply'

import type { WorkoutExercise, WorkoutType } from '../../types'



export type WorkoutVoiceDictationBarProps = {

  enabled: boolean

  recentExerciseNames?: string[]

  onApply: (payload: {

    title: string

    type: WorkoutType

    durationMin: number

    exercises: WorkoutExercise[]

  }) => void

  onHaptic?: (kind: 'light' | 'medium' | 'success') => void

}



export function WorkoutVoiceDictationBar({

  enabled,

  recentExerciseNames = [],

  onApply,

  onHaptic,

}: WorkoutVoiceDictationBarProps) {

  useEffect(() => {
    if (!enabled) return
    void prewarmWorkoutVoicePipeline()
  }, [enabled])

  const voice = useWorkoutVoiceDictation({ recentExerciseNames, onHaptic })



  if (!enabled) {

    return (

      <div className="gym-log-voice gym-log-voice--disabled">

        <Mic className="w-4 h-4 opacity-40" />

        <span>Dictado por voz disponible con cuenta real</span>

      </div>

    )

  }



  if (voice.phase === 'idle') {

    return (

      <button

        type="button"

        className="gym-log-voice gym-log-voice--tap"

        onClick={() => void voice.startRecording()}

      >

        <span className="gym-log-voice__mic" aria-hidden="true">

          <Mic className="w-5 h-5" />

        </span>

        <div className="gym-log-voice__copy text-left">

          <p className="gym-log-voice__title">Dictar entreno</p>

          <p className="gym-log-voice__hint">
            Toca, di tu rutina clara y toca PARAR — ej. &quot;Press banca 3×8 a 80 kg, dominadas 4×10, 45 min&quot;
          </p>

        </div>

      </button>

    )

  }



  if (voice.phase === 'recording') {

    return (

      <div className="gym-log-voice gym-log-voice--recording">

        <span className="gym-log-voice__dot" />

        <div className="gym-log-voice__copy flex-1">

          <p className="gym-log-voice__title text-red-400">

            {voice.captureMode === 'audio'
              ? 'Grabando audio…'
              : voice.captureMode === 'stt' || voice.liveTranscript
                ? 'Escuchando…'
                : 'Preparando micrófono…'}{' '}
            {voice.recordingSec > 0 ? `${voice.recordingSec}s` : ''}

          </p>

          {voice.liveTranscript ? (
            <p className="gym-log-voice__transcript gym-log-voice__transcript--live">
              &quot;{voice.liveTranscript}&quot;
            </p>
          ) : (
            <p className="gym-log-voice__hint">
              {voice.captureMode === 'audio'
                ? `Di tu rutina clara — toca PARAR al terminar (máx ${voice.maxRecordSec}s)`
                : voice.captureMode === 'stt'
                  ? 'Habla claro — verás el texto en vivo. Toca PARAR al terminar.'
                  : 'Preparando micrófono…'}
            </p>
          )}

        </div>

        <button
          type="button"
          className="gym-log-voice__retry"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            voice.reset()
          }}
          aria-label="Cancelar dictado"
        >
          <X className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="gym-log-voice__stop"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            voice.stopRecording()
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >

          <Square className="w-4 h-4 fill-current" />

          Parar

        </button>

      </div>

    )

  }



  if (voice.phase === 'processing') {
    const slow = voice.processingSec >= voice.processingHintSec
    const verySlow = voice.processingSec >= 25
    const statusLine =
      voice.processingSec < 3
        ? 'Organizando entreno…'
        : voice.processingSec < 8
          ? 'Enviando a la IA…'
          : 'Analizando con IA…'
    return (
      <div className="gym-log-voice gym-log-voice--processing">
        <Loader2 className="w-5 h-5 animate-spin text-[#FF671F]" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80">
            {statusLine}
            {voice.processingSec > 0 ? ` (${voice.processingSec}s)` : ''}
          </p>
          {slow && (
            <p className="gym-log-voice__hint mt-1">
              {verySlow
                ? 'La IA sigue trabajando — con Wi‑Fi suele tardar menos. Cancela (X) y reintenta si quieres.'
                : 'Casi listo — con conexión lenta puede tardar unos segundos más.'}
            </p>
          )}
        </div>
        <button type="button" className="gym-log-voice__retry" onClick={voice.reset} aria-label="Cancelar">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }



  if (voice.phase === 'error') {

    const showSettings = voice.errorMessage?.includes('Ajustes')

    return (

      <div className="gym-log-voice gym-log-voice--error">

        <p className="text-sm text-red-300 flex-1">{voice.errorMessage}</p>

        {showSettings && (

          <button

            type="button"

            className="gym-log-voice__retry"

            aria-label="Abrir ajustes de permisos"

            onClick={() => void openMicrophoneAppSettings()}

          >

            <Settings className="w-4 h-4" />

          </button>

        )}

        <button type="button" className="gym-log-voice__retry" onClick={voice.reset}>

          <RotateCcw className="w-4 h-4" />

        </button>

      </div>

    )

  }



  if (voice.phase === 'preview' && voice.preview) {
    const applied = applyWorkoutVoiceParse(voice.preview, recentExerciseNames)
    const lowConfidence = applied.confidence < 0.45
    const heardButEmpty =
      applied.exercises.length === 0 && (applied.transcript?.trim().length ?? 0) > 8
    return (
      <div className="gym-log-voice gym-log-voice--preview">
        <p className="gym-log-voice__preview-kicker">Entendí esto:</p>
        <p className="gym-log-voice__transcript">&quot;{applied.transcript || '—'}&quot;</p>
        {(lowConfidence || heardButEmpty) && (
          <p className="gym-log-voice__hint text-amber-300/90">
            No captamos bien el entreno — revisa la transcripción, dicta de nuevo más claro o edita manualmente.
          </p>
        )}

        {applied.exercises.length > 0 ? (

          <div className="gym-log-voice__chips">

            {applied.exercises.map((ex) => (

              <span key={ex.name} className="gym-log-voice__chip">

                {ex.name} · {ex.sets.length} serie{ex.sets.length !== 1 ? 's' : ''}

              </span>

            ))}

          </div>

        ) : (

          <p className="gym-log-voice__hint">

            Solo duración ({applied.durationMin} min) — añade ejercicios manualmente o dicta de nuevo.

          </p>

        )}

        <div className="gym-log-voice__actions">

          <button type="button" className="gym-log-voice__discard" onClick={voice.reset}>

            <X className="w-4 h-4" />

            Descartar

          </button>

          <button

            type="button"

            className="gym-log-voice__apply"

            onClick={() => {

              onApply({

                title: applied.title,

                type: applied.type,

                durationMin: applied.durationMin,

                exercises: applied.exercises,

              })

              voice.reset()

            }}

          >

            <Check className="w-4 h-4" />

            Aplicar al entreno

          </button>

        </div>

      </div>

    )

  }



  return null

}


