import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'

export type MapZoneFilter = {
  city: string
  color: string
  count: number
}

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
  /** Map tab: city zone pills live inside the filter panel */
  zoneFilters?: MapZoneFilter[]
  selectedMapZone?: string | null
  onSelectedMapZoneChange?: (zone: string | null) => void
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
  zoneFilters = [],
  selectedMapZone = null,
  onSelectedMapZoneChange,
}: GymPulseMapFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeCount =
    [mapNearOnly, showOnlyNetwork, showPartners, mapMyGymOnly].filter(Boolean).length +
    (selectedMapZone ? 1 : 0)

  return (
    <div className="gym-pulse-filters">
      <button
        type="button"
        className={`gym-pulse-filters__trigger ${open ? 'gym-pulse-filters__trigger--open' : ''}`}
        data-gympulse-tour="checkin"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <SlidersHorizontal size={12} />
        Filtros
        {activeCount > 0 && <span className="gym-pulse-filters__badge">{activeCount}</span>}
      </button>
      <span className="gym-pulse-filters__count">
        {mapNearOnly ? filteredCount : totalCount} en vivo
        {showPartners && partnerCount > 0 && ` · ${partnerCount} spots`}
      </span>

      {open && (
        <>
          <button type="button" className="gym-pulse-filters__backdrop" onClick={() => setOpen(false)} aria-label="Cerrar filtros" />
          <div className="gym-pulse-filters__panel" role="dialog" aria-label="Filtros del mapa">
            <div className="gym-pulse-filters__panel-head">
              <strong>{BRAND_COPY.liveMap.filtersTitle}</strong>
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
                {BRAND_COPY.liveMap.partnersFilter}
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
            {zoneFilters.length > 0 && onSelectedMapZoneChange && (
              <div className="gym-pulse-filters__zones">
                <p className="gym-pulse-filters__zones-label">{BRAND_COPY.liveMap.legendZones}</p>
                <div className="gym-pulse-filters__zones-row">
                  {zoneFilters.map(({ city, color, count }) => {
                    const isActive = selectedMapZone === city
                    const short = city.split(' ')[0]
                    return (
                      <button
                        key={city}
                        type="button"
                        className={`gym-pulse-filters__zone-pill ${isActive ? 'gym-pulse-filters__zone-pill--on' : ''}`}
                        style={
                          isActive
                            ? { borderColor: color, color, background: `${color}22` }
                            : undefined
                        }
                        onClick={() => onSelectedMapZoneChange(isActive ? null : city)}
                      >
                        <span className="gym-pulse-filters__zone-dot" style={{ background: color }} />
                        {short}
                        {count > 0 && <span className="gym-pulse-filters__zone-count">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
