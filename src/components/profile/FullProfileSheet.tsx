import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Flame, MapPin, Star, Zap } from 'lucide-react'
import type {
  Profile,
  ProfilePost,
  Squad,
  TrainingReview,
  Workout,
} from '../../types'
import { ProfileAthletePulse } from './ProfileAthletePulse'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from './VerifiedProfilePhoto'
import { VerifiedIdentityPrize } from './VerifiedIdentityPrize'
import { isProfileVerified } from '../../utils/identityVerification'
import { isPubliclyVerified } from '../../utils/profileVerification'
import { BETA_BOT_BADGE_LABEL, isBetaBotProfile } from '../../utils/betaBots'
import { COMMUNITY_ADMIN_BADGE_LABEL, isCommunityAdminProfile } from '../../utils/appAdmin'
import { BRAND_COPY } from '../../constants/brandCopy'
import { WorkoutPostCard } from '../workout/WorkoutPostCard'
import { shareWorkoutStory, toastWorkoutShareOutcome } from '../../utils/workoutStoryShare'
import { toast } from 'sonner'

export interface TrainerProfileSummary {
  userId: string
  hourlyRateClp: number
  sessionDurationMin: number
  avgRating: number
  reviewCount: number
}

export interface FullProfileSheetProps {
  profile: Profile
  isRealTester: boolean
  userLocation: { lat: number; lng: number } | null
  currentUser: Profile | null
  effectiveUserId: string
  profilePosts: ProfilePost[]
  profileViewWorkouts: Workout[]
  syncBond: { sessions: number; bondLevel: number; totalMin: number } | null
  reviews: Record<string, TrainingReview[]>
  trainerProfile: TrainerProfileSummary | null
  squads: Squad[]
  matches: string[]
  realMatches: string[]
  feedReactions: Record<string, Record<string, string[]>>
  activeComment: { postId: string; postUserId?: string } | null
  commentDraft: string
  distanceKm: number | null
  compatibilityPct: number | null
  ratingAvg: number
  ratingCount: number
  trainingStreak: number
  formatTrainerRate: (clp: number) => string
  getRelativeTime: (ts: number) => string
  onClose: () => void
  onLoadPosts: () => void
  onOpenHomeFeed: () => void
  onTrainTogether: () => void
  onOpenChat: () => void
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onBookTrainer: (trainerUserId: string) => void
  onOpenSquad: (squadId: string) => void
  onReport: () => void
  onBlock: () => void
  onBoostReaction: (postId: string, emoji: string) => void
  onCopyWorkout: (workoutId: string, title?: string) => void
  onLikePost: (postId: string) => void
  onOpenComments: (postId: string) => void
  onDeleteComment: (postId: string, commentId: string) => void
  onCommentDraftChange: (value: string) => void
  onSubmitComment: () => void
  onCancelComment: () => void
}

