import {
  Camera, Edit2, Plus, Send,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

/** Galería, momentos, bio — tab Actividad (oleada 349). */
export function ProfileHeroExtras(props: ProfileTabProps) {
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
    openProfileEditor,
    saveUserWithRealSync,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    reorderGallery,
    deleteExtraPhoto,
    uploadProfilePhotoIfNeeded,
    CapacitorCamera,
    profilePosts,
    effectiveUserId,
    setFeedPhotoModal,
    isEditingBio,
    setIsEditingBio,
    setLastSync,
    toggleLiveTraining,
    isTogglingLive,
    profileSection,
  } = p

  if (profileSection !== 'actividad') return null

  return (
    <>
      {currentUser.photos && currentUser.photos.length > 0 && (
        <div className="em-v2-profile-extras px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <div>
              <span className="em-v2-profile-extras__kicker">Galería de rendimiento</span>
              <span className="em-v2-profile-extras__hint ml-2">
                {currentUser.photos.length} sesiones
              </span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {currentUser.photos.map((photo: string, idx: number) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => {
                  try { triggerHaptic('light') } catch {}
                  e.dataTransfer.setData('text/plain', idx.toString())
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = parseInt(e.dataTransfer.getData('text/plain'))
                  if (!isNaN(from) && from !== idx) {
                    reorderGallery(from, idx)
                    try { triggerHaptic('medium') } catch {}
                  }
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border ${
                  idx === 0 ? 'border-[#FF671F] ring-1 ring-[#FF671F]/30' : 'border-[#2F2F35]'
                } shadow group transition-all hover:scale-[1.03] cursor-grab active:cursor-grabbing`}
              >
                <img src={photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                {idx === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-[#FF671F] text-black px-1 text-center rounded-b">
                    principal
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => deleteExtraPhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500/90 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 active:scale-90 shadow"
                  title="Eliminar foto"
                >
                  ×
                </button>
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newPhotos = [currentUser.photos[idx], ...currentUser.photos.filter((_, i) => i !== idx)]
                      const updated = { ...currentUser, photos: newPhotos }
                      saveUserWithRealSync(updated as typeof currentUser)
                      toast('Foto principal actualizada')
                    }}
                    className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 rounded active:bg-[#FF671F]"
                    title="Hacer principal"
                  >
                    ★
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {typeof window !== 'undefined' && (window as Window & { Capacitor?: unknown }).Capacitor && CapacitorCamera && (
        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={async () => {
              try {
                const photo = await CapacitorCamera.getPhoto({ quality: 80, allowEditing: true, resultType: 'base64' })
                if (photo?.base64String) {
                  const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
                  const finalUrl = await uploadProfilePhotoIfNeeded(dataUrl)
                  const newPhotos = [...(currentUser.photos || []), finalUrl].slice(0, 6)
                  const updated = { ...currentUser, photos: newPhotos }
                  saveUserWithRealSync(updated as typeof currentUser)
                  toast.success('Foto agregada a tu galería')
                  setLastSync(new Date())
                }
              } catch {
                toast('No se pudo usar la cámara')
              }
            }}
            className="em-v2-profile-extras__camera-btn w-full py-2.5 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <Camera size={16} /> Añadir foto de sesión
          </button>
        </div>
      )}

      <div className="em-v2-profile-extras px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="em-v2-profile-extras__kicker">Tus momentos</div>
          <button
            type="button"
            onClick={() => openMuroComposer()}
            className="text-[10px] text-[#FF671F] flex items-center gap-1 active:opacity-80"
          >
            + Agregar <span className="text-lg leading-none">→</span>
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-hide">
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              try { triggerHaptic('medium') } catch {}
              openMuroComposer()
            }}
            onKeyDown={(e) => e.key === 'Enter' && openMuroComposer()}
            className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex flex-col items-center justify-center text-black text-[10px] font-black cursor-pointer active:scale-95 border-2 border-white/30 shadow-lg snap-start"
          >
            <Plus size={22} />
            <span className="text-[8px] -mt-0.5 tracking-widest">NUEVO</span>
          </div>
          {(() => {
            const myPosts = (profilePosts[effectiveUserId] || []).slice(0, 5)
            const items: Array<{
              type: string
              label: string
              emoji: string
              img?: string
              onClick: () => void
            }> = []
            if (currentUser.trainingNow) {
              items.push({
                type: 'live',
                label: 'LIVE hoy',
                emoji: '🟢',
                onClick: () => { setActiveTab('explore'); setShowLiveModal(true) },
              })
            }
            myPosts.forEach((post) => {
              if (post.photo) {
                items.push({
                  type: 'post',
                  label: post.text?.slice(0, 12) || 'Momento',
                  emoji: '📸',
                  img: post.photo,
                  onClick: () => setFeedPhotoModal({ url: post.photo!, postId: post.id }),
                })
              } else if ((post.text || '').includes('Sync') || (post.text || '').includes('ENTRENASYNC')) {
                items.push({ type: 'sync', label: 'Sync', emoji: '🔄', onClick: () => setActiveTab('profile') })
              }
            })
            if (items.length < 3) {
              items.push({ type: 'demo', label: 'PR 100kg', emoji: '🏋️', onClick: () => openMuroComposer() })
              items.push({ type: 'demo', label: 'Sync épico', emoji: '⚡', onClick: () => openMuroComposer() })
            }
            return items.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={item.onClick}
                onKeyDown={(e) => e.key === 'Enter' && item.onClick()}
                className="flex-shrink-0 w-16 snap-start cursor-pointer active:scale-95"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[2px] ${
                    item.type === 'live'
                      ? 'bg-[#22c55e] animate-pulse'
                      : 'bg-gradient-to-br from-[#FF671F] via-[#FFD700] to-[#FF4F79]'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#0D0D10] flex items-center justify-center text-2xl border border-white/10">
                    {item.img ? <img src={item.img} className="w-full h-full object-cover" alt="" /> : item.emoji}
                  </div>
                </div>
                <div className="text-center text-[8px] text-[#9CA3AF] mt-1 truncate font-medium">{item.label}</div>
              </div>
            ))
          })()}
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => openCommunityFeed()}
            className="em-v2-profile-hero__cta em-v2-profile-hero__cta--primary flex-shrink-0 px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Send size={14} /> Publicar
          </button>
          <button
            type="button"
            onClick={openProfileEditor}
            className="em-v2-profile-hero__cta flex-shrink-0 px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Camera size={14} /> Foto
          </button>
          {currentUser.trainingNow && (
            <button
              type="button"
              disabled={isTogglingLive}
              onClick={() => void toggleLiveTraining('off')}
              className={`flex-shrink-0 px-4 py-2 text-xs rounded-2xl border border-[#ef4444]/40 text-[#f87171] active:bg-[#ef4444]/10 flex items-center gap-1.5 ${isTogglingLive ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isTogglingLive ? 'Sync…' : 'Terminar Live'}
            </button>
          )}
        </div>
      </div>

      {(!currentUser.photos?.length
        || (currentUser.photos?.length || 0) < 3
        || !currentUser.bio
        || (profilePosts[effectiveUserId] || []).filter((post) => post.photo).length === 0) && (
        <div className="mx-4 mt-2 p-4 rounded-2xl em-v2-profile-extras__motivator">
          <div className="text-[#FFD700] font-bold mb-1.5 text-sm">Construye tu legado</div>
          <p className="text-xs text-[#9CA3AF] mb-3 leading-snug">
            Tu galería y tus syncs son tu capital en la red.
          </p>
          <button
            type="button"
            onClick={() =>
              openCommunityFeed('🔥 Sumando a mi red en EntrenaMatch — ¿quién se une?')
            }
            className="w-full py-2 text-sm rounded-xl bg-[#FFD700] text-black font-extrabold active:brightness-90"
          >
            Impulsar mi red
          </button>
        </div>
      )}

      <div className="px-4 mt-3 mb-2">
        <div className="em-v2-profile-extras__bio card p-4">
          <div className="flex justify-between items-center mb-1.5">
            <div className="em-v2-profile-extras__kicker">Sobre mí</div>
            <button type="button" onClick={openProfileEditor} className="text-[9px] text-[#FF671F] underline">
              Editar
            </button>
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
                  saveUserWithRealSync(u as typeof currentUser)
                  toast('Bio actualizada')
                }
                setIsEditingBio(false)
              }}
              autoFocus
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsEditingBio(true)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingBio(true)}
              className="text-sm leading-snug text-white/95 cursor-pointer active:opacity-80"
            >
              {currentUser.bio || 'Toca para escribir tu bio…'}
              <span className="ml-2 text-[9px] text-[#FF671F]">✎</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}