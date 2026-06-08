import type { ProfilePost } from '../../types'

export interface SyncReplayGalleryProps {
  posts: ProfilePost[]
  onOpenPost?: (postId: string) => void
}

export function SyncReplayGallery({ posts, onOpenPost }: SyncReplayGalleryProps) {
  const replays = posts.filter(
    (p) =>
      p.postType === 'workout' ||
      (p.text || '').includes('ENTRENASYNC') ||
      (p.text || '').includes('Sync con')
  )

  if (replays.length === 0) return null

  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold mb-2 px-1">
        Replays EntrenaSync
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {replays.slice(0, 8).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenPost?.(p.id)}
            className="flex-shrink-0 w-[100px] p-2 rounded-xl bg-[#1C1C20] border border-[#22c55e]/25 text-left active:bg-[#25252A]"
          >
            <div className="text-lg mb-1">🔄</div>
            <p className="text-[9px] text-white font-semibold line-clamp-2">{p.text?.slice(0, 40) || 'Sync'}</p>
            {p.workoutPreview && (
              <p className="text-[8px] text-[#22c55e] mt-0.5">{p.workoutPreview.totalSets} sets</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
