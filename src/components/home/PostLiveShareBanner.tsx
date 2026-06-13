import { Camera, Dumbbell, Share2, X } from 'lucide-react'
import { buildPostLiveFeedText } from '../../services/weeklyPact'

export interface PostLiveSession {
  minutes: number
  gymName?: string | null
}

export interface PostLiveShareBannerProps {
  session: PostLiveSession
  publishing?: boolean
  onPublish: (text: string) => void | Promise<void>
  onPublishWithPhoto: () => void
  onOpenEntrenoLog: () => void
  onShareStory?: () => void
  onOpenCoach?: () => void
  onDismiss: () => void
}

export function PostLiveShareBanner({
  session,
  publishing = false,
  onPublish,
  onPublishWithPhoto,
  onOpenEntrenoLog,
  onShareStory,
  onOpenCoach,
  onDismiss,
}: PostLiveShareBannerProps) {
  const text = buildPostLiveFeedText(session.minutes, session.gymName)
  const gymLabel = session.gymName?.trim() || 'el gym'

  return (
    <div className="mb-3 rounded-2xl border border-[#22c55e]/40 bg-gradient-to-r from-[#22c55e]/15 via-[#1C1C20] to-[#FF671F]/10 p-3 relative overflow-hidden">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-2 right-2 text-[#9CA3AF] active:text-white p-1"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-[#22c55e]/25 flex items-center justify-center flex-shrink-0">
          <Share2 size={18} className="text-[#22c55e]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">Sesión live · {session.minutes} min</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">
            Comparte en el muro con un toque — Entrené en {gymLabel}
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <button
              type="button"
              disabled={publishing}
              onClick={() => void onPublish(text)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#22c55e] text-black active:brightness-90 disabled:opacity-60 flex items-center gap-1"
            >
              {publishing ? 'Publicando…' : 'Publicar 1-tap →'}
            </button>
            <button
              type="button"
              onClick={onPublishWithPhoto}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/15 text-white active:bg-white/10 flex items-center gap-1"
            >
              <Camera size={12} /> Con foto
            </button>
            <button
              type="button"
              onClick={onOpenEntrenoLog}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#FF671F]/35 text-[#FF671F] active:bg-[#FF671F]/10 flex items-center gap-1"
            >
              <Dumbbell size={12} /> Entreno de Hoy
            </button>
            {onShareStory && (
              <button
                type="button"
                onClick={onShareStory}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#FFD700]/35 text-[#FFD700] active:bg-[#FFD700]/10"
              >
                📸 Instagram
              </button>
            )}
          </div>
          {onOpenCoach && (
            <button
              type="button"
              onClick={onOpenCoach}
              className="mt-2 text-[9px] text-[#a5b4fc] font-semibold underline-offset-2 hover:underline"
            >
              ¿Subir de nivel con un PT? →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
