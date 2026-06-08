/**
 * Floating sync bubble — visible when EntrenaSync is active (Arena minimized).
 * Collapsed by default in chat so the message input stays usable.
 */

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface ArenaGlobalPulseItem {
  names: string
  vibe: number
}

export interface ArenaGlobalPulseBarProps {
  partnerName: string
  syncVibe: number
  witnessCount: number
  waveCount: number
  globalPairs: ArenaGlobalPulseItem[]
  onOpenArena: () => void
  /** Start collapsed (e.g. while typing in chat) */
  preferCollapsed?: boolean
}

export function ArenaGlobalPulseBar({
  partnerName,
  syncVibe,
  witnessCount,
  waveCount,
  globalPairs,
  onOpenArena,
  preferCollapsed = false,
}: ArenaGlobalPulseBarProps) {
  const [expanded, setExpanded] = useState(!preferCollapsed)
  const rootRef = useRef<HTMLDivElement>(null)

  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'
  const others =
    globalPairs.length > 0
      ? globalPairs
          .slice(0, 2)
          .map((p) => p.names)
          .join(' · ')
      : null

  useEffect(() => {
    if (preferCollapsed) setExpanded(false)
  }, [preferCollapsed])

  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [expanded])

  return (
    <div
      ref={rootRef}
      className={`arena-sync-bubble ${expanded ? 'arena-sync-bubble--expanded' : ''} ${
        preferCollapsed ? 'arena-sync-bubble--chat' : ''
      }`}
    >
      {expanded && (
        <div className="arena-sync-bubble__panel" role="region" aria-label="EntrenaSync activo">
          <div className="arena-sync-bubble__panel-head">
            <span className="arena-sync-bubble__badge">SYNC</span>
            <button
              type="button"
              className="arena-sync-bubble__minimize"
              onClick={() => setExpanded(false)}
              aria-label="Minimizar sync"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <p className="arena-sync-bubble__title">
            {partnerFirst} × tú · {syncVibe}%
          </p>

          <div className="arena-sync-bubble__meta">
            {witnessCount > 0 && (
              <span>👁️ {witnessCount} presenciando</span>
            )}
            {waveCount > 0 && <span>🌊 Onda #{waveCount}</span>}
          </div>

          {others && (
            <p className="arena-sync-bubble__others">+ {others} en la red</p>
          )}

          <button type="button" className="arena-sync-bubble__open" onClick={onOpenArena}>
            Abrir Arena →
          </button>
        </div>
      )}

      <button
        type="button"
        className="arena-sync-bubble__fab"
        onClick={() => (expanded ? onOpenArena() : setExpanded(true))}
        aria-expanded={expanded}
        aria-label={
          expanded
            ? `Abrir Arena con ${partnerFirst}`
            : `EntrenaSync activo con ${partnerFirst}, ${syncVibe}%`
        }
      >
        <span className="arena-sync-bubble__fab-dot" aria-hidden />
        <span className="arena-sync-bubble__fab-label">SYNC</span>
        <span className="arena-sync-bubble__fab-vibe tabular-nums">{syncVibe}%</span>
        {!expanded && <ChevronUp size={12} className="arena-sync-bubble__fab-chevron" aria-hidden />}
      </button>
    </div>
  )
}
