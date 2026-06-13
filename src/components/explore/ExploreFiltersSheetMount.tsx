import { AnimatePresence, motion } from 'framer-motion'
import { AVAILABILITY, TRAINING_OPTIONS } from '../../constants'
import type { Filters } from '../../hooks/useFilters'

export type ExploreFiltersSheetMountProps = {
  open: boolean
  filters: Filters
  deckCount: number
  liveTrainingCount: number
  userLocation: { lat: number; lng: number } | null
  onClose: () => void
  onReset: () => void
  onSetFilters: (updater: (prev: Filters) => Filters) => void
  onToggleTraining: (type: string) => void
  onToggleAvailability: (time: string) => void
  onRequestLocation: () => void
}

function countActiveFilters(filters: Filters): number {
  return (
    (filters.trainingTypes?.length || 0) +
    (filters.availability?.length || 0) +
    (filters.gender !== 'todos' ? 1 : 0) +
    (filters.onlyAvailableToday ? 1 : 0) +
    (filters.onlyLiveTraining ? 1 : 0)
  )
}

/** Fase 392 — modal de filtros de Explorar extraído de App.tsx. */
export function ExploreFiltersSheetMount({
  open,
  filters,
  deckCount,
  liveTrainingCount,
  userLocation,
  onClose,
  onReset,
  onSetFilters,
  onToggleTraining,
  onToggleAvailability,
  onRequestLocation,
}: ExploreFiltersSheetMountProps) {
  const activeCount = countActiveFilters(filters)

  return (
    <AnimatePresence>
      {open && (
        <div
          className="absolute inset-0 z-[70] flex items-end bg-black/70 overscroll-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', bounce: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full card rounded-t-3xl flex flex-col max-h-[min(92dvh,920px)] overflow-hidden"
          >
            <div className="shrink-0 px-6 pt-6 pb-3 border-b border-[#2F2F35]/60">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-2xl tracking-tight">Filtros</div>
                  {activeCount > 0 && (
                    <div className="text-xs bg-[#FF671F] text-black px-2 py-0.5 rounded-full font-bold">
                      {activeCount} activos
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[#FF671F] text-sm font-semibold active:opacity-70"
                >
                  Limpiar todo
                </button>
              </div>
              <div className="mb-4 px-3 py-2 bg-[#1C1C20] rounded-2xl text-sm flex items-center justify-between border border-[#2F2F35]">
                <span className="text-[#9CA3AF]">Disponibles ahora</span>
                <span className="font-bold text-[#FF671F] text-lg tabular-nums">
                  {deckCount}
                  {liveTrainingCount > 0 ? ` + ${liveTrainingCount} en vivo` : ''}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4 [-webkit-overflow-scrolling:touch]">
              <AnimatePresence>
                {activeCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 flex flex-wrap gap-1.5"
                  >
                    {filters.trainingTypes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onToggleTraining(t)}
                        className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                      >
                        {t} <span className="text-xs">×</span>
                      </button>
                    ))}
                    {filters.availability.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onToggleAvailability(a)}
                        className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                      >
                        {a} <span className="text-xs">×</span>
                      </button>
                    ))}
                    {filters.gender !== 'todos' && (
                      <button
                        type="button"
                        onClick={() => onSetFilters((f) => ({ ...f, gender: 'todos' }))}
                        className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                      >
                        {filters.gender === 'hombre' ? 'Hombres' : 'Mujeres'}{' '}
                        <span className="text-xs">×</span>
                      </button>
                    )}
                    {filters.onlyAvailableToday && (
                      <button
                        type="button"
                        onClick={() => onSetFilters((f) => ({ ...f, onlyAvailableToday: false }))}
                        className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2.5 py-0.5 rounded-full active:bg-[#22c55e]/30 flex items-center gap-1"
                      >
                        Disponibles hoy <span className="text-xs">×</span>
                      </button>
                    )}
                    {filters.onlyLiveTraining && (
                      <button
                        type="button"
                        onClick={() => onSetFilters((f) => ({ ...f, onlyLiveTraining: false }))}
                        className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2.5 py-0.5 rounded-full active:bg-[#22c55e]/30 flex items-center gap-1"
                      >
                        Entrenando ahora <span className="text-xs">×</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-7">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium">Edad</span>
                  <span className="font-mono text-[#FF671F]">
                    {filters.minAge} - {filters.maxAge}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1.5">
                      <span>Mínimo</span>
                      <span>{filters.minAge}</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="70"
                      value={filters.minAge}
                      onChange={(e) =>
                        onSetFilters((f) => ({
                          ...f,
                          minAge: Math.min(parseInt(e.target.value, 10), f.maxAge - 1),
                        }))
                      }
                      className="w-full accent-[#FF671F]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1.5">
                      <span>Máximo</span>
                      <span>{filters.maxAge}</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="70"
                      value={filters.maxAge}
                      onChange={(e) =>
                        onSetFilters((f) => ({
                          ...f,
                          maxAge: Math.max(parseInt(e.target.value, 10), f.minAge + 1),
                        }))
                      }
                      className="w-full accent-[#FF671F]"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Distancia máxima</span>
                  <span className="text-[#FF671F]">
                    {userLocation
                      ? filters.maxDistanceKm >= 100
                        ? 'Sin límite'
                        : `${filters.maxDistanceKm} km`
                      : 'GPS requerido'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.maxDistanceKm}
                  onChange={(e) =>
                    onSetFilters((f) => ({ ...f, maxDistanceKm: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-[#FF671F]"
                  disabled={!userLocation}
                />
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                  <span>5 km</span>
                  <span>100+ km (todos)</span>
                </div>
                {userLocation && filters.maxDistanceKm >= 100 && (
                  <p className="text-[10px] text-[#9CA3AF] mt-2 leading-snug">
                    Sin límite: ves a todos en tu zona, ordenados de más cerca a más lejos.
                  </p>
                )}
                {!userLocation && (
                  <button
                    type="button"
                    onClick={onRequestLocation}
                    className="mt-3 text-xs w-full py-2.5 rounded-2xl border border-[#22c55e] text-[#22c55e] active:bg-[#22c55e] active:text-black font-semibold"
                  >
                    📍 Usar ubicación real del teléfono (GPS)
                  </button>
                )}
                {userLocation && (
                  <div className="mt-1 text-[9px] text-[#22c55e] text-center">
                    ✓ Usando GPS real • distancias precisas
                  </div>
                )}
              </div>

              <div className="mb-7">
                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#2F2F35] cursor-pointer active:bg-[#25252A]">
                  <input
                    type="checkbox"
                    checked={filters.onlyAvailableToday}
                    onChange={(e) =>
                      onSetFilters((f) => ({ ...f, onlyAvailableToday: e.target.checked }))
                    }
                    className="w-5 h-5 accent-[#FF671F]"
                  />
                  <div>
                    <div className="text-sm font-medium">Solo disponibles hoy</div>
                    <div className="text-xs text-[#9CA3AF]">
                      Personas que pueden entrenar el mismo día
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#22c55e]/50 cursor-pointer active:bg-[#25252A] mt-2">
                  <input
                    type="checkbox"
                    checked={filters.onlyLiveTraining}
                    onChange={(e) =>
                      onSetFilters((f) => ({ ...f, onlyLiveTraining: e.target.checked }))
                    }
                    className="w-5 h-5 accent-[#22c55e]"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      Solo entrenando ahora{' '}
                      <span className="live-pill bg-[#22c55e] text-black text-[8px]">🟢 EN VIVO</span>
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      Quién está entrenando en este momento cerca
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#FF671F]/40 cursor-pointer active:bg-[#25252A] mt-2">
                  <input
                    type="checkbox"
                    checked={filters.onlyRealProfiles}
                    onChange={(e) =>
                      onSetFilters((f) => ({ ...f, onlyRealProfiles: e.target.checked }))
                    }
                    className="w-5 h-5 accent-[#FF671F]"
                  />
                  <div>
                    <div className="text-sm font-medium">Solo perfiles reales</div>
                    <div className="text-xs text-[#9CA3AF]">
                      Oculta perfiles DEMO del swipe
                    </div>
                  </div>
                </label>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Me interesa</div>
                <div className="flex rounded-2xl overflow-hidden border border-[#2F2F35]">
                  {(['todos', 'hombre', 'mujer'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onSetFilters((f) => ({ ...f, gender: g }))}
                      className={`flex-1 py-2.5 text-sm font-medium transition ${filters.gender === g ? 'bg-[#FF671F] text-black' : 'bg-[#1C1C20] active:bg-[#25252A] text-white'}`}
                    >
                      {g === 'todos' ? 'Todos' : g === 'hombre' ? 'Hombres' : 'Mujeres'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    Tipo de entrenamiento
                    {filters.trainingTypes.length > 0 && (
                      <span className="text-[10px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded-full font-medium">
                        {filters.trainingTypes.length} seleccionados
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRAINING_OPTIONS.map((t) => {
                    const selected = filters.trainingTypes.includes(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onToggleTraining(t)}
                        className={`px-3 py-1 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] font-medium' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3a3f48] text-white/90'}`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    Disponibilidad
                    {filters.availability.length > 0 && (
                      <span className="text-[10px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded-full font-medium">
                        {filters.availability.length} seleccionadas
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABILITY.map((a) => {
                    const selected = filters.availability.includes(a)
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onToggleAvailability(a)}
                        className={`px-3 py-1 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] font-medium' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3a3f48] text-white/90'}`}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-[#2F2F35]/60 bg-[#141418]">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary w-full shadow-lg shadow-[#FF671F]/20 flex items-center justify-center gap-2 text-base"
              >
                Ver {deckCount} disponibles <span className="text-lg leading-none">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
