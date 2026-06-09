import {
  Camera, Edit2, Plus, Send,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from './VerifiedProfilePhoto'
import { cityChampionLabel } from '../../utils/genderedCopy'
import { isProfileVerified } from '../../utils/identityVerification'
import { DerbyDefenderBadge } from '../home/DerbyDefenderBadge'

export function ProfileHeroSection(props: ProfileTabProps) {
  const p = profileTabBindings(props)
  const openMuroComposer = (prefill?: string) => {
    p.setProfileSection('actividad')
    p.setActiveTab('profile')
    if (prefill) p.setMuroComposerText(prefill)
    window.setTimeout(() => {
      p.muroComposerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      p.muroComposerRef.current?.focus()
    }, 120)
  }
  const openCommunityFeed = (prefill?: string) => {
    if (p.openCommunityMuro) {
      p.openCommunityMuro({ prefill, openPublish: !!prefill })
      return
    }
    openMuroComposer(prefill)
  }
  const {
    currentUser,
    networkStats,
    syncBonds,
    openProfileEditor,
    saveUserWithRealSync,
    setMapForceTick,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    reorderGallery,
    deleteExtraPhoto,
    uploadProfilePhotoIfNeeded,
    CapacitorCamera,
    muroComposerRef,
    profilePosts,
    effectiveUserId,
    setFeedPhotoModal,
    isEditingBio,
    setIsEditingBio,
    setLastSync,
    toggleLiveTraining,
    isTogglingLive,
  } = p

  return (
    <>
{/* HERO - FULL REMASTERED EPIC "MI RITUAL" PRESENCE - Attractive, unique, premium */}
<div className="relative h-80 w-full overflow-hidden bg-[#0a0a0c] profile-hero">
  <VerifiedProfilePhoto
    src={(currentUser.photos && currentUser.photos[0]) || 'https://picsum.photos/id/1005/600/800'}
    className="absolute inset-0"
    imgClassName="w-full h-full object-cover"
    verificationStatus={currentUser.verificationStatus}
    showBadge={false}
    showRing
    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
  />
  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/95" />
  <div className="absolute inset-0 border-b-2 border-[#FF671F]/20" />

  // Top status — hero pulse block below handles LIVE/ghost (fase 89)
  <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-start text-xs">
    <div className="text-right font-mono text-white/50 tracking-widest">{currentUser.level} • {currentUser.intensity}</div>
  </div>

  {/* Bottom hero content - rich & attractive */}
  <div className="absolute bottom-0 left-0 right-0 p-5">
    <div className="font-black text-4xl tracking-[-2.5px] text-white drop-shadow-lg">{currentUser.name}</div>
    <div className="text-[#9CA3AF] text-sm tracking-wider -mt-1 flex items-center gap-2 flex-wrap">
      <span>{currentUser.age} • {currentUser.city}, {currentUser.country}</span>
      {(() => {
        try {
          const key = `entrenamatch_city_done_${new Date().getFullYear()}_w_${currentUser.city}`
          if (localStorage.getItem(key) || localStorage.getItem(`entrenamatch_city_badge_${currentUser.city}`)) {
            return (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-bold border border-[#FFD700]/40">
                🌆 {cityChampionLabel(currentUser.gender, currentUser.city)}
              </span>
            )
          }
        } catch { /* ignore */ }
        return null
      })()}
      <DerbyDefenderBadge city={currentUser.city} gender={currentUser.gender} />
    </div>

    {/* Unique "Tu Poder" mini dashboard in hero - makes profile creation feel valuable immediately */}
    <div className="mt-3 flex gap-2 text-[10px]">
      <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#FFD700]">{networkStats?.networkPower || 0}</span> FE</div>
      <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#22c55e]">{Object.keys(syncBonds || {}).length}</span> ALIANZAS</div>
      <div className="bg-white/10 border border-white/20 px-2 py-1 rounded-xl font-mono"><span className="text-[#FF671F]">{currentUser.photos?.length || 0}</span> FOTOS</div>
    </div>
  </div>

  {isProfileVerified(currentUser.verificationStatus) && (
    <VerifiedPhotoBadge size="lg" corner="bottom-right" className="bottom-24 right-5" />
  )}

  {/* Edit CTA - prominent for creation/editing */}
  <button 
    onClick={openProfileEditor}
    className="absolute top-4 right-4 text-xs px-4 py-2 rounded-2xl bg-black/70 border border-white/30 text-white flex items-center gap-1.5 active:bg-black tracking-wider z-20"
  >
    <Edit2 size={13} /> EDITAR PERFIL
  </button>
</div>

{/* GALERÍA DE RENDIMIENTO - Remastered attractive curation. Unique visual for profile creation/editing */}
{currentUser.photos && currentUser.photos.length > 0 && (
  <div className="px-4 pt-3 pb-2 bg-[#0D0D10] border-b border-[#2F2F35]">
    <div className="flex items-center justify-between mb-1.5 px-0.5">
      <div>
        <span className="text-[10px] uppercase tracking-[1px] text-[#FFD700]">GALERÍA DE RENDIMIENTO</span>
        <span className="ml-2 text-[11px] text-[#FF671F] font-semibold">{currentUser.photos.length} sesiones • tu presencia en el mapa</span>
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
      onClick={() => openMuroComposer()} 
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
        openMuroComposer()
        toast('¡Cuéntale a tu red! +Constancia por posts con foto'); 
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
        items.push({ type: 'demo', label: 'PR 100kg', emoji: '🏋️', onClick: () => openMuroComposer() });
        items.push({ type: 'demo', label: 'Sync épico', emoji: '⚡', onClick: () => openMuroComposer() });
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
    <button onClick={() => openMuroComposer()} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl bg-[#FF671F] text-black font-bold active:opacity-90 flex items-center gap-1.5 shadow">
      <Send size={14} /> Publicar en muro
    </button>
    <button onClick={openProfileEditor} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-white/20 text-white active:bg-white/10 flex items-center gap-1.5">
      <Camera size={14} /> Agregar foto
    </button>
    {currentUser.trainingNow && (
      <button
        type="button"
        disabled={isTogglingLive}
        onClick={() => void toggleLiveTraining('off')}
        className={`flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-[#ef4444]/40 text-[#f87171] active:bg-[#ef4444]/10 flex items-center gap-1.5 ${isTogglingLive ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isTogglingLive ? 'Sincronizando…' : 'Terminar Live'}
      </button>
    )}
    <button onClick={() => setActiveTab('explore')} className="flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-[#FFD700]/30 text-[#FFD700] active:bg-[#FFD700]/10 flex items-center gap-1.5">
      🔍 Buscar alianzas
    </button>
  </div>
</div>

{/* Motivator: Build your performance network - remastered unique & attractive */}
{(!currentUser.photos?.length || (currentUser.photos?.length || 0) < 3 || !currentUser.bio || (profilePosts[effectiveUserId] || []).filter((p:any)=>p.photo).length === 0) && (
  <div className="mx-4 mt-4 p-5 rounded-3xl bg-gradient-to-br from-[#1a160f] via-[#25252A] to-[#1a160f] border border-[#FFD700]/40 shadow-inner">
    <div className="flex items-center gap-2 text-[#FFD700] font-bold mb-1.5 text-sm tracking-wide">
      <span>⭐</span> CONSTRUYE TU LEGADO EN ENTRENAMATCH
    </div>
    <p className="text-sm text-[#f5e8c7] mb-3 leading-snug">Tu galería y tus EntrenaSyncs son tu capital único. Hazlos visibles: otros verán tu progreso real y querrán sincronizarse para multiplicar poder.</p>
    <div className="text-[10px] space-y-0.5 mb-4 text-[#9CA3AF]">
      {!currentUser.photos?.length && <div>• Sube tu primera foto de sesión (tu presencia en el mapa)</div>}
      {(currentUser.photos?.length || 0) < 3 && <div>• 3+ fotos = galería de rendimiento que inspira</div>}
      {!currentUser.bio && <div>• Bio con propósito = matches de alto valor</div>}
      {(profilePosts[effectiveUserId] || []).filter((p:any)=>p.photo).length === 0 && <div>• Publica 1 foto de Sync compartido (tu primer ripple)</div>}
    </div>
    <button
      type="button"
      onClick={() =>
        openCommunityFeed('🔥 Sumando a mi red de rendimiento en EntrenaMatch — ¿quién se une?')
      }
      className="w-full py-2.5 text-sm rounded-2xl bg-[#FFD700] text-black font-extrabold active:brightness-90 tracking-wide"
    >
      CONSTRUIR MI RED DE RENDIMIENTO AHORA
    </button>
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
          const newBio = e.target.value.trim()
          if (newBio !== (currentUser.bio || '')) {
            const u = { ...currentUser, bio: newBio }
            saveUserWithRealSync(u as any)
            toast('Bio actualizada')
          }
          setIsEditingBio(false)
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

    </>
  )
}
