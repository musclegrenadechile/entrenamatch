import type { ReactNode } from 'react'

export interface EmV2EmptyStateProps {
  icon?: ReactNode
  emoji?: string
  title: string
  body?: string
  children?: ReactNode
  className?: string
  compact?: boolean
}

/** Visual 2.0 — empty state unificado (oleada 350). */
export function EmV2EmptyState({
  icon,
  emoji,
  title,
  body,
  children,
  className = '',
  compact,
}: EmV2EmptyStateProps) {
  return (
    <div
      className={`em-v2-empty${compact ? ' em-v2-empty--compact' : ''}${className ? ` ${className}` : ''}`}
      role="status"
    >
      {(icon || emoji) && (
        <div className="em-v2-empty__icon" aria-hidden>
          {icon ?? <span className="em-v2-empty__emoji">{emoji}</span>}
        </div>
      )}
      <h3 className="em-v2-empty__title">{title}</h3>
      {body && <p className="em-v2-empty__body">{body}</p>}
      {children && <div className="em-v2-empty__actions">{children}</div>}
    </div>
  )
}