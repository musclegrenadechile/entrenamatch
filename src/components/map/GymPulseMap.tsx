// @ts-nocheck — fase 76 deferred: strict pass after marker registry split (build green via props types).
/**
 * GymPulseMap - Extracted Live Map Component (modularization started 2026-06-05)
 *
 * Goal: Remove ~800+ lines of complex Leaflet + marker/ripple/partner/sync-line rendering
 * from the giant App.tsx monolith.
 *
 * This component now owns:
 * - The Leaflet map instance and container
 * - All map-specific refs (markers, self, area, syncLines, timeouts, etc.)
 * - Initialization
 * - The heavy debounced real-time update effect (live users, clusters, ripples, partners, tethers, heartbeats)
 * - Dev click-to-place support
 * - Zoom cluster behavior
 *
 * Parent (App) is responsible for:
 * - All the data (liveTrainingNow, partnerLocations, syncRipples, etc.)
 * - Higher level state (showLiveMap, filters like mapNearOnly, selectedMapZone, showPartners, showOnlyNetwork)
 * - Callbacks for user actions (show profile, start sync, partner placed by dev, force tick)
 * - The partner Firestore listener (can be moved here later)
 *
 * Next iterations can move even more (the partner listener, some filter state, the "Centrar" button logic).
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useState } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'
import { Crosshair } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import { GymPulseMapFilters } from './GymPulseMapFilters'
import { GymPulseRadar } from './GymPulseRadar'
import { GymPulsePopupLayer } from './popups/GymPulsePopupLayer'
import type { GymPulsePopupState } from './gymPulsePopupTypes'
// Namespace imports avoid minifier name collisions with App.tsx useState bindings in the same chunk (Fn/Mn/Bn overwrite bug).
import * as MarkerReg from '../../services/gymPulseMarkerRegistry'
import type { MarkerPool } from '../../services/gymPulseMarkerRegistry'

// Fix Leaflet icons (same as before)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

import { getDistanceKm } from '../../utils'
import { filterMapLiveUsers, hasMapCoords } from '../../utils/gymPulseLive'
import { logMapEvent } from '../../services/mapAnalytics'
import * as MarkerHtml from '../../utils/gymPulseMarkers'
import * as MapConfig from '../../services/gymPulseMapConfig'
import * as MapCluster from '../../services/gymPulseCluster'
import * as LocalNetwork from '../../services/localNetwork'
import { syncElapsedMinutes } from '../../utils/syncFomo'
import { markMapGpsPromptShown, shouldShowMapGpsPrompt } from '../../utils/mapGpsPrompt'
import { resolveCityZone, resolveDerbyMapZone, cityZonePolygonLatLngs } from '../../services/cityZoneBounds'
import { DERBY_AWAY, DERBY_HOME, derbyStatusLine, type CityDerbyState } from '../../services/cityDerby'
import { loadMapView, saveMapView } from '../../utils/mapViewCache'

export type CityChallengeMapInfo = {
  cityLabel: string
  progressPct: number
  currentMinutes: number
  targetMinutes: number
}

export interface GymPulseMapProps {
  showLiveMap: boolean
  /** All live users for map rendering (includes self when live). */
  liveTrainingNow: any[]
  /** Precomputed live count from App pipeline (includes self). */
  liveCount?: number
  /** Current user id — used to avoid duplicate self pin (self uses premium marker). */
  selfUserId?: string | null
  syncRipples: any[]
  partnerLocations: any[]
  echoPins?: any[]
  userLocation: { lat: number; lng: number } | null
  mapNearOnly: boolean
  selectedMapZone: string | null
  showOnlyNetwork?: boolean
  showPartners: boolean
  /** When set, only show live users checked in at this partner gym. */
  mapMyGymOnly?: boolean
  mapMyGymId?: string | null
  mapForceTick: number
  syncBonds: Record<string, any>
  isDeveloper?: boolean
  isPlacingPartner?: boolean
  isQuickAddPartner?: boolean
  selfIsLive?: boolean

  // Filter controls (moved inside for self-contained widget)
  onMapNearOnlyChange?: (v: boolean) => void
  onSelectedMapZoneChange?: (z: string | null) => void
  onShowOnlyNetworkChange?: (v: boolean) => void
  onShowPartnersChange?: (v: boolean) => void
  onMapMyGymOnlyChange?: (v: boolean) => void

  // Dev actions
  onOpenAddPartner?: () => void
  onOpenManagePartners?: () => void
  onToggleQuickAdd?: (next: boolean) => void
  onLogoutDeveloper?: () => void
  onAddPartnerAtCurrentCenter?: () => void
  onReloadPartners?: () => void
  onSpawnTestLives?: (count?: number) => void
  onClearDevTestLives?: () => void
  devTestCount?: number // for showing clear button only when there are active test lives

  // Callbacks
  onShowProfile?: (p: any) => void
  onStartSync?: (id: string, name: string) => void
  onPartnerPositionSelected?: (lat: number, lng: number) => void
  onPartnerMoved?: (id: string, lat: number, lng: number) => void
  onPartnerDelete?: (id: string) => void
  onPartnerEdit?: (id: string) => void
  onForceTick?: () => void
  onRequestLocation?: () => void

  onRegisterCentrar?: (fn: () => void) => void

  // Witness for echo pins / ripples from map (connect to parent modal/replay)
  onWitnessEchoPin?: (id: string) => void
  onWitnessRipple?: (id: string) => void
  /** Fase 106 — check-in desde partner card */
  onGymCheckIn?: (gym: { id: string; name: string; lat: number; lng: number }) => void
  userGymId?: string | null
  /** Fase 101 — embedded widget vs fullscreen shell */
  layoutMode?: 'embedded' | 'fullscreen' | 'tab'
  /** Fase 200 — city challenge zone overlay */
  cityChallenge?: CityChallengeMapInfo | null
  /** Fase 85 — CTA when user taps reto banner */
  onCityChallengeCta?: () => void
  /** Derby Valparaíso vs Metropolitana — dual regional zone overlay */
  cityDerby?: CityDerbyState | null
}

export interface GymPulseMapHandle {
  flyToSelf: () => void
  invalidateSize: () => void
  centerOn: (lat: number, lng: number, zoom?: number) => void
  flyTo: (lat: number, lng: number, zoom?: number) => void
  getCenter: () => { lat: number; lng: number } | null
}

const ZONE_COLORS: Record<string, string> = {
  'Viña del Mar': '#22c55e',
  'Santiago': '#FF671F',
  'Valparaíso': '#3b82f6',
  'Concon': '#a855f7',
  default: '#eab308'
}

function isSelfLiveUser(u: any, selfUserId?: string | null): boolean {
  if (!u || !selfUserId) return false
  return u.id === selfUserId || u.id === 'me' || !!u._isSelf
}

function resolveSelfMapPosition(
  userLocation: { lat: number; lng: number; photo?: string } | null,
  liveUsers: any[],
  selfUserId?: string | null
): { lat: number; lng: number; photo?: string } | null {
  if (userLocation && hasMapCoords(userLocation)) {
    return { lat: Number(userLocation.lat), lng: Number(userLocation.lng), photo: userLocation.photo }
  }
  const selfEntry = (liveUsers || []).find((u) => isSelfLiveUser(u, selfUserId))
  if (selfEntry && hasMapCoords(selfEntry)) {
    return { lat: Number(selfEntry.lat), lng: Number(selfEntry.lng), photo: selfEntry.photos?.[0] }
  }
  return null
}

