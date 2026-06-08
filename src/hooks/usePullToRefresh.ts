import { useCallback, useRef, useState, type TouchEvent } from 'react'

const THRESHOLD = 72
const MAX_PULL = 120

export function usePullToRefresh(onRefresh: () => Promise<void>, disabled = false) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return
      const el = e.currentTarget as HTMLElement
      if (el.scrollTop > 0) return
      startY.current = e.touches[0].clientY
      pulling.current = true
    },
    [disabled, isRefreshing]
  )

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pulling.current || disabled || isRefreshing) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0) setPullDistance(Math.min(MAX_PULL, dy * 0.45))
      else setPullDistance(0)
    },
    [disabled, isRefreshing]
  )

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current || disabled) return
    pulling.current = false
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [disabled, isRefreshing, onRefresh, pullDistance])

  return {
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  }
}
