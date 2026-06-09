import { Maximize2, Minimize2, Crosshair, X } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import type { ReactNode } from 'react'

export interface GymPulseMapShellProps {
  fullscreen: boolean
  /** Dedicated Map tab: fill flex column between app chrome and bottom nav (not fixed overlay). */
  tabFill?: boolean
  liveCount: number
  cityLabel?: string
  onToggleFullscreen: () => void
  onCentrar?: () => void
  onClose?: () => void
  children: ReactNode
  bottomSheet?: ReactNode
}

export function GymPulseMapShell({
  fullscreen,
  tabFill = false,
  liveCount,
  cityLabel,
  onToggleFullscreen,
  onCentrar,
  onClose,
  children,
  bottomSheet,
}: GymPulseMapShellProps) {
  const shellClass = tabFill
    ? 'gym-pulse-shell--tab'
    : fullscreen
      ? 'gym-pulse-shell--fullscreen'
      : 'gym-pulse-shell--embedded'

  return (
    <div
      className={`gym-pulse-shell ${shellClass}`}
      data-gympulse-tour="pins"
    >
      {fullscreen && !tabFill && (
        <header className="gym-pulse-shell__header">
          {onClose && (
            <button type="button" className="gym-pulse-shell__icon-btn" onClick={onClose} aria-label="Cerrar mapa">
              <X size={20} />
            </button>
          )}
          <div className="gym-pulse-shell__brand">
            <span className="gym-pulse-shell__dot" />
            <span className="gym-pulse-shell__title">{BRAND_COPY.liveMapLabel.toUpperCase()}</span>
            <span className="gym-pulse-shell__pill">{liveCount} en vivo</span>
            {cityLabel && <span className="gym-pulse-shell__city">{cityLabel}</span>}
          </div>
          <div className="gym-pulse-shell__actions">
            {onCentrar && (
              <button type="button" className="gym-pulse-shell__icon-btn" onClick={onCentrar} aria-label="Centrar mapa">
                <Crosshair size={18} />
              </button>
            )}
            <button
              type="button"
              className="gym-pulse-shell__icon-btn gym-pulse-shell__icon-btn--accent"
              onClick={onToggleFullscreen}
              aria-label="Salir de pantalla completa"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        </header>
      )}

      <div className="gym-pulse-shell__map-wrap">
        {!fullscreen && !tabFill && (
          <button
            type="button"
            className="gym-pulse-shell__expand-fab"
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
          >
            <Maximize2 size={16} />
          </button>
        )}
        {children}
      </div>

      {bottomSheet}
    </div>
  )
}