export function FullProfileSheet({
  profile,
  isRealTester,
  userLocation,
  currentUser,
  effectiveUserId,
  profilePosts,
  profileViewWorkouts,
  syncBond,
  reviews,
  trainerProfile,
  squads,
  matches,
  realMatches,
  feedReactions,
  activeComment,
  commentDraft,
  distanceKm,
  compatibilityPct,
  ratingAvg,
  ratingCount,
  trainingStreak,
  formatTrainerRate,
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
}: FullProfileSheetProps) {
  const sortedPosts = [...profilePosts].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp
  )
  const userSquads = squads.filter((sq) => sq.members.includes(profile.id))
  const isMatch = matches.includes(profile.id) || realMatches.includes(profile.id)
  const profileReviews = reviews[profile.id] || []
  const verified = isPubliclyVerified(profile)
  const verifiedAt = (profile as Profile & { verificationDate?: number }).verificationDate
  const liveMins =
    profile.trainingNow && profile.trainingNowSince
      ? Math.floor((Date.now() - profile.trainingNowSince) / 60000)
      : null
  const locationLine = [
    profile.city?.trim() || 'Tu zona',
    profile.country,
    distanceKm != null && userLocation ? `${distanceKm} km` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="em-v2-full-profile absolute inset-0 z-[90] flex flex-col" onClick={onClose}>
      <div
        className="em-v2-full-profile__header p-4 flex items-center justify-between shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Volver">
          <ArrowLeft />
        </button>
        <div className="font-medium flex items-center gap-2 text-sm">
          Perfil completo
          {isRealTester && (
            <span className="text-[9px] bg-[#FF4F79]/90 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">
              TESTER
            </span>
          )}
        </div>
        <div className="w-6" />
      </div>
      <div className="overflow-auto flex-1" onClick={(e) => e.stopPropagation()}>
        <div className="full-profile-hero relative">
          <VerifiedProfilePhoto
            src={profile.photos[0]}
            alt={`Foto de ${profile.name}`}
            className="w-full full-profile-hero__photo"
            imgClassName="w-full h-full object-cover"
            verificationStatus={profile.verificationStatus}
            showBadge={false}
            showRing
          />
          <div className="full-profile-hero__shade" aria-hidden />
          {verified && (
            <VerifiedPhotoBadge size="lg" corner="top-right" className="top-4 right-4" />
          )}
          {profile.photos.length > 1 && (
            <div className="full-profile-hero__gallery">
              {profile.photos.slice(1, 4).map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`Galería de ${profile.name} ${i + 2}`}
                  className="full-profile-hero__thumb"
                />
              ))}
            </div>
          )}
          <div className="full-profile-hero__title">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="full-profile-hero__name">
                {profile.name}
                <span className="full-profile-hero__age">, {profile.age}</span>
              </h1>
              {profile.trainingNow && (
                <span className="full-profile-live-dot" title="Entrenando ahora">
                  <span className="full-profile-live-dot__pulse" aria-hidden />
                  LIVE
                </span>
              )}
              {verified && <VerifiedIdentityPrize variant="inline" />}
              {isBetaBotProfile(profile) && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 font-semibold border border-violet-400/40"
                  title="Persona de ambiente para la beta — no es un usuario real"
                >
                  {BETA_BOT_BADGE_LABEL}
                </span>
              )}
              {isCommunityAdminProfile(profile) && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 font-semibold border border-sky-400/40"
                  title="Administrador de la comunidad"
                >
                  {COMMUNITY_ADMIN_BADGE_LABEL}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="full-profile-action-card">
          <p className="full-profile-action-card__location">
            <MapPin size={14} className="shrink-0 text-[#FF671F]" aria-hidden />
            {locationLine}
          </p>

          <div className="full-profile-meta-row">
            {profile.trainingNow && liveMins != null && (
              <span className="full-profile-meta-chip full-profile-meta-chip--live">
                En vivo · {liveMins}m
                {profile.liveStreak && profile.liveStreak > 0 && (
                  <>
                    {' '}
                    <Flame size={11} className="inline -mt-px" aria-hidden />
                    {profile.liveStreak}d
                  </>
                )}
              </span>
            )}
            {compatibilityPct != null && (
              <span className="full-profile-meta-chip full-profile-meta-chip--match">
                {compatibilityPct}% match
              </span>
            )}
            {ratingCount > 0 && (
              <span className="full-profile-meta-chip">
                <Star size={11} className="inline -mt-px text-[#fbbf24]" aria-hidden />
                {ratingAvg} · {ratingCount}
              </span>
            )}
            {trainingStreak > 1 && (
              <span className="full-profile-meta-chip">
                <Flame size={11} className="inline -mt-px text-[#FF671F]" aria-hidden />
                {trainingStreak} seguidas
              </span>
            )}
          </div>

          {compatibilityPct != null && (
            <div className="full-profile-match-bar" aria-hidden>
              <div
                className="full-profile-match-bar__fill"
                style={{ width: `${Math.min(100, Math.max(0, compatibilityPct))}%` }}
              />
            </div>
          )}

          {profile.trainingNow && profile.id !== effectiveUserId && (
            <button
              type="button"
              onClick={onTrainTogether}
              className="full-profile-cta"
            >
              <span className="full-profile-cta__main">
                <Zap size={18} aria-hidden />
                Entrenar juntos
              </span>
              <span className="full-profile-cta__sub">Abrir EntrenaSync</span>
            </button>
          )}

          {!profile.trainingNow && profile.id !== effectiveUserId && (
            <p className="full-profile-offline-hint">No está en vivo ahora — vuelve cuando active LIVE en el mapa.</p>
          )}

          {trainerProfile && (
            <div className="full-profile-trainer">
              <div className="text-[10px] font-bold text-[#a5b4fc] uppercase tracking-wider mb-1">
                Entrenador personal
              </div>
              <div className="text-sm text-white font-semibold">
                {formatTrainerRate(trainerProfile.hourlyRateClp)}/h · {trainerProfile.sessionDurationMin} min
              </div>
              {trainerProfile.avgRating > 0 && (
                <div className="text-xs text-[#cbd5e1] mt-1 flex items-center gap-1">
                  <Star size={12} className="text-[#fbbf24]" aria-hidden />
                  {trainerProfile.avgRating} ({trainerProfile.reviewCount} sesiones)
                </div>
              )}
              {profile.id !== effectiveUserId && (
                <button
                  type="button"
                  className="full-profile-trainer__btn"
                  onClick={() => onBookTrainer(trainerProfile.userId)}
                >
                  Reservar EntrenaCoach
                </button>
              )}
            </div>
          )}

          {profileReviews.some((r) => r.photo) && (
            <div className="full-profile-sessions">
              <div className="text-[10px] text-[#9CA3AF] mb-2 uppercase tracking-wider">Sesiones juntos</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profileReviews
                  .filter((r) => r.photo)
                  .map((r, idx) => (
                    <img
                      key={idx}
                      src={r.photo}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-[#2F2F35]"
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 space-y-6">
          {verified && (
            <VerifiedIdentityPrize variant="banner" showPerks verifiedAt={verifiedAt} />
          )}
          {profile.id !== effectiveUserId && (
            <ProfileAthletePulse
              profile={profile}
              syncBond={syncBond}
              recentWorkouts={profileViewWorkouts}
              lastWorkoutPost={
                profilePosts.find((p) => p.postType === 'workout' && p.workoutPreview) ?? null
              }
            />
          )}
          {profile.bio?.trim() && (
            <div>
              <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-1.5">BIOGRAFÍA</div>
              <p className="leading-snug">{profile.bio}</p>
            </div>
          )}
          {(profile.trainingTypes?.length ?? 0) > 0 && (
            <div>
              <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">ENTRENA</div>
              <div className="flex flex-wrap gap-2">
                {profile.trainingTypes!.map((t) => (
                  <div key={t} className="chip">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(profile.goals?.length ?? 0) > 0 && (
            <div>
              <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">OBJETIVOS</div>
              <div className="flex flex-wrap gap-2">
                {profile.goals!.map((g) => (
                  <div key={g} className="chip chip-active">
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2 flex justify-between items-center px-1">
              <span>MURO DE {profile.name.toUpperCase()}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={onOpenHomeFeed}
                  className="text-[9px] text-[#FF671F] underline active:opacity-70"
                >
                  {BRAND_COPY.communityWallTitle}
                </button>
                <button
                  type="button"
                  onClick={onLoadPosts}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10"
                >
                  Refrescar
                </button>
              </div>
            </div>
            <AnimatePresence>
              {sortedPosts.length > 0 ? (
                sortedPosts.slice(0, 6).map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="em-v2-full-profile__post"
                  >
                    {post.postType === 'workout' && post.workoutPreview ? (
                      <WorkoutPostCard
                        preview={post.workoutPreview}
                        compact
                        postId={post.id}
                        reactions={post.reactions}
                        feedReactions={feedReactions[post.id]}
                        effectiveUserId={effectiveUserId}
                        onReact={(emo) => onBoostReaction(post.id, emo)}
                        onCopyRoutine={
                          post.workoutId && profile.id !== effectiveUserId
                            ? () => onCopyWorkout(post.workoutId!, post.workoutPreview?.title)
                            : undefined
                        }
                        onShareStory={
                          profile.id === effectiveUserId
                            ? () => {
                                void shareWorkoutStory({
                                  userName: currentUser?.name || 'Atleta',
                                  userPhoto: currentUser?.photo || currentUser?.photos?.[0],
                                  userId: effectiveUserId,
                                  preview: post.workoutPreview!,
                                  prSummary: post.text?.includes('PR') ? post.text : undefined,
                                }).then((outcome) => toastWorkoutShareOutcome(toast, outcome))
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <>
                        <div className="text-[13px] leading-snug mb-2 text-white/95">
                          {post.pinned ? '📌 ' : ''}
                          <div>{post.text}</div>
                        </div>
                        {post.photo && (
                          <img
                            src={post.photo}
                            alt=""
                            className="w-full max-h-[200px] object-cover rounded-2xl mb-2"
                          />
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#9CA3AF] mt-2">
                      <span>{getRelativeTime(post.timestamp)}</span>
                      <button
                        type="button"
                        onClick={() => onLikePost(post.id)}
                        className="active:text-[#FF671F]"
                      >
                        ❤️ {(post.likes || []).length}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenComments(post.id)}
                        className="active:text-[#FF671F]"
                      >
                        💬 {(post.comments || []).length}
                      </button>
                    </div>
                    {activeComment?.postId === post.id && (
                      <div className="mt-2 pt-2 border-t border-[#2F2F35] flex items-center gap-2">
                        <input
                          type="text"
                          value={commentDraft}
                          onChange={(e) => onCommentDraftChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              onSubmitComment()
                            }
                          }}
                          placeholder={`Comentar en el muro de ${profile.name}...`}
                          className="flex-1 bg-[#1A1A1E] border border-[#2F2F35] rounded-2xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF671F]"
                          maxLength={200}
                        />
                        <button
                          type="button"
                          onClick={onSubmitComment}
                          disabled={!commentDraft.trim()}
                          className="text-[#FF671F] text-sm font-medium px-3 disabled:opacity-40"
                        >
                          Enviar
                        </button>
                        <button type="button" onClick={onCancelComment} className="text-[#9CA3AF] text-xs">
                          ✕
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-xs text-[#9CA3AF] italic">
                  Este perfil aún no tiene publicaciones en el muro. ¡Anímalo a publicar!
                </div>
              )}
            </AnimatePresence>
          </div>

          {userSquads.length > 0 && (
            <div>
              <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">SQUADS</div>
              <div className="flex flex-wrap gap-2">
                {userSquads.map((sq) => (
                  <button
                    key={sq.id}
                    type="button"
                    onClick={() => onOpenSquad(sq.id)}
                    className="em-v2-chip-btn em-v2-chip-btn--brand em-v2-chip-btn--sm cursor-pointer"
                  >
                    {sq.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
              <span className="text-[#9CA3AF] text-[10px]">Nivel</span>
              <br />
              <span className="text-[11px] px-1.5 py-px rounded-full bg-[#FF4F79]/10 text-[#FF4F79] font-semibold inline-block mt-0.5">
                {profile.level}
              </span>
            </div>
            <div>
              <span className="text-[#9CA3AF]">Disponible</span>
              <br />
              {profile.availability.join(', ')}
            </div>
          </div>
        </div>
      </div>
      <div
        className="em-v2-full-profile__footer em-v2-full-profile__footer--actions p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isMatch ? (
          <button type="button" onClick={onOpenChat} className="em-v2-hero-card__cta flex-1">
            Abrir chat con {(profile.name || 'Usuario').split(' ')[0]}
          </button>
        ) : (
          <>
            <button type="button" onClick={onSwipeLeft} className="em-v2-cta-secondary">
              Pasar
            </button>
            <button type="button" onClick={onSwipeRight} className="em-v2-hero-card__cta flex-1">
              Me interesa
            </button>
          </>
        )}
      </div>
      <div
        className="em-v2-full-profile__footer p-4 flex gap-3 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onReport} className="em-v2-full-profile__danger-btn">
          Reportar
        </button>
        <button type="button" onClick={onBlock} className="em-v2-full-profile__danger-btn">
          Bloquear
        </button>
      </div>
      <div className="p-2 text-center text-[9px] text-[#9CA3AF]">
        Perfiles reales se sincronizan entre dispositivos
      </div>
    </div>
  )
}
