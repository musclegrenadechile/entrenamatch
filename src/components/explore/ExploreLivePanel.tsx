// @ts-nocheck — P1 extract from App.tsx; tighten types incrementally
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GymPulseMap, GymPulseMapShell, GymPulseBottomSheet } from '../map'
import { GymPulseTour, hasSeenGymPulseTour } from '../map/GymPulseTour'

const MAP_FULLSCREEN_KEY = 'entrenamatch_map_fullscreen'

/** Props mirror App scope used by explore live banner + map block */
export type ExploreLivePanelProps = Record<string, unknown>

export function ExploreLivePanel(props: ExploreLivePanelProps) {
  const {
    liveCountForUI,
    liveTrainingNow,
    syncBonds,
    dailyPulse,
    activeSyncCount,
    currentUser,
    userLocation,
    joiningSyncWith,
    setShowFullProfile,
    handleSwipe,
    setShowLiveMap,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    showLiveMap,
    networkStats,
    gymPulseMapRef,
    mapLiveTrainingNow,
    effectiveUserId,
    syncRipples,
    partnerLocations,
    echoPins,
    mapNearOnly,
    selectedMapZone,
    showOnlyNetwork,
    showPartners,
    mapMyGymOnly,
    mapMyGymId,
    mapForceTick,
    isDeveloper,
    isPlacingPartner,
    isQuickAddPartner,
    setMapNearOnly,
    setSelectedMapZone,
    setShowOnlyNetwork,
    setShowPartners,
    setMapForceTick,
    setMapMyGymOnly,
    openAddPartner,
    openManagePartners,
    setIsQuickAddPartner,
    logoutDeveloper,
    addPartnerAtCurrentCenter,
    reloadPartners,
    spawnDevTestLives,
    clearDevTestLives,
    startSyncWith,
    witnessEchoPin,
    witnessRipple,
    handleGymCheckIn,
    isQuickAddPartnerRef,
    isDemoMode,
    db,
    setPartnerLocations,
    startEditPartner,
    setPartnerFormLat,
    setPartnerFormLng,
    setIsPlacingPartner,
    devTestLives,
    toast,
    partnerFormLat,
    partnerFormLng,
    handlePartnerEditFromMap,
    cancelPartnerForm,
    partnerFormName,
    partnerFormType,
    partnerFormAddress,
    setPartnerFormName,
    setPartnerFormType,
    setPartnerFormAddress,
    showAddPartnerForm,
    editingPartnerId,
    setEditingPartnerId,
    setShowAddPartnerForm,
    partnerLocationsRef,
    requestUserLocation,
    showDevLogin,
    setShowDevLogin,
    devPassword,
    setDevPassword,
    loginAsDeveloper,
    showManagePartners,
    setShowManagePartners,
    partnerLogoPreview,
    partnerLogoFile,
    setPartnerLogoFile,
    setPartnerLogoPreview,
    handlePartnerLogoSelect,
    CapacitorCamera,
    uploadPartnerLogoIfNeeded,
  } = props

  const [showGymPulseTour, setShowGymPulseTour] = useState(false)
  const [mapFullscreen, setMapFullscreen] = useState(() => {
    try {
      return localStorage.getItem(MAP_FULLSCREEN_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(MAP_FULLSCREEN_KEY, mapFullscreen ? '1' : '0')
    } catch { /* ignore */ }
    if (mapFullscreen) {
      document.body.classList.add('gym-pulse-fs-active')
    } else {
      document.body.classList.remove('gym-pulse-fs-active')
    }
    return () => document.body.classList.remove('gym-pulse-fs-active')
  }, [mapFullscreen])

  useEffect(() => {
    if (mapFullscreen && gymPulseMapRef?.current?.invalidateSize) {
      setTimeout(() => {
        try { gymPulseMapRef.current.invalidateSize() } catch { /* ignore */ }
      }, 120)
    }
  }, [mapFullscreen, gymPulseMapRef])

  useEffect(() => {
    if (showLiveMap && !hasSeenGymPulseTour()) {
      const t = window.setTimeout(() => setShowGymPulseTour(true), 400)
      return () => window.clearTimeout(t)
    }
    if (!showLiveMap) setShowGymPulseTour(false)
  }, [showLiveMap])

  return (
    <div className="px-4 py-2.5 bg-gradient-to-r from-[#0D0D10] via-[#0a2a1a] to-[#0D0D10] border-b border-[#22c55e]/40 relative overflow-hidden live-banner-glow transition-all duration-300" style={{boxShadow: '0 1px 0 rgba(34,197,94,0.1)'}}>
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_0.5px,transparent_1px)] bg-[length:4px_4px] opacity-10 pointer-events-none"></div>
      <div className="flex items-center gap-2 mb-1.5 relative z-10">
        <div className="live-pill green !px-2.5 !py-0.5 text-[9px]">🟢 EN VIVO AHORA</div>
        <div className="text-sm font-semibold tracking-[-0.1px]">{liveCountForUI} entrenando cerca de ti {liveTrainingNow.some(u => u.seVaEnMin > 0) ? '· ¡se va pronto!' : ''} {liveCountForUI > 5 ? '· 🔥 HOT ZONE!' : ''} {liveTrainingNow.reduce((s,u)=>s+(u.joinCount||0),0) > 0 ? `· +${liveTrainingNow.reduce((s,u)=>s+(u.joinCount||0),0)} unidos hoy` : ''}{activeSyncCount > 0 ? ` · 🔄 ${activeSyncCount} pares sincronizados ahora (único)` : ''}</div>
        {dailyPulse && (dailyPulse.trainingStreak > 0 || dailyPulse.synergyStreak > 0) && (
          <div className="text-[10px] mt-1 text-[#22c55e] font-medium flex items-center gap-1">
            🔥 Tu streak: {dailyPulse.trainingStreak}d train + {dailyPulse.synergyStreak}d synergy • Nivel {dailyPulse.level}
          </div>
        )}
      </div>
      {liveTrainingNow.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...liveTrainingNow].sort((a,b)=> {
            const aInNet = !!syncBonds[a.id] ? -1 : 0;
            const bInNet = !!syncBonds[b.id] ? -1 : 0;
            if (aInNet !== bInNet) return aInNet - bInNet;
            return (a.distance||0)-(b.distance||0);
          }).slice(0, 4).map((user, idx) => (
            <motion.div key={user.id} onClick={() => setShowFullProfile(user)} className={`min-w-[130px] card card-glass p-2 text-[10px] cursor-pointer border active:scale-95 relative overflow-hidden shadow-lg shadow-[#22c55e]/10 ${ (user.joinCount||0) >= 3 ? 'border-[#FF671F]/60 shadow-[0_0_0_1px_#FF671F] animate-[pulse_2s_ease-in-out_infinite]' : 'border-[#22c55e]/70' }`} whileHover={{ scale: 1.04, y: -2, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(34 197 94 / 0.2)' }} whileTap={{ scale: 0.96 }} initial={{ opacity: 0.85, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1">
                  {user.photos && user.photos[0] && <img src={user.photos[0]} className="w-5 h-5 rounded-full object-cover border-2 border-[#22c55e]/60 ring-1 ring-[#22c55e]/20" />}
                  <div className="font-semibold truncate text-white drop-shadow-sm">{user.name}</div>
                  {!!syncBonds[user.id] && <span className="text-[6px] bg-[#FFD700] text-black px-0.5 rounded font-bold">RED</span>}
                </div>
                <div className="w-3 h-3 bg-[#22c55e] rounded-full flex-shrink-0 ring-2 ring-[#22c55e]/40" style={{animation: user.seVaEnMin < 10 ? 'live-pulse-green-urgent 1.1s ease-in-out infinite' : 'live-pulse-green 2.0s ease-in-out infinite'}}></div>
              </div>
              <div className="text-[#9CA3AF] text-[9px] mb-0.5 flex items-center gap-1">{userLocation && user.distance < 900 ? `${user.distance.toFixed(1)}km` : '— km'} <span className="text-[#22c55e]/70">·</span> {user.trainingTypes?.[0] || 'Entreno'}</div>
              <div className="flex items-center gap-1 text-[#22c55e] text-[9px] mb-1">
                <span>En vivo hace {Math.floor((Date.now() - (user.trainingNowSince || 0))/60000)}m</span>
                {user.seVaEnMin > 0 && <span className={`text-orange-400 ${user.seVaEnMin < 20 ? 'font-bold text-red-400 animate-pulse' : ''}`}>{user.seVaEnMin < 15 ? '· se va pronto' : '· se va en'} {user.seVaEnMin}m {user.seVaEnMin < 10 ? '¡ya!' : ''}</span>}
              </div>
              {user.seVaEnMin > 0 && (
                <div className="h-1 bg-[#22c55e]/20 rounded mt-0.5 mb-1">
                  <div className="h-1 bg-[#22c55e] rounded" style={{width: `${Math.max(5, Math.min(100, (90 - user.seVaEnMin)/90 * 100))}%`}}></div>
                </div>
              )}
              {user.joinCount > 0 && (
                <div className="text-[8px] text-[#22c55e] mb-1 font-medium flex items-center gap-0.5">+{user.joinCount} se unieron 🔥</div>
              )}
              {(user.liveStreak || user.joinedLiveStreak) && (
                <div className="text-[8px] text-[#22c55e] mb-1">🔥{(user.liveStreak||0)}h +{(user.joinedLiveStreak||0)}j streak</div>
              )}
              {user.trainingSyncWith && <div className="text-[7px] text-[#22c55e] mb-1">🔄 En Sync ahora</div>}
              {user.syncStreak && <div className="text-[7px] text-[#22c55e] mb-1">🔄 SyncStreak {user.syncStreak}d</div>}
              <button 
                disabled={joiningSyncWith === user.id}
                data-gympulse-tour={idx === 0 ? 'sync' : undefined}
                onClick={(e) => {
                  e.stopPropagation()
                  try { triggerHaptic('medium') } catch {}
                  startSyncWith(user.id, user.name)
                }} 
                className={`w-full text-[9px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black py-1 rounded font-bold active:brightness-90 transition shadow-sm flex items-center justify-center gap-1 ${joiningSyncWith === user.id ? 'opacity-80 cursor-wait' : ''}`}
              >
                {joiningSyncWith === user.id ? (
                  <>⏳ Iniciando Sync...</>
                ) : (
                  <>🔥 Entrenar juntos — abrir EntrenaSync</>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      ) : currentUser?.trainingNow ? (
        !showLiveMap ? (
        <div className="card card-glass p-4 text-center border border-[#22c55e]/50 relative overflow-hidden">
          <div className="text-3xl mb-2">🟢</div>
          <div className="font-semibold text-base mb-1 text-[#22c55e]">¡Tú estás en vivo en el GymPulse!</div>
          <div className="text-sm text-[#9CA3AF] mb-3 leading-snug">Tu marcador verde ya está en el mapa. Cuando alguien más active live cerca, aparecerá aquí para unirte o sync.</div>
          <button onClick={() => setShowLiveMap(true)} className="text-xs px-5 py-2 rounded-2xl bg-[#22c55e] text-black font-bold active:brightness-90">Ver mapa en tiempo real →</button>
        </div>
        ) : null
      ) : !showLiveMap ? (
        <div className="card card-glass p-6 text-center border border-[#22c55e]/30 relative overflow-hidden">
          <div className="text-5xl mb-3 opacity-90">🏋️‍♂️</div>
          <div className="font-semibold text-base mb-1.5">Nadie entrenando cerca todavía</div>
          <div className="text-sm text-[#9CA3AF] mb-4 leading-snug">Activa &quot;Entrenando Ahora (EN VIVO)&quot; en tu Perfil para aparecer en el mapa.</div>
          <button onClick={() => setActiveTab('profile')} className="text-xs px-5 py-2 rounded-2xl bg-[#22c55e] text-black font-bold active:brightness-90 active:scale-[0.985] transition shadow-sm">Ir a Perfil y activar live →</button>
          <div className="absolute -bottom-6 -right-6 text-[70px] opacity-5">📡</div>
        </div>
      ) : (
        <p className="text-[11px] text-[#9CA3AF] px-1 py-2 text-center">
          Mapa abierto — activa live en Perfil para ser el centro del GymPulse.
        </p>
      )}
      {!showLiveMap && (
      <div className="text-[9px] text-[#9CA3AF] mt-0.5 flex justify-between items-center">
        <span>El mapa muestra el pulso vivo de la comunidad.</span>
        <button onClick={() => setShowLiveModal(true)} className="text-[#22c55e] underline active:text-white">Ver todos live →</button>
      </div>
      )}

      {/* Map area - primer paso de modularización pulido.
          La mayoría del chrome (header flotante, filtros, leyenda de zonas, centrar, botones dev) ahora vive dentro de <GymPulseMap />.
          El padre mantiene el toggle + el form pesado de partners (por ahora).
      */}
      <div className="mt-3 relative z-10">
        <div className="flex items-center justify-between mb-1.5 px-1 gap-2">
          <div className="text-[11px] font-semibold text-[#22c55e] truncate">
            🗺️ GymPulse
            {networkStats.numPartners > 0 && (
              <span className="text-[9px] font-normal text-[#9CA3AF] ml-1">
                · {networkStats.numPartners} en tu red
              </span>
            )}
          </div>
          <button 
            onClick={() => { try { triggerHaptic('light') } catch {}; setShowLiveMap(!showLiveMap) }} 
            data-gympulse-tour={!mapMyGymId ? 'checkin' : undefined}
            className={`text-[11px] px-3 py-1.5 rounded-full border shrink-0 transition ${showLiveMap ? 'bg-[#22c55e] text-black border-[#22c55e]' : 'border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/10'}`}
          >
            {showLiveMap ? 'Ocultar mapa' : 'Ver mapa'}
          </button>
        </div>

        {showLiveMap && (
      <div
        className={`relative z-10 ${mapFullscreen ? 'gym-pulse-fs-host' : ''}`}
        style={mapFullscreen ? undefined : { minHeight: 'min(420px, 52vh)' }}
      >
        <GymPulseMapShell
          fullscreen={mapFullscreen}
          liveCount={liveCountForUI}
          cityLabel={currentUser?.city || undefined}
          onToggleFullscreen={() => {
            try { triggerHaptic('light') } catch {}
            setMapFullscreen((f) => !f)
            setTimeout(() => {
              try { gymPulseMapRef?.current?.invalidateSize?.() } catch { /* ignore */ }
            }, 150)
          }}
          onClose={() => {
            setMapFullscreen(false)
            setShowLiveMap(false)
          }}
          onCentrar={() => {
            try { (window as any).__gymPulseCentrar?.() } catch { /* ignore */ }
          }}
          bottomSheet={
            <GymPulseBottomSheet
              liveUsers={mapLiveTrainingNow || liveTrainingNow}
              syncBonds={syncBonds}
              selfUserId={effectiveUserId}
              joiningSyncWith={joiningSyncWith}
              expanded={mapFullscreen}
              onShowProfile={setShowFullProfile}
              onStartSync={startSyncWith}
              onFlyToUser={(lat, lng) => {
                try { gymPulseMapRef?.current?.flyTo?.(lat, lng, 15) } catch { /* ignore */ }
              }}
            />
          }
        >
        <GymPulseMap
          ref={gymPulseMapRef}
          showLiveMap={showLiveMap}
          liveTrainingNow={mapLiveTrainingNow}
          liveCount={liveCountForUI}
          selfUserId={effectiveUserId}
          syncRipples={syncRipples}
          partnerLocations={partnerLocations}
          echoPins={echoPins || []}
          userLocation={userLocation}
          mapNearOnly={mapNearOnly}
          selectedMapZone={selectedMapZone}
          showOnlyNetwork={showOnlyNetwork}
          showPartners={showPartners}
          mapMyGymOnly={mapMyGymOnly}
          mapMyGymId={mapMyGymId}
          mapForceTick={mapForceTick}
          syncBonds={syncBonds}
          isDeveloper={isDeveloper}
          isPlacingPartner={isPlacingPartner}
          isQuickAddPartner={isQuickAddPartner}
          selfIsLive={!!currentUser?.trainingNow}
          devTestCount={devTestLives.length}
          layoutMode={mapFullscreen ? 'fullscreen' : 'embedded'}

          // New control callbacks (widget now manages its own filter/legend/dev buttons)
          onMapNearOnlyChange={setMapNearOnly}
          onSelectedMapZoneChange={setSelectedMapZone}
          onShowOnlyNetworkChange={setShowOnlyNetwork}
          onShowPartnersChange={(v) => { setShowPartners(v); setMapForceTick(t => t + 1) }}
          onMapMyGymOnlyChange={setMapMyGymOnly}
          onOpenAddPartner={openAddPartner}
          onOpenManagePartners={openManagePartners}
          onToggleQuickAdd={(next) => { setIsQuickAddPartner(next); if (next) toast('Modo ADD RÁPIDO activado'); else toast('Modo add rápido OFF') }}
          onLogoutDeveloper={logoutDeveloper}
          onAddPartnerAtCurrentCenter={addPartnerAtCurrentCenter}
          onReloadPartners={reloadPartners}
          onSpawnTestLives={spawnDevTestLives}
          onClearDevTestLives={clearDevTestLives}

          onShowProfile={setShowFullProfile}
          onStartSync={startSyncWith}
          onGymCheckIn={handleGymCheckIn}
          userGymId={mapMyGymId}
          onWitnessEchoPin={witnessEchoPin}
          onWitnessRipple={witnessRipple}
          onWitnessRipple={witnessRipple}
          onPartnerPositionSelected={async (lat, lng) => {
            if (isQuickAddPartnerRef.current && isDeveloper) {
    // Quick add mode: create minimal partner immediately on map click (great for rapid dev iteration)
    const pid = 'partner-' + Date.now()
    const minimal: any = {
      id: pid,
      name: 'Nueva Tienda ' + new Date().toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'}),
      lat, lng,
      type: 'gym',
      address: 'Agregada rápido por dev',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
                  // Never include logoUrl if no logo (Firestore rejects undefined)
                  // Will be added later when editing in the auto-opened form.
                  setPartnerLocations(prev => [...prev, minimal])
                  setMapForceTick(t => t + 1)
                  // Defensive clean for any undefineds (Firestore forbids them in setDoc)
                  Object.keys(minimal).forEach(k => { if (minimal[k] === undefined) delete minimal[k] })

                  if (!isDemoMode && db) {
                    try {
                      const { setDoc, doc } = await import('firebase/firestore')
                      await setDoc(doc(db, 'partnerLocations', pid), minimal)
                    } catch (e) { console.warn('quick add fs', e) }
                  }
                  toast.success('Tienda agregada rápido', { description: `${lat.toFixed(4)}, ${lng.toFixed(4)} — usa Manage para editar` })
                  // turn off quick mode after one add
                  setIsQuickAddPartner(false)
                  // Auto open edit for the new one so dev can immediately set name/logo etc.
                  setTimeout(() => startEditPartner(minimal), 50)
                  return
                }
                setPartnerFormLat(lat)
                setPartnerFormLng(lng)
                // keep form open so dev can confirm
              }}
              onPartnerMoved={async (id: string, lat: number, lng: number) => {
                // Dev drag-to-move partner/tienda on map
                setPartnerLocations(prev => prev.map(x => x.id === id ? { ...x, lat, lng } : x))
                setMapForceTick(t => t + 1)
                if (!isDemoMode && db) {
                  try {
                    const { setDoc, doc } = await import('firebase/firestore')
                    await setDoc(doc(db, 'partnerLocations', id), { lat, lng, updatedAt: new Date().toISOString() }, { merge: true })
                    toast.success('Tienda movida', { description: 'Posición actualizada en el mapa para todos' })
                  } catch (e) {
                    console.warn('partner drag fs', e)
                    toast.error('No se pudo guardar el movimiento en FS')
                  }
                }
              }}
              onPartnerEdit={handlePartnerEditFromMap}
              onPartnerDelete={async (id: string) => {
                // Dev delete from map popup
                const p = (partnerLocationsRef.current || partnerLocations).find((pp: any) => pp.id === id)
                if (!p || !confirm(`Eliminar ${p.name || 'esta tienda'}?`)) return
                if (!isDemoMode && db) {
                  try {
                    const { deleteDoc, doc } = await import('firebase/firestore')
                    await deleteDoc(doc(db, 'partnerLocations', id))
                  } catch (e) {
                    console.warn('partner delete from map fs', e)
                    try { toast.error('No se pudo borrar en FS (revisa reglas)') } catch {}
                  }
                }
                setPartnerLocations(prev => prev.filter(pp => pp.id !== id))
                setMapForceTick(t => t + 1)
                try { triggerHaptic('light') } catch {}
              }}
              onForceTick={() => setMapForceTick(t => t + 1)}
              onRequestLocation={() => requestUserLocation().catch(() => {})}
              onRegisterCentrar={(fn) => {
                ;(window as any).__gymPulseCentrar = fn
              }}
            />
        </GymPulseMapShell>
            {!showAddPartnerForm && isDeveloper && showPartners && (
              <div className="text-[7px] text-[#FFD700]/70 px-1 mt-1">Modo dev: botón DEV en el mapa</div>
            )}

            {/* DEV PARTNER FORM - attractive, with logo upload. Gated by developer login. Supports add + edit with logo for negocios. */}
            {showAddPartnerForm && isDeveloper && (
              <div className="absolute bottom-1 left-1 right-1 z-[5000] bg-[#0D0D10] border-2 border-[#FFD700] rounded-2xl p-3 text-xs shadow-2xl max-h-[220px] overflow-auto">
                <div className="font-bold text-[#FFD700] mb-2 flex justify-between items-center">
                  {editingPartnerId ? 'Editar Partner (devs)' : 'Agregar Partner + Logo (devs)'} — visible en mapa en tiempo real
                  <button onClick={cancelPartnerForm} className="text-white/60 hover:text-white px-1">✕</button>
                </div>

                <div className="space-y-2">
                  <input 
                    value={partnerFormName} 
                    onChange={(e) => setPartnerFormName(e.target.value)} 
                    placeholder="Nombre del gym / negocio" 
                    className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded px-3 py-1.5 text-white text-sm outline-none focus:border-[#FF671F]" 
                  />
                  <select 
                    value={partnerFormType} 
                    onChange={(e) => setPartnerFormType(e.target.value as any)} 
                    className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded px-3 py-1.5 text-white text-sm"
                  >
                    <option value="gym">Gym / Box / Entrenamiento</option>
                    <option value="store">Tienda / Suplementos</option>
                    <option value="studio">Studio / Otro</option>
                  </select>

                  {/* Address + precise lat/lng — makes "ponerlo correctamente con direccion" trivial for devs */}
                  <div>
                    <div className="text-[9px] text-[#9CA3AF] mb-0.5">Dirección / referencia (se muestra en popup del mapa)</div>
                    <input 
                      value={partnerFormAddress} 
                      onChange={(e) => setPartnerFormAddress(e.target.value)} 
                      placeholder="Ej: Av. Libertad 1234, Viña del Mar • cerca del mall" 
                      className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded px-3 py-1 text-white text-xs outline-none focus:border-[#FF671F]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] text-[#9CA3AF] mb-0.5">Latitud</div>
                      <input 
                        type="number" step="0.0001" 
                        value={partnerFormLat} 
                        onChange={(e) => setPartnerFormLat(parseFloat(e.target.value) || -33.02)} 
                        className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded px-2 py-1 text-white text-xs font-mono" 
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-[#9CA3AF] mb-0.5">Longitud</div>
                      <input 
                        type="number" step="0.0001" 
                        value={partnerFormLng} 
                        onChange={(e) => setPartnerFormLng(parseFloat(e.target.value) || -71.55)} 
                        className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded px-2 py-1 text-white text-xs font-mono" 
                      />
                    </div>
                  </div>
                  {/* Quick actions to make moving/placing frictionless for devs */}
                  <div className="flex flex-wrap gap-1">
                    <button 
                      type="button"
                      onClick={() => {
                        const c = gymPulseMapRef.current?.getCenter?.() || null
                        if (c) {
                          setPartnerFormLat(c.lat)
                          setPartnerFormLng(c.lng)
                          try { triggerHaptic('light') } catch {}
                          toast('Centro del mapa copiado', { description: 'Ajusta manualmente o guarda' })
                        } else {
                          toast.error('Mapa no disponible todavía')
                        }
                      }} 
                      className="text-[9px] px-2 py-0.5 rounded border border-[#FFD700]/40 text-[#FFD700] active:bg-[#FFD700]/10"
                    >
                      📍 Usar centro del mapa
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (userLocation) {
                          setPartnerFormLat(userLocation.lat)
                          setPartnerFormLng(userLocation.lng)
                          try { triggerHaptic('light') } catch {}
                          toast('Tu GPS copiado al partner')
                        } else {
                          toast.error('GPS no disponible aún')
                        }
                      }} 
                      className="text-[9px] px-2 py-0.5 rounded border border-[#FFD700]/40 text-[#FFD700] active:bg-[#FFD700]/10"
                    >
                      📌 Usar mi ubicación
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const next = !isPlacingPartner
                        setIsPlacingPartner(next)
                        if (next) {
                          toast.info('MODO COLOCAR: toca el mapa donde quieres el local', { description: 'Puedes tocar varias veces para ajustar' })
                          try { triggerHaptic('medium') } catch {}
                        }
                      }} 
                      className={`text-[9px] px-2 py-0.5 rounded border ${isPlacingPartner ? 'bg-[#FF671F] text-white border-[#FF671F]' : 'border-[#FFD700]/40 text-[#FFD700] active:bg-[#FFD700]/10'}`}
                    >
                      {isPlacingPartner ? '✋ CANCELAR CLICK-MAPA' : '👆 COLOCAR TOCANDO MAPA'}
                    </button>
                  </div>
                  {isPlacingPartner && (
                    <div className="text-[9px] text-[#FF671F] bg-black/40 px-2 py-0.5 rounded">Toca cualquier punto del mapa en tiempo real → lat/lng del formulario se actualizan al instante.</div>
                  )}

                  {/* Logo upload - attractive preview */}
                  <div>
                    <div className="text-[10px] text-[#9CA3AF] mb-1">Logo del negocio (recomendado 200x200+)</div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex-1">
                        <div className="border border-dashed border-[#FF671F]/50 hover:border-[#FF671F] rounded-xl px-3 py-2 text-center text-[#FF671F] active:bg-[#FF671F]/10 transition">
                          {partnerLogoPreview ? 'Cambiar logo' : 'Subir logo (jpg/png)'}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePartnerLogoSelect} />
                      </label>
                      {typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera && (
                        <button type="button" onClick={async () => {
                          try {
                            const photo = await CapacitorCamera.getPhoto({ quality: 70, allowEditing: true, resultType: 'base64' })
                            if (photo && photo.base64String) {
                              const byteCharacters = atob(photo.base64String)
                              const byteNumbers = new Array(byteCharacters.length)
                              for (let i=0; i<byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
                              const byteArray = new Uint8Array(byteNumbers)
                              const blob = new Blob([byteArray], { type: 'image/jpeg' })
                              const file = new File([blob], 'partner-logo.jpg', { type: 'image/jpeg' })
                              setPartnerLogoFile(file)
                              if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) URL.revokeObjectURL(partnerLogoPreview)
                              const preview = URL.createObjectURL(file)
                              setPartnerLogoPreview(preview)
                              try { triggerHaptic('light') } catch {}
                            }
                          } catch (e) { console.warn('camera logo', e) }
                        }} className="text-[10px] px-2 py-1 border border-[#FF671F]/40 rounded text-[#FF671F] active:bg-[#FF671F]/10">📷</button>
                      )}
                      {partnerLogoPreview && (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FFD700] flex-shrink-0">
                          <img src={partnerLogoPreview} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => { 
                              setPartnerLogoFile(null); 
                              if (partnerLogoPreview.startsWith('blob:')) URL.revokeObjectURL(partnerLogoPreview); 
                              setPartnerLogoPreview(editingPartnerId ? (partnerLocations.find(pp=>pp.id===editingPartnerId)?.logoUrl || null) : null); 
                            }} 
                            className="absolute -top-1 -right-1 bg-black/80 text-white text-[10px] w-4 h-4 rounded-full leading-none flex items-center justify-center">×</button>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] text-[#666] mt-0.5">Logo → Storage (https) → visible en marker dorado PARTNER del mapa en tiempo real. Requiere login real Firebase.</div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try { triggerHaptic('medium') } catch {}
                    const name = partnerFormName.trim() || 'Partner Gym'
                    const type = partnerFormType
                    // Use the controlled form values (dev can tweak manually, use buttons, or click on map)
                    let lat = partnerFormLat
                    let lng = partnerFormLng
                    const address = partnerFormAddress.trim() || (editingPartnerId ? (partnerLocations.find(pp=>pp.id===editingPartnerId)?.address || 'Actualizado por devs') : 'Agregado por devs')
                    const pid = editingPartnerId || ('partner-' + Date.now())
                    let logoUrl: string | undefined = editingPartnerId ? partnerLocations.find(pp => pp.id === editingPartnerId)?.logoUrl : undefined
                    if (partnerLogoFile) {
                      logoUrl = await uploadPartnerLogoIfNeeded(partnerLogoFile, pid)
                      if (partnerLogoFile && !logoUrl) {
                        toast.error('Logo no se subió (403). Asegúrate de: 1) firebase deploy --only storage (rules), 2) Estar logueado en la app con Google o email (Firebase Auth real, el password dev solo abre el form). Partner guardado sin logo.')
                      }
                    }
                    const partnerData: any = {
                      id: pid,
                      name,
                      lat,
                      lng,
                      type,
                      address,
                      updatedAt: new Date().toISOString(),
                    }
                    if (!editingPartnerId) {
                      partnerData.addedAt = new Date().toISOString()
                    }
                    // Only include logoUrl if we have a real value (Firestore setDoc rejects undefined)
                    if (logoUrl) {
                      partnerData.logoUrl = logoUrl
                    }

                    // Defensive: never send undefined values to Firestore (causes "Unsupported field value: undefined")
                    Object.keys(partnerData).forEach(k => {
                      if (partnerData[k] === undefined) delete partnerData[k]
                    })

                    if (!isDemoMode && db) {
                      try {
                        const { setDoc, doc, updateDoc } = await import('firebase/firestore')
                        if (editingPartnerId) {
                          await updateDoc(doc(db, 'partnerLocations', pid), partnerData)
                        } else {
                          await setDoc(doc(db, 'partnerLocations', pid), partnerData)
                        }
                      } catch (e) { 
                        console.warn('save partner fs', e) 
                        try {
                          toast.error('Error guardando partner en Firestore (permisos)', { 
                            description: 'Deploy las firestore.rules nuevas. Asegúrate de estar logueado con Google/email (Firebase Auth real). El logo se subió bien. Se mostró localmente.' 
                          })
                        } catch {}
                      }
                    }
                    // Always update local state optimistically (for both demo and real mode)
                    // This ensures the partner appears immediately in the map even before the onSnapshot fires in real-time mode.
                    setPartnerLocations(prev => {
                      if (editingPartnerId) {
                        return prev.map(pp => pp.id === pid ? { ...pp, ...partnerData } : pp)
                      }
                      return [...prev, partnerData]
                    })
                    // cleanup
                    if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) URL.revokeObjectURL(partnerLogoPreview)
                    setPartnerLogoFile(null)
                    setPartnerLogoPreview(null)
                    setIsPlacingPartner(false)
                    setShowAddPartnerForm(false)
                    setEditingPartnerId(null)
                    setMapForceTick(t => t + 1)
                    // ensure map immediately reflects the new/updated partner (fixes "no queda guardado" visual)
                    setTimeout(() => {
                      try { gymPulseMapRef.current?.invalidateSize?.() } catch {}
                    }, 30)
                    toast.success(editingPartnerId ? 'Partner actualizado' : 'Partner agregado', { description: 'Aparecerá en el mapa en tiempo real para todos los usuarios' })
                    // recenter with flyTo via the extracted component (old ref is dead)
                    setTimeout(() => {
                      try { gymPulseMapRef.current?.flyTo?.(lat, lng, 14) } catch {}
                    }, 150)
                  }}
                  className="mt-3 w-full py-2 bg-[#FFD700] text-black font-extrabold rounded-xl active:bg-white active:scale-[0.985] transition flex items-center justify-center gap-2"
                >
                  {editingPartnerId ? 'GUARDAR CAMBIOS + LOGO' : 'AGREGAR AL MAPA EN TIEMPO REAL'}
                </button>
                <div className="text-center text-[9px] text-[#666] mt-1">Solo devs. Rules deployadas. Necesitas sign-in real (Google/email) en la app (no solo password dev) para que el upload de logo dé 200 y aparezca la imagen en el marker dorado del mapa.</div>
              </div>
            )}

            {/* DEV LOGIN MODAL - password gate so ONLY developers can add/edit partner locals + logos */}
            {showDevLogin && (
              <div className="absolute inset-0 z-[6000] flex items-center justify-center bg-black/70 p-4" onClick={() => setShowDevLogin(false)}>
                <div onClick={e => e.stopPropagation()} className="bg-[#0D0D10] border-2 border-[#FFD700] rounded-2xl p-4 w-full max-w-[320px] text-sm">
                  <div className="font-black text-[#FFD700] mb-1">Developer Login</div>
                  <div className="text-[#9CA3AF] text-xs mb-3">Acceso exclusivo para agregar y editar partners (locales) con logos en el mapa en tiempo real.</div>
                  <input 
                    type="password" 
                    value={devPassword} 
                    onChange={e => setDevPassword(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter') loginAsDeveloper() }} 
                    placeholder="Password de desarrollador" 
                    className="w-full bg-black border border-[#FFD700]/40 rounded px-3 py-2 mb-3 text-white focus:outline-none focus:border-[#FFD700]" 
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowDevLogin(false); setDevPassword('') }} className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 active:bg-white/5">Cancelar</button>
                    <button onClick={loginAsDeveloper} className="flex-1 py-2 bg-[#FFD700] text-black font-bold rounded-xl active:bg-white">Entrar como Dev</button>
                  </div>
                  <div className="text-[10px] text-center text-[#666] mt-2">
                    Requiere VITE_DEV_MAP_PASSWORD + doc mapEditors/tu-uid en Firestore
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE PARTNERS MODAL (dev only) - improved with search, stats, logo previews, better UX */}
            {showManagePartners && isDeveloper && (
              <div className="absolute inset-0 z-[5500] flex items-end justify-center bg-black/60 p-3" onClick={() => setShowManagePartners(false)}>
                <div onClick={e=>e.stopPropagation()} className="bg-[#0D0D10] border border-[#FFD700] rounded-t-2xl w-full max-w-[420px] max-h-[75vh] overflow-auto p-3 text-sm">
                  <div className="flex justify-between items-center mb-2 sticky top-0 bg-[#0D0D10] pb-1">
                    <div>
                      <div className="font-bold text-[#FFD700]">Manage Partners (devs)</div>
                      <div className="text-[10px] text-[#9CA3AF]">{partnerLocations.length} locales • {partnerLocations.filter((pp:any)=>pp.logoUrl).length} con logo</div>
                    </div>
                    <button onClick={() => setShowManagePartners(false)} className="text-white/50">✕</button>
                  </div>

                  {/* Search for partners */}
                  <input 
                    placeholder="Buscar por nombre..." 
                    className="w-full mb-2 bg-[#1C1C20] border border-[#2F2F35] rounded px-2 py-1 text-xs" 
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase()
                      // simple client filter via data attr or re-render list - for simplicity use state if needed, here we filter in map below
                      const container = e.currentTarget.parentElement?.querySelector('#manage-partner-list')
                      if (container) {
                        Array.from(container.children).forEach((child: any) => {
                          const name = (child.getAttribute('data-name') || '').toLowerCase()
                          child.style.display = name.includes(term) ? '' : 'none'
                        })
                      }
                    }}
                  />

                  <div id="manage-partner-list">
                    {partnerLocations.length === 0 && <div className="text-[#9CA3AF] text-xs py-2">No partners yet. Usa + Partner para agregar.</div>}
                    {partnerLocations.map((p: any) => (
                      <div key={p.id} data-name={p.name} className="flex items-center gap-1 border-b border-white/10 py-2 last:border-0">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} className="w-9 h-9 rounded-full object-cover border border-[#FFD700]/50 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex items-center justify-center text-lg text-white flex-shrink-0">📍</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{p.name}</div>
                          <div className="text-[9px] text-[#9CA3AF] truncate">{p.address || p.type} • {p.lat?.toFixed(3)},{p.lng?.toFixed(3)}</div>
                        </div>
                        <button onClick={() => startEditPartner(p)} className="text-[9px] px-1.5 py-0.5 border border-[#FFD700]/50 rounded text-[#FFD700] active:bg-[#FFD700]/10" title="Editar nombre, logo, dirección, coords">Edit</button>
                        {/* Instant move tools — core of "facil mover un local" for devs */}
                        <button 
                          onClick={() => {
                            if (gymPulseMapRef.current && p.lat && p.lng) {
                              try { gymPulseMapRef.current.centerOn(p.lat, p.lng, 15) } catch {}
                            } // legacy mapInstanceRef removed
                            try { triggerHaptic('light') } catch {}
                          }} 
                          className="text-[9px] px-1.5 py-0.5 border border-[#3b82f6]/50 rounded text-[#3b82f6] active:bg-[#3b82f6]/10" 
                          title="Centrar el mapa en este local (para ver o preparar move)"
                        >
                          Centrar
                        </button>
                        <button 
                          onClick={async () => {
                            // Move this partner to whatever the map is currently centered on — super fast iteration for placement
                            const c = gymPulseMapRef.current?.getCenter?.() || null
                            if (!c) { toast.error('Mapa no disponible'); return }
                            const newLat = c.lat, newLng = c.lng
                            setPartnerLocations(prev => prev.map(x => x.id === p.id ? { ...x, lat: newLat, lng: newLng } : x))
                            setMapForceTick(t => t + 1)
                            if (!isDemoMode && db) {
                              try {
                                const { setDoc, doc } = await import('firebase/firestore')
                                await setDoc(doc(db, 'partnerLocations', p.id), { lat: newLat, lng: newLng, updatedAt: new Date().toISOString() }, { merge: true })
                              } catch (e) { 
                                console.warn('partner move fs', e) 
                                try { toast.error('No se pudo mover en FS (revisa reglas)') } catch {} 
                              }
                            }
                            try { gymPulseMapRef.current?.centerOn?.(newLat, newLng, 14) } catch {}
                            try { triggerHaptic('success') } catch {}
                            toast.success('Movido al centro', { description: `${p.name} actualizado en tiempo real` })
                          }} 
                          className="text-[9px] px-1.5 py-0.5 border border-[#22c55e]/50 rounded text-[#22c55e] active:bg-[#22c55e]/10" 
                          title="Poner este local exactamente donde está centrado el mapa ahora (guarda al instante)"
                        >
                          Poner aquí
                        </button>
                        <button onClick={async () => {
                          if (!confirm(`Eliminar ${p.name}?`)) return
                          if (!isDemoMode && db) {
                            try {
                              const { deleteDoc, doc } = await import('firebase/firestore')
                              await deleteDoc(doc(db, 'partnerLocations', p.id))
                            } catch (e) { 
                              console.warn('partner delete fs', e) 
                              try { toast.error('No se pudo borrar en FS (revisa reglas)') } catch {} 
                            }
                          }
                          setPartnerLocations(prev => prev.filter(pp => pp.id !== p.id))
                          try { triggerHaptic('light') } catch {}
                        }} className="text-[9px] px-1.5 py-0.5 border border-red-500/50 rounded text-red-400 active:bg-red-500/10">Del</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={openAddPartner} className="mt-3 w-full py-1.5 text-sm bg-[#FFD700] text-black rounded-xl font-bold">+ Agregar nuevo Partner</button>

                  {/* Extra dev superpowers for rapid testing / content creation on the map */}
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[9px]">
                    <button 
                      onClick={() => {
                        if (!confirm('¿BORRAR TODAS las tiendas/partners? Esto es solo para devs y es permanente en FS.')) return
                        ;(async () => {
                          for (const p of partnerLocations) {
                            if (!isDemoMode && db) {
                              try { const { deleteDoc, doc } = await import('firebase/firestore'); await deleteDoc(doc(db, 'partnerLocations', p.id)) } catch {}
                            }
                          }
                          setPartnerLocations([])
                          setMapForceTick(t => t + 1)
                          toast('Todas las tiendas borradas')
                        })()
                      }}
                      className="py-1 bg-red-900/60 text-red-300 rounded border border-red-500/40 active:bg-red-800"
                    >
                      🗑️ Borrar TODAS
                    </button>
                    <button 
                      onClick={() => {
                        const data = JSON.stringify(partnerLocations, null, 2)
                        const blob = new Blob([data], {type: 'application/json'})
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'entrenamatch-partners.json'
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success('Partners exportados')
                      }}
                      className="py-1 bg-[#1C1C20] text-[#9CA3AF] rounded border border-white/20 active:bg-[#25252A]"
                    >
                      📤 Export JSON
                    </button>
                    <label className="py-1 bg-[#1C1C20] text-[#9CA3AF] rounded border border-white/20 active:bg-[#25252A] text-center cursor-pointer">
                      📥 Import JSON
                      <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const text = await file.text()
                          const imported = JSON.parse(text)
                          if (!Array.isArray(imported)) throw new Error('Formato inválido')
                          for (const p of imported) {
                            if (!p.id || !p.name || typeof p.lat !== 'number') continue
                            if (!isDemoMode && db) {
                              try {
                                const { setDoc, doc } = await import('firebase/firestore')
                                const payload: any = { ...p, updatedAt: new Date().toISOString() }
                                // sanitize undefineds for Firestore
                                Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k] })
                                await setDoc(doc(db, 'partnerLocations', p.id), payload, { merge: true })
                              } catch {}
                            }
                            // merge into local
                            setPartnerLocations(prev => {
                              const exists = prev.some(x => x.id === p.id)
                              if (exists) return prev.map(x => x.id === p.id ? { ...x, ...p } : x)
                              return [...prev, p]
                            })
                          }
                          setMapForceTick(t => t + 1)
                          toast.success(`${imported.length} partners importados`)
                        } catch (err) {
                          toast.error('Error importando JSON')
                        }
                        e.target.value = '' // reset input
                      }} />
                    </label>
                  </div>
                  <div className="text-[9px] text-center text-[#666] mt-1">Drag del pin en el mapa (solo devs) = mover instantáneo. "Poner aquí" o "COLOCAR TOCANDO MAPA" para precisión. Todo realtime. +Add rápido = click = crear ya.</div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <GymPulseTour active={showGymPulseTour} onComplete={() => setShowGymPulseTour(false)} />
    </div>
  )
}
