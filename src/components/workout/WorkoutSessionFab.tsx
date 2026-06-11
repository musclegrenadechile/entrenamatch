import { useEffect, useState } from 'react'
import { Dumbbell, MessageCircle, Plus, UtensilsCrossed } from 'lucide-react'
import { useDraggableFabPosition } from '../../hooks/useDraggableFabPosition'
import {
  summarizeWorkoutDraft,
  type WorkoutDraft,
} from '../../utils/workoutDraft'

export type WorkoutSessionFabLayout = 'fab' | 'chat-strip'

export interface WorkoutSessionFabProps {
  draft: WorkoutDraft
  onResume: () => void
  onQuickAddSet?: () => void
  onOpenChat?: () => void
  onOpenFuel?: () => void
  chatUnreadCount?: number
  hidden?: boolean
  bottomClass?: string
  /** Fase B — pill fina arriba en chat activo */
  layout?: WorkoutSessionFabLayout
  /** Apila el FAB un poco más arriba si LIVE también está visible */
  liveActive?: boolean
}

function stopPointer(e: React.PointerEvent) {
  e.stopPropagation()
}

/** Gadget de sesión activa — Fases A–D */
export function WorkoutSessionFab({
  draft,
  onResume,
  onQuickAddSet,
  onOpenChat,
  onOpenFuel,
  chatUnreadCount = 0,
  hidden,
  bottomClass,
  layout = 'fab',
  liveActive = false,
}: WorkoutSessionFabProps) {
  const [, setTick] = useState(0)
  const mapTab = bottomClass?.includes('7.5rem')
  const defaultBottomExtraPx = (mapTab ? 46 : 0) + (liveActive ? 52 : 0)

  const drag = useDraggableFabPosition({
    defaultBottomExtraPx,
    storageKey: 'entrenamatch_workout_fab_position',
    defaultHorizontal: 'left',
    enabled: layout === 'fab',
  })

  useEffect(() => {
    if (drag.isDragging) return undefined
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [drag.isDragging])

  if (hidden) return null

  const summary = summarizeWorkoutDraft(draft)
  const bottom =
    bottomClass || 'bottom-[calc(74px+env(safe-area-inset-bottom))]'
  const showActions = !!(onQuickAddSet || onOpenChat || onOpenFuel)

  const actionButtons = showActions ? (
    <div className="workout-session-fab-actions">
      {onQuickAddSet && (
        <button
          type="button"
          onPointerDown={stopPointer}
          onClick={(e) => {
            e.stopPropagation()
            onQuickAddSet()
          }}
          className="workout-session-fab-action"
          title="Añadir serie al ejercicio actual"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Serie</span>
        </button>
      )}
      {onOpenChat && (
        <button
          type="button"
          onPointerDown={stopPointer}
          onClick={(e) => {
            e.stopPropagation()
            onOpenChat()
          }}
          className="workout-session-fab-action relative"
          title="Ir al chat"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {chatUnreadCount > 0 && (
            <span className="workout-session-fab-badge">
              {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
            </span>
          )}
        </button>
      )}
      {onOpenFuel && (
        <button
          type="button"
          onPointerDown={stopPointer}
          onClick={(e) => {
            e.stopPropagation()
            onOpenFuel()
          }}
          className="workout-session-fab-action"
          title="Registrar comida"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  ) : null

  if (layout === 'chat-strip') {
    return (
      <div className="workout-session-strip shrink-0 px-2 pt-1 pb-0.5">
        <div className="workout-session-strip-inner">
          <button
            type="button"
            onClick={onResume}
            className="workout-session-strip-main"
          >
            <Dumbbell className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-black text-[11px]">{summary.currentExerciseName}</span>
            {summary.timer && (
              <span className="text-[10px] font-semibold tabular-nums opacity-90 shrink-0">
                {summary.timer}
              </span>
            )}
          </button>
          {actionButtons}
          <button
            type="button"
            onClick={onResume}
            className="workout-session-strip-open"
          >
            Abrir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={drag.containerRef}
      className={`workout-session-fab fixed z-[44] flex flex-col items-start gap-1 max-w-[min(72vw,240px)] ${
        drag.useCssDefault ? `left-4 ${bottom}` : ''
      }`}
      style={drag.style}
    >
      <button
        ref={drag.elRef}
        type="button"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={(e) => drag.onPointerUp(e, onResume)}
        onClick={(e) => e.preventDefault()}
        aria-label="Volver a Modo Entreno"
        aria-grabbed={drag.isDragging}
        title="Mantén y arrastra para mover · Toca para volver al entreno"
        className={`workout-session-fab-card w-full select-none touch-none ${
          drag.isDragging ? 'cursor-grabbing scale-[1.02] ring-2 ring-white/30' : 'cursor-grab active:scale-95'
        }`}
      >
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-90">
          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
          Sesión activa
        </span>
        <span className="text-xs font-black truncate max-w-full leading-tight text-left">
          {summary.currentExerciseName}
        </span>
        <span className="text-[10px] font-semibold opacity-90 tabular-nums text-left">
          {summary.timer ? `${summary.timer} · ` : ''}
          {summary.exerciseCount} ejercicio{summary.exerciseCount !== 1 ? 's' : ''}
        </span>
      </button>
      {actionButtons}
    </div>
  )
}
