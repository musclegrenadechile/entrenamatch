import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BRAND_COPY } from '../../constants/brandCopy'

export const GYMPULSE_TOUR_KEY = 'entrenamatch_gympulse_tour_seen'

const TOOLTIP_HEIGHT = 172
const BOTTOM_CHROME = 100

const STEPS = [
  {
    selector: '[data-gympulse-tour="pins"]',
    title: 'Pins en vivo',
    body: 'Cada marcador verde es alguien entrenando ahora. Toca un pin para ver perfil y unirte.',
    placement: 'top' as const,
  },
  {
    selector: '[data-gympulse-tour="checkin"]',
    title: 'Check-in en tu spot',
    body: 'Abre Filtros y activa "Solo mi gym" si entrenas en un gimnasio. Conectas con quien entrena en el mismo lugar.',
    placement: 'bottom' as const,
  },
  {
    selector: '[data-gympulse-tour="sync"]',
    title: 'EntrenaSync',
    body: 'Toca "Entrenar juntos" en una card o en la lista de abajo para abrir la arena sincronizada en tiempo real.',
    placement: 'top' as const,
  },
] as const

export function hasSeenGymPulseTour(): boolean {
  try {
    return localStorage.getItem(GYMPULSE_TOUR_KEY) === '1'
  } catch {
    return false
  }
}

export function markGymPulseTourSeen(): void {
  try {
    localStorage.setItem(GYMPULSE_TOUR_KEY, '1')
  } catch {
    /* ignore */
  }
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function tooltipWidth() {
  return Math.min(280, window.innerWidth - 24)
}

function computeTooltipPosition(
  rect: Rect | null,
  placement: 'top' | 'bottom' | 'auto'
): { top: number; left: number } {
  const w = tooltipWidth()
  const maxTop = window.innerHeight - BOTTOM_CHROME - TOOLTIP_HEIGHT
  const centerLeft = Math.max(12, (window.innerWidth - w) / 2)

  if (!rect) {
    return { top: Math.min(72, maxTop), left: centerLeft }
  }

  const highlightDominates = rect.height > window.innerHeight * 0.42
  const preferTop = placement === 'top' || highlightDominates
  const belowTop = rect.top + rect.height + 12
  const aboveTop = rect.top - TOOLTIP_HEIGHT - 12
  const belowFits = belowTop + TOOLTIP_HEIGHT <= window.innerHeight - BOTTOM_CHROME

  if (preferTop || !belowFits) {
    if (aboveTop >= 12) {
      return {
        top: aboveTop,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - w - 12)),
      }
    }
    return { top: Math.min(72, maxTop), left: centerLeft }
  }

  return {
    top: Math.min(belowTop, maxTop),
    left: Math.max(12, Math.min(rect.left, window.innerWidth - w - 12)),
  }
}

export interface GymPulseTourProps {
  active: boolean
  onComplete: () => void
}

export function GymPulseTour({ active, onComplete }: GymPulseTourProps) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!active) return
    setStep(0)
  }, [active])

  useEffect(() => {
    if (!active) return

    const updateRect = () => {
      const sel = STEPS[step]?.selector
      if (!sel) return
      const el = document.querySelector(sel)
      if (!el) {
        setRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      })
    }

    updateRect()
    const t = window.setTimeout(updateRect, 120)
    const t2 = window.setTimeout(updateRect, 400)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [active, step])

  const finish = () => {
    markGymPulseTourSeen()
    onComplete()
  }

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish()
      return
    }
    setStep((s) => s + 1)
  }

  if (!active) return null

  const current = STEPS[step]
  const { top: tooltipTop, left: tooltipLeft } = computeTooltipPosition(
    rect,
    current.placement ?? 'auto'
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-auto"
        aria-live="polite"
      >
        <div className="absolute inset-0 bg-black/75" onClick={finish} aria-hidden />

        {rect && rect.width > 0 && rect.height > 0 && (
          <div
            className="absolute rounded-2xl ring-2 ring-[#22c55e] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] pointer-events-none"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
            }}
          />
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute w-[min(280px,calc(100vw-24px))] rounded-2xl bg-[#1C1C20] border border-[#22c55e]/40 p-4 shadow-xl pointer-events-auto"
          style={{
            top: tooltipTop,
            left: tooltipLeft,
            maxHeight: `min(${TOOLTIP_HEIGHT}px, calc(100vh - ${BOTTOM_CHROME}px - 12px))`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold">
            {BRAND_COPY.liveMap.tourHeader} · {step + 1}/{STEPS.length}
          </p>
          <p className="text-sm font-bold text-white mt-1">{current.title}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">{current.body}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={finish}
              className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold text-[#9CA3AF] border border-[#2F2F35] active:bg-[#25252A]"
            >
              Saltar
            </button>
            <button
              type="button"
              onClick={next}
              className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-[#22c55e] text-black active:brightness-90"
            >
              {step >= STEPS.length - 1 ? 'Listo' : 'Siguiente'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
