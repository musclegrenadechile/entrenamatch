import type { Message, Profile } from '../../types'
import { getDistanceKm } from '../../utils'
import { SkeletonList } from '../ui/SkeletonLoaders'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'
import { isProfileVerified } from '../../utils/identityVerification'

export interface ChatListPanelProps {
  matchProfiles: Profile[]
  blockedUsers: string[]
  messages: Record<string, Message[]>
  chatUnreads: Record<string, number>
  syncBonds: Record<string, unknown>
  userLocation: { lat: number; lng: number } | null
  isDemoMode: boolean
  isLoadingChats: boolean
  lastSync: Date | null
  getRelativeTime: (ts?: number) => string
  onSelectChat: (profileId: string) => void
}

export function ChatListPanel({
  matchProfiles,
  blockedUsers,
  messages,
  chatUnreads,
  syncBonds,
  userLocation,
  isDemoMode,
  isLoadingChats,
  lastSync,
  getRelativeTime,
  onSelectChat,
}: ChatListPanelProps) {
  const syncAgeSec = lastSync
    ? Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))
    : null

  const visibleMatches = matchProfiles.filter((p) => !blockedUsers.includes(p.id))

  if (isLoadingChats && visibleMatches.length === 0 && !isDemoMode) {
    return (
      <div className="overflow-auto flex-1 p-4 min-h-0">
        <div className="section-header mb-4">Mensajes</div>
        <SkeletonList count={5} variant="chat" />
      </div>
    )
  }

  return (
    <div className="overflow-auto flex-1 p-4 min-h-0">
      <div className="sticky top-0 bg-[#0D0D10] z-10 pb-2 -mx-4 px-4">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-2">
            <div className="section-header">Mensajes</div>
          </div>
          {syncAgeSec != null && (
            <span className="text-[10px] text-[#9CA3AF] ml-2">Actualizado hace {syncAgeSec}s</span>
          )}
        </div>
        <div className="text-[#9CA3AF] text-xs px-1 mb-3">
          Chats con tu equipo · desliza abajo para actualizar
        </div>
      </div>

      {matchProfiles.length === 0 && (
        <div className="mt-8 p-8 rounded-3xl text-center border border-[#FF671F]/15 bg-gradient-to-b from-[#1C1C20] to-[#0D0D10]">
          <div className="text-5xl mb-3 opacity-40">💬</div>
          <div className="font-black text-2xl tracking-[-1px] mb-2">Tu red de GymPartners</div>
          <p className="text-sm text-[#9CA3AF] max-w-[260px] mx-auto leading-relaxed">
            Aquí aparecen tus matches. Chats 1:1 con notas de voz y propuestas de entrenamiento.
          </p>
        </div>
      )}

      {visibleMatches.map((profile) => {
          const chatMsgs = messages[profile.id] || []
          const last = chatMsgs[chatMsgs.length - 1]
          const unread = chatUnreads[profile.id] || 0
          const isLive = !!profile.trainingNow
          const isBond = !!syncBonds[profile.id]
          const lastText = last
            ? last.voiceUrl
              ? '🎙️ Nota de voz'
              : last.text
            : 'Match nuevo — rompe el hielo'

          return (
            <div
              key={profile.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectChat(profile.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectChat(profile.id)}
              className="chat-list-card flex items-center gap-4 p-4 rounded-3xl mb-3 active:bg-[#25252A] cursor-pointer"
            >
              <div
                className={`chat-avatar w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 relative ${isLive ? 'live' : ''}`}
              >
                <VerifiedProfilePhoto
                  src={profile.photos[0]}
                  alt=""
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  verificationStatus={profile.verificationStatus}
                  showBadge={false}
                />
                {isProfileVerified(profile.verificationStatus) && (
                  <VerifiedPhotoBadge size="xs" corner="top-right" className="top-0.5 right-0.5" />
                )}
                {isLive && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#22c55e] rounded-full ring-2 ring-[#0D0D10] z-[55]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-[15px] flex items-center gap-1.5 tracking-[-0.2px]">
                    {profile.name}
                    {isBond && (
                      <span className="text-[8px] px-1.5 py-px bg-[#FFD700] text-black rounded font-black tracking-wider">
                        RED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0">
                    {profile.city}
                  </div>
                </div>

                {userLocation && (
                  <div className="text-[10px] text-[#FF671F] mt-px font-medium">
                    {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <div className="text-[13px] text-[#9CA3AF] truncate flex-1 leading-snug">
                    {lastText}
                  </div>
                  {last?.timestamp && (
                    <span className="text-[10px] text-[#6B7280] flex-shrink-0 tabular-nums">
                      {getRelativeTime(last.timestamp)}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="chat-unread ml-0.5 inline-flex items-center justify-center min-w-[19px] h-[19px] px-1.5 text-[10px] font-black rounded-full text-white">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
