import type { ProfilePost } from '../../types'
import {
  SYNC_REPLAY_COPY,
  formatSyncReplayCard,
  isSyncReplayPost,
} from '../../utils/syncReplayCopy'

export interface SyncReplayGalleryProps {
  posts: ProfilePost[]
  onOpenPost?: (postId: string) => void
}

export function SyncReplayGallery({ posts, onOpenPost }: SyncReplayGalleryProps) {
  const replays = posts.filter(isSyncReplayPost)

  if (replays.length === 0) return null

  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold mb-0.5 px-1">
        {SYNC_REPLAY_COPY.galleryTitle}
      </p>
      <p className="text-[9px] text-[#9CA3AF] mb-2 px-1 leading-snug">{SYNC_REPLAY_COPY.galleryHint}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {replays.slice(0, 8).map((p) => {
          const { title, subtitle } = formatSyncReplayCard(p)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenPost?.(p.id)}
              className="flex-shrink-0 w-[108px] p-2.5 rounded-xl bg-[#1C1C20] border border-[#22c55e]/25 text-left active:bg-[#25252A]"
            >
              <div className="text-lg mb-1">🤝</div>
              <p className="text-[10px] text-white font-semibold truncate">{title}</p>
              <p className="text-[8px] text-[#22c55e] mt-0.5 truncate">{subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
