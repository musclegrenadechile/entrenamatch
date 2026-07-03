import { CheckCircle, MapPin, MessageCircle } from 'lucide-react'
import type { Profile, ProfilePost, Squad, TrainingReview } from '../../types'
import { calculateCompatibility, getDistanceKm, getTrainingStreak } from '../../utils'
import { MatchProfilePhoto } from './MatchProfilePhoto'
import {
  displayMatchName,
  formatProfileLocation,
  hasReliableMapCoords,
} from '../../utils/matchProfileDisplay'
import { isProfileVerified } from '../../utils/identityVerification'

export type MatchCardProps = {
  profile: Profile
  currentUser: Profile | null
  userLocation: { lat: number; lng: number } | null
  syncBonds: Record<string, { bondLevel?: number; totalMin?: number }>
  squads: Squad[]
  effectiveUserId: string
  profilePosts: Record<string, ProfilePost[]>
  reviews: Record<string, TrainingReview[]>
  onOpenChat: (profileId: string) => void
}

function compatReason(me: Profile, them: Profile): string | null {
  const sharedTypes = me.trainingTypes.filter((t) => them.trainingTypes.includes(t))
  if (sharedTypes.length) return sharedTypes[0]
  const sharedGoals = (me.goals || []).filter((g) => them.goals.includes(g))
  if (sharedGoals.length) return sharedGoals[0]
  if (me.city === them.city) return them.city
  return null
}

function muroTeaser(posts: ProfilePost[]): string | null {
  if (!posts.length) return null
  const sorted = [...posts].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp
  )
  const t = (sorted[0].text || '').trim()
  if (!t) return null
  return t.length > 48 ? `${t.slice(0, 45)}…` : t
}

export function MatchCard({
  profile,
  currentUser,
  userLocation,
  syncBonds,
  squads,
  effectiveUserId,
  profilePosts,
  reviews,
  onOpenChat,
}: MatchCardProps) {
  const bond = syncBonds[profile.id]
  const isBond = !!bond
  const verified = isProfileVerified(profile.verificationStatus)
  const compat =
    currentUser != null
      ? calculateCompatibility(currentUser, profile, userLocation)
      : null
  const reason =
    currentUser != null ? compatReason(currentUser, profile) : null
  const dist =
    userLocation && hasReliableMapCoords(profile)
      ? getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)
      : null
  const streak = getTrainingStreak(profile.id, reviews)
  const sharedSquad = squads.find(
    (sq) => sq.members.includes(effectiveUserId) && sq.members.includes(profile.id)
  )
  const teaser = muroTeaser(profilePosts[profile.id] || [])

  return (
    <article
      className={`em-v2-match-card ${profile.trainingNow ? 'em-v2-match-card--live' : ''}`}
    >
      <button
        type="button"
        onClick={() => onOpenChat(profile.id)}
        className="em-v2-match-card__tap"
        aria-label={`Abrir chat con ${displayMatchName(profile)}`}
      >
        <div className="em-v2-match-card__media">
          <MatchProfilePhoto profile={profile} variant="cover" />
          <div className="em-v2-match-card__badges">
            {profile.trainingNow && (
              <span className="em-v2-badge em-v2-badge--live">
                LIVE{profile.liveStreak ? ` · ${profile.liveStreak}d` : ''}
              </span>
            )}
            {isBond && (
              <span className="em-v2-badge em-v2-badge--network">
                EntrenaSync{bond.totalMin ? ` · ${bond.totalMin}m` : ''}
              </span>
            )}
            {sharedSquad && (
              <span className="em-v2-badge em-v2-badge--muted">{sharedSquad.name}</span>
            )}
          </div>

          {compat !== null && (
            <div className="em-v2-match-ring em-v2-match-card__ring">
              <span className="em-v2-match-score">{compat}</span>
              <span className="em-v2-match-label">MATCH</span>
              <div className="em-v2-match-bar">
                <div className="em-v2-match-bar__fill" style={{ width: `${compat}%` }} />
              </div>
              {reason && (
                <span className="em-v2-match-card__reason">{reason}</span>
              )}
            </div>
          )}
        </div>

        <div className="em-v2-match-card__body">
          <div className="em-v2-match-card__identity">
            <div className="min-w-0">
              <p className="em-v2-match-card__name">
                <span className="truncate">{displayMatchName(profile)}</span>
                {profile.age ? (
                  <span className="em-v2-match-card__age">, {profile.age}</span>
                ) : null}
                {verified && (
                  <CheckCircle size={15} className="text-[#FF671F] shrink-0" aria-hidden />
                )}
              </p>
              <p className="em-v2-match-card__meta">
                {formatProfileLocation(profile.city, profile.country)}
                {dist !== null && (
                  <>
                    {' · '}
                    <MapPin size={11} className="inline -mt-px" aria-hidden />
                    {dist} km
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="em-v2-match-card__tags">
            {profile.trainingTypes.slice(0, 2).map((t) => (
              <span key={t} className="em-v2-tag">
                {t}
              </span>
            ))}
            {streak > 1 && (
              <span className="em-v2-tag em-v2-tag--goal">{streak} seguidas</span>
            )}
          </div>

          {teaser && <p className="em-v2-match-card__teaser">{teaser}</p>}

          <span className="em-v2-match-card__cta">
            <MessageCircle size={15} aria-hidden />
            Abrir chat
          </span>
        </div>
      </button>
    </article>
  )
}