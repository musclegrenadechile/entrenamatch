import type { ReactNode } from 'react'

export interface EmV2TabShellProps {
  children: ReactNode
  /** Mapa: solo fade (evita glitches con Leaflet). */
  variant?: 'default' | 'map'
}

/** Oleada 351 — contenedor de tab con entrada animada (CSS). */
export function EmV2TabShell({ children, variant = 'default' }: EmV2TabShellProps) {
  return (
    <div
      className={`em-v2-tab-shell flex-1 flex flex-col min-h-0 overflow-hidden${
        variant === 'map' ? ' em-v2-tab-shell--map' : ''
      }`}
    >
      {children}
    </div>
  )
}