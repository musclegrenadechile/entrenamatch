import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'
import { BRAND_COPY } from '../../constants/brandCopy'

export function ProfileMuroSection(props: ProfileTabProps) {
  const {
    profileSection,
    currentUser,
    effectiveUserId,
    profilePosts,
    syncBonds,
    setActiveTab,
    openCommunityMuro,
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
    cancelEditPost,
    recentlyPublishedPostId,
    setFeedPhotoModal,
    getRelativeTime,
    muroComposerRef,
    muroPhotoInputRef,
    triggerHaptic,
    isDemoMode,
    storage,
    CapacitorCamera,
  } = profileTabBindings(props)
  return (
    <>
{/* MURO / WALL - attractive FB-style feed to make profile feel alive */}
<div className={`px-4 mt-4${profileSection !== 'actividad' ? ' hidden' : ''}`}>
  <div className="flex items-center justify-between mb-2 px-1">
    <div className="flex items-center gap-2">
      <div className="text-xs uppercase tracking-[1px] text-[#9CA3AF]">Mi muro</div>
      <button
        type="button"
        onClick={() => (openCommunityMuro ? openCommunityMuro() : setActiveTab('home'))}
        className="text-[9px] text-[#FF671F] underline active:opacity-70"
      >
        {BRAND_COPY.communityWallTitle} →
      </button>
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
        <div className="em-v2-card p-2 text-xs space-y-1">
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
  <div className="em-v2-muro__composer">
    <div className="em-v2-muro__composer-title mb-1">
      <span>✍️</span> ¿Qué lograste hoy en tu red?
    </div>
    <div className="text-[11px] text-[#9CA3AF] mb-3">Comparte tu entreno, un Sync épico o un PR. Tu red gana Constancia y tú construyes historial visible. ¡Posts con foto dan +5 extra!</div>

    {/* Quick achievement templates - makes posting logros frictionless and celebratory (IG story style but performance) */}
    <div className="flex flex-wrap gap-1.5 mb-3">
      {[
        '🏆 PR del mes con mi alianza',
        '💪 Entreno solo pero con mi red en mente',
        '🔥 Sync de 90+ vibe con @buddy',
        '🌟 Nuevo hito en mi perfil hoy',
        '📸 Momento icónico del gym',
        '⚡ 3 syncs esta semana - en racha'
      ].map((tpl, i) => (
        <button key={i} onClick={() => setMuroComposerText(tpl)} className="em-v2-chip-btn em-v2-chip-btn--brand em-v2-chip-btn--removable">
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
            'Highlight de hoy',
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
            await createProfilePost(muroComposerText, muroComposerPhoto, undefined, {
              skipToast: true,
            })
            setMuroComposerText('')
            setMuroComposerPhoto(null)
            openCommunityMuro?.()
            toast.success(BRAND_COPY.feed.publishedTitle, {
              description: BRAND_COPY.feed.publishedDesc,
            })
          } catch (e) {
            toast.error('No se pudo publicar', { description: 'Inténtalo de nuevo.' })
          } finally {
            setMuroPublishing(false)
          }
        }}
        disabled={!muroComposerText.trim() || muroPublishing}
        className="em-v2-hero-card__cta flex-1 text-sm py-2 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {muroPublishing ? BRAND_COPY.feed.publishingLabel : BRAND_COPY.feed.publishButton}
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
    <div className="text-center text-[7px] text-[#FFD700]/50 -mt-1 mb-1">Tu red de sync = tu estatus y resultados en la primera red social de Comunidad de verdad.</div>
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
                  <button onClick={saveEditPost} disabled={!editDraft.trim()} className="em-v2-hero-card__cta text-xs px-4 py-1.5 disabled:opacity-50">Guardar cambios</button>
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
            {post.videoUrl && (
              <video
                src={post.videoUrl}
                className="w-full mt-2 rounded-xl max-h-64 object-cover bg-black"
                controls
                playsInline
                preload="metadata"
              />
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
            className="em-v2-hero-card__cta text-sm py-3 font-semibold"
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
    <button
      type="button"
      onClick={() => (openCommunityMuro ? openCommunityMuro() : setActiveTab('home'))}
      className="em-v2-card em-v2-muro__link-card text-sm active:scale-[0.99]"
    >
      <div>
        <div className="text-[#FF671F] font-medium">{BRAND_COPY.communityWallTitle} →</div>
        <div className="text-[10px] text-[#9CA3AF]">Feed de tu zona, posts fijados y más</div>
      </div>
      <span className="text-[#FF671F]">→</span>
    </button>
  </div>
</div>

    </>
  )
}
