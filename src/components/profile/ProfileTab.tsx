import { motion } from 'framer-motion'
import {
  Camera, Clock, Dumbbell, Edit2, Heart, Plus, RefreshCw, Send, Star, Users, Zap,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { ProfileSectionNav } from './ProfileSectionNav'
import { TuRedPowerCard } from './TuRedPowerCard'
import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'
import { ProfileMuroSection } from './ProfileMuroSection'
import { ProfileAccountSection } from './ProfileAccountSection'
import { profileTabBindings } from './profileTabBindings'
import type { ProfileTabProps } from './profileTabTypes'

export type { ProfileTabProps } from './profileTabTypes'

export function ProfileTab(props: ProfileTabProps) {
  const {
    currentUser,
    showDailyPulseBanner,
    dailyPulse,
    triggerHaptic,
    setShowDailyPulseBanner,
    isDemoMode,
    isSyncingProfile,
    setIsSyncingProfile,
    loadRealProfiles,
    loadRealSessions,
    loadMyFeedbacks,
    firebaseUser,
    getUserProfile,
    saveUser,
    setLastSync,
    lastSync,
    handleLogout,
    openProfileEditor,
    profileSection,
    setProfileSection,
    networkStats,
    syncBonds,
    setMapForceTick,
    saveUserWithRealSync,
    setActiveTab,
    setShowLiveModal,
    matches,
    squads,
    liveCountForUI,
    liveTrainingNow,
    profilePosts,
    effectiveUserId,
    getUnlockedGadgets,
    getTodayStr,
    setDailyPulse,
    debugLogsRef,
    SEED_PROFILES,
    realProfiles,
    startSyncWith,
    tryAutoStartSync,
    setShowFullProfile,
    refreshDailyPulse,
    completeDailyChallenge,
    getNextGadget,
    muroComposerRef,
    loadingPersonalMuro,
    setLoadingPersonalMuro,
    loadProfilePosts,
    processIncomingLiveJoins,
    muroComposerText,
    setMuroComposerText,
    muroComposerPhoto,
    setMuroComposerPhoto,
    muroPhotoUploading,
    muroPhotoUploadProgress,
    muroPublishing,
    setMuroPublishing,
    createProfilePost,
    handleMuroPhotoFile,
    deleteProfilePost,
    togglePinPost,
    likeProfilePost,
    boostReaction,
    feedReactions,
    activeComment,
    commentDraft,
    setCommentDraft,
    openFullComments,
    submitComment,
    cancelComment,
    deleteCommentFromPost,
    editingPost,
    editDraft,
    setEditDraft,
    startEditPost,
    saveEditPost,
    recentlyPublishedPostId,
    setFeedPhotoModal,
    getRelativeTime,
    isEditingBio,
    setIsEditingBio,
    testIntegrityNonce,
    setTestIntegrityNonce,
    checkPlayIntegrity,
    integrityChecking,
    lastIntegrity,
    toggleLiveTraining,
    isTogglingLive,
    syncPartnerId,
    showSyncArena,
    setShowSyncArena,
    syncVibe,
    syncStartedAt,
    setShowLegal,
    setShowVerificationFlow,
    setVerificationStep,
    feedbackType,
    setFeedbackType,
    feedbackRating,
    setFeedbackRating,
    feedbackText,
    setFeedbackText,
    myFeedbacks,
    loadingMyFeedbacks,
    db,
    storage,
    requestWebNotificationPermission,
    requestNativePushPermission,
    PushNotifications,
    CapacitorCamera,
    notifPrefs,
    setNotifPrefs,
    setShowPwaInstall,
  } = profileTabBindings(props)

  return (
    <div className="flex-1 overflow-auto bg-[#0D0D10] pb-28">
      {/* Daily Pulse Banner - strong reason to engage immediately on open */}
      {showDailyPulseBanner && dailyPulse && (
        <motion.div 
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="daily-pulse-banner mx-4 mt-3 p-3.5 rounded-2xl border flex items-center gap-3 shadow-sm"
        >
          <div className="text-2xl">🌅</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-[#FF671F] tracking-tight">¡GymPulse Diario activado!</div>
            <div className="text-xs text-[#9CA3AF]">Streak {dailyPulse.trainingStreak}d • {dailyPulse.currentChallenge?.title}</div>
          </div>
          <button 
            onClick={() => { 
              try { triggerHaptic('light') } catch {} 
              setShowDailyPulseBanner(false); 
            }} 
            className="text-xs px-3.5 py-1.5 bg-[#FF671F] text-black rounded-full font-bold active:bg-[#E55A1A] active:scale-95 transition-transform shadow"
          >
            Ver Pulso
          </button>
        </motion.div>
      )}
      {/* Sticky header with escape hatches - polished aesthetics */}
      <div className="sticky top-0 z-20 bg-[#0D0D10]/95 backdrop-blur-xl border-b border-[#2F2F35] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <div className="section-header text-xl">Tu legado 🔥</div>
            <div className="text-[10px] text-[#9CA3AF] -mt-1">Tu red de rendimiento • comparte y crece</div>
            {!isDemoMode && <div className="live-pill !text-[8px] !py-0.5 !mt-0.5">REAL • Firebase</div>}
          </div>
          {!isDemoMode && (
            <button onClick={async () => { 
              setIsSyncingProfile(true);
              try {
                await loadRealProfiles(); 
                await loadRealSessions(); 
                await loadMyFeedbacks(); 
                if (firebaseUser?.uid) {
                  try {
                    const rp = await getUserProfile(firebaseUser.uid);
                    if (rp && rp.name) {
                      const merged: CurrentUser = {
                        ...currentUser,
                        id: 'me' as any,
                        name: rp.name,
                        age: rp.age,
                        gender: rp.gender,
                        city: rp.city,
                        country: rp.country,
                        bio: rp.bio,
                        photos: rp.photos || [],
                        trainingTypes: rp.trainingTypes || [],
                        goals: rp.goals || [],
                        level: rp.level || 'Intermedio',
                        intensity: rp.intensity || 'Moderado',
                        availability: rp.availability || ['Tarde'],
                        lat: rp.lat || currentUser?.lat || -33.0153,
                        lng: rp.lng || currentUser?.lng || -71.5528,
                        legalConsents: rp.legalConsents || currentUser?.legalConsents,
                      };
                      saveUser(merged);
                    }
                  } catch {}
                }
                setLastSync(new Date()); 
                toast.success('Datos reales sincronizados') 
              } finally {
                setIsSyncingProfile(false);
              }
            }} disabled={isSyncingProfile} className="text-[10px] px-2.5 py-1 rounded-xl border border-[#FF671F]/40 text-[#FF671F] active:bg-[#FF671F]/10 disabled:opacity-60 flex items-center gap-1">
              <RefreshCw size={12} className={isSyncingProfile ? 'animate-spin' : ''} /> {isSyncingProfile ? 'Sync...' : 'Sincronizar'}
            </button>
          )}
          {lastSync && <span className="text-[9px] text-[#9CA3AF] ml-1">hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleLogout} className="text-[10px] px-3 py-1 rounded-2xl border border-[#3f2a2a] text-[#f87171] active:bg-[#1f1616] active:text-white">Cambiar cuenta</button>
          <button onClick={openProfileEditor} className="text-[10px] px-3 py-1 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#E55A1A] text-black font-semibold active:opacity-90 flex items-center gap-1"><Edit2 size={13} /> Personalizar</button>
        </div>
      </div>

      <ProfileSectionNav active={profileSection} onChange={setProfileSection} />

      {/* HERO - FULL REMASTERED EPIC "MI RITUAL" PRESENCE - Attractive, unique, premium */}
      <div className="relative h-80 w-full overflow-hidden bg-[#0a0a0c] profile-hero">
        <img 
          src={(currentUser.photos && currentUser.photos[0]) || 'https://picsum.photos/id/1005/600/800'} 
          className="absolute inset-0 w-full h-full object-cover" 
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/95" />
        <div className="absolute inset-0 border-b-2 border-[#FF671F]/20" />

        {/* Top status bar - unique + quick live action */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start text-xs">
          {currentUser.trainingNow ? (
            <div className="bg-[#22c55e] text-black font-black px-3 py-1 rounded-2xl tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.5)] flex items-center gap-2">🟢 EN GYMPULSE VIVO • {currentUser.liveStreak || 0}D <button onClick={async () => { /* quick deactivate from hero */ try{ const u={...currentUser,trainingNow:false,trainingNowSince:undefined,trainingSyncWith:null,syncStartedAt:null}; await saveUserWithRealSync(u as any); setMapForceTick(t=>t+1); toast('Live terminado'); }catch(e){} }} className="text-[9px] px-1.5 py-0 bg-black/30 rounded">Terminar</button></div>
          ) : (
            <button onClick={() => { /* quick activate */ setActiveTab('profile'); /* the main activate is lower, but hint */ toast('Activa "Entrenando Ahora" más abajo en el perfil'); }} className="bg-white/10 text-white/70 px-2 py-0.5 rounded text-[10px]">Activar GymPulse</button>
          )}
          <div className="text-right font-mono text-white/50 tracking-widest">{currentUser.level} • {currentUser.intensity}</div>
        </div>

        {/* Bottom hero content - rich & attractive */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="font-black text-4xl tracking-[-2.5px] text-white drop-shadow-lg">{currentUser.name}</div>
          <div className="text-[#9CA3AF] text-sm tracking-wider -mt-1">{currentUser.age} • {currentUser.city}, {currentUser.country}</div>

          {/* Unique "Tu Poder" mini dashboard in hero - makes profile creation feel valuable immediately */}
          <div className="mt-3 flex gap-2 text-[10px]">
            <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#FFD700]">{networkStats?.networkPower || 0}</span> NP</div>
            <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#22c55e]">{Object.keys(syncBonds || {}).length}</span> BONDS</div>
            <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#FF671F]">{currentUser.photos?.length || 0}</span> FOTOS</div>
          </div>
        </div>

        {/* Edit CTA - prominent for creation/editing */}
        <button 
          onClick={openProfileEditor}
          className="absolute top-4 right-4 text-xs px-4 py-2 rounded-2xl bg-black/70 border border-white/30 text-white flex items-center gap-1.5 active:bg-black tracking-wider"
        >
          <Edit2 size={13} /> REMASTERIZAR MI RITUAL
        </button>
      </div>

      {/* GALERÍA DE RENDIMIENTO - Remastered attractive curation. Unique visual for profile creation/editing */}
      {currentUser.photos && currentUser.photos.length > 0 && (
        <div className="px-4 pt-3 pb-2 bg-[#0D0D10] border-b border-[#2F2F35]">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div>
              <span className="text-[10px] uppercase tracking-[1px] text-[#FFD700]">GALERÍA DE RENDIMIENTO</span>
              <span className="ml-2 text-[11px] text-[#FF671F] font-semibold">{currentUser.photos.length} sesiones • tu peso en el GymPulse</span>
            </div>
            <div className="text-[8px] text-[#9CA3AF]/60">Arrastra • reordena • la 1ª es tu presencia</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {currentUser.photos.map((photo: string, idx: number) => (
            <div 
              key={idx} 
              draggable
              onDragStart={(e) => { try { triggerHaptic('light') } catch {}; e.dataTransfer.setData('text/plain', idx.toString()) }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const from = parseInt(e.dataTransfer.getData('text/plain'))
                if (!isNaN(from) && from !== idx) {
                  reorderGallery(from, idx)
                  try { triggerHaptic('medium') } catch {}
                }
              }}
              className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border ${idx === 0 ? 'border-[#FF671F] ring-1 ring-[#FF671F]/30' : 'border-[#2F2F35]'} shadow group transition-all hover:scale-[1.03] cursor-grab active:cursor-grabbing`}
            >
              <img src={photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              {idx === 0 && <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-[#FF671F] text-black px-1 text-center rounded-b">principal</div>}
              {/* Delete button - always visible on mobile for usability, nice on desktop */}
              <button
                onClick={() => deleteExtraPhoto(idx)}
                className="absolute top-1 right-1 bg-red-500/90 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 active:scale-90 shadow"
                title="Eliminar foto"
              >
                ×
              </button>
              {idx > 0 && (
                <button
                  onClick={() => {
                    const newPhotos = [currentUser.photos[idx], ...currentUser.photos.filter((_,i)=>i!==idx)];
                    const updated = { ...currentUser, photos: newPhotos };
                    saveUserWithRealSync(updated as any);
                    toast('Foto principal actualizada');
                  }}
                  className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 rounded active:bg-[#FF671F]"
                  title="Hacer principal"
                >
                  ★
                </button>
              )}
              {/* Drag + arrows for reorder (makes galería vivo y curatable) */}
              {currentUser.photos.length > 1 && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {idx > 0 && (
                    <button onClick={() => reorderGallery(idx, idx-1)} className="bg-black/70 text-white text-[7px] px-0.5 rounded active:bg-[#22c55e]" title="Mover izquierda">←</button>
                  )}
                  {idx < currentUser.photos.length-1 && (
                    <button onClick={() => reorderGallery(idx, idx+1)} className="bg-black/70 text-white text-[7px] px-0.5 rounded active:bg-[#22c55e]" title="Mover derecha">→</button>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Quick native camera add (APK only) - Phase 0 deeper integration */}
      {typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera && (
        <div className="px-4 pt-3">
          <button
            onClick={async () => {
              try {
                const photo = await CapacitorCamera.getPhoto({ quality: 80, allowEditing: true, resultType: 'base64' })
                if (photo?.base64String) {
                  const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
                  const finalUrl = await uploadProfilePhotoIfNeeded(dataUrl)
                  const newPhotos = [...(currentUser.photos || []), finalUrl].slice(0, 6)
                  const updated = { ...currentUser, photos: newPhotos }
                  // Use the real-sync saver (handles local + Firestore for real users)
                  saveUserWithRealSync(updated as any)
                  toast.success('Foto icónica agregada a tu galería', { description: 'Arrastra para elegir cuál es tu portada heroica' })
                  setLastSync(new Date())
                }
              } catch (e) {
                toast('No se pudo usar la cámara (permisos o cancelado)')
              }
            }}
            className="w-full py-2.5 rounded-2xl border border-[#FF671F] text-[#FF671F] text-sm flex items-center justify-center gap-2 active:bg-[#FF671F]/10 hover:border-[#FF671F]/60"
          >
            <span>📷</span> Añadir foto de sesión a mi galería de rendimiento
          </button>
          <div className="text-center text-[9px] text-[#9CA3AF] mt-1">Cámara nativa • hasta 6 fotos • la primera es tu presencia principal en la red</div>
        </div>
      )}

      {/* STORIES / HIGHLIGHTS - IG/FB style but performance-focused to encourage visual content sharing */}
      <div className="px-4 pt-4 pb-2 bg-[#0D0D10]">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[11px] uppercase tracking-[1.5px] text-[#FFD700] font-bold">Tus momentos de rendimiento</div>
          <button 
            onClick={() => muroComposerRef.current?.focus()} 
            className="text-[10px] text-[#FF671F] flex items-center gap-1 active:opacity-80"
          >
            + Agregar momento <span className="text-lg leading-none">→</span>
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-hide">
          {/* Add new highlight/story - big friendly CTA to add content */}
          <div 
            onClick={() => { 
              try { triggerHaptic('medium') } catch {}; 
              muroComposerRef.current?.focus(); 
              setActiveTab('profile'); 
              toast('¡Cuéntale a tu red! +Momentum por posts con foto'); 
            }} 
            className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex flex-col items-center justify-center text-black text-[10px] font-black cursor-pointer active:scale-95 border-2 border-white/30 shadow-lg snap-start"
          >
            <Plus size={22} />
            <span className="text-[8px] -mt-0.5 tracking-widest">NUEVO</span>
          </div>

          {/* Recent highlights from posts + live + syncs - makes it feel alive and social */}
          {(() => {
            const myPosts = (profilePosts[effectiveUserId] || []).slice(0, 5);
            const items = [];
            // Today's live if active
            if (currentUser.trainingNow) {
              items.push({ type: 'live', label: 'LIVE hoy', emoji: '🟢', onClick: () => { setActiveTab('explore'); setShowLiveModal(true); } });
            }
            // Recent syncs or highlights
            myPosts.forEach((p, i) => {
              if (p.photo) {
                items.push({ 
                  type: 'post', 
                  label: p.text?.slice(0,12) || 'Momento', 
                  emoji: '📸', 
                  img: p.photo,
                  onClick: () => setFeedPhotoModal({url: p.photo, postId: p.id}) 
                });
              } else if ((p.text || '').includes('Sync') || (p.text || '').includes('ENTRENASYNC')) {
                items.push({ type: 'sync', label: 'Sync', emoji: '🔄', onClick: () => setActiveTab('profile') });
              }
            });
            // Fallback demo highlights to encourage
            if (items.length < 3) {
              items.push({ type: 'demo', label: 'PR 100kg', emoji: '🏋️', onClick: () => muroComposerRef.current?.focus() });
              items.push({ type: 'demo', label: 'Sync épico', emoji: '⚡', onClick: () => muroComposerRef.current?.focus() });
            }
            return items.slice(0,6).map((item, idx) => (
              <div 
                key={idx} 
                onClick={item.onClick} 
                className="flex-shrink-0 w-16 snap-start cursor-pointer active:scale-95"
              >
                <div className={`w-16 h-16 rounded-full p-[2px] ${item.type === 'live' ? 'bg-[#22c55e] animate-pulse' : 'bg-gradient-to-br from-[#FF671F] via-[#FFD700] to-[#FF4F79]'}`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0D0D10] flex items-center justify-center text-2xl border border-white/10">
                    {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : item.emoji}
                  </div>
                </div>
                <div className="text-center text-[8px] text-[#9CA3AF] mt-1 truncate font-medium">{item.label}</div>
              </div>
            ));
          })()}
        </div>
        <div className="text-[8px] text-center text-[#9CA3AF]/60 -mt-1 mb-1">Toca para ver o crear • tus aliados ven esto en su feed</div>
      </div>

      {/* Quick friendly actions bar - more options, encourages content like IG/FB */}
      <div className="px-4 py-2 bg-[#0D0D10] border-b border-[#2F2F35]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => muroComposerRef.current?.focus()} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl bg-[#FF671F] text-black font-bold active:opacity-90 flex items-center gap-1.5 shadow">
            <Send size={14} /> Publicar en muro
          </button>
          <button onClick={openProfileEditor} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-white/20 text-white active:bg-white/10 flex items-center gap-1.5">
            <Camera size={14} /> Agregar foto
          </button>
          <button onClick={() => { if (currentUser.trainingNow) { /* deactivate */ } else { /* hint activate */ setActiveTab('profile'); toast('Activa Live más abajo para aparecer en el Pulso'); } }} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-[#22c55e]/40 text-[#22c55e] active:bg-[#22c55e]/10 flex items-center gap-1.5">
            🟢 {currentUser.trainingNow ? 'Terminar Live' : 'Ir a Live'}
          </button>
          <button onClick={() => setActiveTab('explore')} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-[#FFD700]/30 text-[#FFD700] active:bg-[#FFD700]/10 flex items-center gap-1.5">
            🔍 Buscar bonds
          </button>
        </div>
      </div>

      {/* Motivator: Build your performance network - remastered unique & attractive */}
      {(!currentUser.photos?.length || (currentUser.photos?.length || 0) < 3 || !currentUser.bio || (profilePosts[effectiveUserId] || []).filter((p:any)=>p.photo).length === 0) && (
        <div className="mx-4 mt-4 p-5 rounded-3xl bg-gradient-to-br from-[#1a160f] via-[#25252A] to-[#1a160f] border border-[#FFD700]/40 shadow-inner">
          <div className="flex items-center gap-2 text-[#FFD700] font-bold mb-1.5 text-sm tracking-wide">
            <span>⭐</span> CONSTRUYE TU LEGADO EN EL GYMPULSE
          </div>
          <p className="text-sm text-[#f5e8c7] mb-3 leading-snug">Tu galería y tus EntrenaSyncs son tu capital único. Hazlos visibles: otros verán tu progreso real y querrán sincronizarse para multiplicar poder.</p>
          <div className="text-[10px] space-y-0.5 mb-4 text-[#9CA3AF]">
            {!currentUser.photos?.length && <div>• Sube tu primera foto de sesión (tu presencia en el mapa)</div>}
            {(currentUser.photos?.length || 0) < 3 && <div>• 3+ fotos = galería de rendimiento que inspira</div>}
            {!currentUser.bio && <div>• Bio con propósito = matches de alto valor</div>}
            {(profilePosts[effectiveUserId] || []).filter((p:any)=>p.photo).length === 0 && <div>• Publica 1 foto de Sync compartido (tu primer ripple)</div>}
          </div>
          <button onClick={() => { setActiveTab('profile'); setTimeout(()=> muroComposerRef.current?.focus(), 60); }} className="w-full py-2.5 text-sm rounded-2xl bg-[#FFD700] text-black font-extrabold active:brightness-90 tracking-wide">CONSTRUIR MI RED DE RENDIMIENTO AHORA</button>
          <button onClick={openProfileEditor} className="mt-2 w-full text-[10px] text-[#9CA3AF] underline active:text-[#FF671F]">Editar perfil completo</button>
        </div>
      )}

      {/* Bio - with quick inline edit for fast tweaks (bypasses full wizard) */}
      <div className="px-4 mt-4">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-1.5">
            <div className="uppercase text-[10px] tracking-[1px] text-[#9CA3AF]">Sobre mí</div>
            <button onClick={openProfileEditor} className="text-[9px] text-[#FF671F] underline">Editar completo</button>
          </div>
          {isEditingBio ? (
            <textarea 
              defaultValue={currentUser.bio || ''} 
              className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded p-2 text-sm" 
              rows={3}
              onBlur={(e) => { 
                const newBio = e.target.value.trim(); 
                if (newBio !== (currentUser.bio||'')) { 
                  const u = {...currentUser, bio: newBio}; 
                  saveUserWithRealSync(u as any); 
                  toast('Bio actualizada'); 
                } 
                setIsEditingBio(false); 
              }}
              autoFocus 
            />
          ) : (
            <div onClick={() => setIsEditingBio(true)} className="text-[15px] leading-snug text-white/95 cursor-pointer active:opacity-80">
              {currentUser.bio || 'Toca para escribir tu bio (por qué entrenas, qué buscas en la red)...'}
              <span className="ml-2 text-[9px] text-[#FF671F]">✎</span>
            </div>
          )}
        </div>
      </div>

      <div className={profileSection !== 'actividad' ? 'hidden' : undefined}>
      <TuRedPowerCard
        networkPower={networkStats?.networkPower || 0}
        bondsCount={Object.keys(syncBonds || {}).length}
        liveStreak={currentUser?.liveStreak || 0}
        level={dailyPulse?.level || 1}
        gadgets={dailyPulse ? getUnlockedGadgets(dailyPulse.level || 1).map((g) => g.icon) : []}
        momentum={dailyPulse?.momentum}
        onAmplifyPulse={() => {
          if (!dailyPulse || (dailyPulse.momentum || 0) < 30) return
          const t = getTodayStr()
          const ap = { ...dailyPulse, pulseAmplifiedDate: t, momentum: (dailyPulse.momentum || 0) - 30 }
          setDailyPulse(ap)
          saveUserWithRealSync({ ...(currentUser as any), pulseAmplifiedDate: t, momentumPoints: ap.momentum } as any)
          toast.success('Pulso amplificado 24h')
        }}
        onProtectStreak={() => {
          if (!dailyPulse || (dailyPulse.momentum || 0) < 50) return
          const t = getTodayStr()
          const pp = { ...dailyPulse, streakProtectedDate: t, momentum: (dailyPulse.momentum || 0) - 50 }
          setDailyPulse(pp)
          saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: t, momentumPoints: pp.momentum } as any)
          toast.success('Racha protegida hoy')
        }}
      />
      </div>

      <ProfileAccountSection {...props} />
      {/* Stats row - premium visual cards + LIVE count as global killer stat in header (urgency / FOMO) */}
      <div className={`px-4 mt-4 grid grid-cols-3 gap-2${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        {[
          { label: 'Matches', value: matches?.length || 0, icon: Heart, color: '#FF671F' },
          { label: 'Sesiones', value: squads?.length || 0, icon: Star, color: '#00C4B4' },
          { label: 'Nivel', value: currentUser.level || '—', icon: Dumbbell, color: '#FF4F79', isText: true, isSquare: true },
          { label: 'Retención', value: dailyPulse?.level || 1, icon: Zap, color: '#FFD700', isText: true, isSquare: true },
          { label: 'Live cerca', value: liveCountForUI, icon: Zap, color: '#22c55e', isLive: true },
          { label: 'Live joins', value: currentUser.liveJoins || 0, icon: Zap, color: '#22c55e' },
          { label: 'Syncs', value: (currentUser as any).syncStreak || 0, icon: Users, color: '#22c55e' }
        ].map((stat: any, i) => (
          <div 
            key={i} 
            onClick={stat.isLive && liveTrainingNow.length > 0 ? () => { setActiveTab('explore'); setShowLiveModal(true); } : undefined}
            className={`card p-2 text-center rounded-2xl flex flex-col items-center justify-center min-h-[72px] ${stat.isSquare ? 'aspect-square' : ''} ${stat.isLive && liveTrainingNow.length > 0 ? 'cursor-pointer active:scale-95 border border-[#22c55e]/60 ring-1 ring-[#22c55e]/20 shadow-sm shadow-[#22c55e]/10' : ''} ${stat.isLive ? 'relative' : ''}`}
          >
            <stat.icon size={14} className="mb-0.5" style={{ color: stat.color }} />
            {stat.isText ? (
              <div className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/10 border border-white/10" style={{ color: stat.color }}>{stat.value}</div>
            ) : (
              <div className="stat-number text-lg leading-none font-semibold" style={{ color: stat.color }}>{stat.value}</div>
            )}
            <div className="text-[7.5px] text-[#9CA3AF] mt-0.5 font-medium tracking-[0.5px]">{stat.label}</div>
            {stat.isLive && liveTrainingNow.length > 0 && (
              <div className="text-[6.5px] text-[#22c55e] mt-0.5 flex items-center gap-1">
                ¡Ver ahora! 
                <div className="w-1 h-1 bg-[#22c55e] rounded-full" style={{animation: 'live-pulse-green 1.5s ease-in-out infinite'}}></div>
              </div>
            )}
            {stat.isLive && liveTrainingNow.length === 0 && (
              <div className="text-[6.5px] text-[#9CA3AF] mt-0.5">¡Sé el primero!</div>
            )}
          </div>
        ))}
      </div>

      {/* NEW: "Mi vida de entrenamiento" summary card - makes the whole profile feel VIVO y ATRACTIVO at a glance */}
      <div className={`px-4 mt-3${profileSection !== 'actividad' ? ' hidden' : ''}`}>
        <div className="card p-4 border border-[#FF671F]/20 bg-gradient-to-br from-[#1a140f] to-[#0D0D10]">
          <div className="uppercase text-[9px] tracking-[1.5px] text-[#FF671F] mb-1">Tu vida de entrenamiento</div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-2xl font-black text-white">{currentUser.liveStreak || 0}<span className="text-xs align-super text-[#22c55e]">d</span> + {currentUser.joinedLiveStreak || 0}<span className="text-xs align-super text-[#22c55e]">d</span></div>
              <div className="text-[#9CA3AF] text-xs -mt-1">streak host + join</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#FFD700]">{Object.keys(syncBonds).length} socios RED</div>
              <div className="text-[10px] text-[#9CA3AF]">tu grafo • Network Power {networkStats.networkPower}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#22c55e]">{(currentUser as any).syncStreak || 0}</div>
              <div className="text-[10px] text-[#9CA3AF]">syncs</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#FFD700]">{(profilePosts[effectiveUserId] || []).filter((p: any) => (p.text || '').includes('ENTRENASYNC') || (p.text || '').includes('HIGHLIGHT')).length}</div>
              <div className="text-[10px] text-[#9CA3AF]">EntrenaSyncs completados</div>
            </div>
          </div>
          {currentUser.trainingNow && (
            <div className="mt-2 text-[11px] bg-[#22c55e]/10 text-[#22c55e] px-2 py-1 rounded text-center font-medium">Estás en vivo ahora — tu muro está caliente 🔥</div>
          )}
          {/* NEW: Personal Vibe Score - composite from streaks + bonds + live activity for "alive" feel. Now truly VIVO: bonuses if your bond partners are live right now. */}
          {(() => {
            const liveBondBonus = Object.keys(syncBonds).reduce((acc, pid) => {
              const partnerLive = liveTrainingNow.some(u => u.id === pid && u.trainingNow);
              return acc + (partnerLive ? 12 : 0);
            }, 0);
            const vibe = Math.min(100, Math.round(
              ((currentUser.liveStreak || 0) * 5) + 
              ((currentUser.joinedLiveStreak || 0) * 3) + 
              (Object.keys(syncBonds).length * 8) + 
              ((currentUser.liveJoins || 0) * 0.5) +
              liveBondBonus
            ));
            return (
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Vibe Score</span>
                <span className="font-black text-[#FF671F] text-lg tabular-nums">{vibe}</span>
                <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden ml-2">
                  <div className={`h-1.5 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] transition-all ${liveBondBonus > 0 || currentUser.trainingNow ? 'vibe-bar-live' : ''}`} style={{width: `${vibe}%`}} />
                </div>
                {liveBondBonus > 0 && <span className="ml-1 text-[8px] text-[#22c55e] animate-pulse">+{liveBondBonus} live bonds 🔥</span>}
              </div>
            );
          })()}

          {/* ULTRA VIVO: Live bonds right now - if any of your EntrenaSync legends are training live, show them with instant re-sync CTA. Makes bonds feel alive and valuable. */}
          {Object.keys(syncBonds).length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="text-[8px] uppercase tracking-[1px] text-[#FFD700]/80 mb-1">🔥 TU RED EN VIVO AHORA — re-sync = +Network Power + resultados que se propagan</div>
              <div className="flex flex-wrap gap-1">
                {liveTrainingNow.filter((u: any) => Object.keys(syncBonds).includes(u.id)).slice(0, 3).map((livePartner: any) => (
                  <button
                    key={livePartner.id}
                    onClick={() => { try { triggerHaptic('medium') } catch {}; startSyncWith(livePartner.id, livePartner.name || livePartner.nombre) }}
                    className="text-[8px] px-2 py-0.5 bg-[#FFD700]/20 hover:bg-[#FFD700]/30 text-[#FFD700] rounded-full active:scale-[0.95] transition flex items-center gap-1 border border-[#FFD700]/50 font-medium"
                  >
                    <span>{(livePartner.name || livePartner.nombre || '?').split(' ')[0]}</span> <span className="text-[6px] opacity-70">LV{syncBonds[livePartner.id]?.bondLevel || 1}</span>
                    <span className="text-[7px] opacity-80">🔄 Re-sync (sube Network Power)</span>
                  </button>
                ))}
                {liveTrainingNow.filter((u: any) => Object.keys(syncBonds).includes(u.id)).length === 0 && (
                  <span className="text-[8px] text-[#9CA3AF]/70">Ninguno de tus legends está entrenando ahora</span>
                )}
              </div>
            </div>
          )}

          {/* Vibe History Visual - makes "stats de bonds en vivo" tangible and pretty. Simple bar sparkline of recent vibe sources. */}
          <div className="mt-2 pt-1.5 border-t border-white/10">
            <div className="text-[8px] text-[#9CA3AF] mb-1 flex items-center justify-between">
              <span>Historial Vibe (fuentes recientes)</span>
              <span className="text-[#FF671F]/70">en vivo</span>
            </div>
            <div className="flex items-end gap-1 h-6">
              {[
                { label: 'Host', val: Math.min(100, (currentUser.liveStreak || 0) * 8) },
                { label: 'Join', val: Math.min(100, (currentUser.joinedLiveStreak || 0) * 12) },
                { label: 'Bonds', val: Math.min(100, Object.keys(syncBonds).length * 15) },
                { label: 'Live+', val: Math.min(100, (currentUser.liveJoins || 0) * 4) },
                { label: 'Actual', val: Math.min(100, liveTrainingNow.some(u => Object.keys(syncBonds).includes(u.id)) ? 90 : 40) }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-white/10 rounded-t overflow-hidden" style={{height: `${Math.max(4, bar.val / 2)}px`}}>
                    <div className={`h-full bg-gradient-to-t from-[#FF671F] to-[#FF4F79] transition-all duration-300 ${currentUser.trainingNow ? 'vibe-bar-live' : ''}`} style={{height: '100%', width: '100%'}} />
                  </div>
                  <div className="text-[6px] text-[#9CA3AF] mt-0.5 leading-none">{bar.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
      <ProfileDailyPulseSection {...props} />

      {/* Actividad reciente en tu muro - hace el perfil VIVO y atractivo */}
      {(() => {
        const myPosts = profilePosts[effectiveUserId] || [];
        if (myPosts.length === 0) return null;
        const recent = [];
        myPosts.forEach(post => {
          (post.likes || []).slice(-3).forEach(uid => {
            const p = [...realProfiles, ...SEED_PROFILES].find(pp => pp.id === uid);
            if (p) recent.push({type: 'like', name: p.name, text: '❤️ tu post'});
          });
          (post.comments || []).slice(-3).forEach(c => {
            const p = [...realProfiles, ...SEED_PROFILES].find(pp => pp.id === c.userId);
            if (p) recent.push({type: 'comment', name: p.name, text: '💬 ' + (c.text||'').slice(0,25)});
          });
        });
        if (recent.length === 0) return null;
        const sorted = recent.sort(() => Math.random() - 0.5).slice(0,5); // shuffle for freshness
          return (
            <div className={`px-4 mt-3${profileSection !== 'actividad' ? ' hidden' : ''}`}>
            <div className="text-[9px] uppercase tracking-widest text-[#9CA3AF] mb-1 flex items-center gap-1">💥 ACTIVIDAD RECIENTE EN TU MURO <span className="text-[#22c55e] text-[8px]">¡vivo!</span></div>
            <div className="card p-2.5 text-[10px] space-y-1 bg-gradient-to-r from-black/5 to-transparent">
              {sorted.map((r,i) => <div key={i} className="flex items-center gap-1.5 text-[#9CA3AF]"><span className="font-medium text-white/80">{r.name}</span> {r.text}</div>)}
            </div>
            <div className="text-[8px] text-center text-[#9CA3AF]/60 mt-1">La comunidad interactúa con vos — ¡sigue posteando para más FOMO!</div>
          </div>
        );
      })()}

      {/* YOUR TRAINING NETWORK — the social graph of real synchronized performance.
         This is the heart of EntrenaMatch as the first fitness social network:
         your alliances have real history, generate measurable results, and create visible status in the community. */}
      {Object.keys(syncBonds).length > 0 && (
        <div className={`px-4 mt-3${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
          <div className="text-[10px] uppercase tracking-[1px] text-[#9CA3AF] mb-1.5 flex items-center gap-1">🔥 TU RED DE ENTRENASYNC <span className="text-[8px] normal-case opacity-60">(tu grafo de rendimiento sincronizado — alianzas que generan resultados reales y estatus en la comunidad)</span></div>
          {/* Spectacular visual power meter for profile */}
          <div className="mb-3 h-2 bg-[#1C1C20] rounded-full overflow-hidden border border-[#FFD700]/20">
            <div className="h-2 bg-gradient-to-r from-[#FFD700] via-[#FF671F] to-[#22c55e] transition-all" style={{width: `${Math.min(100, Math.max(5, networkStats.networkPower))}%`}} />
          </div>
          {/* Network summary — epic social graph value. This is what makes EntrenaMatch the first real fitness social network: your sync alliances are a visible, compounding performance asset. */}
          <div className="mb-2 px-0.5">
            <div className="text-[11px] font-bold text-[#FFD700] mb-0.5">Network Power: {networkStats.networkPower} — tu red de sync te hace más fuerte, más consistente y más visible</div>
            {networkStats.networkPower > 30 && <div className="text-[8px] text-[#22c55e] mt-0.5">¡Tu red te da prioridad en el GymPulse del mapa, recomendaciones de alto rendimiento y +visibilidad global entre GymPartners!</div>}
            <div className="text-[9px] text-[#22c55e]">
              {networkStats.numPartners} socios • {networkStats.totalMin}min sincronizados • {networkStats.totalSessions} sesiones • Impacto colectivo en tu rendimiento: +{networkStats.estimatedImpact}%
            </div>
            <div className="mt-1 text-[8px] text-[#FFD700]/80">Tu red esta semana: ~{Math.floor(networkStats.totalMin / 4)} min de alto rendimiento compartido • Esto genera ondas que otros ven en el GymPulse global.</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(syncBonds).slice(0,4).map(([pid, b]: any) => {
              const p = [...realProfiles, ...SEED_PROFILES].find(pp => pp.id === pid)
              const flames = '🔥'.repeat(Math.max(1, b.bondLevel || 1))
              const progress = Math.min(100, Math.round(((b.totalMin || 0) / 120) * 100))
              const partnerImpact = Math.floor((b.totalMin || 0) / 6) // estimated % boost from this specific alliance
              return (
                <div key={pid} className="legend-card rounded-2xl p-3 text-xs flex gap-3 items-center active:scale-[0.985] border border-[#FF671F]/20 hover:border-[#FF671F]/50 transition-all" onClick={() => { const prof = p; if (prof) setShowFullProfile(prof as any); else toast('Compa no disponible ahora') }}>
                  <div className="w-10 h-10 rounded-full bg-[#1C1C20] overflow-hidden ring-2 ring-[#FF671F]/40 flex-shrink-0 relative">
                    {p?.photos?.[0] ? <img src={p.photos[0]} className="w-full h-full object-cover" /> : <div className="text-center text-xl pt-1.5">{(p?.name||'?')[0]}</div>}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center text-[8px] ring-1 ring-[#0D0D10]">🔄</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white/95 truncate flex items-center gap-1">{p?.name || 'Socio'} <span className="text-[8px] text-[#FF671F] font-mono">LV{b.bondLevel}</span>{liveTrainingNow.some(u => u.id === pid && u.trainingNow) && <span className="ml-1 text-[7px] px-1 bg-[#22c55e] text-black rounded font-bold animate-pulse">EN VIVO</span>}</div>
                    <div className="text-[9px] text-[#9CA3AF]">{b.totalMin}min • {b.sessions} sesiones • {b.avgRating}★ • <span className="text-[#22c55e]">tu Network Power sube con esta alianza</span></div>
                    <div className="legend-flame text-[12px] leading-none mt-0.5">{flames}</div>
                    {/* Visual bond progress bar */}
                    <div className="mt-1 h-1 bg-white/10 rounded overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] transition-all" style={{width: `${progress}%`}} />
                    </div>
                    <div className="text-[7px] text-[#9CA3AF]/70 mt-px">Nivel {b.bondLevel} • {progress}% al siguiente</div>
                    {/* Real value from this alliance — the social graph has teeth. This partner is actively boosting your performance. */}
                    <div className="text-[8px] font-medium text-[#22c55e] mt-0.5">+{partnerImpact}% en tu rendimiento por esta alianza 🔥</div>
                    {p && <button onClick={(e)=>{e.stopPropagation(); tryAutoStartSync(p.id, p.name)}} className="mt-1 text-[7px] px-1 py-px bg-[#22c55e]/10 text-[#22c55e] rounded active:bg-[#22c55e]/30">🔄 Re-sync ahora</button>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-[8px] text-center text-[#22c55e]/60 mt-1">Re-sync para subir tu Network Power, fortalecer alianzas y desbloquear prioridad en el mapa + mejores recomendaciones de alto rendimiento</div>
          {Object.keys(syncBonds).length > 4 && (
            <div className="text-center mt-1">
              <button onClick={() => setActiveTab('profile')} className="text-[8px] text-[#FF671F] underline">Ver toda tu red ({Object.keys(syncBonds).length} socios) →</button>
            </div>
          )}
          <div className="text-center mt-1 text-[7px] text-[#FFD700]/60">Tu red de EntrenaSync es tu capital más valioso. Cuanto más sincronizas, más fuerte te haces — y más te ven los demás.</div>
          <div className="text-center mt-1 flex gap-2 justify-center">
            <button onClick={() => setActiveTab('explore')} className="text-[8px] px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] rounded active:bg-[#22c55e]/20">Explora más socios para expandir tu red →</button>
            <button 
              onClick={() => {
                const msg = `🔥 Entreno en EntrenaMatch con mis GymPartners. Syncs reales dan +Network Power, prioridad en el GymPulse y resultados que se propagan. ¿Entrenamos juntos? https://musclegrenadechile.github.io/entrenamatch/`;
                navigator.clipboard?.writeText(msg).then(() => toast.success('Mensaje copiado', { description: 'Comparte con tu red para invitarlos a construir el grafo de alto rendimiento.' })).catch(() => toast('Invita a tu red abriendo el app con ellos.'));
              }}
              className="text-[8px] px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] rounded active:bg-[#FFD700]/30 font-medium"
            >
              Invitar a tu red (copiar link)
            </button>
          </div>
        </div>
      )}

      {/* Live streak badge - killer retention stat, shows when active */}
      {(currentUser.liveStreak && currentUser.liveStreak > 0) || (currentUser.joinedLiveStreak && currentUser.joinedLiveStreak > 0) ? (
        <div className="px-4 -mt-2 mb-1 text-center">
          <span className="inline-block bg-[#22c55e]/10 text-[#22c55e] text-xs px-3 py-0.5 rounded-full font-bold">
            🔥 {currentUser.liveStreak || 0}d host {currentUser.joinedLiveStreak ? `+ ${currentUser.joinedLiveStreak}d join` : ''} streak — ¡sigue así!
          </span>
        </div>
      ) : null}

      {/* Training Types - visual polish */}
      <div className={`px-4 mt-5${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#9CA3AF] mb-2 px-1">
          <Dumbbell size={13} /> Tipos de entrenamiento
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentUser.trainingTypes || []).length > 0 ? (
            currentUser.trainingTypes.map((t: string) => <div key={t} className="chip chip-active text-xs px-3.5 py-1.5">{t}</div>)
          ) : <span className="text-xs text-[#9CA3AF]">Sin tipos seleccionados</span>}
        </div>
      </div>

      {/* Goals */}
      <div className={`px-4 mt-4${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#9CA3AF] mb-2 px-1">
          <Star size={13} /> Objetivos
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentUser.goals || []).length > 0 ? (
            currentUser.goals.map((g: string) => <div key={g} className="chip chip-health text-xs px-3.5 py-1.5">{g}</div>)
          ) : <span className="text-xs text-[#9CA3AF]">Sin objetivos aún</span>}
        </div>
      </div>

      {/* Availability + Disponible hoy - nicer toggle visual */}
      <div className={`px-4 mt-4 card p-4 space-y-3${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        <div className="flex justify-between text-sm items-center">
          <span className="text-[#9CA3AF] flex items-center gap-1.5"><Clock size={14} /> Disponibilidad</span>
          <span className="text-right text-white/90 text-xs">{(currentUser.availability || []).join(' • ') || 'No especificada'}</span>
        </div>
        <div>
          <button 
            onClick={() => {
              const newVal = !currentUser.availableToday
              const updated = { ...currentUser, availableToday: newVal }
              saveUserWithRealSync(updated as CurrentUser)
              toast(newVal ? '¡Marcado como disponible hoy!' : 'Disponibilidad actualizada')
            }}
            className={`w-full py-3 rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 ${currentUser.availableToday ? 'bg-[#10B981] text-black' : 'bg-[#1C1C20] border border-[#2F2F35] text-white'}`}
          >
            {currentUser.availableToday ? '✓ Disponible para entrenar hoy' : 'Marcar como disponible hoy'}
          </button>
          <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">Otros usuarios te verán en el filtro “Solo disponibles hoy”</div>
        </div>
      </div>

      {/* Google Play Integrity - working with the Google app (Play Integrity API) */}
      <div className={`px-4 mt-2${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        <div className="card p-5 border border-[#22c55e]/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-semibold text-sm flex items-center gap-2"><span>🛡️</span> Google Play Integrity</div>
            <div className="text-[9px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">Android + Play Store</div>
          </div>
          <p className="text-xs text-[#9CA3AF] mb-3">
            Verifica app oficial (PLAY_RECOGNIZED), licencia (LICENSED) y dispositivo íntegro. 
            Pega aquí el nonce de tu "prueba de integridad" creada en Play Console para obtener veredictos específicos de prueba (ej. MEETS_DEVICE_INTEGRITY).
            En web y pruebas el live funciona sin verificación; en APK de producción se recomienda integridad positiva.
          </p>
          <div className="text-[10px] text-[#9CA3AF] mb-2">
            Detección actual: <span className="font-mono">{Capacitor.isNativePlatform() ? 'Nativa (APK real)' : 'Web (simulado)'}</span> — debe ser Nativa en la APK instalada. (Ver logs: [Play Integrity] isNativePlatform())
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={testIntegrityNonce}
              onChange={(e) => setTestIntegrityNonce(e.target.value)}
              placeholder="Nonce de prueba de la consola (opcional, para veredictos específicos)"
              className="w-full form-input text-xs py-2"
            />
            <button
              onClick={() => checkPlayIntegrity(true)}
              disabled={integrityChecking}
              className="w-full py-2.5 rounded-2xl text-sm font-semibold bg-[#22c55e] text-black active:bg-[#16a34a] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {integrityChecking ? 'Verificando con Google...' : 'Verificar integridad ahora con Google Play'}
            </button>
            {testIntegrityNonce.trim() && (
              <div className="text-[9px] text-[#9CA3AF]">Usando nonce de prueba — obtendrás el veredicto específico que configuraste en la consola.</div>
            )}
          </div>

          {lastIntegrity && (
            <div className="mt-3 text-[10px] bg-[#111113] p-3 rounded-2xl border border-[#2F2F35]">
              {lastIntegrity.token && (
                <>
                  <div className="text-[#22c55e] font-medium">✅ Token obtenido de Google</div>
                  <div className="text-[#9CA3AF] mt-1 break-all font-mono text-[8px] max-h-12 overflow-auto">{lastIntegrity.token}</div>
                  <div className="text-[#9CA3AF] mt-1">Cópialo y envíalo a un backend para decodificar → obtienes el JSON completo con veredictos (como el que me diste).</div>
                </>
              )}
              {lastIntegrity.simulatedVerdict && (
                <>
                  <div className="text-amber-400 font-medium">🌐 Resultado simulado (web / PWA)</div>
                  <div className="text-[#9CA3AF] mt-1">En la APK nativa instalada desde Play obtendrás un token real. El simulado es positivo:</div>
                  <div className="text-[9px] mt-1 text-[#cbd5e1]">LICENSED + PLAY_RECOGNIZED + MEETS_DEVICE_INTEGRITY</div>
                </>
              )}
              {lastIntegrity.error && (
                <div className="text-red-400">Error: {lastIntegrity.error}</div>
              )}
              <button onClick={() => { console.log('Last full integrity object:', lastIntegrity); toast('Resultado completo en consola del navegador (F12)'); }} className="mt-2 text-[9px] underline text-[#FF671F]">Ver objeto completo en consola</button>
            </div>
          )}

          <div className="text-[9px] text-[#9CA3AF] mt-2">
            Package esperado: <span className="font-mono text-[#22c55e]">com.entrenamatch.app</span>. 
            El JSON que me pasaste usaba placeholder "com.package.name" — en la app real usamos el correcto.
          </div>
        </div>
      </div>

      {/* Entrenando Ahora - KILLER FEATURE real-time, live green indicator near you. Generates urgency, no other fitness app has it this well. */}
      <div className={`px-4 mt-2 card p-4 space-y-3${profileSection !== 'rendimiento' ? ' hidden' : ''}`}>
        <div>
          {currentUser.trainingNow ? (
            /* Clear deactivation option when live - explicit "terminar de entrenar" */
            <>
              <div className="mb-2 px-3 py-1.5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/40 flex items-center gap-2">
                <div className="text-[#22c55e] font-extrabold text-sm tracking-tight">🟢 ESTÁS ENTRENANDO EN VIVO EN EL GYMPULSE</div>
              </div>
              <button 
                onClick={() => toggleLiveTraining('off')}
                disabled={isTogglingLive}
                className="btn-live w-full py-3.5 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm bg-[#E11D48] text-white ring-1 ring-[#E11D48]/60 active:brightness-90 active:scale-[0.985]"
              >
                {isTogglingLive ? '⚡ Finalizando sesión...' : '⏹️ TERMINAR ENTRENAMIENTO Y DESACTIVAR VIVO'}
              </button>
              <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">
                Al terminar, se quita tu marcador del mapa en tiempo real, se calcula tu duración y se suman puntos de Momentum + rachas.
              </div>
            </>
          ) : (
            /* Activate button when not live */
            <button 
              onClick={() => toggleLiveTraining('on')}
              disabled={isTogglingLive}
              className={`btn-live w-full py-3.5 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${isTogglingLive ? 'opacity-70 cursor-wait' : ''} bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black ring-1 ring-[#22c55e]/60 active:brightness-90 active:scale-[0.985]`}
            >
              {isTogglingLive ? '⚡ Sincronizando en el GymPulse...' : 'Activar "Entrenando Ahora (EN VIVO)"'}
            </button>
          )}

          {/* Common description and links */}
          <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">
            {currentUser.trainingNow 
              ? 'Cuando termines de entrenar, usa el botón de arriba para desactivar tu presencia en el mapa del GymPulse.'
              : 'Al activar apareces en el mapa en tiempo real (GymPulse). Usuarios cerca te ven entrenando y sienten urgencia real (FOMO) de unirse o hacer sync contigo.'}
          </div>
          <button onClick={() => setActiveTab('explore')} className="mt-2 w-full text-xs text-[#22c55e] underline active:opacity-70">Ver el mapa en tiempo real y quién está live cerca →</button>
          {currentUser.trainingNow && ((currentUser.liveStreak || 0) + (currentUser.joinedLiveStreak || 0) + (currentUser.liveJoins || 0) > 0) && (
            <div className="text-[9px] text-center text-[#22c55e] mt-1 font-medium">🔥 {currentUser.liveStreak || 0}d host streak + {currentUser.joinedLiveStreak || 0}d join • {currentUser.liveJoins || 0} total live joins recibidos</div>
          )}
        </div>

        {/* EntrenaSync — compact teaser (full immersive Arena is a fixed overlay) */}
        {currentUser.trainingNow && syncPartnerId && !showSyncArena && (
          <button
            type="button"
            onClick={() => setShowSyncArena(true)}
            className="mt-3 w-full text-left sync-arena-compact p-3 border border-[#22c55e]/40 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-black text-[#22c55e] tracking-wide">
                  🔄 Pista compartida activa
                </p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  {syncVibe}% vibe · {syncStartedAt ? Math.floor((Date.now() - syncStartedAt) / 60000) : 0} min con{' '}
                  {(realProfiles.find((p) => p.id === syncPartnerId)?.name || 'tu compañero').split(' ')[0]}
                </p>
              </div>
              <span className="text-[10px] px-3 py-1.5 rounded-full bg-[#22c55e] text-black font-bold shrink-0">
                Abrir Arena
              </span>
            </div>
            {liveTrainingNow.length > 0 && (
              <p className="text-[9px] text-[#FF671F]/90 mt-2">
                🌊 {liveTrainingNow.length} personas live cerca sienten el pulso del GymPulse
              </p>
            )}
          </button>
        )}

        {/* Live activity / recent joiners when you are the one training (spectacular feedback loop) */}
        {currentUser.trainingNow && (() => {
          const myPosts = profilePosts[effectiveUserId] || [];
          const livePost = myPosts.find((p: any) => (p.text || '').toLowerCase().includes('entrenando ahora')) || myPosts[0];
          if (!livePost || ((livePost.comments || []).length + (livePost.likes || []).length) === 0) return null;
          const recent = [...(livePost.comments || []), ...(livePost.likes || []).map((id: string) => {
            const prof = [...realProfiles, ...SEED_PROFILES].find(p => p.id === id);
            return { userId: id, userName: prof?.name || 'Compañero', isLike: true };
          })].slice(-3).reverse();
          return (
            <div className="mt-3 pt-3 border-t border-[#2F2F35]">
              <div className="text-[9px] text-[#22c55e] mb-1 flex items-center gap-1">🔥 Actividad en tu live ahora <span className="text-[#9CA3AF]">(de tu post "Entrenando ahora")</span></div>
              <div className="space-y-1">
                {recent.map((c: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] bg-[#1C1C20] px-2 py-1 rounded-xl border border-[#22c55e]/10 hover:border-[#22c55e]/40 transition cursor-pointer active:bg-[#25252A]" onClick={() => {
                    const joiner = [...realProfiles, ...SEED_PROFILES].find(p => p.id === c.userId);
                    if (joiner) setShowFullProfile(joiner as any); else setActiveTab('home');
                  }}>
                    <span className="font-medium text-white/95">{c.userName || 'Compañero'}</span> <span className="text-[#22c55e]">{c.isLike ? '❤️ dio like' : '💬 ' + (c.text || '').substring(0,28)}</span>
                    <span className="ml-auto text-[#9CA3AF] text-[8px]">ver →</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <ProfileMuroSection {...props} />
      {/* Subtle logout at the very bottom of Profile (non-blocking, after all content) */}
      <div className="px-4 pb-8 pt-2 text-center">
        <div className="text-[10px] text-[#6B7280] mb-1">v{APP_VERSION} • Phase 0 real</div>
        <div className="text-[10px] text-[#9CA3AF] mb-1 flex justify-center gap-2">
          <a href="/entrenamatch/privacy.html" target="_blank" className="underline active:text-[#FF671F]">Privacidad</a>
          <span>·</span>
          <a href="/entrenamatch/terms.html" target="_blank" className="underline active:text-[#FF671F]">Términos</a>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-xs text-[#9CA3AF] active:text-[#f87171] underline"
        >
          Cerrar sesión / Cambiar de cuenta
        </button>
      </div>
    </div>
  )
}
