import { useEffect, useState } from 'react'
import { ChevronUp, Dumbbell, MessageCircle, Plus, Radio, UtensilsCrossed } from 'lucide-react'
import { useDraggableFabPosition } from '../../hooks/useDraggableFabPosition'
import type { Workout } from '../../types'
import {
  summarizeWorkoutDraft,
  type WorkoutDraft,
} from '../../utils/workoutDraft'
import { buildWorkoutFabDraftMeta } from '../../utils/workoutFabDraftMeta'

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
  /** LIVE integrado en el gadget (un solo FAB visible) */
  onToggleLive?: () => void
  isLive?: boolean
  isTogglingLive?: boolean
  /** Historial para chip PR en FAB (oleada 387). */
  recentWorkouts?: Workout[]
}

function stopPointer(e: React.PointerEvent) {
  e.stopPropagation()
}

/** Gadget de sesión activa — absorbe LIVE cuando hay entreno en curso */
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
  onToggleLive,
  isLive = false,
  isTogglingLive = false,
  recentWorkouts = [],
}: WorkoutSessionFabProps) {
  const [, setTick] = useState(0)
  const [actionsOpen, setActionsOpen] = useState(true)
  const mapTab = bottomClass?.includes('7.5rem')
  const defaultBottomExtraPx = mapTab ? 46 : 0

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
  const draftMeta = buildWorkoutFabDraftMeta(draft, Date.now(), { history: recentWorkouts })
  const bottom =
    bottomClass || 'bottom-[calc(74px+env(safe-area-inset-bottom))]'
  const showActions = !!(onQuickAddSet || onOpenChat || onOpenFuel)

  const handleResume = () => {
    setActionsOpen(false)
    onResume()
  }

  const liveChip =
    onToggleLive && layout === 'fab' ? (
      <button
        type="button"
        onPointerDown={stopPointer}
        onClick={(e) => {
          e.stopPropagation()
          onToggleLive()
        }}
        disabled={isTogglingLive}
        className={`em-v2-workout-fab__live flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
          isLive ? 'em-v2-workout-fab__live--on' : ''
        } ${isTogglingLive ? 'opacity-70' : 'active:scale-95'}`}
        title={isLive ? 'Terminar LIVE' : 'Activar LIVE'}
      >
        <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} />
        {isTogglingLive ? '…' : isLive ? 'EN VIVO' : 'IR LIVE'}
      </button>
    ) : null

  const actionButtons = showActions && actionsOpen ? (
    <div className="em-v2-workout-fab__actions workout-session-fab-actions">
      {onQuickAddSet && (
        <button
          type="button"
          onPointerDown={stopPointer}
          onClick={(e) => {
            e.stopPropagation()
            onQuickAddSet()
          }}
          className="em-v2-workout-fab__action workout-session-fab-action"
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
          className="em-v2-workout-fab__action workout-session-fab-action relative"
          title="Ir al chat"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {chatUnreadCount > 0 && (
            <span className="em-v2-workout-fab__badge workout-session-fab-badge">
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
          className="em-v2-workout-fab__action workout-session-fab-action"
          title="Registrar comida"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  ) : null

  const expandActionsBtn =
    showActions && !actionsOpen ? (
      <button
        type="button"
        onPointerDown={stopPointer}
        onClick={(e) => {
          e.stopPropagation()
          setActionsOpen(true)
        }}
        className="em-v2-workout-fab__expand"
        aria-label="Mostrar acciones rápidas"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    ) : null

  if (layout === 'chat-strip') {
    return (
      <div className="em-v2-workout-fab__strip workout-session-strip shrink-0 px-2 pt-1 pb-0.5">
        <div className="em-v2-workout-fab__strip-inner workout-session-strip-inner">
          <button
            type="button"
            onClick={handleResume}
            className="workout-session-strip-main"
          >
            <Dumbbell className="w-3.5 h-3.5 shrink-0" />
            <span className="em-v2-workout-fab__strip-dot" aria-hidden />
            <span className="truncate font-black text-[11px]">{summary.currentExerciseName}</span>
            {summary.timer && (
              <span className="text-[10px] font-semibold tabular-nums opacity-90 shrink-0">
                {summary.timer}
              </span>
            )}
          </button>
          {actionButtons}
          {expandActionsBtn}
          <button
            type="button"
            onClick={handleResume}
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
      className={`workout-session-fab fixed z-[45] flex flex-col items-start gap-1 max-w-[min(72vw,240px)] ${
        drag.useCssDefault ? `left-4 ${bottom}` : ''
      }`}
      style={drag.style}
    >
      <button
        ref={drag.elRef}
        type="button"
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={(e) => drag.onPointerUp(e, handleResume)}
        onClick={(e) => e.preventDefault()}
        aria-label="Volver a Modo Entreno"
        aria-grabbed={drag.isDragging}
        title="Mantén y arrastra para mover · Toca para volver al entreno"
        className={`em-v2-workout-fab__card workout-session-fab-card w-full select-none touch-none ${
          drag.isDragging ? 'em-v2-workout-fab__card--drag cursor-grabbing scale-[1.02] ring-2 ring-white/30' : 'cursor-grab active:scale-95'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-90">
            <Dumbbell className="w-3.5 h-3.5 shrink-0" />
            Sesión activa
          </span>
          {liveChip}
        </div>
        <div className="em-v2-workout-fab__autosave" aria-live="polite">
          <span className="em-v2-workout-fab__autosave-dot" aria-hidden />
          <span className="em-v2-workout-fab__autosave-text">
            Autosave · {draftMeta.blocksLabel} · {draftMeta.ageLabel}
          </span>
        </div>
        {draftMeta.sessionChip && (
          <span className="em-v2-workout-fab__session-chip">{draftMeta.sessionChip}</span>
        )}
        <span className="text-xs font-black truncate max-w-full leading-tight text-left">
          {summary.currentExerciseName}
        </span>
        <span className="text-[10px] font-semibold opacity-90 tabular-nums text-left">
          {summary.timer ? `${summary.timer} · ` : ''}
          {summary.exerciseCount} ejercicio{summary.exerciseCount !== 1 ? 's' : ''}
        </span>
      </button>
      {actionButtons}
      {expandActionsBtn}
    </div>
  )
}
