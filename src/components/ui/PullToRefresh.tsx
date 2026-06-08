import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  disabled?: boolean
  className?: string
  children: ReactNode
}

export function PullToRefresh({ onRefresh, disabled, className = '', children }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh(onRefresh, disabled)

  return (
    <div
      className={`pull-to-refresh ${className}`}
      {...handlers}
    >
      {(pullDistance > 8 || isRefreshing) && (
        <div
          className="pull-to-refresh__indicator"
          style={{ height: isRefreshing ? 40 : pullDistance }}
        >
          <RefreshCw
            size={18}
            className={`pull-to-refresh__icon${isRefreshing ? ' pull-to-refresh__icon--spin' : ''}`}
            style={{ opacity: Math.min(1, pullDistance / 72) }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
