import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play } from 'lucide-react'
import type { SyncArenaAction } from './SyncArenaView'

export interface ArenaSharedPulseProps {
  syncVibe: number
  latestAction: SyncArenaAction | null
  partnerFirst: string
  effectiveUserId: string
  isResting: boolean
  restSecondsLeft: number
  restStartedBy?: string | null
  handshakeLabel?: string | null
  liveHeartRateBpm?: number | null
}

export function ArenaSharedPulse({
  syncVibe,
  latestAction,
  partnerFirst,
  effectiveUserId,
  isResting,
  restSecondsLeft,
  restStartedBy = null,
  handshakeLabel,
  liveHeartRateBpm = null,
}: ArenaSharedPulseProps) {
  const ringScale = 0.92 + (syncVibe / 100) * 0.18
  const isPartner = latestAction?.userId && latestAction.userId !== effectiveUserId
  const voiceRef = useRef<HTMLAudioElement | null>(null)

  const restLabel =
    restStartedBy === effectiveUserId
      ? 'Tu descanso'
      : restStartedBy
        ? `${partnerFirst} · descanso`
        : 'Descanso sync'

  const playVoice = () => {
    if (!latestAction?.voiceUrl) return
    if (voiceRef.current) {
      voiceRef.current.pause()
      voiceRef.current = null
    }
    const audio = new Audio(latestAction.voiceUrl)
    voiceRef.current = audio
    void audio.play().catch(() => {})
  }

  return (
    <div className="arena-shared-pulse em-v2-arena-pulse" aria-live="polite">
      <div
        className={`arena-shared-pulse__ring ${syncVibe > 75 ? 'arena-shared-pulse__ring--high' : ''} ${
          isResting ? 'arena-shared-pulse__ring--rest' : ''
        }`}
        style={{ transform: `scale(${ringScale})` }}
      >
        <div className="arena-shared-pulse__core">
          {isResting ? (
            <>
              <span className="arena-shared-pulse__rest-label">{restLabel}</span>
              <span className="arena-shared-pulse__rest-time">
                {Math.floor(restSecondsLeft / 60)}:{(restSecondsLeft % 60).toString().padStart(2, '0')}
              </span>
            </>
          ) : liveHeartRateBpm ? (
            <>
              <span className="arena-shared-pulse__vibe-num">{liveHeartRateBpm}</span>
              <span className="arena-shared-pulse__vibe-label">bpm ⌚</span>
            </>
          ) : (
            <>
              <span className="arena-shared-pulse__vibe-num">{syncVibe}</span>
              <span className="arena-shared-pulse__vibe-label">energía</span>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(handshakeLabel || latestAction) && !isResting && (
          <motion.div
            key={handshakeLabel || `${latestAction?.at}-${latestAction?.label}`}
            className="arena-shared-pulse__event"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            {handshakeLabel ? (
              <p className="arena-shared-pulse__handshake">{handshakeLabel}</p>
            ) : latestAction ? (
              <>
                <span className="text-lg">{latestAction.emoji}</span>
                <p className="arena-shared-pulse__event-text">
                  <strong>{isPartner ? partnerFirst : 'Tú'}</strong> · {latestAction.label}
                </p>
                {latestAction.voiceUrl && isPartner && (
                  <button
                    type="button"
                    className="arena-shared-pulse__voice-btn"
                    onClick={playVoice}
                  >
                    <Play size={12} /> Escuchar
                  </button>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
