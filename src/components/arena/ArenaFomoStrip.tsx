import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface ArenaFomoStripProps {
  witnessCount: number
  redLiveCount: number
  waveCount: number
  syncVibe: number
  minsToStory: number
  secsToStory?: number
  highlightUnlocked: boolean
  lastWaveLabel?: string
  cityLabel?: string
}

export function ArenaFomoStrip({
  witnessCount,
  redLiveCount,
  waveCount,
  syncVibe,
  minsToStory,
  secsToStory = 0,
  highlightUnlocked,
  lastWaveLabel,
  cityLabel,
}: ArenaFomoStripProps) {
  const messages = useMemo(() => {
    const m: string[] = []
    if (witnessCount > 0) {
      m.push(
        `👁️ ${witnessCount} ${witnessCount === 1 ? 'persona presencia' : 'personas presencian'} tu Arena en el GymPulse`
      )
    } else {
      m.push('🌊 Tu sync ondea en el mapa — quien abra GymPulse puede presenciarla')
    }
    if (redLiveCount > 0) {
      m.push(`🔥 ${redLiveCount} de tu red entrenan en vivo — ven vuestro tether en el mapa`)
    }
    if (highlightUnlocked) {
      m.push('⭐ Modo Highlight activo — la ciudad siente esta sesión')
    } else if (syncVibe >= 60) {
      m.push(`⚡ A ${80 - syncVibe} pts del highlight de sync — una acción más y explota`)
    }
    if (minsToStory > 0 || secsToStory > 0) {
      const label =
        minsToStory > 0
          ? `${minsToStory}:${secsToStory.toString().padStart(2, '0')}`
          : `0:${secsToStory.toString().padStart(2, '0')}`
      m.push(`⏳ ${label} → Historia permanente en ambos muros + feed`)
    } else {
      m.push('📜 Historia compartida lista — termina para publicarla en ambos perfiles')
    }
    if (waveCount > 0 && lastWaveLabel) {
      m.push(`🌊 Onda #${waveCount} · ${lastWaveLabel}`)
    }
    if (cityLabel) {
      m.push(`📍 ${cityLabel} — el pulso de esta sync es visible en tu zona`)
    }
    return m
  }, [witnessCount, redLiveCount, waveCount, syncVibe, minsToStory, secsToStory, highlightUnlocked, lastWaveLabel, cityLabel])

  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [messages.length])

  useEffect(() => {
    if (messages.length <= 1) return
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3800)
    return () => clearInterval(t)
  }, [messages.length])

  const current = messages[idx % messages.length] ?? messages[0]

  return (
    <div className="arena-fomo-strip" role="status" aria-live="polite">
      <span className="arena-fomo-strip__live" aria-hidden>
        LIVE
      </span>
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          className="arena-fomo-strip__text"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28 }}
        >
          {current}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
