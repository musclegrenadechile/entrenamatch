import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

export interface GymPulseMapFiltersProps {
  mapNearOnly: boolean
  showOnlyNetwork: boolean
  showPartners: boolean
  mapMyGymOnly?: boolean
  mapMyGymId?: string | null
  filteredCount: number
  totalCount: number
  partnerCount: number
  onMapNearOnlyChange?: (v: boolean) => void
  onShowOnlyNetworkChange?: (v: boolean) => void
  onShowPartnersChange?: (v: boolean) => void
  onMapMyGymOnlyChange?: (v: boolean) => void
}

export function GymPulseMapFilters({
  mapNearOnly,
  showOnlyNetwork,
  showPartners,
  mapMyGymOnly,
  mapMyGymId,
  filteredCount,
  totalCount,
  partnerCount,
  onMapNearOnlyChange,
  onShowOnlyNetworkChange,
  onShowPartnersChange,
  onMapMyGymOnlyChange,
}: GymPulseMapFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeCount = [mapNearOnly, showOnlyNetwork, showPartners, mapMyGymOnly].filter(Boolean).length

  return (
    <div className="gym-pulse-filters">
      <button
        type="button"
        className={`gym-pulse-filters__trigger ${open ? 'gym-pulse-filters__trigger--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <SlidersHorizontal size={12} />
        Filtros
        {activeCount > 0 && <span className="gym-pulse-filters__badge">{activeCount}</span>}
      </button>
      <span className="gym-pulse-filters__count">
        {mapNearOnly ? filteredCount : totalCount} en vivo
        {showPartners && partnerCount > 0 && ` · ${partnerCount} gyms`}
      </span>

      {open && (
        <>
          <button type="button" className="gym-pulse-filters__backdrop" onClick={() => setOpen(false)} aria-label="Cerrar filtros" />
          <div className="gym-pulse-filters__panel" role="dialog" aria-label="Filtros del mapa">
            <div className="gym-pulse-filters__panel-head">
              <strong>Filtros GymPulse</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
            <div className="gym-pulse-filters__options">
              <button
                type="button"
                className={mapNearOnly ? 'gym-pulse-filters__opt--on' : 'gym-pulse-filters__opt'}
                onClick={() => onMapNearOnlyChange?.(!mapNearOnly)}
              >
                Cerca de mí (10 km)
              </button>
              <button
                type="button"
                className={showOnlyNetwork ? 'gym-pulse-filters__opt--on' : 'gym-pulse-filters__opt'}
                onClick={() => onShowOnlyNetworkChange?.(!showOnlyNetwork)}
              >
                Solo mi red
              </button>
              <button
                type="button"
                className={showPartners ? 'gym-pulse-filters__opt--on' : 'gym-pulse-filters__opt'}
                onClick={() => onShowPartnersChange?.(!showPartners)}
              >
                Gyms partners
              </button>
              {mapMyGymId && (
                <button
                  type="button"
                  className={mapMyGymOnly ? 'gym-pulse-filters__opt--on' : 'gym-pulse-filters__opt'}
                  onClick={() => onMapMyGymOnlyChange?.(!mapMyGymOnly)}
                >
                  Solo mi gym
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
