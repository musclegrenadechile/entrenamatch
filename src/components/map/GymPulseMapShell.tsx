import { Maximize2, Minimize2, Crosshair, X } from 'lucide-react'
import type { ReactNode } from 'react'

export interface GymPulseMapShellProps {
  fullscreen: boolean
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
  liveCount,
  cityLabel,
  onToggleFullscreen,
  onCentrar,
  onClose,
  children,
  bottomSheet,
}: GymPulseMapShellProps) {
  return (
    <div
      className={`gym-pulse-shell ${fullscreen ? 'gym-pulse-shell--fullscreen' : 'gym-pulse-shell--embedded'}`}
      data-gympulse-tour="pins"
    >
      {fullscreen && (
        <header className="gym-pulse-shell__header">
          {onClose && (
            <button type="button" className="gym-pulse-shell__icon-btn" onClick={onClose} aria-label="Cerrar mapa">
              <X size={20} />
            </button>
          )}
          <div className="gym-pulse-shell__brand">
            <span className="gym-pulse-shell__dot" />
            <span className="gym-pulse-shell__title">GYMPULSE</span>
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
        {!fullscreen && (
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
