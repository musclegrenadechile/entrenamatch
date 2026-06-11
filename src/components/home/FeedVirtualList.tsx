import { useVirtualizer } from '@tanstack/react-virtual'
import type { ReactNode, RefObject } from 'react'

const DEFAULT_ESTIMATE = 300
const VIRTUALIZE_MIN_ITEMS = 6

export type FeedVirtualListProps<T> = {
  parentRef: RefObject<HTMLElement | null>
  items: T[]
  getKey: (item: T, index: number) => string
  renderItem: (item: T, index: number) => ReactNode
  enabled?: boolean
  estimateSize?: number
}

/**
 * Windowed feed list — only mounts visible posts (+ overscan).
 */
export function FeedVirtualList<T>({
  parentRef,
  items,
  getKey,
  renderItem,
  enabled = true,
  estimateSize = DEFAULT_ESTIMATE,
}: FeedVirtualListProps<T>) {
  const useVirtual = enabled && items.length >= VIRTUALIZE_MIN_ITEMS

  const virtualizer = useVirtualizer({
    count: useVirtual ? items.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 4,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  if (!useVirtual) {
    return <>{items.map((item, index) => renderItem(item, index))}</>
  }

  return (
    <div
      className="feed-virtual-list"
      style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const item = items[row.index]
        return (
          <div
            key={getKey(item, row.index)}
            data-index={row.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start}px)`,
            }}
          >
            {renderItem(item, row.index)}
          </div>
        )
      })}
    </div>
  )
}
