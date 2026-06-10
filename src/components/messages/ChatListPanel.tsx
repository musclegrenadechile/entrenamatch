import { useMemo } from 'react'

import { BRAND_COPY } from '../../constants/brandCopy'

import type { Message, Profile } from '../../types'

import { getDistanceKm } from '../../utils'

import {

  formatChatListTime,

  formatChatPreview,

  getLastChatMessage,

  sortProfilesByChatActivity,

} from '../../utils/chatListSort'

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

  getRelativeTime?: (ts?: number) => string

  onSelectChat: (profileId: string) => void

  onOpenExplore?: () => void

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

  onSelectChat,

  onOpenExplore,

}: ChatListPanelProps) {

  const syncAgeSec = lastSync

    ? Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))

    : null



  const visibleMatches = useMemo(() => {

    const filtered = matchProfiles.filter((p) => !blockedUsers.includes(p.id))

    return sortProfilesByChatActivity(filtered, messages)

  }, [matchProfiles, blockedUsers, messages])



  if (isLoadingChats && visibleMatches.length === 0 && !isDemoMode) {

    return (

      <div className="chat-wa-list flex-1 min-h-0 overflow-auto">

        <SkeletonList count={5} variant="chat" />

      </div>

    )

  }



  return (

    <div className="chat-wa-list flex-1 min-h-0 overflow-auto">

      <div className="chat-wa-list-header">

        <div className="flex items-center justify-between">

          <span className="chat-wa-list-title">Chats</span>

          {syncAgeSec != null && (

            <span className="text-[10px] text-[#8696a0]">hace {syncAgeSec}s</span>

          )}

        </div>

        <p className="text-[11px] text-[#8696a0] mt-0.5">

          Matches con los que puedes entrenar

        </p>

      </div>



      {matchProfiles.length === 0 && (

        <div className="chat-wa-list-empty">

          <div className="text-4xl mb-3 opacity-50">💬</div>

          <div className="font-bold text-[#e9edef] text-lg">{BRAND_COPY.networkTitle}</div>

          <p className="text-sm text-[#8696a0] max-w-[260px] mx-auto mt-2 leading-relaxed">

            Aquí aparecen tus matches. Texto, fotos y notas de voz.

          </p>

          {onOpenExplore && (

            <button

              type="button"

              onClick={onOpenExplore}

              className="mt-5 px-5 py-2.5 rounded-full bg-[#FF671F] text-black text-sm font-bold active:brightness-90"

            >

              Ir a Explorar

            </button>

          )}

        </div>

      )}



      {visibleMatches.map((profile) => {

        const chatMsgs = messages[profile.id] || []

        const last = getLastChatMessage(chatMsgs)

        const unread = chatUnreads[profile.id] || 0

        const isLive = !!profile.trainingNow

        const isBond = !!syncBonds[profile.id]

        const lastText = formatChatPreview(last)

        const timeLabel = last?.timestamp

          ? formatChatListTime(last.timestamp)

          : unread > 0

            ? 'Nuevo'

            : ''



        return (

          <div

            key={profile.id}

            role="button"

            tabIndex={0}

            onClick={() => onSelectChat(profile.id)}

            onKeyDown={(e) => e.key === 'Enter' && onSelectChat(profile.id)}

            className={`chat-wa-list-row${unread > 0 ? ' chat-wa-list-row--unread' : ''}`}

          >

            <div className={`chat-wa-list-avatar ${isLive ? 'live' : ''}`}>

              <VerifiedProfilePhoto

                src={profile.photos[0]}

                alt={`Foto de ${profile.name}`}

                className="w-full h-full"

                imgClassName="w-full h-full object-cover"

                verificationStatus={profile.verificationStatus}

                showBadge={false}

              />

              {isProfileVerified(profile.verificationStatus) && (

                <VerifiedPhotoBadge size="xs" corner="top-right" className="top-0 right-0" />

              )}

            </div>



            <div className="chat-wa-list-body">

              <div className="flex items-baseline justify-between gap-2">

                <span className={`chat-wa-list-name${unread > 0 ? ' chat-wa-list-name--unread' : ''}`}>

                  {profile.name}

                  {isBond && <span className="chat-wa-list-bond">RED</span>}

                </span>

                {timeLabel ? (

                  <span className={`chat-wa-list-time${unread > 0 ? ' chat-wa-list-time--unread' : ''}`}>

                    {timeLabel}

                  </span>

                ) : null}

              </div>

              <div className="flex items-center gap-2 mt-0.5">

                <span className={`chat-wa-list-preview ${unread > 0 ? 'unread' : ''}`}>

                  {lastText}

                </span>

                {unread > 0 && (

                  <span className="chat-wa-list-badge">{unread > 9 ? '9+' : unread}</span>

                )}

              </div>

              {userLocation && profile.lat != null && profile.lng != null && (

                <span className="text-[10px] text-[#FF671F]/80 mt-0.5 block">

                  {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km ·{' '}

                  {profile.city}

                </span>

              )}

            </div>

          </div>

        )

      })}

    </div>

  )

}