const GymPulseMap = forwardRef<GymPulseMapHandle, GymPulseMapProps>((props, ref) => {
  const {
    showLiveMap,
    liveTrainingNow,
    liveCount,
    selfUserId = null,
    syncRipples,
    partnerLocations,
    echoPins = [],
    userLocation,
    mapNearOnly,
    selectedMapZone,
    showOnlyNetwork = false,
    showPartners,
    mapMyGymOnly = false,
    mapMyGymId = null,
    mapForceTick,
    syncBonds,
    isDeveloper = false,
    isPlacingPartner = false,
    isQuickAddPartner = false,
    selfIsLive = false,

    // New internal control props
    onMapNearOnlyChange,
    onSelectedMapZoneChange,
    onShowOnlyNetworkChange,
    onShowPartnersChange,
    onMapMyGymOnlyChange,
    onOpenAddPartner,
    onOpenManagePartners,
    onToggleQuickAdd,
    onLogoutDeveloper,

    onShowProfile,
    onStartSync,
    onPartnerPositionSelected,
    onPartnerMoved,
    onPartnerDelete,
    onPartnerEdit,
    onForceTick,
    onRequestLocation,
    onRegisterCentrar,

    onWitnessEchoPin,
    onWitnessRipple,
    layoutMode = 'embedded',

    onAddPartnerAtCurrentCenter,
    onReloadPartners,
    onSpawnTestLives,
    onClearDevTestLives,
    devTestCount,
    onGymCheckIn,
    userGymId = null,
    cityChallenge = null,
    onCityChallengeCta,
    cityDerby = null,
  } = props

  const [mapPopup, setMapPopup] = useState<GymPulsePopupState | null>(null)
  const [devToolsOpen, setDevToolsOpen] = useState(false)
  const [radarSweep, setRadarSweep] = useState(false)
  const [gpsBannerDismissed, setGpsBannerDismissed] = useState(false)
  const mapOpenLoggedRef = useRef(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerPoolRef = useRef<MarkerPool>(new Map())
  const markerSigRef = useRef<Map<string, string>>(new Map())
  const lastClusterIndexRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const syncLinesRef = useRef<any[]>([])
  const selfMarkerRef = useRef<any>(null)
  const areaCircleRef = useRef<any>(null)
  const cityChallengeLayerRef = useRef<any>(null)
  const cityDerbyLayersRef = useRef<any[]>([])
  const prevLiveCountRef = useRef(0)
  const prevLiveIdsRef = useRef<Set<string>>(new Set())
  const lastZoomTimeRef = useRef(0)
  const partnerLocationsRef = useRef<any[]>([])
  const mapUpdateTimeoutRef = useRef<any>(null)
  const isPlacingPartnerRef = useRef(false)
  const isQuickAddPartnerRef = useRef(false)
  const showAddPartnerFormRef = useRef(false)
  const isEmbedded = layoutMode === 'embedded'
  const isTabFill = layoutMode === 'tab'
  const isFullHeight = layoutMode === 'fullscreen' || isTabFill

  // Keep latest values in refs for closures inside Leaflet handlers / debounced updates
  useEffect(() => { partnerLocationsRef.current = partnerLocations }, [partnerLocations])
  useEffect(() => { isPlacingPartnerRef.current = isPlacingPartner }, [isPlacingPartner])
  useEffect(() => { isQuickAddPartnerRef.current = isQuickAddPartner }, [isQuickAddPartner])

  // Expose imperative handle for parent (centrar, invalidate, etc.)
  useImperativeHandle(ref, () => ({
    flyToSelf: () => {
      if (mapInstanceRef.current && selfMarkerRef.current) {
        const currentZoom = mapInstanceRef.current.getZoom()
        mapInstanceRef.current.flyTo(selfMarkerRef.current.getLatLng(), Math.max(currentZoom, 15), { duration: 0.85 })
      }
    },
    invalidateSize: () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.invalidateSize() } catch {}
      }
    },
    centerOn: (lat: number, lng: number, zoom = 15) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 0.8 })
      }
    },
    flyTo: (lat: number, lng: number, zoom = 14) => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.flyTo([lat, lng], Math.max(zoom, 12), { duration: 0.9, easeLinearity: 0.25 })
        } catch {}
      }
    },
    getCenter: () => {
      if (mapInstanceRef.current) {
        try {
          const c = mapInstanceRef.current.getCenter()
          return { lat: c.lat, lng: c.lng }
        } catch {}
      }
      return null
    }
  }), [])

  // Register centrar fn with parent if provided
  useEffect(() => {
    if (onRegisterCentrar) {
      onRegisterCentrar(() => {
        if (selfMarkerRef.current && mapInstanceRef.current) {
          const z = mapInstanceRef.current.getZoom()
          mapInstanceRef.current.flyTo(selfMarkerRef.current.getLatLng(), Math.max(z, 15), { duration: 0.85 })
        } else if (mapInstanceRef.current && markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current)
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2))
        }
      })
    }
  }, [onRegisterCentrar])

  /** Always destroy Leaflet on unmount — switching Map → Explorar unmounts without showLiveMap=false first. */
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch { /* ignore */ }
        mapInstanceRef.current = null
      }
      markersRef.current = []
      markerPoolRef.current.clear()
      markerSigRef.current.clear()
      selfMarkerRef.current = null
      areaCircleRef.current = null
      cityChallengeLayerRef.current = null
    }
  }, [])

  // Main map effect - the heart of GymPulse (moved from App.tsx monolith)
  useEffect(() => {
    if (!showLiveMap || !mapContainerRef.current) {
      // Aggressive cleanup when map should be hidden
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        markersRef.current = []
        markerPoolRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        markerPoolRef.current.clear()
        markerSigRef.current.clear()
        setMapPopup(null)
        if (selfMarkerRef.current) { try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}; selfMarkerRef.current = null }
        if (areaCircleRef.current) { try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}; areaCircleRef.current = null }
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
      return
    }

    // First map open: one-time GPS request (fase 193)
    if (!userLocation && onRequestLocation && shouldShowMapGpsPrompt()) {
      markMapGpsPromptShown()
      onRequestLocation().catch(() => {})
    }

    // Initialize map if needed
    if (!mapInstanceRef.current) {
      const cached = loadMapView()
      const initialCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : cached
          ? [cached.lat, cached.lng]
          : [-33.0, -71.5]
      const initialZoom = userLocation ? 13 : cached?.zoom ?? 10
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(initialCenter as [number, number], initialZoom)

      const attachRaster = () => {
        L.tileLayer(MapConfig.GYMPULSE_MAP_TILE_URL, {
          maxZoom: 19,
          subdomains: [...MapConfig.GYMPULSE_MAP_SUBDOMAINS],
          attribution: MapConfig.GYMPULSE_MAP_TILE_ATTRIBUTION,
        }).addTo(mapInstanceRef.current)
      }

      if (MapConfig.GYMPULSE_USE_MAPLIBRE) {
        import('@maplibre/maplibre-gl-leaflet')
          .then(() => import('maplibre-gl/dist/maplibre-gl.css'))
          .then(() => {
            if (!mapInstanceRef.current) return
            try {
              ;(L as any).maplibreGL({
                style: MapConfig.GYMPULSE_MAPLIBRE_STYLE_URL,
                attribution: MapConfig.GYMPULSE_MAP_TILE_ATTRIBUTION,
              }).addTo(mapInstanceRef.current)
            } catch {
              attachRaster()
            }
          })
          .catch(() => attachRaster())
      } else {
        attachRaster()
      }

      // Move zoom control to bottom right so our overlays (Centrar top-right, dev toolbar) are not covered
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current)

      // Critical for "no se descuadra": Leaflet must know the *exact* rendered pixel size of its container.
      // React conditional render + minHeight wrapper + possible CSS transitions/animations mean the div may report 0 or stale size on first paint.
      // Multiple RAF + timeouts + explicit invalidate(true) (the arg helps Leaflet re-evaluate panes).
      const forceMapSize = () => {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.invalidateSize(true) } catch {}
        }
      }
      forceMapSize()
      requestAnimationFrame(forceMapSize)
      requestAnimationFrame(() => requestAnimationFrame(forceMapSize))
      setTimeout(forceMapSize, 60)
      setTimeout(forceMapSize, 160)
      setTimeout(forceMapSize, 400)

      // Dev click-to-place
      if (mapInstanceRef.current && !(mapInstanceRef.current as any)._emDevPlaceBound) {
        mapInstanceRef.current.on('click', (e: any) => {
          const shouldTrigger = isPlacingPartnerRef.current || isQuickAddPartnerRef.current
          if (shouldTrigger && onPartnerPositionSelected) {
            const { lat, lng } = e.latlng || {}
            if (typeof lat === 'number' && typeof lng === 'number') {
              onPartnerPositionSelected(lat, lng)
              try { /* haptic if available */ } catch {}
              if (isPlacingPartnerRef.current) {
                toast.success('Posición fijada', { description: `${lat.toFixed(4)}, ${lng.toFixed(4)} — ajusta o guarda` })
              }
            }
          }
        })
        ;(mapInstanceRef.current as any)._emDevPlaceBound = true
      }

      // Zoom listener for clusters + force tick
      if (mapInstanceRef.current && !(mapInstanceRef.current as any)._clusterZoomBound) {
        const onMapViewChange = () => {
          lastZoomTimeRef.current = Date.now()
          if (onForceTick) onForceTick()
        }
        mapInstanceRef.current.on('zoomend', onMapViewChange)
        mapInstanceRef.current.on('moveend', () => {
          onMapViewChange()
          try {
            const c = mapInstanceRef.current.getCenter()
            saveMapView(c.lat, c.lng, mapInstanceRef.current.getZoom())
          } catch { /* ignore */ }
        })
        mapInstanceRef.current.on('moveend', onMapViewChange)
        ;(mapInstanceRef.current as any)._clusterZoomBound = true
      }
    } else {
      // Map instance already alive (data/filter update while visible). Still force size in case parent layout shifted.
      const forceMapSize = () => {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.invalidateSize() } catch {}
        }
      }
      forceMapSize()
      setTimeout(forceMapSize, 80)
    }

    // Debounced heavy update (core of the living GymPulse)
    if (mapUpdateTimeoutRef.current) clearTimeout(mapUpdateTimeoutRef.current)
    const isRecentZoom = (Date.now() - lastZoomTimeRef.current) < 2000
    const updateDelay = isRecentZoom ? 60 : 280

    mapUpdateTimeoutRef.current = setTimeout(() => {
      if (!mapInstanceRef.current) return

      // Namespace property access only — never alias to short names like `p` inside this callback
      // (production minify collision: `const p = pulsoUser` shadowed `pruneMarkerPool` → p(...) is not a function).

      // Clear ephemeral layers only (ripples, heat, echo) — pooled markers diff in place (Fase 110)
      markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
      markersRef.current = []

      const pool = markerPoolRef.current
      const sigs = markerSigRef.current
      const activeKeys = new Set<string>()
      const map = mapInstanceRef.current
      const allLive = liveTrainingNow || []

      const upsertPooledMarker = (
        key: string,
        lat: number,
        lng: number,
        icon: L.DivIcon,
        iconSig: string,
        onClick: () => void,
        opts?: { draggable?: boolean; onDragEnd?: () => void; className?: string }
      ) => {
        activeKeys.add(key)
        let marker = pool.get(key)
        if (!marker) {
          marker = L.marker([lat, lng], {
            icon,
            draggable: !!opts?.draggable,
            title: opts?.className,
          }).addTo(map)
          marker.on('click', onClick)
          if (opts?.draggable && opts.onDragEnd) marker.on('dragend', opts.onDragEnd)
          pool.set(key, marker)
          sigs.set(key, iconSig)
        } else {
          marker.setLatLng([lat, lng])
          if (sigs.get(key) !== iconSig) {
            marker.setIcon(icon)
            sigs.set(key, iconSig)
          }
        }
      }

      let liveUsers = filterMapLiveUsers(liveTrainingNow || [], {
        mapNearOnly,
        userLocation,
        selectedMapZone,
        showOnlyNetwork,
        mapMyGymId: mapMyGymOnly && mapMyGymId ? mapMyGymId : null,
        getDistanceKm,
      })
      // Self gets the premium marker below — skip duplicate live pin
      liveUsers = liveUsers.filter((u) => !isSelfLiveUser(u, selfUserId))

      const selfMapPos = resolveSelfMapPosition(userLocation, liveTrainingNow || [], selfUserId)
      const selfInFilteredView = selfIsLive && selfMapPos && filterMapLiveUsers(
        (liveTrainingNow || []).filter((u) => isSelfLiveUser(u, selfUserId)),
        {
          mapNearOnly,
          userLocation,
          selectedMapZone,
          showOnlyNetwork,
          mapMyGymId: mapMyGymOnly && mapMyGymId ? mapMyGymId : null,
          getDistanceKm,
        }
      ).length > 0

      // Heartbeats when live count increases (self counts when live + visible on map)
      const currentLive = liveUsers.length + (selfInFilteredView ? 1 : 0)
      const prevLive = prevLiveCountRef.current
      if (currentLive > prevLive && currentLive > 0) {
        const candidates = liveUsers.length > 0 ? liveUsers : (userLocation ? [userLocation] : [])
        for (let i = 0; i < Math.min(2, candidates.length); i++) {
          const pos = candidates[Math.floor(Math.random() * candidates.length)]
          try {
            const beat = L.circle([pos.lat, pos.lng], {
              radius: 420 + (currentLive * 18),
              color: '#22c55e', weight: 1.5, fillColor: '#22c55e', fillOpacity: 0.035, opacity: 0.28,
              className: 'map-heartbeat-ring iconic-ripple'
            }).addTo(mapInstanceRef.current)
            ;(beat as any)._isHeartbeat = true
            markersRef.current.push(beat)
            setTimeout(() => {
              if (mapInstanceRef.current && (beat as any)._isHeartbeat) try { mapInstanceRef.current.removeLayer(beat) } catch {}
            }, 1650)
          } catch {}
        }
        if (currentLive - prevLive >= 2) { try { /* haptic */ } catch {} }
      }
      prevLiveCountRef.current = currentLive

      // New lives ripples (FOMO)
      const currentIds = new Set(liveUsers.map((u: any) => u.id))
      const prevIds = prevLiveIdsRef.current
      const newLives = liveUsers.filter((u: any) => !prevIds.has(u.id))
      newLives.forEach((newUser: any) => {
        if (!newUser.lat || !newUser.lng) return
        const isHigh = (newUser.visibleLevel || 1) >= 15 || newUser.isNetworkBond
        const hasPulso = (newUser.visibleLevel || 1) >= 20
        const color = hasPulso ? '#a855f7' : (isHigh ? '#FFD700' : '#22c55e')
        try {
          const r = L.circle([newUser.lat, newUser.lng], {
            radius: hasPulso ? 650 : (isHigh ? 550 : 320),
            color, weight: hasPulso || isHigh ? 2.8 : 1.8,
            fillColor: color, fillOpacity: hasPulso || isHigh ? 0.1 : 0.05, opacity: hasPulso || isHigh ? 0.7 : 0.45,
            className: `map-heartbeat-ring iconic-ripple ripple-new-live${hasPulso ? ' pulso-maestro-ripple' : (isHigh ? ' high-gadget-ripple' : '')}`
          }).addTo(mapInstanceRef.current)
          ;(r as any)._isNewLiveRipple = true
          markersRef.current.push(r)
          setTimeout(() => {
            if (mapInstanceRef.current && (r as any)._isNewLiveRipple) try { mapInstanceRef.current.removeLayer(r) } catch {}
          }, isHigh ? 2200 : 1600)
        } catch {}
      })
      prevLiveIdsRef.current = currentIds

      // Ambient pulso for high level users
      const pulsoUsers = liveUsers.filter((u: any) => (u.visibleLevel || 1) >= 20 && u.lat && u.lng)
      if (pulsoUsers.length > 0 && Math.random() < 0.4) {
        const ambientPulsoUser = pulsoUsers[Math.floor(Math.random() * pulsoUsers.length)]
        try {
          const amb = L.circle([ambientPulsoUser.lat, ambientPulsoUser.lng], {
            radius: 180, color: '#a855f7', weight: 1.2, fillColor: '#a855f7', fillOpacity: 0.03, opacity: 0.25,
            className: 'pulso-maestro-ripple iconic-ripple ripple-pulso-master'
          }).addTo(mapInstanceRef.current)
          ;(amb as any)._isAmbientPulso = true
          markersRef.current.push(amb)
          setTimeout(() => { if (mapInstanceRef.current && (amb as any)._isAmbientPulso) try { mapInstanceRef.current.removeLayer(amb) } catch {} }, 1800)
        } catch {}
      }

      // Fase 103 — supercluster (replaces grid buckets)
      const currentZoom = mapInstanceRef.current.getZoom()
      const clusterIndex = MapCluster.buildLiveClusterIndex(liveUsers as any[])
      lastClusterIndexRef.current = clusterIndex
      const bounds = mapInstanceRef.current.getBounds()
      const bbox = MapCluster.bboxFromLeafletBounds(bounds)
      const clusterFeatures = MapCluster.getLiveClusters(clusterIndex, bbox, currentZoom)
      const renderUsers = clusterFeatures.map((f) => {
        const [lng, lat] = f.geometry.coordinates
        if (f.properties.cluster) {
          return {
            id: `cluster-${f.properties.cluster_id}`,
            lat,
            lng,
            isCluster: true,
            clusterCount: f.properties.point_count || 0,
            clusterId: f.properties.cluster_id,
            _clusterIndex: clusterIndex,
          }
        }
        return { ...f.properties, lat, lng, isCluster: false }
      })

      // Fase 107 — density heat halos
      MarkerReg.computeHeatCells(liveUsers.filter((u: any) => u.lat && u.lng)).forEach((cell) => {
        if (cell.count < 3) return
        try {
          const heat = L.circle([cell.lat, cell.lng], {
            radius: 280 + cell.count * 90,
            color: '#22c55e',
            weight: 0,
            fillColor: '#22c55e',
            fillOpacity: Math.min(0.14, 0.04 + cell.count * 0.012),
            opacity: 0,
            className: `gym-pulse-heat-halo${cell.count >= 6 ? ' gym-pulse-heat-halo--hot' : ''}`,
          }).addTo(map)
          ;(heat as any)._isHeatHalo = true
          markersRef.current.push(heat)
        } catch { /* ignore */ }
      })

      // Self marker (in-place update, not in markersRef) — upgraded iconic premium presence
      if (selfMapPos) {
        const isLive = !!selfIsLive;
        const isAmp = (typeof (window as any) !== 'undefined' && (window as any).__selfAmplified) || false; // lightweight signal from parent if needed; we also accept via future prop
        const liveClass = isLive ? ' live-self iconic-self' : ' iconic-self';
        const size = isLive ? 34 : 30;
        const borderC = isLive ? '#22c55e' : '#22c55e';
        const ring = isLive 
          ? `<div style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid #22c55e;opacity:0.35;animation:live-pulse-green 1.6s ease-in-out infinite;"></div><div style="position:absolute;inset:-11px;border-radius:9999px;border:1.5px solid #a855f7;opacity:0.18;animation:live-pulso-ring 2.6s ease-in-out infinite;"></div>`
          : `<div style="position:absolute;inset:-4px;border-radius:9999px;border:1.5px solid rgba(34,197,94,0.35);"></div>`;
        const ampAura = isAmp ? `<div class="self-pulso-stack" style="inset:-16px;border-color:#a855f7;opacity:0.28"></div>` : '';
        const liveBadgeSelf = isLive ? `<div style="position:absolute;top:-3px;right:-3px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#111;font-size:8px;font-weight:900;padding:1px 5px;border-radius:4px;line-height:10px;border:1px solid #111;box-shadow:0 0 0 1px rgba(0,0,0,0.6)">LIVE</div>` : '';
        const photo = selfMapPos.photo || '';
        const fallback = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;background:#22c55e;font-weight:700">TÚ</div>`;
        const selfIcon = L.divIcon({
          html: `<div class="self-iconic" style="position:relative;width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:3px solid ${borderC};box-shadow:0 0 0 3px rgba(0,0,0,0.65);">${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='${fallback}'" />` : fallback}</div>${ring}${liveBadgeSelf}${ampAura}</div>`,
          className: `self-marker${liveClass}`, iconSize: [size, size], iconAnchor: [size/2, size/2]
        })
        if (!selfMarkerRef.current) {
          selfMarkerRef.current = L.marker([selfMapPos.lat, selfMapPos.lng], { icon: selfIcon }).addTo(mapInstanceRef.current)
          selfMarkerRef.current.bindPopup('<strong>TÚ</strong><br/>' + BRAND_COPY.liveMap.selfPopupLocation + (isLive ? ' — <span style="color:#22c55e">🟢 EN VIVO</span>' : ''))
        } else {
          selfMarkerRef.current.setLatLng([selfMapPos.lat, selfMapPos.lng])
          selfMarkerRef.current.setIcon(selfIcon)
        }
        if (!areaCircleRef.current) {
          areaCircleRef.current = L.circle([selfMapPos.lat, selfMapPos.lng], {
            radius: isLive ? 12000 : 9000, color: '#22c55e', weight: isLive ? 1.5 : 0.8, fillColor: '#22c55e', fillOpacity: isLive ? 0.09 : 0.05, opacity: isLive ? 0.35 : 0.2,
            className: isLive ? 'self-area-pulse' : ''
          }).addTo(mapInstanceRef.current)
        } else {
          areaCircleRef.current.setLatLng([selfMapPos.lat, selfMapPos.lng])
          areaCircleRef.current.setStyle({ radius: isLive ? 12000 : 9000, weight: isLive ? 1.5 : 0.8, fillOpacity: isLive ? 0.09 : 0.05, opacity: isLive ? 0.35 : 0.2 })
        }
      } else if (selfMarkerRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}
        selfMarkerRef.current = null
        if (areaCircleRef.current) {
          try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}
          areaCircleRef.current = null
        }
      }

      // Fase 109/110 — live + cluster + partner markers (React popups, diffed pool)
      renderUsers.forEach((u: any) => {
        if (!hasMapCoords(u)) return

        if (u.isCluster) {
          const count = u.clusterCount || 2
          const size = count >= 10 ? 44 : count >= 5 ? 40 : 36
          const clusterHtml = MarkerHtml.buildIconicClusterMarkerHtml(count)
          const key = MarkerReg.markerPoolKey('cluster', u.clusterId ?? u.id)
          const icon = L.divIcon({
            html: clusterHtml,
            className: 'iconic-cluster',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
          upsertPooledMarker(key, u.lat, u.lng, icon, `c|${count}|${size}`, () => {
            setMapPopup({ kind: 'cluster', count, lat: u.lat, lng: u.lng, clusterId: u.clusterId })
          })
          return
        }

        const isBond = !!syncBonds[u.id]
        const hasPulso = (u.visibleLevel || 1) >= 20
        const isHigh = (u.visibleLevel || 1) >= 15 || u.isNetworkBond
        const size = hasPulso ? 36 : isHigh ? 32 : 28
        const iconHtml = MarkerHtml.buildIconicLiveMarkerHtml(u, { isBond, size })
        const key = MarkerReg.markerPoolKey('live', u.id)
        const icon = L.divIcon({
          html: iconHtml,
          className: 'iconic-live-marker',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
        upsertPooledMarker(key, u.lat, u.lng, icon, MarkerReg.liveMarkerSignature(u), () => {
          setMapPopup({ kind: 'live', user: u })
        })
      })

      if (showPartners) {
        partnerLocationsRef.current.forEach((partner: any) => {
          if (!partner.lat || !partner.lng) return
          const logo = partner.logoUrl || partner.logo || ''
          const liveAtGym = LocalNetwork.countLiveAtGym(allLive, partner.id)
          const size = 30
          const html = MarkerHtml.buildPartnerMarkerHtml({ logo, liveAtGym, size })
          const key = MarkerReg.markerPoolKey('partner', partner.id)
          const icon = L.divIcon({
            html,
            className: 'partner-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
          upsertPooledMarker(
            key,
            partner.lat,
            partner.lng,
            icon,
            MarkerReg.partnerMarkerSignature({ ...partner, liveAtGym }),
            () => {
              const checkedIn = allLive
                .filter((lu: any) => lu.gymCheckIn?.gymId === partner.id)
                .map((lu: any) => ({ id: lu.id, name: lu.name, photos: lu.photos }))
              setMapPopup({ kind: 'partner', partner, liveAtGym, checkedInUsers: checkedIn })
            },
            {
              draggable: !!isDeveloper,
              onDragEnd: isDeveloper
                ? () => {
                    const m = pool.get(key)
                    if (!m || !onPartnerMoved) return
                    const pos = m.getLatLng()
                    onPartnerMoved(partner.id, pos.lat, pos.lng)
                  }
                : undefined,
            }
          )
        })
      }

      MarkerReg.pruneMarkerPool(pool, activeKeys, (m) => {
        try { map.removeLayer(m) } catch { /* ignore */ }
      })

      // === Ritual Ripples (performance waves from completed EntrenaSync) ===
      // These are the "the community felt that" visual layer.
      (syncRipples || []).forEach((r: any) => {
        if (!r.lat || !r.lng) return
        try {
          const intensity = r.intensity || 1.6
          const rad = 420 * intensity
          const c = L.circle([r.lat, r.lng], {
            radius: rad,
            color: '#a855f7',
            weight: 2.2,
            fillColor: '#a855f7',
            fillOpacity: 0.09,
            opacity: 0.65,
            className: 'iconic-ripple sync-ripple'
          }).addTo(mapInstanceRef.current)
          ;(c as any)._isSyncRipple = true
          markersRef.current.push(c)

          // subtle second ring for stronger ripples
          if (intensity > 2) {
            const c2 = L.circle([r.lat, r.lng], {
              radius: rad * 1.35,
              color: '#c084fc',
              weight: 1.5,
              fillOpacity: 0,
              opacity: 0.4,
              className: 'iconic-ripple sync-ripple'
            }).addTo(mapInstanceRef.current)
            ;(c2 as any)._isSyncRipple = true
            markersRef.current.push(c2)
          }
        } catch {}
      })

      // === Active EntrenaSync tethers (live users linked via trainingSyncWith) ===
      syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
      syncLinesRef.current = []

      const drawnSyncPairs = new Set<string>()
      ;(liveTrainingNow || []).forEach((u: any) => {
        const partnerId = u.trainingSyncWith
        if (!partnerId || !hasMapCoords(u)) return
        const pairKey = [u.id, partnerId].sort().join('|')
        if (drawnSyncPairs.has(pairKey)) return
        const partner = (liveTrainingNow || []).find((x: any) => x.id === partnerId)
        if (!partner || !hasMapCoords(partner)) return
        drawnSyncPairs.add(pairKey)
        try {
          const inRed = !!(syncBonds[u.id] || syncBonds[partnerId])
          const bondLevel = Math.max(
            syncBonds[u.id]?.bondLevel || 0,
            syncBonds[partnerId]?.bondLevel || 0
          )
          const isStrong = inRed && (bondLevel >= 2 || (syncBonds[u.id]?.totalMin || 0) >= 20)
          const line = L.polyline(
            [[u.lat, u.lng], [partner.lat, partner.lng]],
            {
              color: isStrong ? '#FFD700' : '#22c55e',
              weight: isStrong ? 3.5 : 2.5,
              opacity: isStrong ? 0.8 : 0.6,
              dashArray: inRed ? undefined : '6 8',
              className: `sync-tether active-sync ${isStrong ? 'strong-tether' : ''}`
            }
          ).addTo(mapInstanceRef.current)
          const startedAt = u.syncStartedAt || partner.syncStartedAt
          const syncMins = syncElapsedMinutes(startedAt)
          const nameA = (u.name || 'Atleta').split(' ')[0]
          const nameB = (partner.name || 'Atleta').split(' ')[0]
          line.on('click', () => {
            setMapPopup({
              kind: 'sync',
              nameA,
              nameB,
              syncMins,
              inRed,
            })
          })
          syncLinesRef.current.push(line)
        } catch {}
      })

      // Legacy: bonds with stored partner coords (older persisted data)
      Object.entries(syncBonds || {}).forEach(([uid, bond]: [string, any]) => {
        if (!bond || !bond.partnerLat || !bond.partnerLng) return
        if (drawnSyncPairs.size > 0) {
          const u = (liveTrainingNow || []).find((x: any) => x.id === uid)
          if (u?.trainingSyncWith) return
        }
        const u = (liveTrainingNow || []).find((x: any) => x.id === uid)
        if (!u || !hasMapCoords(u)) return
        try {
          const isStrong = (bond.bondLevel || 0) >= 2 || (bond.totalMin || 0) >= 20
          const line = L.polyline(
            [[u.lat, u.lng], [bond.partnerLat, bond.partnerLng]],
            {
              color: isStrong ? '#FFD700' : '#f4c95f',
              weight: isStrong ? 3.5 : 2.2,
              opacity: isStrong ? 0.75 : 0.55,
              className: `sync-tether ${isStrong ? 'strong-tether' : ''}`
            }
          ).addTo(mapInstanceRef.current)
          syncLinesRef.current.push(line)
        } catch {}
      })

      // Echo pins (persistent highlights from legend syncs) - basic version
      ;(echoPins || []).forEach((pin: any) => {
        if (!pin.lat || !pin.lng) return
        try {
          const pinMarker = L.marker([pin.lat, pin.lng], {
            icon: L.divIcon({
              html: `<div style="width:18px;height:18px;border-radius:9999px;background:#FFD700;border:2px solid #111;box-shadow:0 0 0 3px rgba(234,179,8,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;">⭐</div>`,
              className: 'echo-pin',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            })
          }).addTo(mapInstanceRef.current)
          ;(pinMarker as any)._isEchoPin = true
          markersRef.current.push(pinMarker)
          pinMarker.bindPopup(`<div style="font-size:11px">Highlight de la red<br/><strong>${pin.label || 'Sync destacado'}</strong></div>`)
        } catch {}
      })

      // Initial / relevant fit — now always tries to include SELF (user) + current visible markers.
      // This fixes "el mapa no queda fijo / al hacer zoomout/zoomin se pierde".
      // Previously only fitted lives (markersRef) excluding self, and only once ever → view would drift or lose
      // the user's position + activity when zooming or on filter changes.
      const shouldFit = markersRef.current.length > 0 || !!selfMarkerRef.current || !!selfMapPos;

      if (shouldFit && !(mapInstanceRef.current as any)._hasDoneInitialFit) {
        try {
          const group = L.featureGroup(markersRef.current);
          let bounds = group.getBounds && group.getBounds().isValid() ? group.getBounds() : null;

          // Always extend with self so "TÚ" stays in the fitted view
          if (selfMarkerRef.current) {
            const s = selfMarkerRef.current.getLatLng();
            bounds = bounds ? bounds.extend(s) : L.latLngBounds(s, s);
          } else if (selfMapPos) {
            const s = [selfMapPos.lat, selfMapPos.lng] as [number, number];
            bounds = bounds ? bounds.extend(s) : L.latLngBounds(s, s);
          }

          if (bounds && bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds.pad(0.18));
            ;(mapInstanceRef.current as any)._hasDoneInitialFit = true;
          }
        } catch {}
      }
    }, updateDelay)

    // Return cleanup for this effect invocation.
    // IMPORTANT: only clean transient layers (lives, partners, ripples, tethers, echoes).
    // Do NOT remove selfMarkerRef / areaCircleRef here — they are long-lived for the map instance lifetime
    // and updated in-place. Removing them on every liveTrainingNow / filter change causes "map se pierde"
    // flicker and view instability during realtime + zoom.
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
      }
      markersRef.current = []
    }
  }, [
    showLiveMap, liveTrainingNow, liveCount, selfUserId, userLocation, mapNearOnly, selectedMapZone,
    showOnlyNetwork, showPartners, mapMyGymOnly, mapMyGymId, mapForceTick, syncRipples, partnerLocations,
    echoPins, syncBonds, selfIsLive, isDeveloper, isPlacingPartner, isQuickAddPartner,
    onShowProfile, onStartSync, onPartnerPositionSelected, onPartnerMoved, onPartnerDelete,
    onPartnerEdit, onForceTick, onRequestLocation, onAddPartnerAtCurrentCenter, onReloadPartners,
    onSpawnTestLives, onClearDevTestLives, devTestCount, onGymCheckIn, userGymId
  ])

  const handleExpandCluster = (lat: number, lng: number, clusterId?: number) => {
    logMapEvent('cluster_expand', { cluster_id: clusterId ?? 'unknown' })
    if (!mapInstanceRef.current) return
    const idx = lastClusterIndexRef.current
    try {
      if (idx && clusterId != null) {
        const z = idx.getClusterExpansionZoom(clusterId)
        mapInstanceRef.current.flyTo([lat, lng], Math.min(z + 1, 18), { duration: 0.65 })
      } else {
        mapInstanceRef.current.flyTo([lat, lng], Math.min(mapInstanceRef.current.getZoom() + 2, 16), { duration: 0.5 })
      }
    } catch {
      mapInstanceRef.current.setView([lat, lng], 15)
    }
  }

  const mapFilterOpts = {
    mapNearOnly,
    userLocation,
    selectedMapZone,
    showOnlyNetwork,
    mapMyGymId: mapMyGymOnly && mapMyGymId ? mapMyGymId : null,
    getDistanceKm,
  }
  const filteredLiveUsers = useMemo(
    () => filterMapLiveUsers(liveTrainingNow || [], mapFilterOpts),
    [liveTrainingNow, mapNearOnly, userLocation, selectedMapZone, showOnlyNetwork, mapMyGymOnly, mapMyGymId]
  )
  const totalLiveOnMap = typeof liveCount === 'number' ? liveCount : filteredLiveUsers.length
  const filteredLiveOnMap = filteredLiveUsers.length

  useEffect(() => {
    if (showLiveMap && !mapOpenLoggedRef.current) {
      mapOpenLoggedRef.current = true
      logMapEvent('map_open', { layout: layoutMode })
    }
  }, [showLiveMap, layoutMode])

  // City derby / challenge zone overlays (fase 200 + derby)
  useEffect(() => {
    if (!mapInstanceRef.current || !showLiveMap) return undefined
    const map = mapInstanceRef.current

    const clearDerbyLayers = () => {
      for (const layer of cityDerbyLayersRef.current) {
        try { map.removeLayer(layer) } catch { /* ignore */ }
      }
      cityDerbyLayersRef.current = []
    }

    if (cityChallengeLayerRef.current) {
      try { map.removeLayer(cityChallengeLayerRef.current) } catch { /* ignore */ }
      cityChallengeLayerRef.current = null
    }
    clearDerbyLayers()

    if (cityDerby) {
      const sides = [
        { team: 'home' as const, label: DERBY_HOME.label, norm: DERBY_HOME.norm, minutes: cityDerby.home.totalMinutes, base: '#22c55e' },
        { team: 'away' as const, label: DERBY_AWAY.label, norm: DERBY_AWAY.norm, minutes: cityDerby.away.totalMinutes, base: '#3b82f6' },
      ]
      for (const side of sides) {
        const zone = resolveDerbyMapZone(side.team)
        const winning = cityDerby.leaderNorm === side.norm
        const losing = cityDerby.leaderNorm && cityDerby.leaderNorm !== side.norm
        const col = winning ? side.base : losing ? '#ef4444' : side.base
        const layer = L.polygon(cityZonePolygonLatLngs(zone), {
          color: col,
          weight: winning ? 3 : 2,
          dashArray: winning ? undefined : '8 6',
          fillColor: col,
          fillOpacity: winning ? 0.14 : 0.06,
          opacity: 0.75,
          interactive: false,
        }).addTo(map)
        cityDerbyLayersRef.current.push(layer)
      }
      return () => {
        clearDerbyLayers()
      }
    }

    const zone = resolveCityZone(cityChallenge?.cityLabel)
    if (!zone) return undefined
    const col = ZONE_COLORS[zone.label] || ZONE_COLORS.default
    cityChallengeLayerRef.current = L.polygon(cityZonePolygonLatLngs(zone), {
      color: col,
      weight: 2,
      dashArray: '8 6',
      fillColor: col,
      fillOpacity: 0.09,
      opacity: 0.65,
      interactive: false,
    }).addTo(map)
    return () => {
      if (cityChallengeLayerRef.current && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(cityChallengeLayerRef.current) } catch { /* ignore */ }
        cityChallengeLayerRef.current = null
      }
      clearDerbyLayers()
    }
  }, [showLiveMap, cityChallenge, cityDerby, mapForceTick])

  const handleGymCheckInWithAnalytics = (gym: { id: string; name: string; lat: number; lng: number }) => {
    logMapEvent('partner_checkin', { gym_id: gym.id, gym_name: gym.name })
    onGymCheckIn?.(gym)
  }

  // Small local computation for the zone legend (self contained)
  const zoneLiveCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ;(liveTrainingNow || []).forEach((u: any) => {
      if (u.city && hasMapCoords(u) && u.trainingNow) {
        counts[u.city] = (counts[u.city] || 0) + 1
      }
    })
    return counts
  }, [liveTrainingNow])

  // Keep map crisp on container size changes (tab switch, keyboard, parent layout, orientation, form open/close).
  // Prevents "map se descuadra" / tiles misaligned / wrong center / black areas after any layout shift.
  // Observe the container as soon as it exists; the callback safely checks for mapInstance (which may be created slightly later).
  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.invalidateSize() } catch {}
        }
      })
      ro.observe(el)
    } catch (e) {
      // ResizeObserver not supported in this env (very old browser) - fallback to manual calls elsewhere
    }
    return () => { try { ro && ro.disconnect() } catch {} }
  }, [showLiveMap]) // re-attach when the map section mounts/unmounts

  // When strong filters change, reset the "initial fit done" flag so the next debounced update will
  // re-fitBounds to the *currently visible* lives + self. This makes the map feel "fijo" (anchored)
  // to what the user selected after they zoom or pan.
  const prevFiltersRef = useRef({ mapNearOnly, selectedMapZone, showOnlyNetwork })
  useEffect(() => {
    const prev = prevFiltersRef.current
    const changed = prev.mapNearOnly !== mapNearOnly ||
                    prev.selectedMapZone !== selectedMapZone ||
                    prev.showOnlyNetwork !== showOnlyNetwork
    if (changed && mapInstanceRef.current) {
      ;(mapInstanceRef.current as any)._hasDoneInitialFit = false
      // nudge the update so it re-computes + fits promptly
      if (onForceTick) onForceTick()
    }
    prevFiltersRef.current = { mapNearOnly, selectedMapZone, showOnlyNetwork }
  }, [mapNearOnly, selectedMapZone, showOnlyNetwork, onForceTick])

  const zoneColors: Record<string, string> = {
    'Viña del Mar': '#22c55e',
    'Santiago': '#FF671F',
    'Valparaíso': '#3b82f6',
    'Concon': '#a855f7',
    default: '#eab308'
  }

  const selfOnMap = resolveSelfMapPosition(userLocation, liveTrainingNow || [], selfUserId)
  const showGpsBanner = !selfOnMap && !gpsBannerDismissed

  return (
    <div
      className={`relative w-full gym-pulse-map-root ${isEmbedded ? 'gym-pulse-map-root--embedded' : ''} ${isFullHeight ? 'gym-pulse-map-root--fill' : ''}`}
      style={{ zIndex: 10 }}
    >
      {/* Status pill — fullscreen only (embedded uses shell + filters bar) */}
      {!isEmbedded && (
      <div
        className="map-floating-pulse absolute top-2 left-2 z-[2000] px-3 py-1 rounded-2xl text-[10px] font-semibold text-[#22c55e] flex items-center gap-2 shadow-lg border border-[#22c55e]/20 cursor-pointer active:scale-[0.985] transition"
        onClick={() => {
          try { /* haptic if available */ } catch {}
          const active = filterMapLiveUsers(liveTrainingNow || [], mapFilterOpts)
          if (active.length === 0) {
            const selfPos = resolveSelfMapPosition(userLocation, liveTrainingNow || [], selfUserId)
            if (selfIsLive && selfPos) {
              const handle = (ref as any)?.current
              if (handle?.flyTo) handle.flyTo(selfPos.lat, selfPos.lng, 15)
            }
            return
          }
          const hottest = active.reduce((best: any, u: any) => {
            const score = (u.joinCount || 0) + ((u.visibleLevel || 1) * 0.5) + (u.trainingSyncWith ? 5 : 0)
            const bestScore = (best.joinCount || 0) + ((best.visibleLevel || 1) * 0.5) + (best.trainingSyncWith ? 5 : 0)
            return score > bestScore ? u : best
          }, active[0])
          if (hottest) {
            const handle = (ref as any)?.current
            if (handle?.flyTo) {
              handle.flyTo(hottest.lat, hottest.lng, 14)
            } else if ((window as any).__gymPulseCentrar) {
              ;(window as any).__gymPulseCentrar()
            }
          }
        }}
        title={BRAND_COPY.liveMap.globalPillTitle}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
        {BRAND_COPY.liveMap.globalPill}
        <span className="text-[#22c55e]/70 font-mono text-[9px] tabular-nums">
          • {totalLiveOnMap} EN VIVO
        </span>
        {(() => {
          const activeSyncs = (liveTrainingNow || []).filter((u: any) => u.trainingSyncWith).length / 2
          return activeSyncs > 0 ? <span className="text-[#FFD700] font-bold text-[9px]">• {Math.floor(activeSyncs)} EN SYNC</span> : null
        })()}
      </div>
      )}

      {isEmbedded && totalLiveOnMap > 0 && (
        <div className="gym-pulse-map-embedded-badge">
          <span className="gym-pulse-map-embedded-badge__dot" />
          {totalLiveOnMap} en vivo
        </div>
      )}

      {/* The actual Leaflet container */}
      <div
        ref={mapContainerRef}
        className={`w-full overflow-hidden border border-[#22c55e]/25 bg-[#0a0a0c] shadow-[0_0_0_1px_rgba(34,197,94,0.12),0_10px_40px_-12px_rgba(0,0,0,0.7)] ${
          radarSweep ? 'gym-pulse-radar-sweep' : ''
        } ${
          isFullHeight
            ? 'gym-pulse-map-canvas gym-pulse-map-canvas--fs h-full min-h-0 flex-1 rounded-none border-0'
            : 'h-[min(420px,52vh)] min-h-[360px] rounded-2xl'
        }`}
        id="live-map-container"
      />

      {/* Radar + filtros — barra inferior */}
      <div className={`absolute left-2 right-2 z-[2000] flex flex-col gap-1.5 ${isEmbedded ? 'bottom-3' : 'bottom-2'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <GymPulseRadar
            liveUsers={liveTrainingNow || []}
            userLocation={userLocation}
            onSweepStart={() => setRadarSweep(true)}
            onSweepEnd={() => setRadarSweep(false)}
          />
        </div>
        <GymPulseMapFilters
          mapNearOnly={mapNearOnly}
          showOnlyNetwork={showOnlyNetwork}
          showPartners={showPartners}
          mapMyGymOnly={mapMyGymOnly}
          mapMyGymId={mapMyGymId}
          filteredCount={filteredLiveOnMap}
          totalCount={totalLiveOnMap}
          partnerCount={partnerLocations.length}
          onMapNearOnlyChange={onMapNearOnlyChange}
          onShowOnlyNetworkChange={onShowOnlyNetworkChange}
          onShowPartnersChange={onShowPartnersChange}
          onMapMyGymOnlyChange={onMapMyGymOnlyChange}
        />
      </div>

      {/* Centrar — esquina inferior derecha (no compite con ⛶ arriba) */}
      <button
        type="button"
        onClick={() => {
          try {
            const h = (ref as any)?.current
            if (h?.flyToSelf) h.flyToSelf()
            else if ((window as any).__gymPulseCentrar) (window as any).__gymPulseCentrar()
          } catch { /* ignore */ }
        }}
        className="gym-pulse-map-centrar-btn"
        aria-label="Centrar mapa"
      >
        <Crosshair size={14} />
      </button>

      {/* Zonas — solo fullscreen; en embebido van al panel de filtros en fase posterior */}
      {!isEmbedded && (
      <div className="absolute top-9 left-2 z-[2000] flex flex-col gap-1 max-h-[40%] overflow-y-auto">
        {['Viña del Mar', 'Santiago', 'Valparaíso', 'Concon'].map(city => {
          const col = zoneColors[city] || zoneColors.default
          const isActive = selectedMapZone === city
          const cnt = zoneLiveCounts[city] || 0
          return (
            <button
              key={city}
              onClick={() => onSelectedMapZoneChange && onSelectedMapZoneChange(isActive ? null : city)}
              className={`map-zone-pill flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium border transition-all active:scale-[0.96] ${isActive ? 'ring-1 ring-white/70 shadow-md scale-[1.02] active' : 'hover:scale-[1.03] opacity-90 hover:opacity-100'}`}
              style={{ 
                background: isActive ? `${col}22` : 'rgba(0,0,0,0.65)', 
                borderColor: isActive ? col : 'rgba(255,255,255,0.15)',
                color: col 
              }}
              title={cnt > 0 ? `${cnt} entrenando en ${city}` : `Sin live ahora en ${city}`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{background: col}} />
              <span className="font-semibold tracking-[-0.2px]">{city.split(' ')[0]}</span>
              {cnt > 0 && <span className={`ml-0.5 text-[8px] px-1 rounded bg-white/10 text-white/80 font-mono tabular-nums ${cnt >= 3 ? 'scale-110 font-bold text-white' : ''}`}>{cnt}</span>}
            </button>
          )
        })}

        {/* Mi zona quick filter */}
      </div>
      )}

      {/* Dev tools — colapsado por defecto */}
      {isDeveloper && (
        <div className="gym-pulse-dev-tools">
          <button
            type="button"
            className="gym-pulse-dev-tools__toggle"
            onClick={() => setDevToolsOpen((o) => !o)}
          >
            {devToolsOpen ? '✕' : 'DEV'}
          </button>
          {devToolsOpen && (
            <div className="gym-pulse-dev-tools__panel">
              <button type="button" onClick={() => onOpenAddPartner?.()} className="gym-pulse-dev-tools__btn">+ Partner</button>
              <button type="button" onClick={() => onOpenManagePartners?.()} className="gym-pulse-dev-tools__btn">Manage</button>
              <button type="button" onClick={() => onToggleQuickAdd?.(!isQuickAddPartner)} className="gym-pulse-dev-tools__btn">
                {isQuickAddPartner ? '✕ Rápido' : '+ Rápido'}
              </button>
              <button type="button" onClick={() => onReloadPartners?.()} className="gym-pulse-dev-tools__btn">↻</button>
              <button type="button" onClick={() => onSpawnTestLives?.(3)} className="gym-pulse-dev-tools__btn">🧪+3</button>
              {(devTestCount || 0) > 0 && (
                <button type="button" onClick={() => onClearDevTestLives?.()} className="gym-pulse-dev-tools__btn">🧹</button>
              )}
              <button type="button" onClick={() => onLogoutDeveloper?.()} className="gym-pulse-dev-tools__btn gym-pulse-dev-tools__btn--muted">
                Salir
              </button>
            </div>
          )}
        </div>
      )}

      {cityDerby && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[2100] max-w-[92%] w-full max-w-md">
          <div className="rounded-2xl bg-[#0D0D10]/94 border border-[#FF671F]/45 px-3 py-2 shadow-lg pointer-events-auto">
            <div className="text-[9px] uppercase tracking-wider text-[#FF671F] font-bold text-center">
              Derby · {DERBY_HOME.label} vs {DERBY_AWAY.label}
            </div>
            <div className="flex justify-between text-[10px] font-black mt-1 tabular-nums">
              <span className="text-[#22c55e]">{cityDerby.home.indexPer100k}</span>
              <span className="text-[#9CA3AF] text-[9px] font-semibold">índice/100k hab</span>
              <span className="text-[#60a5fa]">{cityDerby.away.indexPer100k}</span>
            </div>
            <div className="flex justify-between text-[8px] text-white/50 tabular-nums mt-0.5">
              <span>{cityDerby.home.totalMinutes} min</span>
              <span>esta semana</span>
              <span>{cityDerby.away.totalMinutes} min</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-black/50 mt-1">
              <div className="bg-[#22c55e]" style={{ width: `${cityDerby.homeBarPct}%` }} />
              <div className="bg-[#3b82f6]" style={{ width: `${cityDerby.awayBarPct}%` }} />
            </div>
            <p className="text-[9px] text-white/90 text-center mt-1">{derbyStatusLine(cityDerby)}</p>
            {onCityChallengeCta && (
              <button
                type="button"
                onClick={onCityChallengeCta}
                className="mt-2 w-full py-1.5 rounded-xl bg-[#FF671F] text-black text-[10px] font-black active:brightness-90"
              >
                {selfIsLive ? BRAND_COPY.liveMap.derbyCtaActive : BRAND_COPY.liveMap.derbyCta}
              </button>
            )}
          </div>
        </div>
      )}

      {!cityDerby && cityChallenge && cityChallenge.progressPct >= 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[2100] max-w-[92%]">
          <div className="rounded-2xl bg-[#0D0D10]/92 border border-[#FF671F]/35 px-3 py-2 text-center shadow-lg pointer-events-auto">
            <div className="text-[9px] uppercase tracking-wider text-[#FF671F] font-bold">
              Reto ciudad · {cityChallenge.cityLabel}
            </div>
            <div className="text-[10px] text-white font-semibold">
              {cityChallenge.currentMinutes}/{cityChallenge.targetMinutes} min ·{' '}
              {Math.round(cityChallenge.progressPct)}%
            </div>
            <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#FF671F] rounded-full"
                style={{ width: `${Math.min(100, cityChallenge.progressPct)}%` }}
              />
            </div>
            {onCityChallengeCta && (
              <button
                type="button"
                onClick={onCityChallengeCta}
                className="mt-2 w-full py-1.5 rounded-xl bg-[#FF671F] text-black text-[10px] font-black active:brightness-90"
              >
                {selfIsLive ? 'Sigue sumando minutos' : 'Entrenar en vivo → sumar al reto'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* GPS banner — map stays usable without location (fase 192) */}
      {showGpsBanner && (
        <div className="absolute top-12 left-2 right-2 z-[3500] pointer-events-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[#0D0D10]/95 border border-[#22c55e]/35 px-3 py-2 shadow-lg">
            <span className="text-[10px] text-[#9CA3AF] flex-1 leading-snug">
              Activa ubicación para distancias reales y tu pin en el mapa
            </span>
            <button
              type="button"
              onClick={() => onRequestLocation?.()}
              className="shrink-0 px-2.5 py-1 rounded-full bg-[#22c55e] text-black text-[10px] font-bold active:brightness-90"
            >
              Activar GPS
            </button>
            <button
              type="button"
              onClick={() => setGpsBannerDismissed(true)}
              className="shrink-0 text-[#666] text-xs px-1"
              aria-label="Cerrar aviso GPS"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <GymPulsePopupLayer
        popup={mapPopup}
        syncBonds={syncBonds}
        userGymId={userGymId}
        isDeveloper={isDeveloper}
        onClose={() => setMapPopup(null)}
        onShowProfile={(u) => onShowProfile?.(u)}
        onStartSync={(id, name) => {
          setMapPopup(null)
          onStartSync?.(id, name)
        }}
        onGymCheckIn={(gym) => {
          setMapPopup(null)
          handleGymCheckInWithAnalytics(gym)
        }}
        onPartnerEdit={(id) => onPartnerEdit?.(id)}
        onPartnerDelete={(id) => onPartnerDelete?.(id)}
        onExpandCluster={handleExpandCluster}
      />
    </div>
  )
})

GymPulseMap.displayName = 'GymPulseMap'

export { GymPulseMap }
export default GymPulseMap
