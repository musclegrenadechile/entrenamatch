// @ts-nocheck
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
 * - All the data (liveTrainingNow, partnerLocations, ritualRipples, etc.)
 * - Higher level state (showLiveMap, filters like mapNearOnly, selectedMapZone, showPartners, showOnlyLegends)
 * - Callbacks for user actions (show profile, start sync, partner placed by dev, force tick)
 * - The partner Firestore listener (can be moved here later)
 *
 * Next iterations can move even more (the partner listener, some filter state, the "Centrar" button logic).
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'

// Fix Leaflet icons (same as before)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

import { getDistanceKm } from '../../utils' // adjust if needed

export interface GymPulseMapProps {
  showLiveMap: boolean
  liveTrainingNow: any[]
  ritualRipples: any[]
  partnerLocations: any[]
  echoPins?: any[]
  userLocation: { lat: number; lng: number } | null
  mapNearOnly: boolean
  selectedMapZone: string | null
  showOnlyLegends?: boolean
  showPartners: boolean
  mapForceTick: number
  syncBonds: Record<string, any>
  isDeveloper?: boolean
  isPlacingPartner?: boolean
  isQuickAddPartner?: boolean
  selfIsLive?: boolean

  // Filter controls (moved inside for self-contained widget)
  onMapNearOnlyChange?: (v: boolean) => void
  onSelectedMapZoneChange?: (z: string | null) => void
  onShowOnlyLegendsChange?: (v: boolean) => void
  onShowPartnersChange?: (v: boolean) => void

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

const PARTNER_SEEDS = [ /* keep seeds here or import from constants if moved later */
  { id: 'gym1', name: 'Power Gym Reñaca', type: 'gym', lat: -32.95, lng: -71.55, logo: null, city: 'Viña del Mar' },
  { id: 'gym2', name: 'CrossFit Viña', type: 'crossfit', lat: -33.02, lng: -71.55, logo: null, city: 'Viña del Mar' },
  { id: 'gym3', name: 'Iron Temple Santiago', type: 'gym', lat: -33.45, lng: -70.67, logo: null, city: 'Santiago' },
]

const GymPulseMap = forwardRef<GymPulseMapHandle, GymPulseMapProps>((props, ref) => {
  const {
    showLiveMap,
    liveTrainingNow,
    ritualRipples,
    partnerLocations,
    echoPins = [],
    userLocation,
    mapNearOnly,
    selectedMapZone,
    showOnlyLegends = false,
    showPartners,
    mapForceTick,
    syncBonds,
    isDeveloper = false,
    isPlacingPartner = false,
    isQuickAddPartner = false,
    selfIsLive = false,

    // New internal control props
    onMapNearOnlyChange,
    onSelectedMapZoneChange,
    onShowOnlyLegendsChange,
    onShowPartnersChange,
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
  } = props

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const syncLinesRef = useRef<any[]>([])
  const selfMarkerRef = useRef<any>(null)
  const areaCircleRef = useRef<any>(null)
  const prevLiveCountRef = useRef(0)
  const prevLiveIdsRef = useRef<Set<string>>(new Set())
  const lastZoomTimeRef = useRef(0)
  const partnerLocationsRef = useRef<any[]>([])
  const mapUpdateTimeoutRef = useRef<any>(null)
  const isPlacingPartnerRef = useRef(false)
  const isQuickAddPartnerRef = useRef(false)
  const showAddPartnerFormRef = useRef(false)

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

  // Main map effect - the heart of GymPulse (moved from App.tsx monolith)
  useEffect(() => {
    if (!showLiveMap || !mapContainerRef.current) {
      // Aggressive cleanup when map should be hidden
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        markersRef.current = []
        if (selfMarkerRef.current) { try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}; selfMarkerRef.current = null }
        if (areaCircleRef.current) { try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}; areaCircleRef.current = null }
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
      return
    }

    // Request location the first time map opens (good UX)
    if (!userLocation && onRequestLocation) {
      onRequestLocation().catch(() => {})
    }

    // Initialize map if needed
    if (!mapInstanceRef.current) {
      const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [-33.0, -71.5]
      const initialZoom = userLocation ? 13 : 10
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(initialCenter, initialZoom)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapInstanceRef.current)

      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize() }, 50)

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
        mapInstanceRef.current.on('zoomend', () => {
          lastZoomTimeRef.current = Date.now()
          if (onForceTick) onForceTick()
        })
        ;(mapInstanceRef.current as any)._clusterZoomBound = true
      }
    } else {
      setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize() }, 50)
    }

    // Debounced heavy update (core of the living GymPulse)
    if (mapUpdateTimeoutRef.current) clearTimeout(mapUpdateTimeoutRef.current)
    const isRecentZoom = (Date.now() - lastZoomTimeRef.current) < 2000
    const updateDelay = isRecentZoom ? 60 : 280

    mapUpdateTimeoutRef.current = setTimeout(() => {
      if (!mapInstanceRef.current) return

      // Nuke previous markers (except self/area which we manage separately)
      markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
      markersRef.current = []

      let liveUsers = [...liveTrainingNow].filter(u => u.lat && u.lng && u.trainingNow)
      if (mapNearOnly && userLocation) liveUsers = liveUsers.filter(u => (u.distance || 999) < 10)
      if (selectedMapZone) liveUsers = liveUsers.filter(u => u.city === selectedMapZone)
      if (showOnlyLegends) liveUsers = liveUsers.filter(u => u.isLegend)

      // Heartbeats when live count increases
      const currentLive = liveUsers.length
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
        const isHigh = (newUser.visibleLevel || 1) >= 15 || newUser.isLegend
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
        const p = pulsoUsers[Math.floor(Math.random() * pulsoUsers.length)]
        try {
          const amb = L.circle([p.lat, p.lng], {
            radius: 180, color: '#a855f7', weight: 1.2, fillColor: '#a855f7', fillOpacity: 0.03, opacity: 0.25,
            className: 'pulso-maestro-ripple iconic-ripple ripple-pulso-master'
          }).addTo(mapInstanceRef.current)
          ;(amb as any)._isAmbientPulso = true
          markersRef.current.push(amb)
          setTimeout(() => { if (mapInstanceRef.current && (amb as any)._isAmbientPulso) try { mapInstanceRef.current.removeLayer(amb) } catch {} }, 1800)
        } catch {}
      }

      // Clustering at low zoom
      let renderUsers = liveUsers
      const currentZoom = mapInstanceRef.current.getZoom()
      if (currentZoom < 11.5 && liveUsers.length > 3) {
        const gridSize = 0.04
        const buckets: Record<string, any[]> = {}
        liveUsers.forEach(u => {
          const k = `${Math.floor(u.lat / gridSize)}:${Math.floor(u.lng / gridSize)}`
          if (!buckets[k]) buckets[k] = []
          buckets[k].push(u)
        })
        renderUsers = Object.values(buckets).map(g => {
          if (g.length <= 1) return g[0]
          const avgLat = g.reduce((s, u) => s + u.lat, 0) / g.length
          const avgLng = g.reduce((s, u) => s + u.lng, 0) / g.length
          const maxLvl = Math.max(0, ...g.map((u: any) => u.visibleLevel || 1))
          return { id: `cluster-${avgLat.toFixed(3)}-${avgLng.toFixed(3)}`, lat: avgLat, lng: avgLng, isCluster: true, clusterCount: g.length, clusterMembers: g, visibleLevel: maxLvl, city: g[0]?.city }
        })
      }

      // Self marker (in-place update, not in markersRef) — upgraded iconic premium presence
      if (userLocation) {
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
        const photo = userLocation.photo || '';
        const fallback = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;background:#22c55e;font-weight:700">TÚ</div>`;
        const selfIcon = L.divIcon({
          html: `<div class="self-iconic" style="position:relative;width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:3px solid ${borderC};box-shadow:0 0 0 3px rgba(0,0,0,0.65);">${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='${fallback}'" />` : fallback}</div>${ring}${liveBadgeSelf}${ampAura}</div>`,
          className: `self-marker${liveClass}`, iconSize: [size, size], iconAnchor: [size/2, size/2]
        })
        if (!selfMarkerRef.current) {
          selfMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: selfIcon }).addTo(mapInstanceRef.current)
          selfMarkerRef.current.bindPopup('<strong>TÚ</strong><br/>Tu ubicación actual (GPS) — el centro de tu GymPulse')
        } else {
          selfMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
          selfMarkerRef.current.setIcon(selfIcon)
        }
        if (!areaCircleRef.current) {
          areaCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
            radius: isLive ? 12000 : 9000, color: '#22c55e', weight: isLive ? 1.5 : 0.8, fillColor: '#22c55e', fillOpacity: isLive ? 0.09 : 0.05, opacity: isLive ? 0.35 : 0.2,
            className: isLive ? 'self-area-pulse' : ''
          }).addTo(mapInstanceRef.current)
        } else {
          areaCircleRef.current.setLatLng([userLocation.lat, userLocation.lng])
          areaCircleRef.current.setStyle({ radius: isLive ? 12000 : 9000, weight: isLive ? 1.5 : 0.8, fillOpacity: isLive ? 0.09 : 0.05, opacity: isLive ? 0.35 : 0.2 })
        }
      }

      // Live user markers + tethers + partner markers (simplified version of the original for extraction - full details can be expanded)
      // ... (the rest of the original marker creation for liveUsers, partners with logos, sync tethers, ritual ripples, echo pins, etc. would go here)
      // For this step we keep a functional core and note that the full rich version (with all the beautiful icons, popups, tethers, partner logos, legend gold, etc.) lives in the original until fully ported.

      // Enriched live markers for "Entrenando Ahora" (GymPulse) - makes the live status visually obvious
      // Uses data like seVaEnMin, joinCount, isLegend, visibleLevel from the parent liveTrainingNow computation.
      renderUsers.forEach((u: any) => {
        if (!u.lat || !u.lng) return
        const isBond = !!syncBonds[u.id]
        const isHigh = (u.visibleLevel || 1) >= 15 || u.isLegend
        const hasPulso = (u.visibleLevel || 1) >= 20
        const lvl = u.visibleLevel || 1
        const borderColor = isBond ? '#FFD700' : (hasPulso ? '#a855f7' : (isHigh ? '#eab308' : '#22c55e'))
        const size = hasPulso ? 36 : (isHigh ? 32 : 28)
        const ringExtra = hasPulso 
          ? `<div class="live-pulso-ring" style="inset:-11px;border-color:#a855f7;opacity:0.28"></div><div style="position:absolute;inset:-15px;border-radius:9999px;border:1px solid #a855f7;opacity:0.12;animation:live-pulso-ring 3.2s ease-in-out infinite;"></div>`
          : (isHigh ? `<div class="live-halo-ring" style="border-color:#eab308;opacity:0.38"></div>` : '')
        const bondHalo = isBond ? `<div style="position:absolute;inset:-7px;border-radius:9999px;border:2px solid #FFD700;opacity:0.35;animation:live-pulse-green 1.4s ease-in-out infinite;"></div>` : ''
        const liveBadge = `<div style="position:absolute;top:-3px;right:-3px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#111;font-size:7px;font-weight:900;padding:0 4px;border-radius:4px;line-height:9px;border:1px solid #111;box-shadow:0 0 0 1px rgba(0,0,0,.7)">LIVE</div>`
        const timeBadge = u.seVaEnMin != null ? `<div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);background:#0a0a0c;color:#22c55e;font-size:8px;padding:0 4px;border-radius:3px;border:1px solid #22c55e55;white-space:nowrap;font-weight:700">~${u.seVaEnMin}m</div>` : ''
        const lvlBadge = (isHigh || hasPulso) ? `<div style="position:absolute;bottom:-1px;right:2px;background:${hasPulso?'#a855f7':'#eab308'};color:#111;font-size:7px;font-weight:800;padding:0 2px;border-radius:2px;line-height:8px;opacity:0.95">${lvl}</div>` : ''
        const nameLabel = `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:rgba(10,10,12,0.85);color:#ddd;font-size:8px;padding:0 4px;border-radius:3px;white-space:nowrap;max-width:68px;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,0.1)">${(u.name||'').split(' ')[0]}</div>`
        const iconHtml = `
          <div class="iconic-live-marker" style="position:relative;width:${size}px;height:${size}px">
            ${nameLabel}
            <div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:2.5px solid ${borderColor};box-shadow:0 0 0 2px rgba(0,0,0,0.75);">
              <img src="${u.photos?.[0] || ''}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.background='#22c55e';this.innerHTML='<div style=\\'font-size:9px;color:white;display:flex;align-items:center;justify-content:center;height:100%;font-weight:700\\'>LIVE</div>'" />
            </div>
            ${ringExtra}
            ${bondHalo}
            ${liveBadge}
            ${timeBadge}
            ${lvlBadge}
            <div style="position:absolute;inset:-4px;border-radius:9999px;border:1.5px solid #22c55e;opacity:0.32;animation:live-pulse-green 1.9s ease-in-out infinite;"></div>
          </div>`
        try {
          const marker = L.marker([u.lat, u.lng], {
            icon: L.divIcon({ html: iconHtml, className: 'live-user-marker iconic-live-marker', iconSize: [size, size], iconAnchor: [size/2, size/2] })
          }).addTo(mapInstanceRef.current)

          const joinTxt = u.joinCount ? ` • ${u.joinCount} unidos` : ''
          const levelTxt = hasPulso ? ' • PULSO MAESTRO' : (isHigh ? ' • ALTO NIVEL' : '')
          marker.bindPopup(`
            <div style="min-width:178px;font-size:12px;line-height:1.35">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <strong>${u.name}</strong> ${isBond ? '<span style="color:#FFD700">⭐ RED</span>' : ''} 
                <span style="color:#22c55e;font-size:10px;font-weight:700">🟢 EN VIVO</span>
              </div>
              <span style="font-size:10px;color:#9CA3AF">${u.trainingTypes?.[0] || 'Entreno'} • ${(u.distance || 0).toFixed(1)}km${joinTxt}${levelTxt}</span><br/>
              ${u.seVaEnMin != null ? `<span style="font-size:10px;color:#f59e0b">⏱ Se va en ~${u.seVaEnMin} min — ¡únete ya!</span><br/>` : ''}
              <button style="margin-top:6px;background:linear-gradient(90deg,#22c55e,#16a34a);color:black;border:none;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;box-shadow:0 1px 4px rgba(34,197,94,0.4)" onclick="window.startSyncFromMap && window.startSyncFromMap('${u.id}', '${(u.name||'').replace(/'/g,'')}')">🔥 Entrenar juntos / Sync</button>
            </div>
          `)

          marker.on('click', () => onShowProfile && onShowProfile(u))
          markersRef.current.push(marker)
        } catch (e) {}
      })

      // Partner markers (logos if present). Premium hub look + dev tools.
      if (showPartners) {
        partnerLocationsRef.current.forEach((p: any) => {
          if (!p.lat || !p.lng) return
          const logo = p.logoUrl || p.logo || ''
          const isHub = (p.hubStrength || 0) > 1 || (p.type === 'gym')
          const size = isHub ? 36 : 30
          const gold = isHub ? '#FFD700' : '#f4c95f'
          const aura = isHub ? `<div class="partner-hub-aura" style="position:absolute;inset:-7px;border-radius:9999px;border:2px solid ${gold};opacity:0.18;animation:partner-aura-breathe 4.2s ease-in-out infinite"></div>` : ''
          const hubLabel = isHub ? `<div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);background:#111;color:${gold};font-size:7px;padding:0 3px;border-radius:2px;font-weight:700;border:1px solid ${gold}33">HUB</div>` : ''
          const html = logo
            ? `<div style="position:relative;width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:2.5px solid ${gold};box-shadow:0 0 0 2px rgba(0,0,0,0.6), 0 0 10px ${gold}33;"> <img src="${logo}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<div style=\\'width:${size}px;height:${size}px;background:#1a1a1f;border:2.5px solid ${gold};border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:13px;color:${gold}\\'>🏋️</div>'" /> </div>${aura}${hubLabel}</div>`
            : `<div style="position:relative;width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;background:#1a1a1f;border:2.5px solid ${gold};border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:14px;color:${gold};box-shadow:0 0 0 2px rgba(0,0,0,0.6)">🏋️</div>${aura}${hubLabel}</div>`

          try {
            const pm = L.marker([p.lat, p.lng], {
              icon: L.divIcon({ html, className: `partner-marker ${isHub ? 'partner-hub-strong' : ''}`, iconSize: [size, size], iconAnchor: [size/2, size/2] }),
              draggable: !!isDeveloper,
              title: isDeveloper ? 'DEV: drag to move, tap for actions' : p.name
            }).addTo(mapInstanceRef.current)

            let popupContent = `<strong style="font-size:13px">${p.name}</strong><br/><span style="font-size:10px;color:#9CA3AF">${p.type || 'Partner'} • ${p.address || p.city || ''}</span>`
            if (isHub) popupContent += `<div style="font-size:9px;color:#FFD700;margin-top:1px">⭐ Hub del GymPulse</div>`
            if (isDeveloper) {
              popupContent += `<br/><small style="color:#FFD700">DEV MODE</small><br/>`
              popupContent += `<button onclick="window.devEditPartner && window.devEditPartner('${p.id}')" style="font-size:10px;margin-right:4px;background:#222;color:#FFD700;border:1px solid #FFD70044;padding:1px 5px;border-radius:3px">✏️ Edit</button>`
              popupContent += `<button onclick="window.devDeletePartner && window.devDeletePartner('${p.id}')" style="font-size:10px;color:#f55;background:#2a1515;border:1px solid #f55444;padding:1px 5px;border-radius:3px">🗑️ Borrar</button>`
            }
            pm.bindPopup(popupContent)

            if (isDeveloper) {
              pm.on('dragend', () => {
                const pos = pm.getLatLng()
                if (onPartnerMoved) onPartnerMoved(p.id, pos.lat, pos.lng)
                try { /* haptic */ } catch {}
              })
            }

            markersRef.current.push(pm)
          } catch {}
        })
      }

      // === Ritual Ripples (performance waves from completed EntrenaSync) ===
      // These are the "the community felt that" visual layer.
      (ritualRipples || []).forEach((r: any) => {
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
            className: 'iconic-ripple ritual-ripple'
          }).addTo(mapInstanceRef.current)
          ;(c as any)._isRitualRipple = true
          markersRef.current.push(c)

          // subtle second ring for stronger ripples
          if (intensity > 2) {
            const c2 = L.circle([r.lat, r.lng], {
              radius: rad * 1.35,
              color: '#c084fc',
              weight: 1.5,
              fillOpacity: 0,
              opacity: 0.4,
              className: 'iconic-ripple ritual-ripple'
            }).addTo(mapInstanceRef.current)
            ;(c2 as any)._isRitualRipple = true
            markersRef.current.push(c2)
          }
        } catch {}
      })

      // === Sync Tethers (visual connection between people currently in EntrenaSync) ===
      // Golden lines showing who is bonded right now (high signal social graph on the map).
      syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
      syncLinesRef.current = []

      Object.entries(syncBonds || {}).forEach(([uid, bond]: [string, any]) => {
        if (!bond || !bond.partnerLat || !bond.partnerLng) return
        const u = (liveTrainingNow || []).find((x: any) => x.id === uid)
        if (!u || !u.lat || !u.lng) return
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
          pinMarker.bindPopup(`<div style="font-size:11px">Highlight de la red<br/><strong>${pin.label || 'Sync legendario'}</strong></div>`)
        } catch {}
      })

      // Initial fit (once)
      if (markersRef.current.length > 0 && !(mapInstanceRef.current as any)._hasDoneInitialFit) {
        try {
          const group = L.featureGroup(markersRef.current)
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15))
          ;(mapInstanceRef.current as any)._hasDoneInitialFit = true
        } catch {}
      }
    }, updateDelay)

    // Return cleanup for this effect invocation
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(m => { try { mapInstanceRef.current.removeLayer(m) } catch {} })
        syncLinesRef.current.forEach(l => { try { mapInstanceRef.current.removeLayer(l) } catch {} })
        syncLinesRef.current = []
        if (selfMarkerRef.current) { try { mapInstanceRef.current.removeLayer(selfMarkerRef.current) } catch {}; selfMarkerRef.current = null }
        if (areaCircleRef.current) { try { mapInstanceRef.current.removeLayer(areaCircleRef.current) } catch {}; areaCircleRef.current = null }
      }
      markersRef.current = []
    }
  }, [
    showLiveMap, liveTrainingNow, userLocation, mapNearOnly, selectedMapZone,
    ritualRipples, echoPins, showPartners, mapForceTick, partnerLocations.length,
    showOnlyLegends, syncBonds, isDeveloper, selfIsLive, onShowProfile, onStartSync, onPartnerPositionSelected, onPartnerMoved, onPartnerDelete, onPartnerEdit, onForceTick, onRequestLocation, isQuickAddPartner,
    onAddPartnerAtCurrentCenter, onReloadPartners, onSpawnTestLives, onClearDevTestLives, devTestCount
  ])

  // Global window helpers for popups (quick bridge until we use React portals or better event system)
  // Also dev helpers for partner management from map popups
  useEffect(() => {
    ;(window as any).startSyncFromMap = (id: string, name: string) => {
      onStartSync && onStartSync(id, name)
    }
    ;(window as any).witnessEchoPin = (id: string) => {
      // TODO: wire to parent witness modal
      console.log('witness echo', id)
    }
    ;(window as any).devDeletePartner = (id: string) => {
      if (onPartnerDelete) onPartnerDelete(id)
    }
    ;(window as any).devEditPartner = (id: string) => {
      if (onPartnerEdit) onPartnerEdit(id)
    }
    // Extra dev tools exposed for console / quick calls
    ;(window as any).devAddAtCenter = () => onAddPartnerAtCurrentCenter && onAddPartnerAtCurrentCenter()
    ;(window as any).devReloadPartners = () => onReloadPartners && onReloadPartners()
    ;(window as any).devSpawnTestLives = (n = 3) => onSpawnTestLives && onSpawnTestLives(n)
    ;(window as any).devClearTestLives = () => onClearDevTestLives && onClearDevTestLives()
    return () => {
      delete (window as any).startSyncFromMap
      delete (window as any).witnessEchoPin
      delete (window as any).devDeletePartner
      delete (window as any).devEditPartner
      delete (window as any).devAddAtCenter
      delete (window as any).devReloadPartners
      delete (window as any).devSpawnTestLives
      delete (window as any).devClearTestLives
    }
  }, [onStartSync, onPartnerDelete, onPartnerEdit, onAddPartnerAtCurrentCenter, onReloadPartners, onSpawnTestLives, onClearDevTestLives])

  // Small local computation for the zone legend (self contained)
  const zoneLiveCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ;(liveTrainingNow || []).forEach((u: any) => {
      if (u.city && u.lat && u.lng && u.trainingNow) {
        counts[u.city] = (counts[u.city] || 0) + 1
      }
    })
    return counts
  }, [liveTrainingNow])

  const zoneColors: Record<string, string> = {
    'Viña del Mar': '#22c55e',
    'Santiago': '#FF671F',
    'Valparaíso': '#3b82f6',
    'Concon': '#a855f7',
    default: '#eab308'
  }

  return (
    <div className="relative w-full" style={{ zIndex: 1 }}>
      {/* Floating "El Pulso está vivo" header — now owned by the component */}
      <div
        className="map-floating-pulse absolute top-2 left-2 z-40 px-3 py-1 rounded-2xl text-[10px] font-semibold text-[#22c55e] flex items-center gap-2 shadow-lg border border-[#22c55e]/20 cursor-pointer active:scale-[0.985] transition"
        onClick={() => {
          try { /* haptic if available */ } catch {}
          const active = (liveTrainingNow || []).filter((u: any) => u.lat && u.lng && u.trainingNow)
          if (active.length === 0) return
          const hottest = active.reduce((best: any, u: any) => {
            const score = (u.joinCount || 0) + ((u.visibleLevel || 1) * 0.5) + (u.trainingSyncWith ? 5 : 0)
            const bestScore = (best.joinCount || 0) + ((best.visibleLevel || 1) * 0.5) + (best.trainingSyncWith ? 5 : 0)
            return score > bestScore ? u : best
          }, active[0])
          if (hottest) {
            // use our own flyTo
            ;(ref as any)?.current?.flyTo?.(hottest.lat, hottest.lng, 14) || (window as any).__gymPulseCentrar?.()
          }
        }}
        title="Click para volar al punto más caliente del GymPulse"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
        EL GYMPULSE GLOBAL
        <span className="text-[#22c55e]/70 font-mono text-[9px] tabular-nums">
          • {(liveTrainingNow || []).filter((u: any) => u.lat && u.lng && u.trainingNow).length} EN VIVO
        </span>
        {(() => {
          const activeSyncs = (liveTrainingNow || []).filter((u: any) => u.trainingSyncWith).length / 2
          return activeSyncs > 0 ? <span className="text-[#FFD700] font-bold text-[9px]">• {Math.floor(activeSyncs)} EN SYNC</span> : null
        })()}
      </div>

      {/* The actual Leaflet container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[340px] rounded-2xl overflow-hidden border border-[#22c55e]/25 bg-[#0a0a0c] shadow-[0_0_0_1px_rgba(34,197,94,0.12),0_10px_40px_-12px_rgba(0,0,0,0.7)]"
        id="live-map-container"
      />

      {/* Bottom-right filter cluster (self-contained) */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 z-30">
        <div className="text-[8px] bg-black/75 text-[#22c55e] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          🟢 {(liveTrainingNow || []).filter((u: any) => u.lat && u.lng && u.trainingNow && (!mapNearOnly || (userLocation && ((u.distance||999)<10))) && (!selectedMapZone || u.city === selectedMapZone) && (!showOnlyLegends || u.isLegend)).length} en vivo
          {showPartners && partnerLocations.length > 0 && <span className="ml-1 text-[7px] bg-[#FF671F] text-black px-1 rounded font-bold">{partnerLocations.length} PARTNERS</span>}
          {isDeveloper && <span className="ml-1 text-[7px] bg-[#FFD700] text-black px-1 rounded font-extrabold cursor-pointer active:opacity-70" onClick={onLogoutDeveloper} title="Tap to logout dev mode">DEV ON</span>}
        </div>

        <button
          onClick={() => onMapNearOnlyChange && onMapNearOnlyChange(!mapNearOnly)}
          className={`text-[8px] px-2 py-0.5 rounded-full border transition ${mapNearOnly ? 'bg-[#3b82f6] text-white border-[#3b82f6]' : 'bg-black/70 text-[#3b82f6] border-[#3b82f6]/40 hover:bg-[#3b82f6]/10'}`}
        >
          {mapNearOnly ? '✓ Cerca de mí (10km)' : 'Solo cerca de mí'}
        </button>

        <button
          onClick={() => onShowOnlyLegendsChange && onShowOnlyLegendsChange(!showOnlyLegends)}
          className={`text-[8px] px-2 py-0.5 rounded-full border transition ${showOnlyLegends ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black/70 text-[#FFD700] border-[#FFD700]/40 hover:bg-[#FFD700]/10'}`}
        >
          {showOnlyLegends ? '✓ Mi Red (Network Power)' : 'Solo Mi Red de Alto Rendimiento'}
        </button>

        <button
          onClick={() => onShowPartnersChange && onShowPartnersChange(!showPartners)}
          className={`text-[8px] px-2 py-0.5 rounded-full border transition ${showPartners ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'bg-black/70 text-[#FF671F] border-[#FF671F]/40 hover:bg-[#FF671F]/10'}`}
        >
          {showPartners ? '✓ Partners (mapa)' : 'Mostrar Partners'}
        </button>
      </div>

      {/* Top-left interactive zone legend */}
      <div className="absolute top-2 left-2 z-30 flex flex-col gap-1">
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
        {/* Note: "currentUser city" is not passed; parent can still drive selectedMapZone */}
      </div>

      {/* Centrar button (uses our imperative handle) */}
      <button
        onClick={() => {
          try {
            if ((ref as any).current?.flyToSelf) {
              (ref as any).current.flyToSelf()
            } else if (onRegisterCentrar) {
              // fallback registered from parent
            }
          } catch {}
        }}
        className="absolute top-2 right-2 text-[9px] px-2.5 py-0.5 rounded-full bg-black/70 hover:bg-black text-[#22c55e] border border-[#22c55e]/40 active:bg-[#22c55e] active:text-black transition z-30"
      >
        Centrar
      </button>

      {/* Dev quick actions (inside the map widget) */}
      {isDeveloper && (
        <>
          <button
            onClick={() => onOpenAddPartner && onOpenAddPartner()}
            className="absolute top-2 right-20 text-[8px] px-2 py-0.5 rounded-full bg-[#FFD700] text-black font-bold border border-[#FFD700] active:scale-95 z-30"
            title="Agregar local partner con logo (solo devs)"
          >
            + Partner
          </button>
          <button
            onClick={() => onOpenManagePartners && onOpenManagePartners()}
            className="absolute top-2 right-36 text-[8px] px-2 py-0.5 rounded-full bg-[#FFD700]/80 text-black font-bold border border-[#FFD700] active:scale-95 z-30"
            title="Gestionar partners existentes"
          >
            Manage
          </button>
          <button
            onClick={() => onToggleQuickAdd && onToggleQuickAdd(!isQuickAddPartner)}
            className={`absolute top-2 right-[170px] text-[8px] px-2 py-0.5 rounded-full font-bold border active:scale-95 z-30 ${isQuickAddPartner ? 'bg-red-500 text-white border-red-500' : 'bg-[#FFD700]/70 text-black border-[#FFD700]'}`}
            title="Modo agregar rápido: click en mapa crea tienda mínima"
          >
            {isQuickAddPartner ? '✕ Add rápido' : '+ Add rápido'}
          </button>
          <button
            onClick={() => onAddPartnerAtCurrentCenter && onAddPartnerAtCurrentCenter()}
            className="absolute top-2 right-[260px] text-[8px] px-2 py-0.5 rounded-full bg-[#FFD700]/60 text-black font-bold border border-[#FFD700] active:scale-95 z-30"
            title="Agregar partner directamente en el centro actual del mapa (rápido para devs)"
          >
            +@centro
          </button>
          <button
            onClick={() => onReloadPartners && onReloadPartners()}
            className="absolute top-9 right-2 text-[8px] px-2 py-0.5 rounded-full bg-black/70 text-[#22c55e] border border-[#22c55e]/40 active:bg-[#22c55e] active:text-black z-30"
            title="Forzar refresh de partners y mapa"
          >
            ↻ Reload
          </button>
          <button
            onClick={() => onSpawnTestLives && onSpawnTestLives(3)}
            className="absolute top-9 right-16 text-[8px] px-2 py-0.5 rounded-full bg-purple-600/80 text-white font-bold border border-purple-400 active:scale-95 z-30"
            title="Spawnea 3 vidas de test cerca de ti (solo visibles en este mapa para probar GymPulse sin otras cuentas)"
          >
            🧪 +3 lives
          </button>
          {isDeveloper && (devTestCount || 0) > 0 && (
            <button
              onClick={() => onClearDevTestLives && onClearDevTestLives()}
              className="absolute top-9 right-28 text-[8px] px-2 py-0.5 rounded-full bg-red-900/70 text-red-200 border border-red-500/50 active:bg-red-800 z-30"
              title="Quitar las vidas de test"
            >
              🧹 clear tests
            </button>
          )}
        </>
      )}

      {/* GPS prompt overlay */}
      {!userLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-center p-5 rounded-2xl text-xs z-40">
          <div>
            <div className="mb-1">📍 Ubicación real desactivada</div>
            <button 
              onClick={() => onRequestLocation && onRequestLocation()}
              className="px-3 py-1 rounded-full bg-[#22c55e] text-black text-[10px] font-semibold active:brightness-90"
            >
              Activar GPS para ver distancias + tú en el mapa
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

GymPulseMap.displayName = 'GymPulseMap'

export { GymPulseMap }
export default GymPulseMap
