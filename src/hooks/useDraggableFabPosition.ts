import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

const DEFAULT_STORAGE_KEY = 'entrenamatch_live_fab_position'
const DRAG_THRESHOLD_PX = 8
const EDGE_PAD_PX = 8
const TOP_RESERVED_PX = 52
const BOTTOM_NAV_PX = 74

export type FabPosition = { left: number; top: number }

type SafeAreaInsets = { top: number; bottom: number }

let cachedSafeArea: SafeAreaInsets | null = null

/** Measured once per session / resize — never per pointermove (was causing drag jank). */
export function measureSafeAreaInsets(): SafeAreaInsets {
  if (typeof document === 'undefined') return { top: 0, bottom: 0 }

  const read = (edge: 'top' | 'bottom'): number => {
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

  cachedSafeArea = { top: read('top'), bottom: read('bottom') }
  return cachedSafeArea
}

function getSafeAreaInsets(): SafeAreaInsets {
  return cachedSafeArea ?? measureSafeAreaInsets()
}

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

function applyFabPosition(el: HTMLElement, pos: FabPosition): void {
  el.style.left = `${pos.left}px`
  el.style.top = `${pos.top}px`
  el.style.right = 'auto'
  el.style.bottom = 'auto'
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
  /** Element that receives left/top positioning (wrapper or same as elRef). */
  containerRef: RefObject<HTMLElement | null>
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
  const containerRef = useRef<HTMLElement | null>(null)
  const positionRef = useRef<FabPosition | null>(position)
  const dragFrameRef = useRef<number | null>(null)
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
  })

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    measureSafeAreaInsets()
    const refresh = () => measureSafeAreaInsets()
    window.addEventListener('resize', refresh)
    window.visualViewport?.addEventListener('resize', refresh)
    return () => {
      window.removeEventListener('resize', refresh)
      window.visualViewport?.removeEventListener('resize', refresh)
    }
  }, [])

  const clampPosition = useCallback((left: number, top: number): FabPosition => {
    const measureEl = containerRef.current ?? elRef.current
    const w = measureEl?.offsetWidth ?? 128
    const h = measureEl?.offsetHeight ?? 40
    const { top: safeTop, bottom: safeBottom } = getSafeAreaInsets()
    const minTop = TOP_RESERVED_PX + safeTop
    const maxTop = window.innerHeight - h - BOTTOM_NAV_PX - defaultBottomExtraPx - safeBottom - EDGE_PAD_PX
    const maxLeft = window.innerWidth - w - EDGE_PAD_PX
    return {
      left: Math.min(Math.max(EDGE_PAD_PX, left), Math.max(EDGE_PAD_PX, maxLeft)),
      top: Math.min(Math.max(minTop, top), Math.max(minTop, maxTop)),
    }
  }, [defaultBottomExtraPx])

  const resolveCurrentPosition = useCallback((): FabPosition => {
    if (positionRef.current) return positionRef.current
    const rect = (containerRef.current ?? elRef.current)?.getBoundingClientRect()
    if (rect) return { left: rect.left, top: rect.top }
    const measureEl = containerRef.current ?? elRef.current
    const w = measureEl?.offsetWidth ?? 128
    const h = measureEl?.offsetHeight ?? 40
    const { bottom: safeBottom } = getSafeAreaInsets()
    return {
      left:
        defaultHorizontal === 'left'
          ? EDGE_PAD_PX + 8
          : window.innerWidth - w - 16,
      top: window.innerHeight - h - BOTTOM_NAV_PX - defaultBottomExtraPx - safeBottom,
    }
  }, [defaultBottomExtraPx, defaultHorizontal])

  const schedulePositionPaint = useCallback((pos: FabPosition) => {
    positionRef.current = pos
    if (dragFrameRef.current != null) return
    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null
      const target = containerRef.current ?? elRef.current
      const next = positionRef.current
      if (target && next) applyFabPosition(target, next)
    })
  }, [])

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
      positionRef.current = current
      const target = containerRef.current ?? elRef.current
      if (target) applyFabPosition(target, current)
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
      schedulePositionPaint(
        clampPosition(dragRef.current.originLeft + dx, dragRef.current.originTop + dy)
      )
    },
    [clampPosition, schedulePositionPaint]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, onTap: () => void) => {
      if (!dragRef.current.active) return
      const moved = dragRef.current.moved
      const finalPos = positionRef.current
      dragRef.current.active = false
      setIsDragging(false)
      if (dragFrameRef.current != null) {
        cancelAnimationFrame(dragFrameRef.current)
        dragFrameRef.current = null
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      if (moved && finalPos) {
        setPosition(finalPos)
        saveFabPosition(storageKey, finalPos)
      } else if (!moved) {
        onTap()
      }
    },
    [storageKey]
  )

  useEffect(() => {
    if (!position) return
    const reclamp = () => {
      setPosition((prev) => {
        if (!prev) return prev
        const next = clampPosition(prev.left, prev.top)
        positionRef.current = next
        return next
      })
    }
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
    containerRef,
    position,
    isDragging,
    useCssDefault,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
