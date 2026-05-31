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
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  deck,
  visibleCards,
  userLocation,
  currentUser,
  setShowFilters,
  resetDeck,
  requestUserLocation,
  onSwipe,
  onShowProfile,
}) => {
  // Local drag state for the top card (framer-motion controlled)
  const [dragX, setDragX] = useState(0);

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

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 110;
    const velocity = info.velocity.x;
    if (!topProfile) return;

    if (info.offset.x > threshold || velocity > 550) {
      onSwipe('right', topProfile.id);
      setDragX(0);
    } else if (info.offset.x < -threshold || velocity < -550) {
      onSwipe('left', topProfile.id);
      setDragX(0);
    } else {
      setDragX(0);
    }
  };

  const handleLike = () => {
    if (topProfile) {
      onSwipe('right', topProfile.id);
      setDragX(0);
    }
  };

  const handlePass = () => {
    if (topProfile) {
      onSwipe('left', topProfile.id);
      setDragX(0);
    }
  };

  // Stack rendering: top card is draggable, others are visual stack
  const renderCard = (profile: Profile, index: number) => {
    const isTop = index === 0;
    const compat = getCompatibility(profile);
    const dist = getDistance(profile);
    const verified = isVerified(profile);

    const scale = isTop ? 1 : index === 1 ? 0.96 : 0.92;
    const yOffset = isTop ? 0 : index === 1 ? 12 : 24;
    const opacity = isTop ? 1 : index === 1 ? 0.85 : 0.6;
    const z = 30 - index;

    return (
      <motion.div
        key={profile.id}
        className="absolute w-full max-w-[340px] aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/85" />

        {/* Top badges row */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {verified && (
              <div className="inline-flex items-center gap-1 bg-[#14b8a6] text-black text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
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

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between mb-1">
            <div>
              <div className="text-2xl font-semibold tracking-[-0.5px] flex items-center gap-2">
                {profile.name}, {profile.age}
                {verified && <CheckCircle size={18} className="text-[#14b8a6] -mb-0.5" />}
              </div>
              <div className="text-sm opacity-90 flex items-center gap-1.5">
                {profile.city}
                {profile.availableToday && (
                  <span className="text-[10px] bg-[#22c55e]/90 text-black px-2 py-px rounded-full font-medium">HOY</span>
                )}
              </div>
            </div>

            {compat !== null && (
              <div className="text-right">
                <div className="text-3xl font-bold text-[#14b8a6] leading-none">{compat}</div>
                <div className="text-[10px] -mt-1 opacity-75">compat</div>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm leading-snug text-white/90 line-clamp-2 mb-3 pr-2">
            {profile.bio}
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {profile.trainingTypes.slice(0, 3).map(t => (
              <div key={t} className="text-[11px] bg-white/15 px-3 py-0.5 rounded-full">{t}</div>
            ))}
          </div>

          {profile.goals.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {profile.goals.slice(0, 2).map(g => (
                <div key={g} className="text-[10px] bg-[#14b8a6]/80 text-black px-2 py-px rounded-full">{g}</div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-white/70">
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

        {/* Subtle drag hint on top card */}
        {isTop && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40 text-[10px] pointer-events-none select-none">
            Desliza
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 pt-3 relative bg-[#0a0b0f]">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2 px-1">
        <div>
          <div className="text-2xl font-semibold tracking-[-1.5px]">Explorar</div>
          <div className="text-[#14b8a6] text-xs font-medium">
            {deck.length} personas 
            {userLocation ? ' cerca de ti' : ' (activa GPS para ver distancias)'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!userLocation && (
            <button 
              onClick={requestUserLocation}
              className="text-xs flex items-center gap-1 bg-[#14b8a6]/10 text-[#14b8a6] px-2.5 py-1 rounded-full active:bg-[#14b8a6] active:text-black"
            >
              <MapPin size={12}/> Activar GPS
            </button>
          )}
          <button 
            onClick={resetDeck} 
            className="text-xs flex items-center gap-1 text-[#94a3b8] active:text-white"
          >
            <RefreshCw size={14}/> Reiniciar
          </button>
          <button 
            onClick={() => setShowFilters(true)} 
            className="p-2 active:bg-[#121418] rounded-full"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Cards Stack Area */}
      <div className="relative flex-1 flex items-center justify-center mt-1 mb-3 min-h-[460px]">
        <AnimatePresence>
          {visibleCards.length === 0 && (
            <div className="text-center px-8">
              <div className="mx-auto w-16 h-16 bg-[#121418] rounded-full flex items-center justify-center mb-4">
                <Star className="text-[#14b8a6]" />
              </div>
              <div className="text-xl font-semibold mb-2">¡Se acabaron por hoy!</div>
              <p className="text-[#94a3b8] max-w-[260px] mx-auto mb-4">
                No quedan más perfiles que cumplan tus filtros. Cambia los filtros o reinicia el deck.
              </p>
              <button 
                onClick={resetDeck}
                className="px-5 py-2 bg-[#14b8a6] text-black rounded-2xl text-sm font-semibold active:bg-[#0f9d8c]"
              >
                Reiniciar deck
              </button>
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
            className="w-16 h-16 rounded-full bg-[#121418] border border-[#272b33] flex items-center justify-center active:scale-95 transition shadow-inner"
            aria-label="Pasar"
          >
            <X size={34} className="text-[#ef4444]" />
          </button>
          <button 
            onClick={handleLike}
            className="w-[74px] h-[74px] rounded-full bg-[#14b8a6] flex items-center justify-center active:scale-95 transition shadow-lg shadow-[#14b8a6]/40"
            aria-label="Me gusta"
          >
            <Heart size={36} className="text-black" />
          </button>
        </div>
      )}
      {deck.length > 0 && (
        <div className="text-center text-[11px] text-[#475569] pb-2">Desliza o usa los botones</div>
      )}

      {/* Recommendations - Más compatibles (unique discovery) */}
      {userLocation && currentUser && deck.length > 0 && (
        <div className="mt-4 mb-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div>
              <div className="font-semibold text-sm">Más compatibles esta semana</div>
              <div className="text-[10px] text-[#94a3b8]">Basado en tus objetivos + cercanía</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {deck
              .slice(0, 6)
              .map(p => ({ profile: p, score: getCompatibility(p) || 50 }))
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .slice(0, 4)
              .map(({ profile, score }) => (
                <div 
                  key={profile.id}
                  onClick={() => onShowProfile?.(profile)}
                  className="card p-2.5 rounded-2xl flex gap-2.5 cursor-pointer active:scale-[0.985] transition"
                >
                  <img src={profile.photos[0]} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{profile.name}</div>
                    <div className="text-xs text-[#94a3b8] truncate">{profile.city}</div>
                    <div className="text-[#14b8a6] text-sm font-bold mt-0.5">{score}%</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
