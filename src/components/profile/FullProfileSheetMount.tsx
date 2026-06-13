import { AnimatePresence } from 'framer-motion'
import type { Profile, ProfilePost, Squad, TrainingReview, Workout, TrainerProfile } from '../../types'
import { getDistanceKm, calculateCompatibility, getTrainingStreak, getAverageRating } from '../../utils'
import { enrichProfileFromDirectory } from '../../utils/profileVerification'
import { formatTrainerRate } from '../../services/trainerCoach'
import { FullProfileSheet, type TrainerProfileSummary } from './FullProfileSheet'

export type FullProfileSheetMountProps = {
  profile: Profile | null
  realProfiles: Profile[]
  userLocation: { lat: number; lng: number } | null
  currentUser: Profile | null
  effectiveUserId: string
  profilePosts: Record<string, ProfilePost[]>
  profileViewWorkouts: Workout[]
  syncBonds: Record<string, { sessions: number; bondLevel: number; totalMin: number }>
  reviews: Record<string, TrainingReview[]>
  trainerProfiles: TrainerProfile[]
  squads: Squad[]
  matches: string[]
  realMatches: string[]
  feedReactions: Record<string, Record<string, string[]>>
  activeComment: { postId: string; postUserId?: string } | null
  commentDraft: string
  getRelativeTime: (ts: number) => string
  onClose: () => void
  onLoadPosts: (profileId: string) => void
  onOpenHomeFeed: () => void
  onTrainTogether: (profile: Profile) => void
  onOpenChat: (profileId: string) => void
  onSwipeLeft: (profileId: string) => void
  onSwipeRight: (profileId: string) => void
  onBookTrainer: (trainerUserId: string) => void
  onOpenSquad: (squadId: string) => void
  onReport: (profileId: string) => void
  onBlock: (profile: Profile) => void | Promise<void>
  onBoostReaction: (postId: string, emoji: string, profileId: string) => void
  onCopyWorkout: (workoutId: string, title?: string) => void
  onLikePost: (postId: string, profileId: string) => void
  onOpenComments: (postId: string, profileId: string, ownerName: string) => void
  onDeleteComment: (postId: string, profileId: string, commentId: string) => void
  onCommentDraftChange: (value: string) => void
  onSubmitComment: () => void
  onCancelComment: () => void
}

function pickTrainerSummary(
  trainerProfiles: TrainerProfile[],
  userId: string
): TrainerProfileSummary | null {
  const tp = trainerProfiles.find((t) => t.userId === userId)
  if (!tp) return null
  return {
    userId: tp.userId,
    hourlyRateClp: tp.hourlyRateClp,
    sessionDurationMin: tp.sessionDurationMin,
    avgRating: tp.avgRating,
    reviewCount: tp.reviewCount,
  }
}

/** Fase 362 — FullProfileSheet mount + computed metrics extracted from App.tsx. */
export function FullProfileSheetMount({
  profile,
  realProfiles,
  userLocation,
  currentUser,
  effectiveUserId,
  profilePosts,
  profileViewWorkouts,
  syncBonds,
  reviews,
  trainerProfiles,
  squads,
  matches,
  realMatches,
  feedReactions,
  activeComment,
  commentDraft,
  getRelativeTime,
  onClose,
  onLoadPosts,
  onOpenHomeFeed,
  onTrainTogether,
  onOpenChat,
  onSwipeLeft,
  onSwipeRight,
  onBookTrainer,
  onOpenSquad,
  onReport,
  onBlock,
  onBoostReaction,
  onCopyWorkout,
  onLikePost,
  onOpenComments,
  onDeleteComment,
  onCommentDraftChange,
  onSubmitComment,
  onCancelComment,
}: FullProfileSheetMountProps) {
  return (
    <AnimatePresence>
      {profile && (
        <FullProfileSheet
          profile={enrichProfileFromDirectory(profile, realProfiles)}
          isRealTester={realProfiles.some((rp) => rp.id === profile.id)}
          userLocation={userLocation}
          currentUser={currentUser}
          effectiveUserId={effectiveUserId}
          profilePosts={profilePosts[profile.id] || []}
          profileViewWorkouts={profileViewWorkouts}
          syncBond={syncBonds[profile.id] ?? null}
          reviews={reviews}
          trainerProfile={pickTrainerSummary(trainerProfiles, profile.id)}
          squads={squads}
          matches={matches}
          realMatches={realMatches}
          feedReactions={feedReactions}
          activeComment={activeComment}
          commentDraft={commentDraft}
          distanceKm={
            userLocation
              ? getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)
              : null
          }
          compatibilityPct={
            currentUser ? calculateCompatibility(currentUser, profile, userLocation) : null
          }
          ratingAvg={getAverageRating(profile.id, reviews).avg}
          ratingCount={getAverageRating(profile.id, reviews).count}
          trainingStreak={getTrainingStreak(profile.id, reviews)}
          formatTrainerRate={formatTrainerRate}
          getRelativeTime={getRelativeTime}
          onClose={onClose}
          onLoadPosts={() => onLoadPosts(profile.id)}
          onOpenHomeFeed={onOpenHomeFeed}
          onTrainTogether={() => onTrainTogether(profile)}
          onOpenChat={() => onOpenChat(profile.id)}
          onSwipeLeft={() => onSwipeLeft(profile.id)}
          onSwipeRight={() => onSwipeRight(profile.id)}
          onBookTrainer={onBookTrainer}
          onOpenSquad={onOpenSquad}
          onReport={() => onReport(profile.id)}
          onBlock={() => onBlock(profile)}
          onBoostReaction={(postId, emo) => onBoostReaction(postId, emo, profile.id)}
          onCopyWorkout={onCopyWorkout}
          onLikePost={(postId) => onLikePost(postId, profile.id)}
          onOpenComments={(postId) => onOpenComments(postId, profile.id, profile.name)}
          onDeleteComment={(postId, commentId) => onDeleteComment(postId, profile.id, commentId)}
          onCommentDraftChange={onCommentDraftChange}
          onSubmitComment={onSubmitComment}
          onCancelComment={onCancelComment}
        />
      )}
    </AnimatePresence>
  )
}
