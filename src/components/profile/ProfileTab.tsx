// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Download, Dumbbell, Edit2, Heart, Mic, Pause, Play, RefreshCw, Send, Star, User, Users, Zap,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { APP_VERSION } from '../../constants'
import { ProfileSectionNav } from './ProfileSectionNav'
import { TuRedPowerCard } from './TuRedPowerCard'
import type { ProfileSection } from './ProfileSectionNav'

/** Context bag passed from App — typed loosely until App.tsx drops @ts-nocheck */
export type ProfileTabProps = Record<string, any>

export function ProfileTab(props: ProfileTabProps) {
  const p = props
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
    toggleLikePost,
    addReactionToPost,
    activeComment,
    commentDraft,
    setCommentDraft,
    openFullComments,
    submitComment,
    cancelComment,
    deleteCommentFromPost,
    isEditingBio,
    setIsEditingBio,
    editBioDraft,
    setEditBioDraft,
    saveBioEdit,
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
    requestWebNotificationPermission,
    requestNativePushPermission,
    PushNotifications,
    notifPrefs,
    setNotifPrefs,
    setShowPwaInstall,
  } = p

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

      {/* In-app debug logs export (phone-only crash reporting, no adb/PC needed) */}
      <div className={`px-4 mt-3${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <details className="card p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-[#FF671F]">🐛 Debug logs (para reportar crashes desde el celular)</summary>
          <div className="mt-2 max-h-40 overflow-auto text-[#9CA3AF] font-mono text-[10px] bg-black/30 p-2 rounded">
            {debugLogsRef.current.length ? debugLogsRef.current.map((l,i) => <div key={i}>{l}</div>) : <div>Sin logs aún. Se capturan en login, sync, publish, errores...</div>}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => {
              const txt = debugLogsRef.current.join('\n')
              navigator.clipboard?.writeText(txt).then(()=>toast.success('Logs copiados'))
            }} className="text-[10px] px-2 py-1 bg-[#25252A] rounded border border-[#FF671F]/30">Copiar al portapapeles</button>
            <button onClick={() => {
              const txt = debugLogsRef.current.join('\n')
              if ((navigator as any).share) (navigator as any).share({title:'EntrenaMatch debug logs', text: txt})
              else navigator.clipboard?.writeText(txt).then(()=>toast('Copiado (usa compartir manual)'))
            }} className="text-[10px] px-2 py-1 bg-[#25252A] rounded border border-[#FF671F]/30">Compartir</button>
            <button onClick={() => { debugLogsRef.current = []; /* force re-render via state if needed */ toast('Logs limpiados') }} className="text-[10px] px-2 py-1 bg-[#25252A] rounded border border-white/10">Limpiar</button>
          </div>
          <div className="text-[9px] text-[#9CA3AF]/60 mt-1">Útil para Samsung Members / bug report. Incluye login, sync actions, publishes, crashes.</div>
        </details>
      </div>

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
           GYMPULSE DIARIO - The daily habit engine with your GymPartners
           Innovative, attractive, tied to the graph: streaks that matter, 
           personalized challenges that drive real syncs/voice/map impact,
           Momentum as spendable network currency.
           Strong reasons to open daily + intelligent hooks.
      ===================================================== */}
      {dailyPulse && (
        <motion.div 
          className={`px-4 mt-4${profileSection !== 'rendimiento' ? ' hidden' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#0f0a08] via-[#1a140f] to-[#0D0D10] border border-[#FF671F]/30 p-4 shadow-inner hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[#FF671F] text-[10px] font-bold tracking-[1px] uppercase">EL GYMPULSE DE TUS GYMPARTNERS</div>
                <div className="text-white text-xl font-black tracking-[-0.5px]">GymPulse Diario</div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="text-xs text-[#FFD700]">NIVEL {dailyPulse.level || 1}</div>
                  <div className="text-[10px] text-[#9CA3AF]">Retención</div>
                </div>
                <div>
                  <div className="momentum-number tabular-nums">{dailyPulse.momentum}</div>
                  <div className="text-[9px] text-[#9CA3AF] -mt-1 font-medium tracking-widest">MOMENTUM</div>
                </div>
              </div>
            </div>

            {/* Multi-streaks - attractive flames (enhanced with Voice + Pulse for more daily hooks) */}
            <div className="flex gap-1.5 mb-3">
              <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#22c55e]/20">
                <div className="text-lg font-black text-[#22c55e] flex items-center justify-center gap-0.5">🔥{dailyPulse.trainingStreak}</div>
                <div className="text-[8px] text-[#9CA3AF] font-medium">Train</div>
              </div>
              <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#FF671F]/20">
                <div className="text-lg font-black text-[#FF671F] flex items-center justify-center gap-0.5">🔗{dailyPulse.synergyStreak}</div>
                <div className="text-[8px] text-[#9CA3AF] font-medium">Synergy</div>
              </div>
              <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#EAB308]/30 ring-1 ring-inset ring-[#EAB308]/10">
                <div className="text-lg font-black text-[#EAB308] flex items-center justify-center gap-0.5">🎙️{dailyPulse.voiceStreak || 0}</div>
                <div className="text-[8px] text-[#EAB308]/90 font-medium tracking-wide">VOICE RITUAL</div>
              </div>
              <div className="flex-1 bg-black/40 rounded-2xl p-2 text-center border border-[#06B6D4]/20">
                <div className="text-lg font-black text-[#06B6D4] flex items-center justify-center gap-0.5">🗺️{dailyPulse.pulseStreak || 0}</div>
                <div className="text-[8px] text-[#9CA3AF] font-medium">Pulse</div>
              </div>
            </div>
            <div className="text-[8px] text-[#FFD700] -mt-2 mb-2 text-center">Récord: {Math.max(dailyPulse.longestTraining || 0, dailyPulse.longestSynergy || 0, dailyPulse.longestVoice || 0, dailyPulse.longestPulse || 0)}d</div>

            {/* Prominent status badges for protection / amplify (makes the spend feel real + visual payoff) */}
            {(dailyPulse.streakProtectedDate === getTodayStr() || dailyPulse.pulseAmplifiedDate === getTodayStr()) && (
              <div className="flex gap-2 justify-center mb-2">
                {dailyPulse.streakProtectedDate === getTodayStr() && <span className="status-protected">🛡️ PROTEGIDO HOY</span>}
                {dailyPulse.pulseAmplifiedDate === getTodayStr() && <span className="status-amplified">📡 AMPLIFICADO</span>}
              </div>
            )}

            {/* Level progress - powerful retention visual */}
            <div className="mb-3">
              <div className="flex justify-between text-[8px] mb-1">
                <span>NIVEL {dailyPulse.level || 1}</span>
                <span className="tabular-nums">{dailyPulse.xp || 0}/300 XP</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#FFD700] to-[#FF671F]" style={{width: `${((dailyPulse.xp || 0) / 300) * 100}%`}} />
              </div>
              <div className="text-[7px] text-[#9CA3AF] mt-0.5">Entrena más → +XP → sube de nivel y desbloquea GADGETS exclusivos (mapa, sync, ripples...)</div>
            </div>

            {/* Gadgets exclusivos - fuerte motivador de retención visual (mientras más entrenes, más efectos únicos) */}
            {dailyPulse && getUnlockedGadgets(dailyPulse.level || 1).length > 0 && (
              <div className="mb-3">
                <div className="text-[8px] text-[#FFD700] font-bold mb-1">🎁 GADGETS DESBLOQUEADOS</div>
                <div className="flex gap-1 flex-wrap">
                  {getUnlockedGadgets(dailyPulse.level || 1).map((g, i) => (
                    <div key={i} className="text-[9px] bg-black/40 border border-[#FFD700]/30 rounded px-1.5 py-0.5 flex items-center gap-1" title={g.desc}>
                      <span>{g.icon}</span> <span className="font-medium text-white/90">{g.name}</span>
                    </div>
                  ))}
                </div>
                {getNextGadget(dailyPulse.level || 1) && (
                  <div className="text-[7px] text-[#9CA3AF] mt-0.5">Siguiente: {getNextGadget(dailyPulse.level || 1)!.name} (nivel {getNextGadget(dailyPulse.level || 1)!.level})</div>
                )}
              </div>
            )}

            {/* Misión Diaria / Daily Challenge - more potent retention */}
            {dailyPulse.currentChallenge && (
              <div className="bg-[#0D0D10] border border-[#FF671F]/40 rounded-2xl p-3 mb-2">
                <div className="flex items-start gap-3">
                  <div className="text-3xl mt-0.5">{dailyPulse.currentChallenge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-[13px] flex items-center gap-2">
                      {dailyPulse.currentChallenge.title}
                      <span className="text-[8px] px-1.5 py-px bg-[#FF671F]/20 text-[#FF671F] rounded">MISIÓN</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] leading-snug mt-0.5">{dailyPulse.currentChallenge.description}</div>

                    {/* Progress */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-[#FF671F] font-medium">Progreso</span>
                        <span className="tabular-nums font-mono">{dailyPulse.currentChallenge.progress || 0}/{dailyPulse.currentChallenge.target}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-[#FF671F] to-[#E55A1A] transition-all" 
                          style={{ width: `${Math.min(100, Math.round(((dailyPulse.currentChallenge.progress || 0) / dailyPulse.currentChallenge.target) * 100))}%` }} 
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => {
                          try { triggerHaptic('light') } catch {}
                          if (dailyPulse.currentChallenge.type === 'solo') {
                            completeDailyChallenge(1)
                          } else if (dailyPulse.currentChallenge.type === 'bond') {
                            setActiveTab('explore')
                            toast('Ve a tu Red y activa un bond hoy')
                          } else {
                            setActiveTab('profile')
                            toast('Publica en el GymPulse para completar')
                          }
                        }}
                        className="flex-1 text-xs py-1.5 rounded-full bg-[#FF671F] text-black font-bold active:bg-[#E55A1A] active:scale-[0.985] transition-transform"
                      >
                        {dailyPulse.currentChallenge.actionLabel || 'Avanzar'}
                      </button>
                      {dailyPulse.currentChallenge.completed ? (
                        <div className="text-[10px] px-2 py-1.5 text-[#22c55e] font-bold">¡COMPLETADO! +{dailyPulse.currentChallenge.reward}</div>
                      ) : (
                        <button 
                          onClick={() => { try { triggerHaptic('light') } catch {}; completeDailyChallenge(1) }} 
                          className="text-xs px-3 py-1.5 rounded-full border border-[#FF671F]/50 text-[#FF671F] active:bg-[#FF671F]/10 active:scale-[0.985] transition-transform"
                        >
                          +1
                        </button>
                      )}
                    </div>
                    <div className="text-[8px] text-[#FFD700] mt-1">Recompensa: +{dailyPulse.currentChallenge.reward} Momentum para ti y tu Red</div>
                  </div>
                </div>
              </div>
            )}

            {/* Spend Momentum - premium, impactful, clear payoff */}
            <div className="text-[9px] uppercase tracking-[1px] text-[#9CA3AF] mb-1 mt-2">Gasta Momentum — impacto real en tu pulso y el de tu red</div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if ((dailyPulse.momentum || 0) >= 30) {
                    try { triggerHaptic('medium') } catch {}
                    const todayStr = getTodayStr()
                    const ampPulse = { ...dailyPulse, pulseAmplifiedDate: todayStr, momentum: (dailyPulse.momentum || 0) - 30 }
                    setDailyPulse(ampPulse)
                    saveUserWithRealSync({ ...(currentUser as any), pulseAmplifiedDate: todayStr, momentumPoints: ampPulse.momentum } as any)
                    toast.success('GymPulse amplificado', { description: 'Tu actividad ahora tiene más peso en el GymPulse de tus GymPartners por 24h' })
                  } else {
                    toast('Necesitas 30 Momentum')
                  }
                }}
                className="flex-1 text-[10px] py-2 rounded-2xl border border-[#FF671F]/40 active:bg-[#FF671F]/10 active:scale-[0.985] hover:bg-[#FF671F]/5 transition-all text-[#FF671F] flex flex-col items-center leading-tight"
              >
                <span>📡</span>
                <span className="font-bold">Amplificar Pulso</span>
                <span className="text-[9px] opacity-70">30M • 24h</span>
              </button>
              <button 
                onClick={() => {
                  if ((dailyPulse.momentum || 0) >= 20) {
                    try { triggerHaptic('medium') } catch {}
                    const todayStr = getTodayStr()
                    const igniteM = (dailyPulse.momentum || 0) - 20
                    const ignPulse = { ...dailyPulse, momentum: igniteM }
                    setDailyPulse(ignPulse)
                    saveUserWithRealSync({ ...(currentUser as any), momentumPoints: igniteM } as any)
                    const bondIds = Object.keys(syncBonds || {})
                    const target = bondIds.length > 0 ? bondIds[Math.floor(Math.random() * bondIds.length)] : null
                    toast.success('Socio ignitado', { description: target ? `+protección de streak enviada a ${syncBonds[target]?.name || 'socio' } hoy` : 'Protección de streak enviada a tu Red' })
                  } else toast('Necesitas 20 Momentum')
                }}
                className="flex-1 text-[10px] py-2 rounded-2xl border border-[#22c55e]/40 active:bg-[#22c55e]/10 active:scale-[0.985] hover:bg-[#22c55e]/5 transition-all text-[#22c55e] flex flex-col items-center leading-tight"
              >
                <span>🔥</span>
                <span className="font-bold">Ignitar Socio</span>
                <span className="text-[9px] opacity-70">20M • regalo</span>
              </button>
              <button 
                onClick={() => {
                  if ((dailyPulse.momentum || 0) >= 50) {
                    try { triggerHaptic('medium') } catch {}
                    const todayStr = getTodayStr()
                    const protectedPulse = { ...dailyPulse, streakProtectedDate: todayStr, momentum: (dailyPulse.momentum || 0) - 50 }
                    setDailyPulse(protectedPulse)
                    saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: todayStr, momentumPoints: protectedPulse.momentum } as any)
                    toast.success('Streak protegido', { description: 'No perderás tu racha si no entrenas hoy. ¡Buen uso de Momentum!' })
                  } else {
                    toast('Necesitas 50 Momentum para proteger')
                  }
                }}
                className="flex-1 text-[10px] py-2 rounded-2xl border border-[#EAB308]/40 active:bg-[#EAB308]/10 active:scale-[0.985] hover:bg-[#EAB308]/5 transition-all text-[#EAB308] flex flex-col items-center leading-tight"
              >
                <span>🛡️</span>
                <span className="font-bold">Proteger Racha</span>
                <span className="text-[9px] opacity-70">50M • hoy</span>
              </button>
            </div>

            <div className="text-center mt-2">
              <button 
                onClick={() => { 
                  refreshDailyPulse(); 
                  try { triggerHaptic('light') } catch {} 
                }} 
                className="text-[9px] text-[#9CA3AF] underline active:opacity-70 active:text-white transition-colors"
              >
                Refrescar GymPulse
              </button>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* MURO / WALL - attractive FB-style feed to make profile feel alive */}
      <div className={`px-4 mt-4${profileSection !== 'actividad' ? ' hidden' : ''}`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <div className="text-xs uppercase tracking-[1px] text-[#9CA3AF]">Muro</div>
            <button onClick={() => setActiveTab('home')} className="text-[9px] text-[#FF671F] underline active:opacity-70">Ver feed global →</button>
          </div>
          <button 
            disabled={loadingPersonalMuro}
            onClick={() => { 
              setLoadingPersonalMuro(true);
              loadProfilePosts(effectiveUserId).then(() => processIncomingLiveJoins()).finally(() => setLoadingPersonalMuro(false)); 
            }} 
            className="text-[10px] px-2 py-0.5 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10 disabled:opacity-50"
          >
            {loadingPersonalMuro ? '...' : 'Refrescar'}
          </button>
        </div>
        {/* Live engagement stats - makes the muro feel ALIVE and spectacular */}
        {(() => {
          const myPosts = profilePosts[effectiveUserId] || []
          if (myPosts.length === 0) return null
          const likes = myPosts.reduce((s, p) => s + (p.likes?.length || 0), 0)
          const comms = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0)
          return (
            <div className="flex gap-3 text-[10px] px-1 mb-2 text-[#9CA3AF] flex-wrap">
              <span>📝 {myPosts.length} posts</span>
              {myPosts.some((p: any) => p.pinned) && <span>📌 {myPosts.filter((p: any) => p.pinned).length} fijados</span>}
              <span className="text-[#FF4F79]">❤️ {likes} likes</span>
              <span className="text-[#22c55e]">💬 {comms} comentarios</span>
              {currentUser.trainingNow && <span className="text-[#22c55e] font-bold animate-pulse">🟢 ENTRENANDO AHORA {currentUser.liveStreak ? `🔥${currentUser.liveStreak}d` : ''}</span>}
              {(currentUser.liveJoins || 0) > 0 && <span className="text-[#22c55e]">🔥 {currentUser.liveJoins} joins {currentUser.joinedLiveStreak ? `+${currentUser.joinedLiveStreak}d` : ''}</span>}
              <span className="text-[#FF671F]/60">· la comunidad te ve y reacciona</span>
            </div>
          )
        })()}

        {/* Pinned posts highlight - spectacular for personal muro */}
        {(() => {
          const myPosts = profilePosts[effectiveUserId] || [];
          const pinned = myPosts.filter((p: any) => p.pinned);
          if (pinned.length === 0) return null;
          return (
            <div className="px-1 mb-3">
              <div className="text-[9px] text-[#FF671F] mb-1 flex justify-between items-center">
                <span>📌 Tus posts fijados ({pinned.length}) — aparecen primero en el feed global</span>
                <button onClick={() => setActiveTab('home')} className="text-xs underline active:text-white">ver todo en feed →</button>
              </div>
              <div className="card card-glass p-2 text-xs space-y-1">
                {pinned.slice(0,3).map((p: any) => (
                  <div key={p.id} onClick={() => setActiveTab('home')} className="truncate cursor-pointer hover:text-[#FF671F] active:text-[#FF671F] flex gap-1">
                    <span>📌</span> <span>{p.text}</span>
                  </div>
                ))}
                {pinned.length > 3 && <div className="text-[#FF671F]/70">+{pinned.length-3} más...</div>}
              </div>
            </div>
          );
        })()}

        {/* Attractive composer - premium journal style */}
        <div className="card p-5 mb-4 border border-[#FF671F]/10 bg-gradient-to-b from-[#1C1C20] to-[#0D0D10]">
          <div className="text-sm font-semibold text-[#FF671F] mb-1 flex items-center gap-2">
            <span>✍️</span> ¿Qué lograste hoy en tu red?
          </div>
          <div className="text-[11px] text-[#9CA3AF] mb-3">Comparte tu entreno, un Sync épico o un PR. Tu red gana Momentum y tú construyes tu legado visible. ¡Posts con foto dan +5 extra!</div>

          {/* Quick achievement templates - makes posting logros frictionless and celebratory (IG story style but performance) */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              '🏆 PR del mes en mi bond',
              '💪 Entreno solo pero con mi red en mente',
              '🔥 Sync de 90+ vibe con @buddy',
              '🌟 Nuevo nivel desbloqueado hoy',
              '📸 Momento icónico del gym',
              '⚡ 3 syncs esta semana - en racha'
            ].map((tpl, i) => (
              <button key={i} onClick={() => setMuroComposerText(tpl)} className="text-[10px] px-2.5 py-1 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10 hover:bg-[#FF671F]/5">
                {tpl}
              </button>
            ))}
          </div>
          <textarea 
            ref={muroComposerRef}
            value={muroComposerText}
            onChange={e => setMuroComposerText(e.target.value)}
            placeholder={muroComposerPhoto ? "Caption para la foto de tu entreno..." : "¿Qué tal tu último entreno? Motiva a la comunidad..."}
            className="form-input w-full h-20 text-sm mb-3 resize-y"
            maxLength={280}
          />
          <div className="text-[10px] text-right text-[#9CA3AF] -mt-2 mb-2 pr-1">
            {muroComposerText.length}/280
          </div>
          {/* Iconic photo caption suggestions — makes uploading a photo to the wall feel like capturing a high-performance network moment */}
          {muroComposerPhoto && !muroPhotoUploading && (
            <div className="mb-2">
              <div className="text-[8px] uppercase tracking-[1px] text-[#9CA3AF]/70 mb-1">Sugerencias para este momento icónico</div>
              <div className="flex flex-wrap gap-1">
                {[
                  'El pico del sync • imbatible',
                  'Momento que nadie más presenció',
                  'Mi entreno más puro y salvaje',
                  'Leyenda capturada hoy',
                  'Vibe máxima • este es el que cuenta'
                ].map((sug, i) => (
                  <button key={i} onClick={() => setMuroComposerText(sug)} className="text-[9px] px-2 py-0.5 rounded-full border border-[#FFD700]/30 text-[#f5e8c7] hover:bg-[#FFD700]/10 active:bg-[#FFD700]/20">
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
          {muroComposerPhoto && <div className="text-[9px] text-[#FF671F]/70 -mt-1 mb-2">Foto + texto se publican juntos como parte de tu red de EntrenaSync</div>}
          {muroPhotoUploading && (
            <div className="mb-3">
              <div className="text-[10px] text-[#9CA3AF] mb-1">Subiendo momento icónico...</div>
              <div className="w-full h-2 bg-[#2F2F35] rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] transition-all" style={{ width: `${muroPhotoUploadProgress}%` }} />
              </div>
              <div className="text-[9px] text-right text-[#FF671F]">{muroPhotoUploadProgress}%</div>
            </div>
          )}
          {muroComposerPhoto && !muroPhotoUploading && (
            <div className="mb-3">
              <div className="text-[9px] uppercase tracking-[1px] text-[#FFD700]/80 mb-1 flex items-center gap-1">📸 MOMENTO ICÓNICO — esto quedará en tu muro para siempre</div>
              <div className="muro-post-hero-media cursor-pointer group" onClick={() => setFeedPhotoModal({url: muroComposerPhoto})}>
                <img src={muroComposerPhoto} className="w-full object-cover" />
                <div className="muro-post-hero-overlay" />
                <div className="muro-post-hero-label">TU MOMENTO ICÓNICO</div>
                <div className="muro-post-hero-zoom group-hover:bg-black/80">
                  <span>🔍</span> <span className="font-semibold">ampliar</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMuroComposerPhoto(null); }} 
                  className="absolute -top-2 -right-2 bg-[#1C1C20] hover:bg-red-500 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center border border-[#2F2F35] transition-colors z-10 shadow"
                  title="Quitar foto icónica"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera) {
                  // Native camera + immediate Storage upload with progress for pro UX
                  (async () => {
                    try {
                      const p = await CapacitorCamera.getPhoto({ quality: 70, allowEditing: true, resultType: 'base64' })
                      if (p?.base64String) {
                        const dataUrl = `data:image/jpeg;base64,${p.base64String}`
                        if (!isDemoMode && storage) {
                          setMuroPhotoUploading(true)
                          setMuroPhotoUploadProgress(0)
                          try {
                            const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
                            const path = `posts/${effectiveUserId}/composer-${Date.now()}.jpg`
                            const storageRef = ref(storage, path)
                            const snap = await uploadString(storageRef, dataUrl, 'data_url')
                            const url = await getDownloadURL(snap.ref)
                            setMuroComposerPhoto(url)
                            setMuroPhotoUploading(false)
                          } catch (uploadErr) {
                            // Fallback: still allow publishing the "iconic" photo by embedding as data URL
                            // (this is what used to happen before the Storage "giant update" fixes).
                            // This unblocks the beautiful new muro photo UX even if rules are not yet deployed
                            // or temporary permission issues.
                            console.warn('Muro photo Storage upload failed, falling back to data: URL embed', uploadErr)
                            setMuroComposerPhoto(dataUrl)
                            setMuroPhotoUploading(false)
                            if (uploadErr && (uploadErr.code === 'storage/unauthorized' || (uploadErr.message || '').includes('unauthorized'))) {
                              toast.error('Storage sin permisos todavía (403). Usando foto embebida. Despliega storage.rules.')
                            } else {
                              toast('No se pudo subir a Storage, foto embebida en el post')
                            }
                          }
                        } else {
                          setMuroComposerPhoto(dataUrl)
                        }
                      }
                    } catch (e) { 
                      toast('No se pudo agregar foto')
                      setMuroPhotoUploading(false)
                    }
                  })()
                } else {
                  // Web: use nice file picker (much more attractive than prompt URL)
                  muroPhotoInputRef.current?.click()
                }
              }}
              className="flex-1 py-2 text-sm border border-[#2F2F35] rounded-2xl active:bg-[#25252A] flex items-center justify-center gap-1 hover:border-[#FF671F]/40 transition-colors"
            >
              <Camera size={15} /> {muroComposerPhoto ? 'Cambiar foto icónica' : 'Capturar momento icónico (cámara primero)'}
            </motion.button>
            {/* Hidden file input for web - makes photo upload feel native and attractive */}
            <input
              ref={muroPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleMuroPhotoFile}
              className="hidden"
            />
            <motion.button 
              whileTap={{ scale: 0.985 }}
              onClick={async () => {
                if (!muroComposerText.trim()) return
                setMuroPublishing(true)
                try {
                  await createProfilePost(muroComposerText, muroComposerPhoto)
                  setMuroComposerText('')
                  setMuroComposerPhoto(null)
                  setMuroPublishing(false)
                } catch (e) {
                  setMuroPublishing(false)
                }
              }}
              disabled={!muroComposerText.trim() || muroPublishing}
              className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {muroPublishing ? 'Publicando...' : 'Publicar'}
            </motion.button>
          </div>
          <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">Se vuelve parte de tu red de rendimiento en EntrenaMatch • visible en tu perfil y para la comunidad</div>
        </div>

        {/* Small decorative stat — makes the network feel alive */}
        {(() => {
          const photoPosts = (profilePosts[effectiveUserId] || []).filter((p: any) => p.photo).length;
          const gal = currentUser.photos?.length || 0;
          if (photoPosts + gal < 2) return null;
          return (
            <div className="mx-1 mb-2 text-[9px] text-center text-[#FFD700]/70">✨ {photoPosts} sesiones de EntrenaSync documentadas • {gal} fotos en tu galería de rendimiento</div>
          );
        })()}

        {/* Posts feed - ICONIC beautiful muro for your performance network */}
        <div className="px-1 mb-3 flex items-center justify-between">
          <div>
            <div className="font-semibold text-base flex items-center gap-2">
              <span>🏋️</span> 
              <span>Tu Historial de EntrenaSync</span>
            </div>
            <div className="text-[10px] text-[#9CA3AF] -mt-0.5">Tu red de rendimiento • sesiones compartidas visibles en Feed Global</div>
          </div>
          <button onClick={() => setActiveTab('home')} className="text-xs px-3 py-1 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10">Ver en Feed →</button>
        </div>

        {/* Achievement counters - your performance network capital. Alianzas + Syncs + Highlights = the visible proof of your training graph. */}
        <div className="grid grid-cols-3 gap-2 mb-3 px-1">
          {(() => {
            const myHighlights = (profilePosts[effectiveUserId] || []).filter((p: any) => (p.text || '').includes('HIGHLIGHT DE ENTRENASYNC') || (p.text || '').includes('Destacado de Sesión Sync')).length;
            const myCompletedSyncs = (profilePosts[effectiveUserId] || []).filter((p: any) => (p.text || '').includes('ENTRENASYNC COMPLETADO') || (p.text || '').includes('Sync Legendario')).length;
            const bondCount = Object.keys(syncBonds).length;
            return (
              <>
                <div className="text-center p-2 rounded-2xl bg-[#1C1C20] border border-[#FFD700]/30">
                  <div className="text-xl font-black text-[#FFD700]">{bondCount}</div>
                  <div className="text-[8px] text-[#9CA3AF]">ALIANZAS DE SYNC</div>
                </div>
                <div className="text-center p-2 rounded-2xl bg-[#1C1C20] border border-[#22c55e]/30">
                  <div className="text-xl font-black text-[#22c55e]">{myCompletedSyncs}</div>
                  <div className="text-[8px] text-[#9CA3AF]">SYNC COMPLETADOS</div>
                </div>
                <div className="text-center p-2 rounded-2xl bg-[#1C1C20] border border-[#FF671F]/30">
                  <div className="text-xl font-black text-[#FF671F]">{myHighlights}</div>
                  <div className="text-[8px] text-[#9CA3AF]">HIGHLIGHTS DE SYNC</div>
                </div>
              </>
            );
          })()}
          <div className="text-center text-[7px] text-[#FFD700]/50 -mt-1 mb-1">Tu red de sync = tu estatus y resultados en la primera red social del fitness de verdad.</div>
        </div>
        <AnimatePresence>
          {loadingPersonalMuro && (profilePosts[effectiveUserId] || []).length === 0 ? (
            <div className="space-y-3">
              {[1,2].map(i => (
                <div key={i} className="muro-post p-4 mb-3 rounded-2xl animate-pulse">
                  <div className="h-3 bg-[#2F2F35] rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-[#2F2F35] rounded w-full mb-1"></div>
                  <div className="h-4 bg-[#2F2F35] rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (profilePosts[effectiveUserId] || []).length > 0 ? (
            [...(profilePosts[effectiveUserId] || [])].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp).map(post => {
              const isOwn = true
              const liked = (post.likes || []).includes(effectiveUserId)
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97, height: 0, marginBottom: 0 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: 'spring', bounce: 0.12, duration: 0.28 }}
                  className={`muro-post p-4 mb-3 rounded-2xl ${post.pinned ? 'muro-post--pinned' : ''} ${post.isSyncStory || (post.text || '').includes('ENTRENASYNC COMPLETADO') ? 'muro-post--sync-story' : (post.text || '').includes('HIGHLIGHT DE ENTRENASYNC') || (post.text || '').includes('Destacado de Sesión Sync') ? 'muro-post--echo' : '' } ${recentlyPublishedPostId === post.id ? 'ring-2 ring-[#FF671F] shadow-lg shadow-[#FF671F]/20' : ''} ${post.ownerId && syncBonds[post.ownerId] ? 'muro-post--red border-[#FFD700]/50' : ''} hover:border-[#FF671F]/40 hover:-translate-y-0.5 overflow-hidden transition-all active:scale-[0.995]`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-[#9CA3AF]" title={new Date(post.timestamp).toLocaleString('es-CL')}>{getRelativeTime(post.timestamp)}</span>
                      {post.pinned && <span className="px-1.5 py-px text-[9px] rounded bg-[#FF671F] text-black font-bold tracking-wider">📌 DESTACADO</span>}
                      {Date.now() - post.timestamp < 3600000 && <span className="px-1.5 py-px text-[9px] rounded bg-[#22c55e] text-black font-bold">NUEVO</span>}
                      {recentlyPublishedPostId === post.id && <span className="px-1.5 py-px text-[9px] rounded bg-[#FF671F] text-black font-bold animate-pulse">¡ACABAS DE PUBLICAR!</span>}
                      {(post.text || '').includes('Fui testigo') || (post.text || '').includes('RITUAL LEGENDARIO') || (post.text || '').includes('Echo') ? <span className="px-1.5 py-px text-[9px] rounded bg-[#FFD700] text-black font-bold">👁️ ECO</span> : null}
                    </div>
                    {isOwn && (
                      <div className="flex gap-2 text-[11px]">
                        <button 
                          onClick={() => togglePinPost(post.id, effectiveUserId, post.pinned)}
                          className={`px-2 py-0.5 rounded transition ${post.pinned ? 'bg-[#FF671F] text-black' : 'text-[#9CA3AF] hover:text-[#FF671F] active:bg-[#2F2F35]'}`}
                          title={post.pinned ? 'Desfijar del feed' : 'Fijar en el feed global'}
                        >
                          {post.pinned ? '★' : '☆'}
                        </button>
                        <button 
                          onClick={() => startEditPost(post.id, effectiveUserId, post.text)}
                          className="text-[#9CA3AF] hover:text-[#FF671F] active:text-[#FF671F]"
                          title="Editar post"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteProfilePost(post.id, effectiveUserId)}
                          className="text-red-400 hover:text-red-500 active:text-red-600"
                          title="Eliminar post"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                  {editingPost?.postId === post.id ? (
                    <div className="mb-3">
                      <textarea 
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        className="form-input w-full h-20 text-sm resize-y mb-2 border-[#FF671F]/30"
                        maxLength={280}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEditPost} className="text-xs px-4 py-1.5 rounded-xl text-[#9CA3AF] hover:bg-[#2F2F35] active:bg-[#1C1C20]">Cancelar</button>
                        <button onClick={saveEditPost} disabled={!editDraft.trim()} className="text-xs px-4 py-1.5 rounded-xl btn-primary disabled:opacity-50">Guardar cambios</button>
                      </div>
                    </div>
                  ) : (
                    <div className="muro-text mb-3 text-[15px] leading-snug tracking-[-0.1px] text-[#F1F1F3]">
                      {(post.text || '').includes('Fui testigo') || (post.text || '').includes('RITUAL LEGENDARIO') || (post.text || '').includes('Echo') ? (
                        <span className="text-[#FFD700] font-semibold">👁️ Highlight de EntrenaSync</span>
                      ) : null}
                      <div>{post.text}</div>
                    </div>
                  )}
                  {post.photo && (
                    <div 
                      className="muro-post-hero-media cursor-pointer group"
                      onClick={() => setFeedPhotoModal({ url: post.photo, postId: post.id })}
                    >
                      <img src={post.photo} className="w-full object-cover" />
                      <div className="muro-post-hero-overlay" />
                      <div className="muro-post-hero-label">MOMENTO ICÓNICO DE SYNC</div>
                      <div className="muro-post-hero-zoom group-hover:bg-black/80">
                        <span>🔍</span> <span className="font-semibold">ampliar</span>
                      </div>
                      {post.pinned && <div className="absolute top-3 right-3 text-[10px] bg-[#FF671F] text-black px-2 py-0.5 rounded-full font-bold tracking-wider z-10">📌 DESTACADA</div>}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2F2F35]">
                    <div className="flex items-center gap-4 text-sm">
                      <button 
                        onClick={() => likeProfilePost(post.id, effectiveUserId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl transition-all active:scale-95 ${liked ? 'bg-[#FF671F]/15 text-[#FF671F] border border-[#FF671F]/30' : 'text-[#9CA3AF] hover:bg-[#1C1C20] hover:text-[#FF671F] border border-transparent'}`}
                      >
                        <motion.span
                          key={liked ? 'l' + post.likes.length : 'u'}
                          animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {liked ? '❤️' : '🤍'}
                        </motion.span>
                        <span className="font-semibold tabular-nums">{(post.likes || []).length}</span>
                        {(post.likes || []).length > 0 && <span className="text-[10px] opacity-60">likes</span>}
                      </button>
                      <button 
                        onClick={() => openFullComments(post.id, effectiveUserId, currentUser?.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[#9CA3AF] hover:bg-[#1C1C20] hover:text-[#FF671F] border border-transparent active:scale-95"
                      >
                        💬 <span className="font-semibold tabular-nums">{(post.comments || []).length}</span>
                        <span className="text-[10px] opacity-60">comentarios</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]/60">Toca para hilo completo</div>
                  </div>
                  {/* Quick reactions also in personal muro for consistency and "vivo" feel (reuses same optimistic + persist) */}
                  <div className="flex gap-1.5 mt-2 -ml-0.5">
                    {['🔥','💪','❤️','👏'].map(emo => {
                      const postReactors = (post.reactions?.[emo]) || [];
                      const count = postReactors.length || (feedReactions[post.id]?.[emo] || 0);
                      const active = postReactors.includes(effectiveUserId) || ((feedReactions[post.id]?.[emo] || 0) > 0);
                      return (
                        <motion.button
                          key={emo}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { boostReaction(post.id, emo, effectiveUserId); triggerHaptic('light'); }}
                          className={`muro-reaction px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all ${active ? 'bg-[#FF671F]/10 border-[#FF671F] scale-105' : 'bg-[#1C1C20] border-[#2F2F35] hover:border-[#FF671F]/40'}`}
                        >
                          <motion.span
                            animate={{ scale: active ? [1, 1.3, 1] : 1 }}
                            transition={{ duration: 0.25 }}
                            className="text-base"
                          >
                            {emo}
                          </motion.span>
                          {count > 0 && (
                            <motion.span 
                              key={count} 
                              initial={{ scale: 0.6, y: 3 }} 
                              animate={{ scale: 1, y: 0 }} 
                              className="count text-[#FF671F] font-bold tabular-nums text-xs"
                            >
                              {count}
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {post.comments && post.comments.length > 0 && (
                    <div 
                      onClick={() => openFullComments(post.id, effectiveUserId)}
                      className="mt-3 pt-3 border-t border-[#2F2F35] text-xs cursor-pointer group"
                      title="Ver todos los comentarios"
                    >
                      <div className="text-[#9CA3AF] mb-1.5 flex items-center justify-between text-[10px]">
                        <span>Comentarios recientes</span>
                        <span className="text-[#FF671F] group-hover:underline">Ver hilo →</span>
                      </div>
                      <div className="space-y-1.5">
                        {post.comments.slice(-3).map(c => (
                          <div key={c.id} className="flex gap-2 items-start bg-[#1A1A1E]/60 rounded-xl px-2.5 py-1.5">
                            <span className="font-semibold text-white/90 shrink-0">{c.userName}:</span> 
                            <span className="text-[#9CA3AF] truncate">{c.text}</span>
                            {c.userId === effectiveUserId && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteCommentFromPost(post.id, effectiveUserId, c.id); }}
                                className="ml-auto text-red-400 text-[11px] hover:text-red-500 active:scale-90"
                                title="Eliminar comentario"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {(post.comments || []).length > 3 && <div className="text-[#FF671F]/70 text-[10px] mt-1 pl-1">+{(post.comments || []).length-3} comentarios más</div>}
                    </div>
                  )}
                  {/* Inline attractive comment box */}
                  {activeComment?.postId === post.id && (
                    <div className="mt-2 pt-2 border-t border-[#2F2F35] flex items-center gap-2">
                      <input 
                        type="text" 
                        value={commentDraft} 
                        onChange={e => setCommentDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                        placeholder="Escribe un comentario..."
                        className="flex-1 form-input text-sm py-1.5"
                        maxLength={200}
                      />
                      <button 
                        type="button"
                        onClick={submitComment} 
                        disabled={!commentDraft.trim()} 
                        className="text-[#FF671F] text-sm font-medium px-3 disabled:opacity-40 active:scale-95"
                      >
                        Enviar
                      </button>
                      <button onClick={cancelComment} className="text-[#9CA3AF] text-xs px-1">✕</button>
                    </div>
                  )}
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="muro-empty p-8 text-center mb-3 rounded-3xl border border-[#FF671F]/10"
            >
              <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FF671F]/10 to-[#FF4F79]/10 flex items-center justify-center mb-4 text-4xl">📜</div>
              <div className="font-bold text-lg mb-2 tracking-tight">Mi Historial de EntrenaSync — tu red de rendimiento y progreso compartido</div>
              <div className="text-sm text-[#9CA3AF] mb-5 max-w-[260px] mx-auto">Este es TU lugar en la red. Aquí quedan registradas las sesiones sincronizadas que realmente movieron la aguja: alianzas de alto rendimiento, resultados medibles, y el archivo de lo que construyes entrenando con otros. Tu historial es visible, inspira a la comunidad y demuestra el poder del esfuerzo sincronizado.</div>
              <div className="flex flex-col gap-2 max-w-[220px] mx-auto">
                <button 
                  onClick={() => muroComposerRef.current?.focus()}
                  className="btn-primary text-sm py-3 rounded-2xl font-semibold"
                >
                  Publicar mi primer post
                </button>
                <button 
                  onClick={() => { /* focus photo */ const el = document.querySelector('button[aria-label*="Añadir foto"]') as HTMLButtonElement; el?.click(); }}
                  className="text-xs py-2 text-[#FF671F] border border-[#FF671F]/30 rounded-2xl active:bg-[#FF671F]/5"
                >
                  O sube una foto de tu último entreno
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prominent link to global feed - makes the app feel like a living movement */}
        <div className="mt-3 px-1">
          <button onClick={() => setActiveTab('home')} className="w-full text-left card card-glass p-3 text-sm flex items-center justify-between active:scale-[0.99]">
            <div>
              <div className="text-[#FF671F] font-medium">Explora el Feed Global →</div>
              <div className="text-[10px] text-[#9CA3AF]">Muro completo de la comunidad, posts fijados y más</div>
            </div>
            <span className="text-[#FF671F]">→</span>
          </button>
        </div>
      </div>

      {/* Verification status - visual upgrade */}
      <div className={`px-4 mt-4${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <div className="card p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2 text-sm">
              Verificación de identidad
              {currentUser.verificationStatus === 'verified' && <span className="chip-health text-[10px] px-2 py-0 !font-bold">✓ VERIFICADO</span>}
              {currentUser.verificationStatus === 'pending' && <span className="text-[#facc15] text-xs font-medium">EN REVISIÓN</span>}
            </div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">Aumenta la confianza de otros usuarios reales</div>
          </div>
          {currentUser.verificationStatus !== 'verified' && (
            <button onClick={() => { setShowVerificationFlow(true); setVerificationStep(1); }} className="shrink-0 text-xs px-4 py-2 bg-[#FF671F] text-black rounded-2xl font-semibold active:bg-[#E55A1A]">
              {currentUser.verificationStatus === 'pending' ? 'Ver estado' : 'Verificar'}
            </button>
          )}
        </div>
      </div>

      {/* Legal & safety */}
      <div className={`px-4 mt-4 card p-4 text-sm${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <div className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-2">Legal y seguridad</div>
        <div className="flex flex-col gap-1 text-[#FF671F] text-sm">
          <button onClick={() => setShowLegal('terms')} className="text-left py-0.5">Términos de Servicio</button>
          <button onClick={() => setShowLegal('privacy')} className="text-left py-0.5">Política de Privacidad</button>
          <button onClick={() => setShowLegal('community')} className="text-left py-0.5">Directrices de la Comunidad</button>
          <a href="/entrenamatch/privacy.html" target="_blank" className="text-left py-0.5 hover:underline">Ver Política de Privacidad completa →</a>
          <a href="/entrenamatch/terms.html" target="_blank" className="text-left py-0.5 hover:underline">Ver Términos de Servicio completos →</a>
        </div>
      </div>

      {/* Micro guidance - kept minimal, no heavy Pre-Alpha branding to avoid clutter in profile view */}
      <div className={`px-4 mt-6 mb-8${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <div className="card p-4 text-xs text-[#9CA3AF] leading-snug">
          Tus datos se sincronizan entre dispositivos vía Firebase. Usa "Cambiar cuenta" en la barra superior (siempre visible) o el botón del encabezado. ¡Gracias por testear!
          <div className="mt-1 text-[10px] text-[#9CA3AF]">Ver PRODUCTION_AND_APK.md para hosting y builds.</div>
        </div>
        <div className="text-center text-[10px] text-[#6B7280] mt-4">v{APP_VERSION} • Solo +18 • Backend real</div>
      </div>

      {/* Mobile App Download - Prominent for Pre-Alpha testers */}
      <div className={`px-4 mt-2 mb-8${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <div className="card p-5 rounded-3xl border border-[#FF4F79]/30 bg-[#1C1C20]">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">📱</div>
            <div>
              <div className="font-semibold text-[#FF671F]">App Móvil Android</div>
              <div className="text-xs text-[#9CA3AF]">Experiencia nativa con notificaciones y mejor cámara</div>
            </div>
          </div>
          <div className="text-sm text-[#F8F8F8] mb-4">
            Descarga la versión nativa de EntrenaMatch (APK) para tener <strong>notificaciones push reales en tu celular</strong> (mejor que web PWA), cámara nativa y experiencia completa offline. Se actualiza vía GitHub Releases. Para pruebas beta, instala el APK (activa "orígenes desconocidos").
          </div>
          <a 
            href="https://github.com/musclegrenadechile/entrenamatch/releases/tag/android-prealpha" 
            target="_blank"
            className="btn-primary w-full block text-center text-sm py-2.5"
          >
            Descargar APK más reciente (Gratis)
          </a>
          <div className="text-[10px] text-center text-[#9CA3AF] mt-2">
            También disponible automáticamente en GitHub Actions → Artifacts
          </div>
        </div>
      </div>

      {/* Beta Feedback ENHANCED (Phase 0 - structured, with history) - visual polish */}
      <div className={`px-4 mt-2 mb-8${profileSection !== 'cuenta' ? ' hidden' : ''}`}>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm flex items-center gap-2"><Star size={15} className="text-[#FF671F]" /> Feedback de Beta</div>
            <div className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FF671F]/10 text-[#FF671F] border border-[#FF671F]/20">Privado</div>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mb-4">Tu opinión define la app. Todo se guarda en Firebase y lo leemos.</p>

          {/* Type segmented */}
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1">Tipo</div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { v: 'bug', l: '🐞 Bug' },
                { v: 'idea', l: '💡 Idea' },
                { v: 'ux', l: '🎨 UX / Diseño' },
                { v: 'other', l: '📝 Otro' },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setFeedbackType(opt.v as any)}
                  className={`px-3 py-1 text-xs rounded-2xl border transition ${feedbackType === opt.v ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] text-[#cbd5e1] active:bg-[#1C1C20]'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1">¿Qué tan bien funciona para ti? (1-5)</div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(r => (
                <button
                  key={r}
                  onClick={() => setFeedbackRating(r)}
                  className={`p-1 rounded-xl ${feedbackRating >= r ? 'text-[#facc15]' : 'text-[#6B7280]'}`}
                  aria-label={`${r} estrellas`}
                >
                  <Star size={22} fill={feedbackRating >= r ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="ml-1 text-sm text-[#9CA3AF] self-center">{feedbackRating}/5</span>
            </div>
          </div>

          {/* Text */}
          <textarea 
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl p-3 text-sm h-20 resize-y" 
            placeholder="Cuéntanos qué pasó, qué te gustó, qué duele o qué mejorarías..."
          />

          {/* APK screenshot note */}
          <div className="text-[10px] text-[#9CA3AF] mt-1 mb-2">
            En la APK nativa puedes adjuntar capturas al reportar por el mismo canal de invitación.
          </div>

          <button 
            onClick={async () => {
              const text = feedbackText.trim()
              if (!text) { toast('Escribe algo antes de enviar'); return }
              if (!firebaseUser?.uid || !db) { toast('Inicia sesión para enviar feedback'); return }

              const platform = (typeof window !== 'undefined' && (window as any).Capacitor) ? 'android' : 'web'
              const appVersion = APP_VERSION

              try {
                const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
                await addDoc(collection(db, 'betaFeedback'), {
                  userId: firebaseUser.uid,
                  type: feedbackType,
                  rating: feedbackRating,
                  text,
                  platform,
                  appVersion,
                  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                  createdAt: serverTimestamp(),
                })
                toast.success('¡Gracias! Feedback guardado.')
                setFeedbackText('')
                setFeedbackType('idea')
                setFeedbackRating(5)
                setLastSync(new Date())
                await loadMyFeedbacks()
              } catch (e) {
                toast.error('No se pudo enviar (revisa conexión o permisos)')
              }
            }}
            className="mt-1 w-full py-2.5 rounded-2xl bg-[#FF671F] text-black text-sm font-semibold active:bg-[#E55A1A]"
          >
            Enviar feedback estructurado
          </button>
          <div className="text-[10px] text-[#9CA3AF] mt-1 text-center">Se guarda privado • Lo revisamos para la beta</div>

          {/* My previous feedbacks list */}
          {(myFeedbacks.length > 0 || loadingMyFeedbacks) && (
            <div className="mt-4 pt-3 border-t border-[#2F2F35]">
              <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2 flex items-center justify-between">
                <span>Mis feedbacks anteriores</span>
                {loadingMyFeedbacks && <span className="text-[#FF671F]">cargando…</span>}
              </div>
              {myFeedbacks.length === 0 && !loadingMyFeedbacks && (
                <div className="text-xs text-[#9CA3AF]">Aún no has enviado ninguno. ¡El primero cuenta mucho!</div>
              )}
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {myFeedbacks.map((fb, i) => (
                  <div key={fb.id || i} className="bg-[#1C1C20] rounded-2xl p-3 text-xs border border-[#2F2F35] card-glass">
                    <div className="flex items-center gap-2 text-[#9CA3AF]">
                      <span className="font-medium text-white/90">{fb.type === 'bug' ? '🐞 Bug' : fb.type === 'idea' ? '💡 Idea' : fb.type === 'ux' ? '🎨 UX' : '📝 Otro'}</span>
                      <span>·</span>
                      <span className="text-[#facc15]">{ '★'.repeat(Math.max(1, Math.min(5, fb.rating || 0))) }</span>
                      <span className="ml-auto text-[#9CA3AF] text-[10px]">{new Date(fb.createdAt).toLocaleDateString('es-CL', {month:'short', day:'numeric'})}</span>
                    </div>
                    <div className="mt-1.5 text-[#cbd5e1] leading-snug line-clamp-2 text-[11px]">{fb.text}</div>
                    <div className="mt-1 text-[#9CA3AF] text-[9px] flex items-center gap-1">📱 {fb.platform}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Web notification quick control (only real web users; native uses Capacitor plugin) */}
      {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
        <div className="px-4 pb-2">
          <button
            onClick={() => { requestWebNotificationPermission(); toast('Solicitando permiso de notificaciones del navegador...') }}
            className="w-full text-xs py-2 rounded-2xl border border-[#2F2F35] text-[#FF671F] active:bg-[#1C1C20]"
          >
            🔔 Activar/renovar notificaciones del navegador (para mensajes en segundo plano)
          </button>
        </div>
      )}

      {/* Native push notification activation (only in real APK) */}
      {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor !== 'undefined' && (
        <div className="px-4 pb-2">
          <button
            onClick={() => { requestNativePushPermission() }}
            className="w-full text-xs py-2.5 rounded-2xl border border-[#22c55e]/40 bg-[#22c55e]/5 text-[#22c55e] active:bg-[#22c55e] active:text-black font-semibold"
          >
            🔔 Activar notificaciones push nativas (reales en Android, incluso app cerrada)
          </button>
          <div className="text-[9px] text-center text-[#9CA3AF] mt-1">Mejor que PWA. Requiere build con google-services.json correcto.</div>
          {!PushNotifications && (
            <div className="mt-1.5 text-[9px] bg-red-950/50 border border-red-500/50 text-red-400 p-1.5 rounded-xl text-center">
              ⚠️ Esta build del APK no tiene google-services.json configurado. La app puede fallar al abrir en Android. Actualiza a v{APP_VERSION}+.
            </div>
          )}
        </div>
      )}

      {/* Notification preferences - simple local toggles (progressive UX improvement) */}
      {!isDemoMode && (
        <div className="px-4 pb-3">
          <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1.5">Preferencias de notificaciones (local en este dispositivo)</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { key: 'messages' as const, label: 'Mensajes y matches', icon: '💬' },
              { key: 'live' as const, label: 'Live / Sesiones', icon: '🟢' },
              { key: 'muro' as const, label: 'Actividad en muro', icon: '📝' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setNotifPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition ${notifPrefs[p.key] ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]' : 'border-[#2F2F35] text-[#9CA3AF] opacity-70'}`}
              >
                {p.icon} {p.label} {notifPrefs[p.key] ? '✓' : '○'}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-[#9CA3AF] mt-1">Cambios se guardan localmente. Útil para silenciar temporalmente.</div>
        </div>
      )}

      {/* PWA / App install options - always offer for web, with clear APK for native notifications on phone */}
      {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
        <div className="px-4 pb-3 space-y-2">
          <button
            onClick={() => { 
              localStorage.removeItem('entrenamatch_pwa_dismissed'); 
              setShowPwaInstall(true); 
            }}
            className="w-full text-xs py-2.5 rounded-2xl border border-[#FF671F]/40 bg-[#FF671F]/5 text-[#FF671F] active:bg-[#FF671F] active:text-black flex items-center justify-center gap-1.5 font-semibold"
          >
            <Download size={14} /> Instalar como PWA (acceso rápido + notifs web)
          </button>
          <div className="text-[9px] text-center text-[#9CA3AF]">O usa el botón 📱 Instalar de la barra superior.</div>
        </div>
      )}

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
