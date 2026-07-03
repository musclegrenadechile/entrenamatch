import { useState } from 'react'
import { Info } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'

export interface MapLiveLegendProps {
  selfIsLive?: boolean
  othersLiveCount?: number
  compact?: boolean
  /** Map tab: collapsed by default so the map stays readable */
  collapsible?: boolean
}

/** Leyenda del Mapa LIVE — colapsable para no tapar el mapa. */
export function MapLiveLegend({
  selfIsLive = false,
  othersLiveCount = 0,
  compact = false,
  collapsible = false,
}: MapLiveLegendProps) {
  const copy = BRAND_COPY.liveMap
  const [open, setOpen] = useState(!collapsible)

  if (collapsible && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="em-v2-map-legend-toggle pointer-events-auto active:scale-[0.97]"
        aria-label={`Abrir ${copy.legendTitle.toLowerCase()}`}
      >
        <Info size={12} className="text-[#22c55e]" aria-hidden />
        {copy.legendTitle}
      </button>
    )
  }

  return (
    <div
      className={`em-v2-map-legend pointer-events-auto ${
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
      }`}
      aria-label={copy.legendTitle}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="em-v2-map-legend__title">
          {copy.legendTitle}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[11px] text-white/50 px-1 active:text-white"
            aria-label="Ocultar leyenda"
          >
            ✕
          </button>
        )}
      </div>
      <ul className="space-y-1">
        <li className="em-v2-map-legend__item flex items-center gap-1.5">
          <span className="inline-flex w-4 h-4 rounded-full bg-[#22c55e] text-[8px] font-black text-white items-center justify-center shrink-0">
            TÚ
          </span>
          <span>{copy.legendSelf}</span>
        </li>
        <li className="em-v2-map-legend__item flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#22c55e]/30 shrink-0" />
          <span>{copy.legendLivePin}</span>
        </li>
        <li className="em-v2-map-legend__item flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded-full border border-[#22c55e]/50 bg-[#22c55e]/10 shrink-0" />
          <span>{copy.legendCircle}</span>
        </li>
      </ul>
      {othersLiveCount === 0 && !collapsible && (
        <p className="em-v2-map-overlay__body mt-2 border-t border-white/10 pt-2">
          {selfIsLive ? copy.emptyOverlaySelfLive : copy.emptyOverlayBody}
        </p>
      )}
    </div>
  )
}
