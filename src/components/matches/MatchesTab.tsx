import { Heart, Users } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import type { Profile, ProfilePost, Squad, TrainingReview } from '../../types'
import { isIncompleteMatchProfile } from '../../utils/matchProfileDisplay'
import { SkeletonList } from '../ui/SkeletonLoaders'
import { MatchCard } from './MatchCard'

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
  /** Partner UIDs still fetching from Firestore (outside city snapshot). */
  loadingPartnerIds?: string[]
  lastSync: Date | null
  onExplore: () => void
  onOpenChat: (profileId: string) => void
  /** Fase 331 — crew opcional post-sync (no tab fijo) */
  onOpenSquads?: () => void
}

export function MatchesTab({
  matchProfiles,
  blockedUsers,
  syncBonds,
  currentUser,
  userLocation,
  reviews,
  squads,
  effectiveUserId,
  profilePosts,
  isDemoMode,
  isLoadingMatches,
  loadingPartnerIds = [],
  lastSync,
  onExplore,
  onOpenChat,
  onOpenSquads,
}: MatchesTabProps) {
  const syncPartnerCount = Object.keys(syncBonds).length
  const syncAgeSec = lastSync
    ? Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))
    : null

  const blockedFiltered = matchProfiles.filter((p) => !blockedUsers.includes(p.id))
  const readyProfiles = blockedFiltered.filter((p) => !isIncompleteMatchProfile(p))
  const pendingPartnerIds = [
    ...new Set([
      ...loadingPartnerIds,
      ...blockedFiltered.filter((p) => isIncompleteMatchProfile(p)).map((p) => p.id),
    ]),
  ].filter((id) => !readyProfiles.some((p) => p.id === id))
  const partnersStillLoading = !isDemoMode && pendingPartnerIds.length > 0

  if ((isLoadingMatches || partnersStillLoading) && readyProfiles.length === 0 && !isDemoMode) {
    return (
      <div className="em-v2-matches flex-1 overflow-auto px-4 pb-28">
        <p className="em-v2-matches__title">Tus matches</p>
        <SkeletonList count={3} variant="match" />
      </div>
    )
  }

  const sortedProfiles = [...readyProfiles].sort((a, b) => {
    const aBond = syncBonds[a.id] ? -1 : 0
    const bBond = syncBonds[b.id] ? -1 : 0
    if (aBond !== bBond) return aBond - bBond
    if (a.trainingNow !== b.trainingNow) return a.trainingNow ? -1 : 1
    return 0
  })

  return (
    <div className="em-v2-matches flex-1 overflow-auto px-4 pb-28">
      <header className="em-v2-matches__header">
        <div>
          <p className="em-v2-matches__eyebrow">{BRAND_COPY.networkTitle}</p>
          <h2 className="em-v2-matches__title">Tus matches</h2>
          <p className="em-v2-matches__sub">
            {readyProfiles.length > 0
              ? `${readyProfiles.length} conexión${readyProfiles.length === 1 ? '' : 'es'} — toca para chatear`
              : 'Desliza abajo para actualizar'}
          </p>
        </div>
        {syncAgeSec != null && (
          <span className="em-v2-matches__sync">hace {syncAgeSec}s</span>
        )}
      </header>

      {onOpenSquads && syncPartnerCount > 0 && (
        <button
          type="button"
          onClick={onOpenSquads}
          className="em-v2-matches-squad-btn"
        >
          <div className="min-w-0">
            <p className="em-v2-matches-squad-btn__kicker">Crew opcional</p>
            <p className="em-v2-matches-squad-btn__title">
              {syncPartnerCount} EntrenaSync{syncPartnerCount === 1 ? '' : 's'} — crear Squad fijo
            </p>
            <p className="em-v2-matches-squad-btn__hint">
              Para tu gym o equipo; el mapa LIVE sigue siendo el centro
            </p>
          </div>
          <Users className="w-4 h-4 shrink-0" aria-hidden />
        </button>
      )}

      {readyProfiles.length === 0 && pendingPartnerIds.length === 0 ? (
        <div className="em-v2-matches-empty">
          <div className="em-v2-matches-empty__icon">
            <Heart className="text-[#FF671F]" size={32} aria-hidden />
          </div>
          <p className="em-v2-matches-empty__title">Aún no tienes matches</p>
          <p className="em-v2-matches-empty__body">
            Sigue explorando partners compatibles cerca de ti.
          </p>
          <button type="button" onClick={onExplore} className="em-v2-hero-card__cta">
            Ir a Explorar
          </button>
          {syncAgeSec != null && (
            <p className="em-v2-matches__sync mt-3">Actualizado hace {syncAgeSec}s</p>
          )}

          <div className="em-v2-matches-howto">
            <p className="em-v2-matches-howto__kicker">¿Cómo funciona el match?</p>
            <ol className="em-v2-matches-howto__list">
              <li>
                En <strong>Explorar</strong>, desliza o toca en perfiles compatibles.
              </li>
              <li>
                Si la otra persona también te da like, hay <strong>match</strong> y se abre el chat.
              </li>
              <li>
                Desde el chat puedes iniciar <strong>EntrenaSync</strong> y entrenar en vivo juntos.
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="em-v2-matches-list">
          {sortedProfiles.map((profile) => (
            <MatchCard
              key={profile.id}
              profile={profile}
              currentUser={currentUser}
              userLocation={userLocation}
              syncBonds={syncBonds}
              squads={squads}
              effectiveUserId={effectiveUserId}
              profilePosts={profilePosts}
              reviews={reviews}
              onOpenChat={onOpenChat}
            />
          ))}
          {partnersStillLoading &&
            pendingPartnerIds.map((id) => (
              <div key={`loading-${id}`} className="em-v2-match-card em-v2-match-card--skeleton">
                <div className="em-v2-match-card__media bg-[#141418] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#2F2F35] rounded w-3/4" />
                  <div className="h-2 bg-[#2F2F35] rounded w-1/2" />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}