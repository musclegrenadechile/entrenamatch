export function SwipeCardSkeleton() {
  return (
    <div className="skeleton-card skeleton-card--swipe animate-pulse">
      <div className="skeleton-card__photo" />
      <div className="skeleton-card__body">
        <div className="skeleton-line skeleton-line--lg w-3/5" />
        <div className="skeleton-line w-2/5" />
        <div className="skeleton-line w-4/5 mt-3" />
        <div className="skeleton-line w-3/5" />
      </div>
    </div>
  )
}

export function MatchRowSkeleton() {
  return (
    <div className="skeleton-match-row animate-pulse">
      <div className="skeleton-avatar" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-line w-2/5" />
        <div className="skeleton-line w-3/5" />
      </div>
    </div>
  )
}

export function ChatRowSkeleton() {
  return (
    <div className="skeleton-chat-row animate-pulse">
      <div className="skeleton-avatar skeleton-avatar--rounded" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-line w-1/3" />
        <div className="skeleton-line w-4/5" />
      </div>
    </div>
  )
}

export function FeedPostSkeleton() {
  return (
    <div className="skeleton-feed-post animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="skeleton-avatar" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-2/5" />
          <div className="skeleton-line w-1/4" />
        </div>
      </div>
      <div className="skeleton-line w-4/5 mb-2" />
      <div className="skeleton-line w-3/5 mb-3" />
      <div className="skeleton-card__photo skeleton-card__photo--sm" />
    </div>
  )
}

export function SkeletonList({
  count = 3,
  variant,
}: {
  count?: number
  variant: 'match' | 'chat' | 'feed'
}) {
  const Item =
    variant === 'match' ? MatchRowSkeleton : variant === 'chat' ? ChatRowSkeleton : FeedPostSkeleton
  return (
    <div className="skeleton-list space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  )
}
