import { Download, Star } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { APP_VERSION } from '../../constants'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileAccountSection(props: ProfileTabProps) {
  const {
    profileSection,
    currentUser,
    debugLogsRef,
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
    firebaseUser,
    db,
    isDemoMode,
    setLastSync,
    loadMyFeedbacks,
    requestWebNotificationPermission,
    requestNativePushPermission,
    PushNotifications,
    notifPrefs,
    setNotifPrefs,
    setShowPwaInstall,
    handleLogout,
  } = profileTabBindings(props)
  return (
    <>
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

    </>
  )
}
