export function SwipeCardSkeleton() {
  return (
    <div className="em-v2-skeleton em-v2-skeleton--swipe">
      <div className="em-v2-skeleton__photo" />
      <div className="em-v2-skeleton__body">
        <div className="em-v2-skeleton__line em-v2-skeleton__line--lg w-3/5" />
        <div className="em-v2-skeleton__line w-2/5" />
        <div className="em-v2-skeleton__line w-4/5 mt-3" />
        <div className="em-v2-skeleton__line w-3/5" />
      </div>
    </div>
  )
}

export function MatchRowSkeleton() {
  return (
    <div className="em-v2-skeleton em-v2-skeleton--row">
      <div className="em-v2-skeleton__avatar" />
      <div className="flex-1 space-y-2">
        <div className="em-v2-skeleton__line w-2/5" />
        <div className="em-v2-skeleton__line w-3/5" />
      </div>
    </div>
  )
}

export function ChatRowSkeleton() {
  return (
    <div className="em-v2-skeleton em-v2-skeleton--row">
      <div className="em-v2-skeleton__avatar em-v2-skeleton__avatar--round" />
      <div className="flex-1 space-y-2">
        <div className="em-v2-skeleton__line w-1/3" />
        <div className="em-v2-skeleton__line w-4/5" />
      </div>
    </div>
  )
}

export function FeedPostSkeleton() {
  return (
    <div className="em-v2-skeleton em-v2-skeleton--feed">
      <div className="flex gap-2 mb-3">
        <div className="em-v2-skeleton__avatar" />
        <div className="flex-1 space-y-2">
          <div className="em-v2-skeleton__line w-2/5" />
          <div className="em-v2-skeleton__line w-1/4" />
        </div>
      </div>
      <div className="em-v2-skeleton__line w-4/5 mb-2" />
      <div className="em-v2-skeleton__line w-3/5 mb-3" />
      <div className="em-v2-skeleton__photo em-v2-skeleton__photo--sm" />
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
    <div className="em-v2-skeleton-list space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  )
}