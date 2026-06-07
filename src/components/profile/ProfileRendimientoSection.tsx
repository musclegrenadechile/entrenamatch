import { Clock, Dumbbell, Heart, Star, Users, Zap } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileRendimientoSection(props: ProfileTabProps) {
  const {
    profileSection,
    matches,
    squads,
    currentUser,
    dailyPulse,
    liveCountForUI,
    liveTrainingNow,
    setActiveTab,
    setShowLiveModal,
    saveUserWithRealSync,
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
    realProfiles,
    profilePosts,
    effectiveUserId,
    SEED_PROFILES,
    setShowFullProfile,
  } = profileTabBindings(props)

  return (
    <>
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

<ProfileDailyPulseSection {...props} />

<ProfileSyncNetworkSection {...props} />
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

    </>
  )
}
