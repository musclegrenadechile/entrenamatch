import { Heart, MessageCircle } from 'lucide-react'
import type { Profile, ProfilePost, Squad, TrainingReview } from '../../types'
import { getDistanceKm, getTrainingStreak } from '../../utils'
import { SkeletonList } from '../ui/SkeletonLoaders'
import { MatchScoreBreakdown } from './MatchScoreBreakdown'

export interface MatchesTabProps {
  matchProfiles: Profile[]
  blockedUsers: string[]
  syncBonds: Record<string, { bondLevel?: number }>
  realProfiles: Profile[]
  currentUser: Profile | null
  userLocation: { lat: number; lng: number } | null
  reviews: Record<string, TrainingReview[]>
  squads: Squad[]
  effectiveUserId: string
  profilePosts: Record<string, ProfilePost[]>
  isDemoMode: boolean
  isLoadingMatches: boolean
  lastSync: Date | null
  onExplore: () => void
  onOpenChat: (profileId: string) => void
}

export function MatchesTab({
  matchProfiles,
  blockedUsers,
  syncBonds,
  realProfiles,
  currentUser,
  userLocation,
  reviews,
  squads,
  effectiveUserId,
  profilePosts,
  isDemoMode,
  isLoadingMatches,
  lastSync,
  onExplore,
  onOpenChat,
}: MatchesTabProps) {
  const syncAgeSec = lastSync
    ? Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))
    : null

  if (isLoadingMatches && matchProfiles.length === 0 && !isDemoMode) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="section-header mb-4">Tus matches</div>
        <SkeletonList count={4} variant="match" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <div className="section-header">Tus matches</div>
          <div className="text-[#9CA3AF] text-sm">
            Tu red de gym partners
          </div>
        </div>
        {syncAgeSec != null && (
          <span className="text-[10px] text-[#9CA3AF] ml-2">Actualizado hace {syncAgeSec}s</span>
        )}
      </div>
      <div className="text-[#9CA3AF] px-1 mb-4 text-xs">Desliza abajo para actualizar</div>

      {matchProfiles.length === 0 ? (
        <div className="mt-10 px-4 space-y-4">
          <div className="card p-8 rounded-3xl text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-4">
              <Heart className="text-[#FF671F]" size={36} />
            </div>
            <div className="font-semibold text-xl mb-2">Aún no tienes matches</div>
            <p className="text-sm text-[#9CA3AF] leading-snug mb-4 max-w-[300px] mx-auto">
              Sigue explorando partners compatibles cerca de ti.
            </p>
            <div className="flex gap-2 justify-center">
              <button type="button" onClick={onExplore} className="btn-primary px-6">
                Ir a Explorar
              </button>
            </div>
            {syncAgeSec != null && (
              <div className="text-[10px] text-[#9CA3AF] mt-2">Actualizado hace {syncAgeSec}s</div>
            )}
          </div>
          <div className="card p-5 rounded-2xl border border-[#FF671F]/20 text-left">
            <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold mb-2">¿Cómo funciona el match?</p>
            <ol className="text-sm text-[#9CA3AF] space-y-2 list-decimal list-inside leading-snug">
              <li>En <strong className="text-white">Explorar</strong>, desliza o toca ❤️ en perfiles compatibles.</li>
              <li>Si la otra persona también te da like, hay <strong className="text-white">match</strong> y se abre el chat.</li>
              <li>Desde el chat puedes iniciar <strong className="text-white">EntrenaSync</strong> y entrenar en vivo juntos.</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {matchProfiles
            .filter((p) => !blockedUsers.includes(p.id))
            .sort((a, b) => {
              const aInNet = syncBonds[a.id] ? -1 : 0
              const bInNet = syncBonds[b.id] ? -1 : 0
              if (aInNet !== bInNet) return aInNet - bInNet
              return 0
            })
            .map((profile) => (
              <div
                key={profile.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenChat(profile.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenChat(profile.id)}
                className={`card card-glass rounded-3xl overflow-hidden active:opacity-80 cursor-pointer relative ring-1 ring-white/5 ${
                  profile.trainingNow
                    ? 'ring-2 ring-[#22c55e]/60 shadow-lg shadow-[#22c55e]/10'
                    : ''
                }`}
                style={{ transition: 'transform 0.2s' }}
              >
                <div className="relative">
                  <img src={profile.photos[0]} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {profile.trainingNow && (
                      <div className="text-[9px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black px-1.5 py-0.5 rounded-full font-bold shadow-sm ring-1 ring-[#22c55e]/50">
                        LIVE {profile.liveStreak ? `${profile.liveStreak}d` : ''}
                      </div>
                    )}
                    {profile.verificationStatus === 'verified' && (
                      <div className="text-[9px] bg-[#22c55e] text-black px-1 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-3">
                    <div className="font-semibold">
                      {profile.name}, {profile.age}
                    </div>
                    <div className="text-xs text-[#FF4F79]">
                      {profile.city}, {profile.country}
                    </div>
                    {userLocation && (
                      <div className="text-[10px] text-[#FF671F]/80 mt-0.5">
                        {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km
                      </div>
                    )}
                    {getTrainingStreak(profile.id, reviews) > 1 && (
                      <div className="text-[10px] text-orange-400 mt-0.5">
                        {getTrainingStreak(profile.id, reviews)} seguidas
                      </div>
                    )}
                    {(() => {
                      const sharedSquads = squads.filter(
                        (sq) =>
                          sq.members.includes(effectiveUserId) &&
                          sq.members.includes(profile.id)
                      )
                      if (sharedSquads.length > 0) {
                        return (
                          <div className="text-[10px] text-[#FF671F] mt-0.5">
                            Squad: {sharedSquads[0].name}
                          </div>
                        )
                      }
                      return null
                    })()}
                    {(() => {
                      const posts = profilePosts[profile.id] || []
                      if (posts.length === 0) return null
                      const sorted = [...posts].sort(
                        (a, b) =>
                          (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp
                      )
                      const top = sorted.slice(0, 2)
                      const str = top
                        .map((p) => {
                          let t = (p.text || '').trim()
                          if (t.length > 35) t = t.slice(0, 32) + '...'
                          const pre = p.photo ? '📷' : p.pinned ? '📌' : '📝'
                          return `${pre} ${t}`
                        })
                        .join(' • ')
                      return (
                        <div className="text-[9px] text-[#FF671F]/90 mt-0.5 line-clamp-2 leading-tight">
                          {str}
                        </div>
                      )
                    })()}
                  </div>
                </div>
                {currentUser && (
                  <div className="px-2 pb-2" onClick={(e) => e.stopPropagation()}>
                    <MatchScoreBreakdown me={currentUser} them={profile} userLocation={userLocation} />
                  </div>
                )}
                <div className="p-3 text-xs text-[#9CA3AF] flex items-center gap-1">
                  <MessageCircle size={14} /> Abrir chat
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}