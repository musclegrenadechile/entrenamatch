import type { RefObject, ReactNode } from 'react'
import { PullToRefresh } from '../ui/PullToRefresh'
import { ChatListPanel, ChatView } from '../messages'
import { WorkoutSessionFab } from '../workout/WorkoutSessionFab'
import type { ChatPactCompareData } from '../messages/ChatPactCompareStrip'
import type { Message, Profile, Workout } from '../../types'
import type { WorkoutDraft } from '../../utils/workoutDraft'
import type { ChatViewProps } from '../messages/ChatView'

export type RedMessagesPanelProps = {
  activeChat: string | null
  isDemoMode: boolean
  matchProfiles: Profile[]
  blockedUsers: string[]
  messages: Record<string, Message[]>
  chatUnreads: Record<string, number>
  syncBonds: Record<string, { bondLevel?: number; totalMin?: number }>
  userLocation: { lat: number; lng: number } | null
  isLoadingChats: boolean
  lastSync: Date | null
  getRelativeTime: (ts: number) => string
  onSelectChat: (id: string) => void
  onOpenExplore: () => void
  onRefreshList: () => Promise<void>
  chatProfile: Profile | undefined
  isRealMatch: boolean
  chatMessages: Message[]
  syncBond: { bondLevel?: number } | undefined
  workoutSessionDraft: WorkoutDraft | null
  entrenoRecentWorkouts?: Workout[]
  showEntrenaLogModal: boolean
  onResumeWorkout: () => void
  onQuickAddSet: () => void
  onOpenChatFromFab: () => void
  onOpenFuelFromFab: () => void
  totalChatUnreads: number
  chatViewProps: Omit<
    ChatViewProps,
    | 'activeChat'
    | 'chatProfile'
    | 'isRealMatch'
    | 'chatMessages'
    | 'syncBond'
    | 'isDemoMode'
    | 'isLoadingChats'
  >
}

/** Fase 348 — Red tab messages shell (list + active ChatView) extracted from App.tsx. */
export function RedMessagesPanel({
  activeChat,
  isDemoMode,
  matchProfiles,
  blockedUsers,
  messages,
  chatUnreads,
  syncBonds,
  userLocation,
  isLoadingChats,
  lastSync,
  getRelativeTime,
  onSelectChat,
  onOpenExplore,
  onRefreshList,
  chatProfile,
  isRealMatch,
  chatMessages,
  syncBond,
  workoutSessionDraft,
  entrenoRecentWorkouts = [],
  showEntrenaLogModal,
  onResumeWorkout,
  onQuickAddSet,
  onOpenChatFromFab,
  onOpenFuelFromFab,
  totalChatUnreads,
  chatViewProps,
}: RedMessagesPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {!activeChat ? (
        <PullToRefresh
          className="flex-1 flex flex-col min-h-0"
          disabled={isDemoMode}
          onRefresh={onRefreshList}
        >
          <ChatListPanel
            matchProfiles={matchProfiles}
            blockedUsers={blockedUsers}
            messages={messages}
            chatUnreads={chatUnreads}
            syncBonds={syncBonds}
            userLocation={userLocation}
            isDemoMode={isDemoMode}
            isLoadingChats={isLoadingChats}
            lastSync={lastSync}
            getRelativeTime={getRelativeTime}
            onSelectChat={onSelectChat}
            onOpenExplore={onOpenExplore}
          />
        </PullToRefresh>
      ) : (
        <>
          {workoutSessionDraft && !showEntrenaLogModal && (
            <WorkoutSessionFab
              draft={workoutSessionDraft}
              recentWorkouts={entrenoRecentWorkouts}
              onResume={onResumeWorkout}
              onQuickAddSet={onQuickAddSet}
              onOpenChat={onOpenChatFromFab}
              onOpenFuel={onOpenFuelFromFab}
              chatUnreadCount={totalChatUnreads}
              layout="chat-strip"
            />
          )}
          <ChatView
            activeChat={activeChat}
            chatProfile={chatProfile}
            isRealMatch={isRealMatch}
            chatMessages={chatMessages}
            syncBond={syncBond}
            isDemoMode={isDemoMode}
            isLoadingChats={isLoadingChats}
            {...chatViewProps}
          />
        </>
      )}
    </div>
  )
}
