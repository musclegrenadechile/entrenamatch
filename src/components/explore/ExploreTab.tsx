import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ExploreTabProps {
  // Props will be expanded as we extract more logic
  deck: any[];
  visibleCards: any[];
  userLocation: any;
  filters: any;
  currentUser: any;
  setShowFilters: (show: boolean) => void;
  resetDeck: () => void;
  requestUserLocation: () => void;
  onSwipe: (direction: 'left' | 'right', profileId: string) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  deck,
  visibleCards,
  userLocation,
  filters,
  currentUser,
  setShowFilters,
  resetDeck,
  requestUserLocation,
  onSwipe,
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 pt-3 relative">
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
          <button onClick={resetDeck} 
            className="text-xs flex items-center gap-1 text-[#94a3b8] active:text-white">
            <RefreshCw size={14}/> Reiniciar
          </button>
          <button onClick={() => setShowFilters(true)} className="p-2 active:bg-[#121418] rounded-full">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Cards Stack - real swipe rendering logic being moved aggressively from App.tsx (wave in progress) */}
      <div className="relative flex-1 flex items-center justify-center mt-1 mb-3 min-h-[460px]">
        <AnimatePresence>
          {visibleCards.length === 0 && (
            <div className="text-center px-8">
              <div className="mx-auto w-16 h-16 bg-[#121418] rounded-full flex items-center justify-center mb-4">
                <Star className="text-[#14b8a6]" />
              </div>
              <div className="text-xl font-semibold mb-2">¡Se acabaron por hoy!</div>
              <p className="text-[#94a3b8] max-w-[240px] mx-auto">No quedan más perfiles que cumplan tus filtros.</p>
            </div>
          )}

          {/* The actual swipe cards will be moved here in the next aggressive step */}
          {visibleCards.map((profile, index) => (
            <div key={profile.id} className="absolute w-full max-w-[340px] aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-2xl">
              <img src={profile.photos[0]} className="w-full h-full object-cover" alt={profile.name} />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-semibold">{profile.name}, {profile.age}</div>
                    <div className="text-sm opacity-90">{profile.city}</div>
                  </div>
                  {currentUser && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#14b8a6]">{/* compatibility */}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Swipe buttons - will be wired in next step */}
      <div className="flex justify-center gap-4 pb-4">
        <button onClick={() => onSwipe('left', visibleCards[0]?.id)} className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center active:scale-95">
          ✕
        </button>
        <button onClick={() => onSwipe('right', visibleCards[0]?.id)} className="w-16 h-16 rounded-full border-2 border-[#14b8a6] text-[#14b8a6] flex items-center justify-center active:scale-95">
          ♥
        </button>
      </div>
    </div>
  );
};
