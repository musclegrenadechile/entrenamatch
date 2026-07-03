import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { markArenaSyncTutorialSeen } from '../../utils/arenaTutorial'

const TIPS = [
  {
    emoji: '💪',
    title: 'Set listo',
    body: 'Cuando termines una serie, pulsa Set listo — tu partner lo ve al instante.',
  },
  {
    emoji: '💧',
    title: 'Descanso sync',
    body: 'Descanso activa un timer compartido para recuperar juntos.',
  },
  {
    emoji: '🏋️',
    title: 'Ejercicio arriba',
    body: 'Elige ejercicio, reps y kg en la card superior — se guarda en Entreno de Hoy.',
  },
] as const

const DURATION_MS = 15_000

export type ArenaSyncTutorialProps = {
  onDismiss: () => void
}

/** Fase 207 — tutorial Arena 15s (primera apertura). */
export function ArenaSyncTutorial({ onDismiss }: ArenaSyncTutorialProps) {
  const [elapsed, setElapsed] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  const dismiss = () => {
    markArenaSyncTutorialSeen()
    onDismiss()
  }

  useEffect(() => {
    const start = Date.now()
    const tick = window.setInterval(() => {
      const ms = Date.now() - start
      setElapsed(ms)
      setTipIndex(Math.min(TIPS.length - 1, Math.floor(ms / (DURATION_MS / TIPS.length))))
    }, 200)
    const done = window.setTimeout(() => {
      markArenaSyncTutorialSeen()
      onDismiss()
    }, DURATION_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [onDismiss])

  const tip = TIPS[tipIndex]
  const progress = Math.min(100, (elapsed / DURATION_MS) * 100)

  return (
    <div className="em-v2-arena-tutorial" role="dialog" aria-label="Tutorial EntrenaSync">
      <div className="em-v2-arena-tutorial__card">
        <button type="button" onClick={dismiss} className="em-v2-arena-tutorial__close" aria-label="Cerrar">
          <X size={16} />
        </button>
        <p className="em-v2-arena-tutorial__kicker">EntrenaSync · guía rápida</p>
        <div className="em-v2-arena-tutorial__emoji" aria-hidden>
          {tip.emoji}
        </div>
        <p className="em-v2-arena-tutorial__title">{tip.title}</p>
        <p className="em-v2-arena-tutorial__body">{tip.body}</p>
        <div className="em-v2-arena-tutorial__dots">
          {TIPS.map((t, i) => (
            <span key={t.title} className={i === tipIndex ? 'em-v2-arena-tutorial__dot--active' : ''} />
          ))}
        </div>
        <div className="em-v2-arena-tutorial__track">
          <div className="em-v2-arena-tutorial__fill" style={{ width: `${progress}%` }} />
        </div>
        <button type="button" onClick={dismiss} className="em-v2-hero-card__cta w-full">
          Entendido
        </button>
      </div>
    </div>
  )
}