import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw, MapPin, Star, CheckCircle, X, Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, CurrentUser } from '../../types';
import { calculateCompatibility, getDistanceKm } from '../../utils';

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
  onRefreshRealProfiles?: () => void;
  lastSync?: Date | null;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
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
  onRefreshRealProfiles,
  lastSync,
}) => {
  // Local drag state + optimistic removal for snappy swipe/match feel
  const [dragX, setDragX] = useState(0);
  const [optimisticRemovedId, setOptimisticRemovedId] = useState<string | null>(null);
  const [isRefreshingReals, setIsRefreshingReals] = useState(false);

  // Merge prop visibleCards with optimistic removal for instant visual feedback after swipe
  const visibleCards = optimisticRemovedId
    ? propVisibleCards.filter(p => p.id !== optimisticRemovedId)
    : propVisibleCards;

  const topProfile = visibleCards[0] || null;

  const getCompatibility = (profile: Profile): number | null => {
    if (!currentUser || !userLocation) return null;
    return Math.round(calculateCompatibility(currentUser as any, profile, userLocation));
  };

  const getDistance = (profile: Profile): number | null => {
    if (!userLocation) return null;
    return Math.round(getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng));
  };

  const isVerified = (profile: Profile): boolean => {
    return profile.verificationStatus === 'verified' || ['p1', 'p2', 'p4', 'p6'].includes(profile.id);
  };

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

    return reasons.slice(0, 2);
  };

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

        {/* Top badges row - Premium with Real tester indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {isRealProfile && (
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FF671F] to-[#E55A1A] text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow ring-1 ring-white/70">
                ★ REAL TESTER
              </div>
            )}
            {verified && (
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

          {dist !== null && (
            <div className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <MapPin size={12} /> {dist} km
            </div>
          )}
        </div>

        {/* Bottom info - Premium layout */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-3xl font-semibold tracking-[-1px] flex items-center gap-2 drop-shadow">
                {profile.name}, {profile.age}
                {verified && <CheckCircle size={20} className="text-[#FF671F] -mb-0.5" />}
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
                <div className="text-3xl font-bold text-[#FF671F] leading-none">{compat}</div>
                <div className="text-[10px] -mt-1 opacity-75">compat</div>
                {(() => {
                  const rs = getCompatReasons(profile);
                  if (!rs.length) return null;
                  return (
                    <div className="text-[8px] text-[#FF671F]/80 mt-0.5 leading-none">
                      {rs.join(' · ')}
                    </div>
                  );
                })()}
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
      {/* Header - Cleaner and more premium */}
      <div className="flex items-start justify-between mb-3 px-1">
        <div>
          <div className="section-header text-3xl">Explorar</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-[#FF671F] text-xs font-semibold">
              {deck.length} disponibles ahora {userLocation ? 'cerca de ti' : ''} · ordenados por compat
            </div>
            {lastSync && (
              <div className="text-[9px] text-[#9CA3AF] bg-[#1C1C20] px-1.5 py-px rounded">sync hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</div>
            )}
          </div>
          {realProfiles && realProfiles.length > 0 && (
            <div className="text-[10px] text-[#FF671F] mt-0.5 font-medium flex items-center gap-1">+ {realProfiles.length} perfiles reales de testers <span className="live-pill text-[8px]">en vivo</span></div>
          )}
          {lastSync && (
            <div className="text-[9px] text-[#9CA3AF] mt-0.5 flex items-center gap-1">
              <span className="live-pill text-[8px]">en vivo</span> · hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s
            </div>
          )}
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
          {realProfiles.length > 0 && onRefreshRealProfiles && (
            <>
              <button 
                onClick={async () => {
                  setIsRefreshingReals(true);
                  try {
                    await onRefreshRealProfiles();
                    toast.success('Perfiles reales actualizados');
                  } finally {
                    setIsRefreshingReals(false);
                  }
                }} 
                disabled={isRefreshingReals}
                className="text-xs flex items-center gap-1 bg-[#FF671F] text-black px-3 py-1.5 rounded-2xl font-semibold active:bg-[#E55A1A] disabled:opacity-60"
              >
                <RefreshCw size={13} className={isRefreshingReals ? 'animate-spin' : ''}/> {isRefreshingReals ? '...' : 'Actualizar reales'}
              </button>
              {lastSync && (
                <span className="text-[9px] text-[#9CA3AF] ml-1">hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>
              )}
            </>
          )}
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

      {/* Cards Stack Area */}
      <div className="relative flex-1 flex items-center justify-center mt-1 mb-3 min-h-[460px]">
        <AnimatePresence>
          {visibleCards.length === 0 && (
            <div className="text-center px-6">
              <div className="mx-auto w-14 h-14 bg-[#1C1C20] rounded-2xl flex items-center justify-center mb-4">
                <Star className="text-[#FF671F]" size={28} />
              </div>
              <div className="text-2xl font-semibold tracking-tight mb-1">No hay perfiles que coincidan</div>
              <p className="text-[#9CA3AF] max-w-[300px] mx-auto mb-4 text-sm">
                {realProfiles.length > 0 
                  ? 'Los filtros actuales limitan los resultados. Relaja distancia, tipos de entrenamiento o actualiza perfiles reales.'
                  : 'Aún no hay perfiles reales cargados. Actualiza o prueba en modo demo.'}
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
                {onRefreshRealProfiles && (
                  <button 
                    onClick={async () => {
                      setIsRefreshingReals(true);
                      try {
                        await onRefreshRealProfiles();
                        toast.success('Perfiles reales actualizados');
                      } finally {
                        setIsRefreshingReals(false);
                      }
                    }} 
                    disabled={isRefreshingReals}
                    className="px-5 py-2.5 border border-[#FF671F] text-[#FF671F] rounded-2xl text-sm active:bg-[#FF671F] active:text-black disabled:opacity-60 flex items-center gap-1"
                  >
                    <RefreshCw size={14} className={isRefreshingReals ? 'animate-spin' : ''} />
                    {isRefreshingReals ? 'Actualizando...' : 'Actualizar reales'}
                  </button>
                )}
                {/* Quick relax: show more by resetting some filters temporarily */}
                <button 
                  onClick={() => {
                    // Quick action: relax distance and training filters to see more
                    setShowFilters(true); // open so user can fine tune, or could auto reset here
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

      {/* Action Buttons */}
      {deck.length > 0 && topProfile && (
        <div className="flex justify-center items-center gap-5 pb-3">
          <button 
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-[#1C1C20] border border-[#2F2F35] flex items-center justify-center active:scale-95 transition shadow-inner"
            aria-label="Pasar"
          >
            <X size={34} className="text-[#ef4444]" />
          </button>
          <button 
            onClick={handleLike}
            className="w-[74px] h-[74px] rounded-full bg-[#FF671F] flex items-center justify-center active:scale-95 transition shadow-lg shadow-[#FF671F]/40"
            aria-label="Me gusta"
          >
            <Heart size={36} className="text-black" />
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
              .slice(0, 6)
              .map(p => ({ profile: p, score: getCompatibility(p) || 50, isReal: realProfiles.some(r => r.id === p.id) }))
              .sort((a, b) => (b.isReal ? 1 : 0) - (a.isReal ? 1 : 0) || (b.score || 0) - (a.score || 0))
              .slice(0, 4)
              .map(({ profile, score, isReal }) => (
                <div 
                  key={profile.id}
                  onClick={() => onShowProfile?.(profile)}
                  className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] transition"
                >
                  <img src={profile.photos[0]} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate flex items-center gap-1">{profile.name} {isReal && <span className="text-[8px] bg-[#FF671F] text-black px-1 rounded">REAL</span>}</div>
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
    </div>
  );
};
