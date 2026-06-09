import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'
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
import { BRAND_COPY } from '../../constants/brandCopy'
import { WorkoutPostCard } from '../workout/WorkoutPostCard'

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

  return (
    <div className="absolute inset-0 z-[90] bg-[#0D0D10] flex flex-col" onClick={onClose}>
      <div className="p-4 flex items-center justify-between border-b border-[#2F2F35]">
        <button type="button" onClick={onClose}>
          <ArrowLeft />
        </button>
        <div className="font-medium flex items-center gap-2">
          Perfil completo
          {isRealTester && (
            <span className="text-[10px] bg-[#FF4F79] text-black px-1.5 py-0.5 rounded-full font-bold">
              REAL TESTER
            </span>
          )}
        </div>
        <div />
      </div>
      <div className="overflow-auto flex-1">
        <div className="relative">
          <VerifiedProfilePhoto
            src={profile.photos[0]}
            alt={`Foto de ${profile.name}`}
            className="w-full aspect-square"
            imgClassName="w-full aspect-square object-cover"
            verificationStatus={profile.verificationStatus}
            showBadge={false}
            showRing
          />
          {verified && (
            <VerifiedPhotoBadge size="lg" corner="top-right" className="top-4 right-4" />
          )}
          {profile.photos.length > 1 && (
            <div className="absolute bottom-16 right-2 flex gap-1 overflow-x-auto max-w-[120px]">
              {profile.photos.slice(1, 4).map((p, i) => (
                <img key={i} src={p} alt={`Galería de ${profile.name} ${i + 2}`} className="w-8 h-8 rounded object-cover border border-white/50" />
              ))}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="text-4xl font-semibold tracking-[-1.5px]">
                {profile.name}, {profile.age}
              </div>
              {verified && <VerifiedIdentityPrize variant="inline" />}
            </div>
            <div className="flex gap-2 mt-1 text-[#FF671F] items-center">
              <MapPin size={18} /> {profile.city?.trim() || 'Tu zona'}, {profile.country}
            </div>
            {distanceKm != null && userLocation && (
              <div className="mt-1 text-sm text-[#FF671F] font-medium">A {distanceKm} km de ti</div>
            )}
            {profile.trainingNow && profile.trainingNowSince && (
              <>
                <div className="mt-2 inline-flex items-center gap-2 bg-[#22c55e] text-black px-3 py-1 rounded-full text-sm font-bold relative overflow-hidden shadow-md shadow-[#22c55e]/30">
                  🟢 ENTRENANDO AHORA • en vivo hace{' '}
                  {Math.floor((Date.now() - profile.trainingNowSince) / 60000)}m
                  {profile.liveStreak && profile.liveStreak > 0 && (
                    <span className="text-xs ml-1">🔥{profile.liveStreak}d</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onTrainTogether}
                  className="mt-1 w-full py-2 bg-[#22c55e] text-black rounded-2xl text-sm font-bold active:bg-[#16a34a]"
                >
                  🔥 Entrenar juntos — abrir EntrenaSync ahora
                </button>
              </>
            )}
            {compatibilityPct != null && (
              <div className="mt-2 inline-block bg-[#FF671F] text-black px-3 py-1 rounded-full text-sm font-bold">
                {compatibilityPct}% compatible para entrenar juntos
              </div>
            )}
            {ratingCount > 0 && (
              <div className="mt-2 text-sm">
                ★ {ratingAvg} promedio de {ratingCount} reseñas
                {trainingStreak > 1 && (
                  <span className="ml-2 text-orange-400">🔥 {trainingStreak} seguidas</span>
                )}
              </div>
            )}
            {trainerProfile && (
              <div className="mt-3 p-3 rounded-xl border border-[#6366f1]/35 bg-[#6366f1]/10">
                <div className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wider mb-1">
                  Entrenador personal
                </div>
                <div className="text-sm text-white font-semibold">
                  {formatTrainerRate(trainerProfile.hourlyRateClp)}/h ·{' '}
                  {trainerProfile.sessionDurationMin} min
                </div>
                {trainerProfile.avgRating > 0 && (
                  <div className="text-xs text-[#cbd5e1] mt-1">
                    ★ {trainerProfile.avgRating} ({trainerProfile.reviewCount} sesiones)
                  </div>
                )}
                {profile.id !== effectiveUserId && (
                  <button
                    type="button"
                    className="mt-2 w-full py-2 rounded-xl bg-[#6366f1] text-white text-sm font-bold"
                    onClick={() => onBookTrainer(trainerProfile.userId)}
                  >
                    Reservar sesión EntrenaCoach
                  </button>
                )}
              </div>
            )}
            {profileReviews.some((r) => r.photo) && (
              <div className="mt-3">
                <div className="text-xs text-[#9CA3AF] mb-1">Sesiones juntos</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {profileReviews
                    .filter((r) => r.photo)
                    .map((r, idx) => (
                      <img
                        key={idx}
                        src={r.photo}
                        alt=""
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-[#2F2F35]"
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
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
                    className="card card-glass p-3 mb-2 border-[#2F2F35]/80 hover:border-[#FF671F]/30"
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
                    className="chip cursor-pointer hover:bg-[#FF671F] hover:text-black"
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
      <div className="p-4 border-t border-[#2F2F35] flex gap-3">
        {isMatch ? (
          <button type="button" onClick={onOpenChat} className="flex-1 btn-primary">
            Abrir chat con {(profile.name || 'Usuario').split(' ')[0]}
          </button>
        ) : (
          <>
            <button type="button" onClick={onSwipeLeft} className="flex-1 btn-secondary">
              Pasar
            </button>
            <button type="button" onClick={onSwipeRight} className="flex-1 btn-primary">
              Me interesa
            </button>
          </>
        )}
      </div>
      <div className="p-4 border-t border-[#2F2F35] flex gap-3 text-sm">
        <button
          type="button"
          onClick={onReport}
          className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
        >
          Reportar
        </button>
        <button
          type="button"
          onClick={onBlock}
          className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
        >
          Bloquear
        </button>
      </div>
      <div className="p-2 text-center text-[9px] text-[#9CA3AF]">
        Perfiles reales se sincronizan entre dispositivos
      </div>
    </div>
  )
}
