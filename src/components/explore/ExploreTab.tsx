// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw, MapPin, CheckCircle, X, Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, CurrentUser } from '../../types';
import { computeMatchScore } from '../../services/matchingScore';
import { getDistanceKm } from '../../utils';
import { isSeedProfileId } from '../../utils/seedProfiles';
import { SwipeCardSkeleton } from '../ui/SkeletonLoaders';
import { GeoPromptBanner, GEO_PROMPT_V2_KEY } from './GeoPromptBanner';

interface ExploreTabProps {
  deck: Profile[];
  visibleCards: Profile[];
  userLocation: { lat: number; lng: number } | null;
  filters: any;
  currentUser: CurrentUser | null;
  setShowFilters: (show: boolean) => void;
  resetDeck: () => void;
  requestUserLocation: () => void;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
  onShowProfile?: (profile: Profile) => void;
  onReport?: (profileId: string) => void;
  realProfiles?: Profile[];
  isLoadingProfiles?: boolean;
  lastSync?: Date | null;
  profilePosts?: Record<string, any[]>; // for spectacular muro teaser on cards
  syncBonds?: Record<string, { totalMin: number; sessions: number; avgRating: number; bondLevel: number }>;
  networkPower?: number;
}

export const ExploreTab = ({
  deck,
  visibleCards: propVisibleCards,
  userLocation,
  filters,
  currentUser,
  setShowFilters,
  resetDeck,
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
}) => {
  // Local drag state + optimistic removal for snappy swipe/match feel
  const [dragX, setDragX] = useState(0);
  const [optimisticRemovedId, setOptimisticRemovedId] = useState<string | null>(null);
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setShowGeoPrompt(false)
      return
    }
    try {
      if (localStorage.getItem(GEO_PROMPT_V2_KEY) === '1') return
    } catch { /* ignore */ }
    if (propVisibleCards.length > 0) setShowGeoPrompt(true)
  }, [userLocation, propVisibleCards.length])

  // Merge prop visibleCards with optimistic removal for instant visual feedback after swipe
  const visibleCards = optimisticRemovedId
    ? propVisibleCards.filter(p => p.id !== optimisticRemovedId)
    : propVisibleCards;

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

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 110;
    const velocity = info.velocity.x;
    if (!topProfile) return;

    const direction = (info.offset.x > threshold || velocity > 550) ? 'right' : 
                      (info.offset.x < -threshold || velocity < -550) ? 'left' : null;

    if (direction) {
      setOptimisticRemovedId(topProfile.id); // instant visual pop
      onSwipe(direction, topProfile.id);
      setDragX(0);
      // Clear optimistic after parent has time to update
      setTimeout(() => setOptimisticRemovedId(null), 400);
    } else {
      setDragX(0);
    }
  };

  const handleLike = () => {
    if (topProfile) {
      setOptimisticRemovedId(topProfile.id);
      onSwipe('right', topProfile.id);
      setDragX(0);
      setTimeout(() => setOptimisticRemovedId(null), 350);
    }
  };

  const handlePass = () => {
    if (topProfile) {
      setOptimisticRemovedId(topProfile.id);
      onSwipe('left', topProfile.id);
      setDragX(0);
      setTimeout(() => setOptimisticRemovedId(null), 350);
    }
  };

  // Stack rendering: top card is draggable, others are visual stack
  const renderCard = (profile: Profile, index: number) => {
    const isTop = index === 0;
    const compat = getCompatibility(profile);
    const dist = getDistance(profile);
    const verified = isVerified(profile);
    const isRealProfile = realProfiles.some(rp => rp.id === profile.id);
    const isDemoSeed = isSeedProfileId(profile.id) && !isRealProfile;

    const scale = isTop ? 1 : index === 1 ? 0.955 : 0.91;
    const yOffset = isTop ? 0 : index === 1 ? 14 : 28;
    const opacity = isTop ? 1 : index === 1 ? 0.82 : 0.55;
    const z = 30 - index;

    return (
      <motion.div
        key={profile.id}
        className="absolute w-full max-w-[340px] aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing swipe-card ring-1 ring-white/10"
        style={{ zIndex: z }}
        initial={false}
        animate={{
          scale,
          y: yOffset,
          opacity,
          x: isTop ? dragX : 0,
          rotate: isTop ? dragX * 0.08 : 0,
        }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: -280, right: 280 }}
        dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: isTop ? 1.01 : scale }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Photo */}
        <img 
          src={profile.photos[0]} 
          className="w-full h-full object-cover" 
          alt={profile.name} 
          draggable={false}
        />

        {/* Gradient overlay - premium cinematic for fitness app */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/95" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Unique: Dynamic swipe feedback overlay (green for like/train, red for pass) */}
        {isTop && Math.abs(dragX) > 20 && (
          <div 
            className={`absolute inset-0 rounded-3xl transition-opacity ${dragX > 0 ? 'bg-[#22c55e]/20' : 'bg-red-500/20'}`}
            style={{ opacity: Math.min(Math.abs(dragX) / 150, 0.6) }}
          />
        )}

        {/* Top badges row - Premium with Real tester indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {isDemoSeed && (
              <div className="inline-flex items-center gap-1 bg-[#6B7280]/90 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full ring-1 ring-white/30">
                DEMO
              </div>
            )}
            {isRealProfile && verified && (
              <div className="inline-flex items-center gap-1 bg-[#FF671F] text-black text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                <CheckCircle size={12} /> VERIFICADO
              </div>
            )}
            {profile.intensity && (
              <div className="inline-flex text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full w-fit">
                {profile.intensity}
              </div>
            )}
          </div>

          {dist !== null ? (
            <div className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin size={12} /> {dist} km
            </div>
          ) : !userLocation ? (
            <div className="bg-black/50 text-[#3b82f6] text-[10px] px-2 py-1 rounded-full">
              GPS → km
            </div>
          ) : null}
        </div>

        {/* Bottom info - Premium layout */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-semibold tracking-[-1px] flex items-center gap-2 drop-shadow">
                {profile.name}, {profile.age}
                {verified && <CheckCircle size={20} className="text-[#FF671F] -mb-0.5" />}
                {isNetwork(profile) && (
                  <span className="text-[10px] bg-[#FFD700] text-black px-1.5 py-0.5 rounded-full font-black tracking-[0.5px] ml-1 align-middle">⭐ RED · Fuerza {getBondLevel(profile)} +{getNetworkBoost(profile)}%</span>
                )}
              </div>
              <div className="text-sm opacity-90 flex items-center gap-2 mt-0.5">
                <span>{profile.city}</span>
                {profile.availableToday && (
                  <span className="text-[10px] bg-[#22c55e] text-black px-2 py-px rounded-full font-semibold tracking-wide">DISPONIBLE HOY</span>
                )}
              </div>
            </div>

            {compat !== null && (
              <div className="text-right">
                {/* Unique: Compatibility as "match energy" with visual bar */}
                <div className="flex items-end justify-end gap-1">
                  <div className="text-4xl font-black text-[#FF671F] leading-none tracking-[-2px]">{compat}</div>
                  <div className="text-[9px] text-[#FF671F]/70 font-bold mb-0.5">MATCH</div>
                </div>
                <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden mt-0.5 ml-auto">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF671F] to-[#E55A1A] transition-all" 
                    style={{ width: `${compat}%` }} 
                  />
                </div>
                <div className="text-[8px] text-[#FF671F]/70 mt-0.5 leading-none font-medium">
                  {getCompatReasons(profile).join(' · ')}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm leading-snug text-white/90 line-clamp-2 mb-3 pr-2 drop-shadow">
            {profile.bio}
          </p>

          {/* Chips - More attractive */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {profile.trainingTypes.slice(0, 3).map(t => (
              <div key={t} className="text-[10px] bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full font-medium">{t}</div>
            ))}
          </div>

          {profile.goals.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {profile.goals.slice(0, 2).map(g => (
                <div key={g} className="text-[9px] bg-[#FF671F]/70 text-black px-2 py-px rounded-full font-medium">{g}</div>
              ))}
            </div>
          )}

          {/* Spectacular muro teaser (1-2 latest posts) - makes profiles feel alive while swiping - feed attractive polish */}
          {(() => {
            const teaser = getMuroTeaser(profile.id)
            if (!teaser) return null
            return (
              <div 
                onClick={(e) => { e.stopPropagation(); onShowProfile?.(profile) }}
                className="mb-2 px-2 py-1 bg-[#111113]/70 backdrop-blur rounded-2xl text-[9px] text-white/90 line-clamp-2 border border-[#FF671F]/20 cursor-pointer active:bg-[#FF671F]/10 flex items-start gap-1 hover:border-[#FF671F]/40 transition"
              >
                <span className="mt-0.5 text-[#FF671F]">📝</span> <span className="leading-tight">{teaser}</span>
              </div>
            )
          })()}

          <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
            <span>Disponible:</span> {profile.availability.join(' • ')}
          </div>
        </div>

        {/* VER PERFIL overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onShowProfile) onShowProfile(profile);
            else toast.info('Ver perfil completo');
          }}
          className="absolute bottom-4 right-4 text-[10px] bg-black/60 hover:bg-black/80 active:bg-black px-3 py-1 rounded-full border border-white/20 text-white font-medium transition"
        >
          VER PERFIL
        </button>

        {/* Report for safety / moderation polish (visible on hover/tap for testers) */}
        {onReport && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReport(profile.id);
            }}
            className="absolute top-4 right-4 text-[9px] bg-black/50 hover:bg-black/70 active:bg-red-900/70 px-2 py-0.5 rounded-full text-white/70 hover:text-white flex items-center gap-0.5 transition"
            title="Reportar perfil"
          >
            ⚠ <span className="text-[8px]">REPORT</span>
          </button>
        )}

        {/* No text hint - clean for premium profile choosing (swipe or use buttons below) */}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 pt-3 relative bg-[#0D0D10]">
      {/* Header - Cleaner and more premium, tight spacing */}
      <div className="flex items-start justify-between mb-1.5 px-1">
        <div>
          <div className="section-header text-3xl">Explorar</div>
          <div className="mt-0.5 flex items-center gap-x-2 text-xs leading-tight flex-wrap">
            <span className="text-[#FF671F] font-semibold">
              {deck.length} disponibles ahora {userLocation ? 'cerca de ti' : ''} · ordenados por compat
            </span>
            {lastSync && (
              <span className="text-[9px] text-[#9CA3AF] bg-[#1C1C20] px-1.5 py-px rounded">sync hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>
            )}
            {realProfiles && realProfiles.length > 0 && (
              <span className="text-[10px] text-[#FF671F] font-medium">+ {realProfiles.length} reales <span className="live-pill text-[8px]">en vivo</span></span>
            )}
            <span className="text-[10px] text-[#FF671F]/70">• tu equipo de gym en vivo</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!userLocation && (
            <button 
              onClick={requestUserLocation}
              className="text-xs flex items-center gap-1 bg-[#FF671F]/10 text-[#FF671F] px-3 py-1.5 rounded-2xl active:bg-[#FF671F] active:text-black"
            >
              <MapPin size={13}/> GPS
            </button>
          )}
          <button 
            onClick={() => { setOptimisticRemovedId(null); setDragX(0); resetDeck(); }} 
            className="text-xs flex items-center gap-1 text-[#9CA3AF] active:text-white px-3 py-1.5 rounded-2xl active:bg-[#25252A]"
          >
            <RefreshCw size={13}/> Reiniciar
          </button>
          <button 
            onClick={() => setShowFilters(true)} 
            className="relative p-2 active:bg-[#25252A] rounded-2xl bg-[#1C1C20] border border-[#2F2F35]"
          >
            <Filter size={18} />
            {(filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0) > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#FF671F] text-black text-[9px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-1">
                {(filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0)}
              </div>
            )}
          </button>
        </div>
      </div>

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

      {/* Cards Stack Area */}
      <div className="relative flex-1 flex items-center justify-center mt-0.5 mb-2 min-h-[460px]">
        {isLoadingProfiles && visibleCards.length === 0 && (
          <SwipeCardSkeleton />
        )}
        <AnimatePresence>
          {!isLoadingProfiles && visibleCards.length === 0 && (
            <div className="text-center px-6">
              <div className="mx-auto w-16 h-16 bg-[#1C1C20] rounded-3xl flex items-center justify-center mb-4 ring-1 ring-[#FF671F]/20">
                <div className="text-4xl">🏋️</div>
              </div>
              <div className="text-2xl font-semibold tracking-tight mb-1">¡No más perfiles por hoy!</div>
              <p className="text-[#9CA3AF] max-w-[300px] mx-auto mb-4 text-sm">
                {currentUser?.city
                  ? `Aún no hay más perfiles en ${currentUser.city}. Activa live para aparecer en el mapa e invita a tu gym.`
                  : 'Ajusta filtros o activa live para que otros te encuentren en el GymPulse.'}
              </p>

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
                  onClick={() => { setOptimisticRemovedId(null); setDragX(0); resetDeck(); }}
                  className="px-5 py-2.5 bg-[#FF671F] text-black rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
                >
                  Reiniciar deck
                </button>
                <button 
                  onClick={() => {
                    setShowFilters(true);
                  }}
                  className="px-4 py-2.5 text-xs border border-[#2F2F35] rounded-2xl active:bg-[#25252A]"
                >
                  Relajar filtros
                </button>
              </div>
              {lastSync && (
                <div className="text-[10px] text-[#9CA3AF] mt-3">Última sync real: hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</div>
              )}
            </div>
          )}

          {/* Render stack from back to front */}
          {visibleCards.slice().reverse().map((profile, revIndex) => {
            const realIndex = visibleCards.length - 1 - revIndex;
            return renderCard(profile, realIndex);
          })}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Unique EntrenaMatch style */}
      {deck.length > 0 && topProfile && (
        <div className="flex justify-center items-center gap-6 pb-2">
          <button 
            onClick={handlePass}
            className="group w-14 h-14 rounded-full bg-[#1C1C20] border border-[#2F2F35] flex flex-col items-center justify-center active:scale-90 transition-all shadow-inner hover:border-red-500/50"
            aria-label="Pasar"
          >
            <X size={28} className="text-red-400 group-active:text-red-500" />
            <span className="text-[8px] text-red-400/70 -mt-0.5 tracking-widest">PASAR</span>
          </button>
          <button 
            onClick={handleLike}
            className="group w-20 h-20 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex flex-col items-center justify-center active:scale-90 transition-all shadow-xl shadow-[#FF671F]/50 ring-1 ring-white/20"
            aria-label="Entrenar juntos"
          >
            <Heart size={32} className="text-black" />
            <span className="text-[9px] text-black/80 -mt-1 font-bold tracking-[1px]">ENTRENAR</span>
          </button>
        </div>
      )}
      {/* "Desliza o usa los botones" guide text removed - was cluttering the profile choice / swipe area */}

      {/* Recommendations - Más compatibles (unique discovery) */}
      {userLocation && currentUser && deck.length > 0 && (
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div>
              <div className="font-semibold text-sm flex items-center gap-1">Más compatibles (reales primero) <span className="live-pill text-[8px]">en vivo</span></div>
              {lastSync && <span className="text-[9px] text-[#9CA3AF] ml-1">· hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
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
                  className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] transition"
                >
                  <img src={profile.photos[0]} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
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
        <div className="mt-4 mb-2 px-1">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="font-semibold text-sm flex items-center gap-1 text-[#FFD700]">🔥 TOP REDES (Fuerza del equipo global) <span className="text-[8px] bg-[#FFD700]/20 px-1 rounded text-black">LIVE</span></div>
            <div className="text-[8px] text-[#9CA3AF]">Tu grafo mueve el pulso</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topNetworks.map((n, i) => (
              <div
                key={n.profile.id}
                onClick={() => onShowProfile?.(n.profile)}
                className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition"
              >
                <img src={n.profile.photos?.[0]} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate flex items-center gap-1 text-[#FFD700]">{n.profile.name} <span className="text-[7px] bg-[#FFD700] text-black px-1 rounded font-bold">FE {n.np}</span></div>
                  <div className="text-[9px] text-[#9CA3AF] truncate">{n.numPartners} socios • {n.totalMin} min total • top con {n.topPartnerName}</div>
                  <div className="text-[8px] text-[#22c55e] mt-0.5">+{Math.floor(n.totalMin / 10)}% impacto colectivo en la red</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[8px] text-center text-[#FFD700]/60 mt-1">Las redes más fuertes dominan el pulso y las recomendaciones. Construye la tuya →</div>
        </div>
      )}
    </div>
  );
};
