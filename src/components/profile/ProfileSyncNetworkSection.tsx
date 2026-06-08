import {
  Camera, Edit2, Plus, Send,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileSyncNetworkSection(props: ProfileTabProps) {
  const p = profileTabBindings(props)
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
    profileSection,
    liveTrainingNow,
    realProfiles,
    SEED_PROFILES,
    startSyncWith,
    tryAutoStartSync,
    setShowFullProfile,
    networkStats: ns,
  } = p

  return (
    <>
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
        <div className="text-[10px] text-[#9CA3AF]">tu grafo • Fuerza del equipo {networkStats.networkPower}</div>
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
          {liveBondBonus > 0 && <span className="ml-1 text-[8px] text-[#22c55e] animate-pulse">+{liveBondBonus} alianzas en vivo 🔥</span>}
        </div>
      );
    })()}

    {/* ULTRA VIVO: Live bonds right now - if any of your EntrenaSync legends are training live, show them with instant re-sync CTA. Makes bonds feel alive and valuable. */}
    {Object.keys(syncBonds).length > 0 && (
      <div className="mt-2 pt-2 border-t border-white/10">
        <div className="text-[8px] uppercase tracking-[1px] text-[#FFD700]/80 mb-1">🔥 TU RED EN VIVO AHORA — re-sync = +Fuerza del equipo + resultados que se propagan</div>
        <div className="flex flex-wrap gap-1">
          {liveTrainingNow.filter((u: any) => Object.keys(syncBonds).includes(u.id)).slice(0, 3).map((livePartner: any) => (
            <button
              key={livePartner.id}
              onClick={() => { try { triggerHaptic('medium') } catch {}; startSyncWith(livePartner.id, livePartner.name || livePartner.nombre) }}
              className="text-[8px] px-2 py-0.5 bg-[#FFD700]/20 hover:bg-[#FFD700]/30 text-[#FFD700] rounded-full active:scale-[0.95] transition flex items-center gap-1 border border-[#FFD700]/50 font-medium"
            >
              <span>{(livePartner.name || livePartner.nombre || '?').split(' ')[0]}</span> <span className="text-[6px] opacity-70">F{syncBonds[livePartner.id]?.bondLevel || 1}</span>
              <span className="text-[7px] opacity-80">🔄 Re-sync (sube Fuerza del equipo)</span>
            </button>
          ))}
          {liveTrainingNow.filter((u: any) => Object.keys(syncBonds).includes(u.id)).length === 0 && (
            <span className="text-[8px] text-[#9CA3AF]/70">Ninguno de tu red está entrenando ahora</span>
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
          { label: 'Alianzas', val: Math.min(100, Object.keys(syncBonds).length * 15) },
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
      <div className="text-[11px] font-bold text-[#FFD700] mb-0.5">Fuerza del equipo: {networkStats.networkPower} — tu red de sync te hace más fuerte, más consistente y más visible</div>
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
          <div key={pid} className="network-bond-card rounded-2xl p-3 text-xs flex gap-3 items-center active:scale-[0.985] border border-[#FF671F]/20 hover:border-[#FF671F]/50 transition-all" onClick={() => { const prof = p; if (prof) setShowFullProfile(prof as any); else toast('Compa no disponible ahora') }}>
            <div className="w-10 h-10 rounded-full bg-[#1C1C20] overflow-hidden ring-2 ring-[#FF671F]/40 flex-shrink-0 relative">
              {p?.photos?.[0] ? <img src={p.photos[0]} className="w-full h-full object-cover" /> : <div className="text-center text-xl pt-1.5">{(p?.name||'?')[0]}</div>}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center text-[8px] ring-1 ring-[#0D0D10]">🔄</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white/95 truncate flex items-center gap-1">{p?.name || 'Socio'} <span className="text-[8px] text-[#FF671F] font-mono">F{b.bondLevel}</span>{liveTrainingNow.some(u => u.id === pid && u.trainingNow) && <span className="ml-1 text-[7px] px-1 bg-[#22c55e] text-black rounded font-bold animate-pulse">EN VIVO</span>}</div>
              <div className="text-[9px] text-[#9CA3AF]">{b.totalMin}min • {b.sessions} sesiones • {b.avgRating}★ • <span className="text-[#22c55e]">tu Fuerza del equipo sube con esta alianza</span></div>
              <div className="bond-flame text-[12px] leading-none mt-0.5">{flames}</div>
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
    <div className="text-[8px] text-center text-[#22c55e]/60 mt-1">Re-sync para subir tu Fuerza del equipo, fortalecer alianzas y ganar más visibilidad en el GymPulse</div>
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
          const msg = `🔥 Entreno en EntrenaMatch con mis GymPartners. Syncs reales dan +Fuerza del equipo, prioridad en el GymPulse y resultados que se propagan. ¿Entrenamos juntos? https://musclegrenadechile.github.io/entrenamatch/`;
          navigator.clipboard?.writeText(msg).then(() => toast.success('Mensaje copiado', { description: 'Comparte con tu red para invitarlos a construir el grafo de alto rendimiento.' })).catch(() => toast('Invita a tu red abriendo el app con ellos.'));
        }}
        className="text-[8px] px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] rounded active:bg-[#FFD700]/30 font-medium"
      >
        Invitar a tu red (copiar link)
      </button>
    </div>
  </div>
)}

    </>
  )
}
