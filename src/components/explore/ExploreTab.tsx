// Explore tab — typed props (Phase 63)
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExploreSwipeCard } from './ExploreSwipeCard';
import { Filter, RefreshCw, MapPin, CheckCircle, X, Heart, Share2, Users, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, CurrentUser } from '../../types';
import { computeMatchScore } from '../../services/matchingScore';
import { getDistanceKm } from '../../utils';
import { isSeedProfileId } from '../../utils/seedProfiles';
import { SwipeCardSkeleton } from '../ui/SkeletonLoaders';
import { GeoPromptBanner, GEO_PROMPT_V2_KEY } from './GeoPromptBanner';
import { buildInviteLink } from '../../utils/sparseCityDefaults';
import { getLocalWaitlistEntry, saveCityWaitlist } from '../../services/cityWaitlist';
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto';
import type { Firestore } from 'firebase/firestore';
import { WhyEntrenaMatchStrip } from '../growth/WhyEntrenaMatchStrip';
import { BRAND_COPY } from '../../constants/brandCopy';
import { SyncHourBanner } from '../home/SyncHourBanner';
import { GymInviteQrSheet } from '../growth/GymInviteQrSheet';
import { recordPilotDensityEvent } from '../../services/pilotDensityMetrics';

interface ExploreTabProps {
  deck: Profile[];
  visibleCards: Profile[];
  userLocation: { lat: number; lng: number } | null;
  filters: any;
  currentUser: CurrentUser | null;
  setShowFilters: (show: boolean) => void;
  resetDeck: () => void | Promise<void>;
  isResettingDeck?: boolean;
  requestUserLocation: () => void;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
  onShowProfile?: (profile: Profile) => void;
  onReport?: (profileId: string) => void;
  realProfiles?: Profile[];
  isLoadingProfiles?: boolean;
  lastSync?: Date | null;
  profilePosts?: Record<string, any[]>;
  syncBonds?: Record<string, { totalMin: number; sessions: number; avgRating: number; bondLevel: number }>;
  networkPower?: number;
  poolSize?: number;
  onRelaxFilters?: () => void;
  isDemoMode?: boolean;
  db?: Firestore | null;
  firebaseUid?: string | null;
  onActivateLive?: () => void;
  liveCountForUI?: number;
  onOpenMap?: () => void;
  /** When live banner is shown above, skip duplicate promos (SyncHour + map CTA). */
  compactHeader?: boolean;
}

