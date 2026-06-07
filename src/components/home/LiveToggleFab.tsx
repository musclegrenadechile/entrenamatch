import { Radio } from 'lucide-react'

interface LiveToggleFabProps {
  isLive: boolean
  isTogglingLive: boolean
  liveCount: number
  onToggle: () => void
  hidden?: boolean
}

/** Global live toggle — visible on all main tabs (Phase 0). */
export function LiveToggleFab({
  isLive,
  isTogglingLive,
  liveCount,
  onToggle,
  hidden,
}: LiveToggleFabProps) {
  if (hidden) return null

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isTogglingLive}
      aria-label={isLive ? 'Terminar entrenamiento en vivo' : 'Activar entrenamiento en vivo'}
      className={`fixed z-[45] right-4 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-lg font-bold text-xs transition active:scale-95 ${
        isLive
          ? 'bg-[#E11D48] text-white ring-2 ring-[#E11D48]/40 bottom-[calc(74px+env(safe-area-inset-bottom))]'
          : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black ring-2 ring-[#22c55e]/40 bottom-[calc(74px+env(safe-area-inset-bottom))]'
      } ${isTogglingLive ? 'opacity-70 cursor-wait' : ''}`}
    >
      <Radio className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
      {isTogglingLive ? '…' : isLive ? 'EN VIVO' : 'IR LIVE'}
      {!isLive && liveCount > 0 && (
        <span className="ml-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">
          {liveCount}
        </span>
      )}
    </button>
  )
}
