import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

const DEFAULT_STORAGE_KEY = 'entrenamatch_live_fab_position'
const DRAG_THRESHOLD_PX = 8
const EDGE_PAD_PX = 8
const TOP_RESERVED_PX = 52
const BOTTOM_NAV_PX = 74

export type FabPosition = { left: number; top: number }

function loadStoredFabPosition(storageKey: string): FabPosition | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { left?: number; top?: number }
    if (typeof parsed.left === 'number' && typeof parsed.top === 'number') {
      return { left: parsed.left, top: parsed.top }
    }
  } catch {
    /* ignore */
  }
  return null
}

function saveFabPosition(storageKey: string, pos: FabPosition): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(pos))
  } catch {
    /* ignore */
  }
}

function readSafeAreaInset(edge: 'top' | 'bottom'): number {
  if (typeof document === 'undefined') return 0
  const el = document.createElement('div')
  el.style.position = 'fixed'
  el.style.visibility = 'hidden'
  el.style.pointerEvents = 'none'
  if (edge === 'bottom') {
    el.style.bottom = '0'
    el.style.height = 'env(safe-area-inset-bottom)'
  } else {
    el.style.top = '0'
    el.style.height = 'env(safe-area-inset-top)'
  }
  document.body.appendChild(el)
  const px = el.getBoundingClientRect().height
  document.body.removeChild(el)
  return Number.isFinite(px) ? px : 0
}

export interface UseDraggableFabPositionOptions {
  /** Extra bottom offset when using CSS default (e.g. map tab filter bar). */
  defaultBottomExtraPx?: number
  enabled?: boolean
  storageKey?: string
  defaultHorizontal?: 'left' | 'right'
}

export interface DraggableFabBindings {
  elRef: RefObject<HTMLButtonElement | null>
  position: FabPosition | null
  isDragging: boolean
  useCssDefault: boolean
  style: React.CSSProperties | undefined
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>, onTap: () => void) => void
}

export function useDraggableFabPosition(
  opts: UseDraggableFabPositionOptions = {}
): DraggableFabBindings {
  const {
    defaultBottomExtraPx = 0,
    enabled = true,
    storageKey = DEFAULT_STORAGE_KEY,
    defaultHorizontal = 'right',
  } = opts
  const [position, setPosition] = useState<FabPosition | null>(() => loadStoredFabPosition(storageKey))
  const [isDragging, setIsDragging] = useState(false)
  const elRef = useRef<HTMLButtonElement | null>(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
  })

  const clampPosition = useCallback((left: number, top: number): FabPosition => {
    const el = elRef.current
    const w = el?.offsetWidth ?? 128
    const h = el?.offsetHeight ?? 40
    const safeTop = readSafeAreaInset('top')
    const safeBottom = readSafeAreaInset('bottom')
    const minTop = TOP_RESERVED_PX + safeTop
    const maxTop = window.innerHeight - h - BOTTOM_NAV_PX - defaultBottomExtraPx - safeBottom - EDGE_PAD_PX
    const maxLeft = window.innerWidth - w - EDGE_PAD_PX
    return {
      left: Math.min(Math.max(EDGE_PAD_PX, left), Math.max(EDGE_PAD_PX, maxLeft)),
      top: Math.min(Math.max(minTop, top), Math.max(minTop, maxTop)),
    }
  }, [defaultBottomExtraPx])

  const resolveCurrentPosition = useCallback((): FabPosition => {
    if (position) return position
    const rect = elRef.current?.getBoundingClientRect()
    if (rect) return { left: rect.left, top: rect.top }
    const w = elRef.current?.offsetWidth ?? 128
    const h = elRef.current?.offsetHeight ?? 40
    const safeBottom = readSafeAreaInset('bottom')
    return {
      left:
        defaultHorizontal === 'left'
          ? EDGE_PAD_PX + 8
          : window.innerWidth - w - 16,
      top: window.innerHeight - h - BOTTOM_NAV_PX - defaultBottomExtraPx - safeBottom,
    }
  }, [position, defaultBottomExtraPx, defaultHorizontal])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!enabled || e.button !== 0) return
      const current = resolveCurrentPosition()
      dragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
        originLeft: current.left,
        originTop: current.top,
      }
      setPosition(current)
      setIsDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [enabled, resolveCurrentPosition]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD_PX) {
        dragRef.current.moved = true
      }
      setPosition(clampPosition(dragRef.current.originLeft + dx, dragRef.current.originTop + dy))
    },
    [clampPosition]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, onTap: () => void) => {
      if (!dragRef.current.active) return
      const moved = dragRef.current.moved
      const finalPos = position
      dragRef.current.active = false
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      if (moved && finalPos) {
        saveFabPosition(storageKey, finalPos)
      } else if (!moved) {
        onTap()
      }
    },
    [position]
  )

  useEffect(() => {
    if (!position) return
    const reclamp = () => setPosition((prev) => (prev ? clampPosition(prev.left, prev.top) : prev))
    window.addEventListener('resize', reclamp)
    window.visualViewport?.addEventListener('resize', reclamp)
    return () => {
      window.removeEventListener('resize', reclamp)
      window.visualViewport?.removeEventListener('resize', reclamp)
    }
  }, [position, clampPosition])

  const useCssDefault = !position
  const style = position
    ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' }
    : undefined

  return {
    elRef,
    position,
    isDragging,
    useCssDefault,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