export const ExploreTab = ({
  deck,
  visibleCards: propVisibleCards,
  userLocation,
  filters,
  currentUser,
  setShowFilters,
  resetDeck,
  isResettingDeck = false,
  requestUserLocation,
  onSwipe,
  onShowProfile,
  onReport,
  realProfiles = [],
  isLoadingProfiles = false,
  lastSync,
  profilePosts = {},
  syncBonds = {},
  networkPower = 0,
  poolSize = 0,
  onRelaxFilters,
  isDemoMode = false,
  db = null,
  firebaseUid = null,
  onActivateLive,
  liveCountForUI = 0,
  onOpenMap,
  compactHeader = false,
}) => {
  const [buttonExit, setButtonExit] = useState<'left' | 'right' | null>(null);
  const swipeBusy = buttonExit !== null;
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSaved, setWaitlistSaved] = useState(() => !!getLocalWaitlistEntry());
  const [showGymQr, setShowGymQr] = useState(false);

  const handleResetDeck = async () => {
    if (isResettingDeck) return
    setButtonExit(null)
    try {
      await resetDeck()
    } catch {
      /* parent shows toast */
    }
  }

  const referralCode = (currentUser?.id || firebaseUid || 'invite').slice(0, 8);
  const inviteLink = buildInviteLink(referralCode);
  const cityLabel = currentUser?.city || 'tu zona';
  const showSparseBanner = deck.length > 0 && deck.length < 3 && poolSize > deck.length;
  const filtersAreTight =
    (filters.trainingTypes?.length || 0) > 0 ||
    (filters.availability?.length || 0) > 0 ||
    filters.gender !== 'todos' ||
    (userLocation && filters.maxDistanceKm < 100) ||
    filters.onlyAvailableToday ||
    filters.onlyLiveTraining;

  useEffect(() => {
    if (userLocation) {
      setShowGeoPrompt(false)
      return
    }
    try {
      if (localStorage.getItem(GEO_PROMPT_V2_KEY) === '1') return
    } catch { /* ignore */ }
    const sharesLocation = !!(currentUser as { legalConsents?: { sharesLocation?: boolean } })?.legalConsents?.sharesLocation
    if (sharesLocation) setShowGeoPrompt(true)
  }, [userLocation, propVisibleCards.length, currentUser])

  const visibleCards = propVisibleCards;
  const topProfile = visibleCards[0] || null;

  const getCompatibility = (profile: Profile): number | null => {
    if (!currentUser || !userLocation) return null;
    const base = computeMatchScore(currentUser as any, profile, userLocation, {
      myTzOffsetMin: -new Date().getTimezoneOffset(),
      profileTzOffsetMin: -new Date().getTimezoneOffset(),
    });
    const boost = getNetworkBoost(profile);
    return Math.min(99, Math.round(base + boost)); // Network Power makes the % higher on card for your red
  };

  const getDistance = (profile: Profile): number | null => {
    if (!userLocation) return null;
    return Math.round(getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng));
  };

  const isVerified = (profile: Profile): boolean => {
    return profile.verificationStatus === 'verified' || ['p1', 'p2', 'p4', 'p6'].includes(profile.id);
  };

  const isNetwork = (profile: Profile): boolean => !!syncBonds[profile.id];
  const getBondLevel = (profile: Profile): number => syncBonds[profile.id]?.bondLevel || 1;
  const getNetworkBoost = (profile: Profile): number => isNetwork(profile) ? Math.floor(getBondLevel(profile) * 8) : 0; // visual +% for the card

  // Small breakdown for "why this profile" in recs (makes the % feel less magic, builds trust)
  // Polish: richer reasons, up to 2-3 for better matching transparency
  const getCompatReasons = (profile: Profile): string[] => {
    if (!currentUser) return [];
    const reasons: string[] = [];
    const typeOverlap = (currentUser.trainingTypes || []).filter((t: string) => (profile.trainingTypes || []).includes(t)).length;
    if (typeOverlap > 0) reasons.push(typeOverlap > 1 ? 'Entrenamientos en común' : 'Entrenamiento coincide');

    const goalOverlap = (currentUser.goals || []).filter((g: string) => (profile.goals || []).includes(g)).length;
    if (goalOverlap > 0) reasons.push('Objetivos parecidos');

    if (userLocation) {
      const d = getDistance(profile);
      if (d !== null && d <= 8) reasons.push('Muy cerca');
      else if (d !== null && d <= 15) reasons.push('Cerca');
    }

    if (currentUser.level && profile.level && currentUser.level === profile.level) reasons.push('Mismo nivel');

    if (currentUser.intensity && profile.intensity && currentUser.intensity === profile.intensity) {
      reasons.push('Misma intensidad');
    }

    if (profile.verificationStatus === 'verified' || ['p1','p2','p4','p6'].includes(profile.id)) {
      reasons.push('Verificado');
    }

    if (isNetwork(profile)) {
      reasons.unshift('Tu red • Fuerza del equipo');
    }

    return reasons.slice(0, 2);
  };

  // TOP RED / NETWORK LEADERBOARD (global quantification + status for the social graph)
  // Highest impact: makes high Network Power visible and aspirational. Top users/pairs by collective sync time + bond strength.
  // Perk: high NP users get visual priority (already in sorts/badges); here we surface the leaders.
  const topNetworks = [...realProfiles]
    .filter(p => p.syncBonds && Object.keys(p.syncBonds).length > 0)
    .map(p => {
      const b = p.syncBonds || {};
      const totalMin = Object.values(b).reduce((sum: number, bb: any) => sum + (bb.totalMin || 0), 0);
      const sessions = Object.values(b).reduce((sum: number, bb: any) => sum + (bb.sessions || 0), 0);
      const avgBond = Object.values(b).reduce((sum: number, bb: any) => sum + (bb.bondLevel || 1), 0) / Math.max(1, Object.keys(b).length);
      const np = Math.round(avgBond * sessions * 0.8);
      const topPartnerId = Object.keys(b).sort((a, c) => (b[c]?.bondLevel || 0) - (b[a]?.bondLevel || 0))[0];
      const topPartner = realProfiles.find(r => r.id === topPartnerId);
      return {
        profile: p,
        totalMin,
        sessions,
        np,
        numPartners: Object.keys(b).length,
        topPartnerName: topPartner?.name || 'socio',
      };
    })
    .sort((a, b) => b.np - a.np || b.totalMin - a.totalMin)
    .slice(0, 4);

  // Spectacular: get 1-2 latest muro posts for teaser (prefer pinned, makes profiles feel alive - progressive improvement)
  const getMuroTeaser = (profileId: string): string | null => {
    const posts = profilePosts[profileId] || []
    if (!posts.length) return null
    const sorted = [...posts].sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp)
    const top = sorted.slice(0, 2)
    return top.map((p: any) => {
      let t = (p.text || '').trim()
      if (t.length > 40) t = t.slice(0, 37) + '...'
      const prefix = p.photo ? '📷' : (p.pinned ? '📌' : '📝')
      return `${prefix} ${t}`
    }).join(' • ')
  }

  const cardMetaById = useMemo(() => {
    const map = new Map<
      string,
      {
        compat: number | null
        dist: number | null
        verified: boolean
        isRealProfile: boolean
        isDemoSeed: boolean
        isNetwork: boolean
        bondMinutes: number
        compatReasons: string[]
        muroTeaser: string | null
      }
    >()
    for (const profile of visibleCards) {
      map.set(profile.id, {
        compat: getCompatibility(profile),
        dist: getDistance(profile),
        verified: isVerified(profile),
        isRealProfile: realProfiles.some((rp) => rp.id === profile.id),
        isDemoSeed: isSeedProfileId(profile.id) && !realProfiles.some((rp) => rp.id === profile.id),
        isNetwork: isNetwork(profile),
        bondMinutes: syncBonds[profile.id]?.totalMin ?? 0,
        compatReasons: getCompatReasons(profile),
        muroTeaser: getMuroTeaser(profile.id),
      })
    }
    return map
  }, [visibleCards, currentUser, userLocation, realProfiles, syncBonds, profilePosts])

  const handleLike = () => {
    if (!topProfile || swipeBusy) return
    setButtonExit('right')
  }

  const handlePass = () => {
    if (!topProfile || swipeBusy) return
    setButtonExit('left')
  }

  return (
    <div className="em-v2-explore flex flex-col p-3 pt-2 pb-4 relative">
      <div className="relative z-30 flex items-start justify-between gap-2 mb-2 px-0.5 shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="em-v2-explore__header-title">Explorar</h1>
          <p className="em-v2-explore__header-sub">
            <strong>{deck.length} disponibles</strong>
            {userLocation ? ' cerca de ti' : ' en tu zona'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {!userLocation && (
            <button
              type="button"
              onClick={requestUserLocation}
              className="em-v2-chip-btn em-v2-chip-btn--brand"
            >
              <MapPin size={13}/> GPS
            </button>
          )}
          <button
            type="button"
            onClick={() => { void handleResetDeck() }}
            disabled={isResettingDeck}
            className="em-v2-chip-btn disabled:opacity-50"
          >
            <RefreshCw size={13} className={isResettingDeck ? 'animate-spin' : ''}/> {isResettingDeck ? 'Reiniciando…' : 'Reiniciar'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            aria-label="Abrir filtros de búsqueda"
            className="em-v2-chip-btn em-v2-chip-btn--icon relative"
          >
            <Filter size={18} aria-hidden />
            {(filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0) > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#FF671F] text-black text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-1">
                {(filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0)}
              </div>
            )}
          </button>
        </div>
      </div>

      {!compactHeader && (
        <SyncHourBanner
          compact
          onActivateLive={onActivateLive}
          db={db}
          city={cityLabel}
          isDemoMode={isDemoMode}
        />
      )}

      {onOpenMap && (
        <button
          type="button"
          onClick={onOpenMap}
          className={`em-v2-map-cta relative z-20 mb-2 shrink-0 ${compactHeader ? 'em-v2-map-cta--compact py-2' : ''}`}
        >
          <span className="em-v2-map-cta__title">
            {liveCountForUI > 0
              ? `🟢 ${liveCountForUI} en ${BRAND_COPY.liveMapLabel} ahora`
              : `Abre el ${BRAND_COPY.liveMapLabel}`}
          </span>
          <span className="em-v2-map-cta__arrow">Mapa →</span>
        </button>
      )}

      {showSparseBanner && (
        <div className="relative z-20 mb-3 mx-1 p-3 rounded-2xl bg-[#FF671F]/10 border border-[#FF671F]/25 text-[11px] leading-snug shrink-0">
          <strong className="text-[#FF671F]">Pocos perfiles con tus filtros.</strong>{' '}
          <span className="text-[#9CA3AF]">
            Hay {poolSize} en total — prueba quitar límite de distancia o ampliar el rango de edad.
          </span>
          {onRelaxFilters && (
            <button
              type="button"
              onClick={onRelaxFilters}
              className="mt-2 block w-full py-2 rounded-xl bg-[#FF671F] text-black font-bold text-xs active:opacity-90"
            >
              Ampliar filtros automáticamente
            </button>
          )}
        </div>
      )}

      {showGeoPrompt && (
        <GeoPromptBanner
          onRequestLocation={() => {
            requestUserLocation()
            try { localStorage.setItem(GEO_PROMPT_V2_KEY, '1') } catch { /* ignore */ }
            setShowGeoPrompt(false)
          }}
          onDismiss={() => {
            try { localStorage.setItem(GEO_PROMPT_V2_KEY, '1') } catch { /* ignore */ }
            setShowGeoPrompt(false)
          }}
        />
      )}

      {/* Cards Stack Area — fixed height so recs below stay reachable on scroll */}
      <div className="em-v2-swipe-stack relative z-0 flex items-center justify-center my-1.5 h-[min(40dvh,340px)] sm:h-[min(44dvh,380px)] overflow-hidden shrink-0">
        {isLoadingProfiles && visibleCards.length === 0 && (
          <SwipeCardSkeleton />
        )}
        <AnimatePresence>
          {!isLoadingProfiles && visibleCards.length === 0 && (
            <div className="text-center px-6 py-2 max-h-full overflow-y-auto overscroll-contain">
              <div className="mx-auto w-16 h-16 bg-[#1C1C20] rounded-3xl flex items-center justify-center mb-4 ring-1 ring-[#FF671F]/20">
                <div className="text-4xl">🏋️</div>
              </div>
              <div className="text-2xl font-semibold tracking-tight mb-1">{BRAND_COPY.explore.emptyTitle}</div>
              <p className="text-[#9CA3AF] max-w-[300px] mx-auto mb-4 text-sm">
                {isDemoMode
                  ? 'En modo prueba puedes reiniciar el deck o invitar amigos a probar EntrenaMatch.'
                  : BRAND_COPY.explore.emptyBody(cityLabel)}
              </p>

              <WhyEntrenaMatchStrip compact />

              <div className="rounded-2xl border border-[#22c55e]/30 bg-[#0a2a1a]/40 p-4 mb-4 text-left max-w-[320px] mx-auto">
                <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-bold mb-1">{BRAND_COPY.explore.inviteTitle}</p>
                <p className="text-[11px] text-[#9CA3AF] break-all mb-2">{inviteLink}</p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: 'EntrenaMatch',
                          text: BRAND_COPY.explore.inviteShareText,
                          url: inviteLink,
                        })
                        void recordPilotDensityEvent(db, {
                          city: cityLabel,
                          kind: 'invite_shared',
                          isDemoMode,
                        })
                        return
                      }
                      await navigator.clipboard.writeText(inviteLink)
                      toast.success(BRAND_COPY.explore.inviteToastCopied)
                      void recordPilotDensityEvent(db, {
                        city: cityLabel,
                        kind: 'invite_shared',
                        isDemoMode,
                      })
                    } catch {
                      toast.error('No se pudo compartir')
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#22c55e] text-black font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> {BRAND_COPY.explore.inviteTitle}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGymQr(true)}
                  className="w-full mt-2 py-2 rounded-xl border border-[#22c55e]/40 text-[#22c55e] text-xs font-bold flex items-center justify-center gap-2"
                >
                  <QrCode size={14} /> QR para tu gym
                </button>
              </div>

              {!waitlistSaved && !isDemoMode && (
                <div className="rounded-2xl border border-[#2F2F35] bg-[#1C1C20] p-4 mb-4 max-w-[320px] mx-auto text-left">
                  <p className="text-[10px] text-[#9CA3AF] mb-2">Avísame cuando haya más gente en {cityLabel}</p>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full mb-2 px-3 py-2 rounded-xl bg-[#0D0D10] border border-[#2F2F35] text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!waitlistEmail.includes('@')) {
                        toast.error('Ingresa un email válido')
                        return
                      }
                      await saveCityWaitlist(waitlistEmail, cityLabel, {
                        db,
                        uid: firebaseUid,
                      })
                      setWaitlistSaved(true)
                      toast.success('¡Listo! Te avisaremos cuando crezca la comunidad')
                    }}
                    className="w-full py-2 rounded-xl border border-[#FF671F]/40 text-[#FF671F] text-xs font-semibold"
                  >
                    Unirme a la lista de espera
                  </button>
                </div>
              )}

              {onActivateLive && (
                <button
                  type="button"
                  onClick={onActivateLive}
                  className="mb-3 px-5 py-2.5 bg-[#22c55e] text-black rounded-2xl text-sm font-semibold active:brightness-90"
                >
                  {BRAND_COPY.explore.activateLiveCta}
                </button>
              )}

              {/* Active filters summary for better UX */}
              {(filters.trainingTypes.length > 0 || filters.availability.length > 0 || filters.gender !== 'todos' || (userLocation && filters.maxDistanceKm < 100)) && (
                <div className="text-[10px] text-[#9CA3AF] mb-4 px-3">
                  Filtros activos: {[
                    filters.trainingTypes.length ? `${filters.trainingTypes.length} tipos` : null,
                    filters.availability.length ? `${filters.availability.length} horarios` : null,
                    filters.gender !== 'todos' ? filters.gender : null,
                    userLocation && filters.maxDistanceKm < 100 ? `≤${filters.maxDistanceKm}km` : null
                  ].filter(Boolean).join(' · ')}
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="px-5 py-2.5 border border-[#2F2F35] rounded-2xl text-sm active:bg-[#25252A]"
                >
                  Cambiar filtros
                </button>
                <button 
                  type="button"
                  onClick={() => { void handleResetDeck() }}
                  disabled={isResettingDeck}
                  className="px-5 py-2.5 bg-[#FF671F] text-black rounded-2xl text-sm font-semibold active:bg-[#E55A1A] disabled:opacity-50"
                >
                  {isResettingDeck ? 'Reiniciando…' : 'Reiniciar deck'}
                </button>
                <button 
                  onClick={() => {
                    if (onRelaxFilters) onRelaxFilters()
                    else setShowFilters(true)
                  }}
                  className="px-4 py-2.5 text-xs border border-[#2F2F35] rounded-2xl active:bg-[#25252A]"
                >
                  {filtersAreTight ? 'Relajar filtros' : 'Ver filtros'}
                </button>
              </div>
              {lastSync && (
                <div className="text-[10px] text-[#9CA3AF] mt-3">Última sync real: hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</div>
              )}
            </div>
          )}

          {/* Render stack from back to front */}
          {visibleCards
            .slice()
            .reverse()
            .map((profile, revIndex) => {
              const stackIndex = visibleCards.length - 1 - revIndex
              const meta = cardMetaById.get(profile.id)
              if (!meta) return null
              return (
                <ExploreSwipeCard
                  key={profile.id}
                  profile={profile}
                  stackIndex={stackIndex}
                  isInteractive={stackIndex === 0 && !swipeBusy}
                  buttonExit={stackIndex === 0 ? buttonExit : null}
                  onButtonExitHandled={() => setButtonExit(null)}
                  onSwipe={onSwipe}
                  onShowProfile={onShowProfile}
                  onReport={onReport}
                  compat={meta.compat}
                  dist={meta.dist}
                  verified={meta.verified}
                  isRealProfile={meta.isRealProfile}
                  isDemoSeed={meta.isDemoSeed}
                  isNetwork={meta.isNetwork}
                  bondMinutes={meta.bondMinutes}
                  compatReasons={meta.compatReasons}
                  muroTeaser={meta.muroTeaser}
                  hasUserLocation={!!userLocation}
                  stackPromoting={swipeBusy}
                />
              )
            })}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Unique EntrenaMatch style */}
      {deck.length > 0 && topProfile && (
        <div className="em-v2-swipe-actions shrink-0">
          <button
            type="button"
            onClick={handlePass}
            disabled={swipeBusy}
            className="em-v2-action-pass disabled:opacity-50"
            aria-label="Pasar"
          >
            <X size={26} className="text-red-400" />
            <span className="em-v2-action-label text-red-400/80">PASAR</span>
          </button>
          <button
            type="button"
            onClick={handleLike}
            disabled={swipeBusy}
            className="em-v2-action-like disabled:opacity-50"
            aria-label="Entrenar juntos"
          >
            <Heart size={30} className="text-black" fill="black" />
            <span className="em-v2-action-label text-black/85">ENTRENAR</span>
          </button>
        </div>
      )}
      {/* "Desliza o usa los botones" guide text removed - was cluttering the profile choice / swipe area */}

      {/* Recommendations - Más compatibles */}
      {userLocation && currentUser && deck.length > 0 && (
        <div className="mt-2 mb-2 shrink-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <div>
              <div className="font-semibold text-sm flex items-center gap-1 flex-wrap">
                Más compatibles
                <span className="live-pill text-[8px]">en vivo</span>
              </div>
              {lastSync && (
                <span className="text-[9px] text-[#9CA3AF]">
                  Actualizado hace {Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))}s
                </span>
              )}
            </div>
          </div>
          <div className="explore-recs-scroll flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:snap-none">
            {deck
              .slice(0, 8)
              .map(p => ({ 
                profile: p, 
                score: getCompatibility(p) || 50, 
                isReal: realProfiles.some(r => r.id === p.id),
                isNet: !!syncBonds[p.id],
                bond: syncBonds[p.id]?.bondLevel || 0
              }))
              .sort((a, b) => {
                if (a.isNet && !b.isNet) return -1;
                if (!a.isNet && b.isNet) return 1;
                if (a.isNet && b.isNet) return b.bond - a.bond;
                return (b.isReal ? 1 : 0) - (a.isReal ? 1 : 0) || (b.score || 0) - (a.score || 0);
              })
              .slice(0, 4)
              .map(({ profile, score, isReal, isNet, bond }) => (
                <div 
                  key={profile.id}
                  onClick={() => onShowProfile?.(profile)}
                  className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] transition min-w-[168px] max-w-[168px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink"
                >
                  <VerifiedProfilePhoto
                    src={profile.photos[0]}
                    className="w-12 h-12 rounded-xl flex-shrink-0"
                    imgClassName="w-12 h-12 rounded-xl object-cover"
                    verificationStatus={profile.verificationStatus}
                    badgeSize="xs"
                    badgeCorner="bottom-right"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate flex items-center gap-1">{profile.name} {isNet && <span className="text-[7px] bg-[#FFD700] text-black px-1 rounded font-bold">⭐ RED · F{bond}</span>}</div>
                    {onReport && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReport(profile.id); }}
                        className="text-[8px] text-red-400 underline ml-1 active:text-red-600"
                      >
                        Reportar
                      </button>
                    )}
                    <div className="text-xs text-[#9CA3AF] truncate flex justify-between"><span>{profile.city}</span> {userLocation && <span className="text-[#9CA3AF]">{getDistance(profile)} km</span>}</div>
                    <div className="text-[#FF671F] text-sm font-bold mt-0.5">{score}%</div>
                    {(() => {
                      const reasons = getCompatReasons(profile);
                      return reasons.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {reasons.map((r, idx) => (
                            <span key={idx} className="text-[8px] px-1.5 py-px rounded bg-[#FF671F]/10 text-[#FF671F]">{r}</span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* NEW HIGH IMPACT: RED GLOBAL / TOP NETWORK POWER LEADERBOARD + GLOBAL QUANTIFICATION */}
      {/* Makes the social graph visible and competitive at scale. High NP users get status. Your red's impact is quantified. */}
      {topNetworks.length > 0 && (
        <div className="mt-2 mb-2 px-1 shrink-0">
          <div className="flex items-center justify-between mb-2 px-0.5 gap-2">
            <div className="font-semibold text-sm flex items-center gap-1 text-[#FFD700] min-w-0">
              <span className="truncate">🔥 TOP REDES</span>
              <span className="text-[10px] bg-[#FFD700]/20 px-1 rounded text-black shrink-0">LIVE</span>
            </div>
            <div className="text-[10px] text-[#9CA3AF] shrink-0">Tu red en el mapa LIVE</div>
          </div>
          <div className="explore-recs-scroll flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:snap-none">
            {topNetworks.map((n) => (
              <div
                key={n.profile.id}
                onClick={() => onShowProfile?.(n.profile)}
                className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition min-w-[168px] max-w-[168px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink"
              >
                <VerifiedProfilePhoto
                  src={n.profile.photos?.[0] || ''}
                  className="w-11 h-11 rounded-xl flex-shrink-0"
                  imgClassName="w-11 h-11 rounded-xl object-cover"
                  verificationStatus={n.profile.verificationStatus}
                  badgeSize="xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate flex items-center gap-1 text-[#FFD700]">{n.profile.name} <span className="text-[10px] bg-[#FFD700] text-black px-1 rounded font-bold">FE {n.np}</span></div>
                  <div className="text-[10px] text-[#9CA3AF] truncate">{n.numPartners} socios • {n.totalMin} min total • top con {n.topPartnerName}</div>
                  <div className="text-[10px] text-[#22c55e] mt-0.5">+{Math.floor(n.totalMin / 10)}% impacto en el mapa LIVE</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-center text-[#FFD700]/60 mt-1">Las redes más fuertes destacan en Explorar. Construye la tuya →</div>
        </div>
      )}
      <GymInviteQrSheet
        open={showGymQr}
        inviteUrl={inviteLink}
        gymName={cityLabel}
        onClose={() => setShowGymQr(false)}
        db={db}
        city={cityLabel}
        isDemoMode={isDemoMode}
      />
    </div>
  );
};
