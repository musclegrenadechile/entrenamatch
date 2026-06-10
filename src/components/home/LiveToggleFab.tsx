import { Radio } from 'lucide-react'
import { useDraggableFabPosition } from '../../hooks/useDraggableFabPosition'

interface LiveToggleFabProps {
  isLive: boolean
  isTogglingLive: boolean
  liveCount: number
  onToggle: () => void
  hidden?: boolean
  /** Extra bottom offset class (e.g. map tab above filter bar). */
  bottomClass?: string
}

/** Global live toggle — visible on all main tabs; draggable on mobile. */
export function LiveToggleFab({
  isLive,
  isTogglingLive,
  liveCount,
  onToggle,
  hidden,
  bottomClass,
}: LiveToggleFabProps) {
  // Map tab uses ~7.5rem bottom vs 74px elsewhere (+46px).
  const defaultBottomExtraPx = bottomClass?.includes('7.5rem') ? 46 : 0

  const drag = useDraggableFabPosition({ defaultBottomExtraPx })

  if (hidden) return null

  const bottom =
    bottomClass || 'bottom-[calc(74px+env(safe-area-inset-bottom))]'

  return (
    <button
      ref={drag.elRef}
      type="button"
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={(e) => drag.onPointerUp(e, onToggle)}
      onClick={(e) => e.preventDefault()}
      disabled={isTogglingLive}
      aria-label={isLive ? 'Terminar entrenamiento en vivo' : 'Activar entrenamiento en vivo'}
      aria-grabbed={drag.isDragging}
      title="Mantén y arrastra para mover · Toca para activar"
      aria-busy={isTogglingLive}
      style={drag.style}
      className={`live-toggle-fab fixed z-[45] flex items-center gap-2 rounded-full shadow-lg font-bold text-xs transition max-w-[calc(100vw-2rem)] select-none touch-none ${
        drag.useCssDefault ? `right-4 ${bottom}` : ''
      } ${drag.isDragging ? 'live-toggle-fab--dragging scale-[1.02] ring-2 ring-white/30' : 'active:scale-95'} ${
        isLive
          ? 'bg-[#E11D48] text-white ring-2 ring-[#E11D48]/40 pl-3 pr-4 py-2.5'
          : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black ring-2 ring-[#22c55e]/40 pl-3 pr-4 py-2.5'
      } ${isTogglingLive ? 'opacity-80 cursor-wait' : drag.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <Radio className={`w-4 h-4 shrink-0 ${isLive ? 'animate-pulse' : ''}`} />
      <span className="truncate">
        {isTogglingLive ? (isLive ? 'Cerrando…' : 'Activando…') : isLive ? 'EN VIVO' : 'IR LIVE'}
      </span>
      {!isLive && liveCount > 0 && (
        <span className="ml-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">
          {liveCount}
        </span>
      )}
    </button>
  )
}
