// @ts-nocheck
import { useState, type ChangeEvent } from 'react';
import { Dumbbell, MapPin, Camera, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINING_OPTIONS, TRAINING_GOALS, TRAINING_INTENSITIES } from '../../constants'; // resolves to index.ts

// Camera is provided by the loader loaded from App.tsx in CAP builds (via global side effect).
// No direct dynamic import here to avoid module graph issues in bundler analysis.
let CapacitorCamera: any = null

if (typeof window !== 'undefined' && (window as any).Capacitor) {
  const plugins = (window as any).__CAPACITOR_PLUGINS__ || {}
  CapacitorCamera = plugins.Camera || null
}

interface OnboardingFlowProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  currentUser: any;
  saveUser: (user: any) => void; // can be sync local or async saveUserWithRealSync
  setShowOnboarding: (show: boolean) => void;
  requestUserLocation: () => void;
  consents: any;
  setConsents: (consents: any) => void;
  triggerHaptic?: (style?: 'light' | 'medium' | 'success') => void;
  uploadPhotoIfNeeded?: (dataUrl: string) => Promise<string>;
}

export const OnboardingFlow = ({
  onboardingStep,
  setOnboardingStep,
  currentUser,
  saveUser,
  setShowOnboarding,
  requestUserLocation,
  consents,
  setConsents,
  triggerHaptic = () => { try { navigator.vibrate && navigator.vibrate(20) } catch {} },
  uploadPhotoIfNeeded,
}) => {
  // Internal state (moved from App.tsx for better encapsulation)
  // Seed from existing currentUser (for edit flow or returning incomplete profiles) so user doesn't re-type everything
  const [onboardData, setOnboardData] = useState<any>(() => {
    if (currentUser && currentUser.name) {
      return {
        name: currentUser.name || '',
        age: currentUser.age || 26,
        gender: currentUser.gender || 'mujer',
        city: currentUser.city || 'Viña del Mar',
        country: currentUser.country || 'Chile',
        lat: currentUser.lat || -33.0153,
        lng: currentUser.lng || -71.5528,
        bio: currentUser.bio || '',
        photos: currentUser.photos || [],
        trainingTypes: currentUser.trainingTypes || [],
        goals: currentUser.goals || [],
        level: currentUser.level || 'Intermedio',
        intensity: currentUser.intensity || 'Moderado',
        availability: currentUser.availability || [],
        wantsToGoLive: !!currentUser?.trainingNow
      }
    }
    return {
      name: '',
      age: 26,
      gender: 'mujer',
      city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
      bio: '',
      photos: [],
      trainingTypes: [],
      goals: [],
      level: 'Intermedio',
      intensity: 'Moderado',
      availability: [],
      wantsToGoLive: true // default excite new users with the killer live feature
    }
  });

  // Consents fully managed internally now (previous props were dummy)
  // For edit mode, pre-fill from existing legalConsents so user doesn't have to re-tap to save changes
  const [localConsents, setLocalConsents] = useState(() => {
    if (currentUser && currentUser.legalConsents) {
      return {
        is18: !!currentUser.legalConsents.is18,
        isForTraining: !!currentUser.legalConsents.isForTraining,
        sharesLocation: !!currentUser.legalConsents.sharesLocation,
      };
    }
    return {
      is18: false,
      isForTraining: false,
      sharesLocation: false
    };
  });

  // Helper to process photos (upload if data: in real mode) - makes creation safe and attractive (no bloat)
  const processPhotos = async (photos: string[]): Promise<string[]> => {
    if (!uploadPhotoIfNeeded) return photos;
    return Promise.all(photos.map(p => uploadPhotoIfNeeded(p)));
  };

  const updateOnboard = (patch: any) => {
    setOnboardData((prev: any) => ({ ...prev, ...patch }));
  };

  const isEditingProfile = !!(currentUser && currentUser.name);

  // Live updating preview card (the key onboarding improvement - user sees exactly how they will appear in Explore + live lists)
  // Enhanced to preview the unique EntrenaSync and live features to build excitement from day 1
  const renderProfilePreview = () => {
    const d = onboardData;
    const hasPhoto = (d.photos || []).length > 0;
    const mainPhoto = hasPhoto ? d.photos[0] : null;
    const previewTraining = (d.trainingTypes || []).slice(0, 2).join(' · ') || 'Entrenamiento';
    const previewGoals = (d.goals || []).slice(0, 1);
    const isLive = !!d.wantsToGoLive;
    return (
      <div className="mb-4 rounded-3xl overflow-hidden border border-[#22c55e]/30 bg-[#111113] shadow-xl">
        <div className="relative h-36">
          {mainPhoto ? (
            <img src={mainPhoto} className="absolute inset-0 w-full h-full object-cover" alt="preview" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C20] to-black flex items-center justify-center">
              <div className="text-center text-[#9CA3AF]">
                <Dumbbell className="mx-auto mb-1 opacity-50" size={28} />
                <div className="text-xs">Sube tu primera foto para previsualizar</div>
              </div>
            </div>
          )}
          {/* Gradient overlays like real swipe cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

          {/* LIVE badge if opted - sells the killer feature right in preview */}
          {isLive && (
            <div className="absolute top-2 left-2 live-pill green text-[9px] px-2 py-0.5 flex items-center gap-1" style={{animation: 'live-pulse-green 1.8s ease-in-out infinite'}}>
              🟢 EN VIVO AHORA
            </div>
          )}
          {d.level && <div className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-white/90 text-black font-semibold">{d.level}</div>}

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-baseline gap-2">
              <div className="font-bold text-xl tracking-tighter">{d.name || 'Tu nombre'} <span className="text-sm font-normal text-white/70">· {d.age || 26}</span></div>
              <div className="text-xs text-white/70 ml-auto">{d.city || 'Viña del Mar'}</div>
            </div>
            <div className="text-xs text-white/80 line-clamp-1 mt-0.5 pr-6">{d.bio || 'Tu bio aparecerá aquí...'}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {previewTraining && <span className="text-[9px] bg-white/25 px-1.5 py-px rounded-full">{previewTraining}</span>}
              {previewGoals.map((g: string) => <span key={g} className="text-[8px] bg-[#FF671F]/80 text-black px-1 py-px rounded-full">{g}</span>)}
              {d.intensity && <span className="text-[8px] bg-white/20 px-1 py-px rounded">{d.intensity}</span>}
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 text-[9px] bg-[#0D0D10] text-[#22c55e] flex items-center gap-1 border-t border-[#22c55e]/20">
          <span>👁️ Tu presencia en el Pulso y swipes</span>
          {isLive && <span className="ml-auto font-bold">¡VERDE EN EL MAPA AL TERMINAR!</span>}
          <span className="ml-auto text-[8px] text-[#FF671F]">⚡ Red con peso • ripples visibles • syncs que se sienten</span>
        </div>
        {/* Unique ritual mock: small live map simulation for excitement - makes the first Live feel inevitable */}
        {isLive && (
          <div className="mx-3 -mt-1 mb-1 px-2 py-1 bg-[#0a120f] border border-[#22c55e]/20 rounded-b-2xl text-[7px] text-[#22c55e] flex items-center gap-1">
            <span>🗺️</span> <span>Pulso simulado: tú + 4 cerca • tether dorado listo • primer match en 20s</span>
          </div>
        )}
      </div>
    );
  };

  // Quick fill example data - huge for testers / fast flow (addresses "onboarding feels long")
  const fillExampleData = () => {
    updateOnboard({
      name: 'Alex Rivera',
      age: 27,
      gender: 'hombre',
      city: 'Viña del Mar',
      country: 'Chile',
      bio: 'Entreno pesas y running por la costanera. Busco gente motivada para ir constante 4-5 veces por semana. ¡Sin excusas!',
      trainingTypes: ['Pesas/Gym', 'Running', 'Funcional'],
      goals: ['Ganar músculo', 'Mejorar resistencia', 'Socializar y motivación'],
      level: 'Intermedio',
      intensity: 'Moderado',
      availability: ['Tarde', 'Noche'],
      wantsToGoLive: true,
      photos: [ // unique demo photos for attractive preview
        'https://picsum.photos/id/1011/600/800',
        'https://picsum.photos/id/1005/600/800',
        'https://picsum.photos/id/201/600/800'
      ]
    });
    toast.success('¡Datos de ejemplo cargados!', { description: 'Ajusta lo que quieras. La preview se actualiza en vivo.' });
  };

  const suggestedBios = [
    'Pesas 4x por semana + correr al atardecer. Busco compañero/a constante para motivarnos.',
    'Calistenia y yoga en los cerros. Me encanta entrenar al aire libre y tomar algo después.',
    'CrossFit y boxeo. Nivel avanzado, busco sparring serio sin excusas.',
    'Running y pilates. Corro por la costanera 3 veces semana, ideal para sumar kms juntos.'
  ];

  const toggleAvailability = (time: string) => {
    const curr = onboardData.availability || [];
    const next = curr.includes(time) ? curr.filter((t: string) => t !== time) : [...curr, time];
    updateOnboard({ availability: next });
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).slice(0, 6).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    const urls = await Promise.all(readers);
    let finalUrls = urls;
    if (uploadPhotoIfNeeded) {
      finalUrls = await Promise.all(urls.map(u => uploadPhotoIfNeeded(u)));
    }
    const current = onboardData.photos || [];
    updateOnboard({ photos: [...current, ...finalUrls].slice(0, 6) });
    try { triggerHaptic('light') } catch {}
  };

  const removeOnboardPhoto = (index: number) => {
    const newPhotos = (onboardData.photos || []).filter((_: any, i: number) => i !== index);
    updateOnboard({ photos: newPhotos });
  };

  // Native camera support (Capacitor)
  const takeNativePhoto = async () => {
    if (!CapacitorCamera || typeof window === 'undefined' || !(window as any).Capacitor) {
      toast('Cámara nativa no disponible en esta versión web');
      return;
    }
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 'base64',
      });
      if (photo && photo.base64String) {
        const dataUrl = `data:image/jpeg;base64,${photo.base64String}`;
        let final = dataUrl;
        if (uploadPhotoIfNeeded) {
          final = await uploadPhotoIfNeeded(dataUrl);
        }
        const current = onboardData.photos || [];
        if (current.length < 6) {
          updateOnboard({ photos: [...current, final] });
          try { triggerHaptic('light') } catch {}
        } else {
          toast('Máximo 6 fotos');
        }
      }
    } catch (err) {
      toast('No se pudo tomar la foto (permiso o cancelación)');
    }
  };
  const nextOnboarding = () => {
    if (onboardingStep < 3) {
      try { triggerHaptic('light') } catch {}
      setOnboardingStep(s => s + 1);
    } else {
      finishOnboarding(); // async but fire-and-forget is fine (it handles its own errors)
    }
  };

  // Local GPS wrapper: syncs directly to onboardData (fixes previous disconnect) + calls parent for global
  const handleGpsRequest = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateOnboard({ lat: latitude, lng: longitude });
        try { requestUserLocation && requestUserLocation(); } catch {}
        toast.success('¡Ubicación GPS actualizada!', { description: `Usando (${latitude.toFixed(2)}, ${longitude.toFixed(2)}) para matching` });
      },
      () => toast.error('No pudimos obtener tu ubicación GPS. Ingresa manualmente.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const finishOnboarding = async () => {
    if (!onboardData.name || !onboardData.bio || onboardData.photos?.length === 0 || onboardData.trainingTypes?.length === 0 || (onboardData.goals?.length || 0) === 0) {
      toast.error('Faltan datos', { description: 'Nombre, bio, foto, tipos de entrenamiento y al menos un objetivo son obligatorios' });
      return;
    }
    if ((onboardData.age || 0) < 18) {
      toast.error('Debes ser mayor de 18 años', { description: 'EntrenaMatch es solo para personas mayores de 18 años' });
      return;
    }
    const allConsents = Object.values(localConsents).every(v => v === true);
    if (!allConsents) {
      toast.error('Faltan aceptaciones', { description: 'Debes aceptar todos los consentimientos para continuar' });
      return;
    }
    if ((onboardData.availability || []).length === 0) {
      // soft default instead of hard block
      updateOnboard({ availability: ['Tarde'] });
    }

    // Process photos (upload data: to Storage if real mode) before save - fixes errors with large base64 in Firestore profiles.
    let finalPhotos = onboardData.photos || [];
    if (uploadPhotoIfNeeded && finalPhotos.some((p: string) => p && p.startsWith('data:'))) {
      finalPhotos = await Promise.all(finalPhotos.map((p: string) => uploadPhotoIfNeeded(p)));
    }

    // Preserve any extra fields the user may have (e.g. verificationStatus) when editing
    const newUser: any = {
      ...(currentUser || {}),
      id: 'me',
      name: onboardData.name!,
      age: onboardData.age!,
      gender: onboardData.gender!,
      city: onboardData.city || 'Viña del Mar',
      country: onboardData.country || 'Chile',
      lat: onboardData.lat || -33.0153,
      lng: onboardData.lng || -71.5528,
      bio: onboardData.bio!,
      photos: finalPhotos,
      trainingTypes: onboardData.trainingTypes!,
      goals: onboardData.goals || [],
      level: onboardData.level!,
      intensity: onboardData.intensity || 'Moderado',
      availability: (onboardData.availability || []).length ? onboardData.availability : ['Tarde'],
      // Spark the killer live feature immediately if user opted in onboarding (or default for new)
      ...(onboardData.wantsToGoLive ? {
        trainingNow: true,
        trainingNowSince: Date.now(),
        liveStreak: (currentUser?.liveStreak || 0) + 1,
        lastLiveDate: Date.now()
      } : {}),
      legalConsents: {
        acceptedAt: Date.now(),
        termsVersion: 'v1.1',
        privacyVersion: 'v1.1',
        communityVersion: 'v1.0',
        is18: localConsents.is18,
        isForTraining: localConsents.isForTraining,
        sharesLocation: localConsents.sharesLocation,
      }
    };

    try {
      // saveUser may be async (saveUserWithRealSync writes to Firestore for real users)
      await Promise.resolve(saveUser(newUser));
      setShowOnboarding(false);
      setOnboardingStep(0);

      const liveDesc = onboardData.wantsToGoLive ? ' ¡Estás EN VIVO ahora en el Pulso! Ve a Explorar y da like al primer perfil vivo cerca.' : ' Ve a Explorar y activa Live o da like a alguien cerca para tu primer match.';
      toast.success(isEditingProfile ? '¡Perfil actualizado!' : '¡Iniciado! Tu primer ritual te espera.', { 
        description: isEditingProfile 
          ? 'Los cambios se guardaron y sincronizaron con el backend real.' 
          : ('Bienvenido al Círculo. ' + liveDesc + ' Crea un EntrenaSync en <60s más y sentirás la diferencia.')
      });
      try { triggerHaptic('success') } catch {}

      // Ceremonial touch: for new users who opt live, create a subtle "iniciación" post so their first presence is felt in the community
      if (!isEditingProfile && onboardData.wantsToGoLive) {
        // The save already triggers live, but we can hint at the first ripple opportunity
      }
    } catch (err) {
      console.error('Error guardando perfil en onboarding:', err);
      toast.error('No se pudo guardar el perfil', { description: 'Revisa tu conexión e intenta de nuevo.' });
      // Do not close the flow on error so user can retry
    }
  };

  return (
    <div className="app-container flex flex-col bg-[#0D0D10] text-white">
      <div className="flex-1 flex flex-col p-6 pt-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(255,103,31,0.4)', '0 0 0 16px rgba(255,103,31,0.15)', '0 0 0 0 rgba(255,103,31,0.4)'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="w-12 h-12 rounded-2xl bg-[#FF671F] flex items-center justify-center ring-1 ring-[#FF671F]/30"
          >
            <Dumbbell className="w-7 h-7 text-black" />
          </motion.div>
          <div>
            <div className="font-bold text-3xl tracking-[-1.5px]">ENTRENAMATCH</div>
            <div className="text-[#FF671F] text-[10px] -mt-0.5 tracking-[2.5px] font-medium">RITUAL DE INICIACIÓN • EL PULSO TE ESPERA</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-[-1.2px] leading-none mb-0.5">
                {isEditingProfile ? 'Edita tu presencia en el Círculo' : 'Iniciación al Ritual'}
              </div>
              <div className="text-[#9CA3AF] text-sm">Crea tu perfil único • activa tu primer Pulso • primer match en &lt;90s. <span className="font-bold text-[#FF671F]">Único en el fitness.</span></div>
            </div>
            {!isEditingProfile && (
              <button onClick={fillExampleData} className="text-[10px] px-3 py-1.5 rounded-2xl border border-[#22c55e]/40 text-[#22c55e] active:bg-[#22c55e]/10 font-medium">Rellenar ejemplo</button>
            )}
          </div>
        </div>

        {/* Progress - 4 steps, ~15-20s each, total <90s to first action */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
            <div className="font-medium text-[#FF671F]">Paso {onboardingStep + 1} de 4 • {Math.round((onboardingStep+1)/4 * 100)}% listo</div>
            <div className="text-[#9CA3AF]">
              {onboardingStep === 0 && 'Tu Presencia'}
              {onboardingStep === 1 && 'Tu Esencia'}
              {onboardingStep === 2 && 'El Pulso Vivo'}
              {onboardingStep === 3 && 'Los Votos'}
            </div>
          </div>
          <div className="flex gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className={`step-dot flex-1 ${i <= onboardingStep ? 'active' : ''}`} style={i <= onboardingStep ? {width: 'auto', minWidth: 28} : {}} />
            ))}
          </div>
        </div>

        {/* LIVE PREVIEW - ALWAYS VISIBLE, updates in real-time as user types/selects. THIS IS THE KEY IMPROVEMENT for onboarding. */}
        {renderProfilePreview()}

        {/* Scrollable step content - 4 ultra-fast steps for <60-90s to first Live or Match. NO old/dupe JSX. */}
        <div className="flex-1 overflow-auto -mx-1 px-1 pb-8 min-h-0">

        {/* Paso 0: Presencia rápida (nombre + foto + bio) — 15s */}
        {onboardingStep === 0 && (
          <div className="space-y-5">
            <div>
              <div className="text-xl font-semibold mb-1 tracking-tight">Tu nombre en el Círculo de Rendimiento</div>
              <input 
                type="text" 
                value={onboardData.name} 
                onChange={e => { updateOnboard({ name: e.target.value }); try { triggerHaptic('light') } catch {} }}
                placeholder="Alex Rivera" 
                className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-4 py-3.5 text-2xl font-semibold tracking-tighter" 
              />
            </div>

            {/* Photo - camera-first for speed + native feel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#9CA3AF]">Tu foto principal (obligatoria)</div>
                <div className="text-[10px] text-[#FF671F]">Cámara recomendada</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(onboardData.photos || []).slice(0,6).map((photo: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#FF671F]/40 ring-1 ring-[#FF671F]/10">
                    <img src={photo} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => { removeOnboardPhoto(idx); try { triggerHaptic('light') } catch {} }} className="absolute top-1 right-1 bg-black/80 text-white p-1 rounded-full text-xs leading-none">×</button>
                    {idx === 0 && <div className="absolute bottom-0 left-0 right-0 text-[7px] bg-[#FF671F] text-black text-center">principal</div>}
                  </div>
                ))}
                {(onboardData.photos || []).length < 6 && (
                  <>
                    <button onClick={() => { try { triggerHaptic('medium') } catch {}; takeNativePhoto() }} className="aspect-square border-2 border-[#FF671F] rounded-2xl flex flex-col items-center justify-center text-[#FF671F] text-xs font-medium active:bg-[#FF671F]/10 active:scale-[0.985]">
                      <Camera size={26} className="mb-1" />
                      <span>Cámara YA</span>
                    </button>
                    <label className="aspect-square border-2 border-dashed border-[#3A3A40] rounded-2xl flex flex-col items-center justify-center text-xs cursor-pointer active:bg-[#1C1C20]">
                      <Camera className="mb-1 text-[#9CA3AF]" size={22} />
                      <span className="text-[#9CA3AF]">Elegir foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </>
                )}
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1.5">Hasta 6 fotos • la primera es tu presencia principal en el Pulso y swipes. Arrastra en Perfil para reordenar.</p>
            </div>

            {/* Bio quick */}
            <div>
              <div className="text-sm text-[#9CA3AF] mb-1.5">Tu bio (corta y directa)</div>
              <textarea 
                value={onboardData.bio || ''} 
                onChange={e => { updateOnboard({ bio: e.target.value.slice(0,140) }); try { triggerHaptic('light') } catch {} }}
                className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-4 py-3 h-14 text-sm resize-y"
                placeholder="Pesas + running. Busco gente constante para motivarnos sin excusas."
              />
              <button onClick={() => { updateOnboard({ bio: 'Pesas 4x semana y running por la costanera. Quiero entrenar con gente seria y constante.' }); try { triggerHaptic('light') } catch {} }} className="mt-1 text-xs text-[#FF671F] underline">Usar bio de ejemplo (1 toque)</button>
            </div>
          </div>
        )}

        {/* Paso 1: Tu esencia de entrenamiento — 15s. Esto alimenta Pulso + matches reales */}
        {onboardingStep === 1 && (
          <div className="space-y-6">
            <div>
              <div className="text-xl font-semibold mb-2 tracking-tight">¿Qué rituales de movimiento practicas? (elige 1-3)</div>
              <div className="flex flex-wrap gap-2">
                {TRAINING_OPTIONS.map((type: string) => {
                  const selected = (onboardData.trainingTypes || []).includes(type);
                  return (
                    <button key={type} onClick={() => { 
                      const curr = onboardData.trainingTypes || [];
                      const next = selected ? curr.filter((t:string)=>t!==type) : [...curr, type].slice(0,3);
                      updateOnboard({ trainingTypes: next }); 
                      try { triggerHaptic('light') } catch {} 
                    }} className={`px-4 py-2 rounded-2xl text-sm border active:scale-95 transition ${selected ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'}`}>
                      {type}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1">Apareces en el Pulso correcto y en recomendaciones precisas de la Red.</p>
            </div>

            <div>
              <div className="text-xl font-semibold mb-2 tracking-tight">Tu propósito principal en el Círculo</div>
              <div className="flex flex-wrap gap-2">
                {TRAINING_GOALS.map((goal: string) => {
                  const selected = (onboardData.goals || []).includes(goal);
                  return (
                    <button key={goal} onClick={() => { 
                      updateOnboard({ goals: [goal] }); 
                      try { triggerHaptic('light') } catch {} 
                    }} className={`px-4 py-2 rounded-2xl text-sm border active:scale-95 ${selected ? 'bg-[#FF671F] text-black' : 'border-[#2F2F35]'}`}>
                      {goal}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-[#9CA3AF] mt-1">Usado para crear matches de alto valor y Daily Challenges que importan.</div>
            </div>
          </div>
        )}

        {/* Paso 2: EL AHA MOMENT — por qué esto es diferente. Live + EntrenaSync + Red con peso real. 20s */}
        {onboardingStep === 2 && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-[#0f1a14] to-[#111113] border border-[#22c55e]/30 p-5">
              <div className="uppercase tracking-[1.5px] text-[10px] text-[#22c55e] font-semibold mb-1">LA MAGIA QUE NADIE MÁS TIENE</div>
              <div className="text-lg font-semibold leading-tight mb-3">EntrenaSync + Pulso del Mapa = tu Red cobra vida real y medible</div>
              
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><span className="text-[#22c55e] mt-0.5">1</span><span><span className="font-semibold">Marca "Entrenando Ahora"</span> → apareces en el mapa con urgencia (verde pulsante). Otros cerca te ven en tiempo real.</span></div>
                <div className="flex gap-3"><span className="text-[#22c55e] mt-0.5">2</span><span><span className="font-semibold">Dan like</span> → chat instantáneo. Estás a 1 toque de conectar con alguien que está sudando ahora mismo.</span></div>
                <div className="flex gap-3"><span className="text-[#22c55e] mt-0.5">3</span><span><span className="font-semibold">Creas EntrenaSync</span> → acciones compartidas en vivo (flexiones, sprints, etc). Ambos sienten el efecto. Se crea un tether visual dorado en el mapa. + Network Power para tu Red.</span></div>
                <div className="flex gap-3"><span className="text-[#22c55e] mt-0.5">4</span><span>Todo queda en tus muros, en el feed global y genera <span className="font-semibold text-[#FF671F]">ripples</span> que otros presencian. Entrenar juntos tiene consecuencias medibles.</span></div>
              </div>
            </div>

            <div className="text-center pt-1">
              <div className="text-base font-semibold mb-2 text-[#22c55e]">¿Activas tu primer Pulso Vivo ahora? (el corazón de lo único)</div>
              <button 
                onClick={() => { 
                  const next = !onboardData.wantsToGoLive;
                  updateOnboard({ wantsToGoLive: next }); 
                  try { triggerHaptic(next ? 'success' : 'light') } catch {} 
                }} 
                className={`w-full py-4 rounded-3xl text-lg font-bold transition-all active:scale-[0.985] ${onboardData.wantsToGoLive ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/30' : 'border-2 border-[#22c55e] text-[#22c55e] active:bg-[#22c55e]/10'}`}
              >
                {onboardData.wantsToGoLive ? '✅ SÍ — Activa mi primer LIVE al terminar' : '🚀 ACTIVAR MI PRIMER LIVE AHORA (recomendado)'}
              </button>
              <div className="text-[11px] text-[#9CA3AF] mt-2">Banner verde visible al instante. En el mapa + explore. 30 segundos después ya puedes dar tu primer like y match.</div>
            </div>

            <div className="text-center text-[10px] text-[#FF671F]/90">Esto no es una app de citas de gym. Es la primera red donde entrenar juntos se siente en el cuerpo de ambos al mismo tiempo.</div>
          </div>
        )}

        {/* Paso 3: Votos cortos + gran CTA de acción inmediata */}
        {onboardingStep === 3 && (
          <div className="space-y-4">
            <div>
              <div className="text-xl font-semibold mb-1.5">Los 3 Votos del Círculo</div>
              <div className="text-xs text-[#9CA3AF]">Sella tu entrada al primer ritual donde el esfuerzo se comparte.</div>
            </div>

            {[
              { key: 'is18', label: 'Juro ser mayor de 18 y entrenar con respeto al Círculo' },
              { key: 'isForTraining', label: 'Juro entrenar en serio y con motivación real para mi Red' },
              { key: 'sharesLocation', label: 'Juro aparecer en el Pulso vivo para sincronizarme con otros' }
            ].map(item => (
              <label key={item.key} onClick={() => { 
                const next = ! (localConsents as any)[item.key]; 
                setLocalConsents(prev => ({ ...prev, [item.key]: next })); 
                try { triggerHaptic('light') } catch {} 
              }} className="flex items-center gap-3 p-4 bg-[#1C1C20] rounded-2xl border border-[#2F2F35] cursor-pointer active:bg-[#25252A] active:scale-[0.995]">
                <input type="checkbox" checked={(localConsents as any)[item.key]} readOnly className="w-5 h-5 accent-[#FF671F] pointer-events-none" />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}

            <div className="mt-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/50 p-4">
              <div className="font-bold text-[#22c55e] text-sm mb-1">AL SELLAR LOS VOTOS:</div>
              <div className="text-sm leading-snug">Si activaste Live → tu punto verde pulsa en el mapa al instante. <span className="font-semibold">Explora</span> → ❤️ en el primero que veas cerca = chat + match en &lt;20s. Abre chat → "Iniciar EntrenaSync" y siente el tether.</div>
            </div>

            <div className="text-[10px] text-center text-[#9CA3AF] pt-1">Tus datos se guardan en el backend real. Puedes editar todo después desde Perfil.</div>
          </div>
        )}

        </div> {/* end scrollable step content */}

        {/* Fixed bottom navigation - always visible, haptic, speed-focused */}
        <div className="pt-3 pb-2 flex flex-col gap-2 bg-[#0D0D10] border-t border-[#2F2F35]">
          {onboardingStep > 0 && (
            <button onClick={() => { try { triggerHaptic('light') } catch {}; setOnboardingStep(onboardingStep - 1) }} className="w-full py-3 text-sm rounded-2xl border border-[#2F2F35] active:bg-[#1f242b]">
              Atrás
            </button>
          )}

          {onboardingStep === 1 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0) && (
            <p className="text-center text-[10px] text-[#ef4444] font-medium">
              Elige al menos un tipo de entrenamiento y un objetivo
            </p>
          )}

          <button 
            onClick={nextOnboarding} 
            className="w-full py-3.5 text-base font-semibold rounded-3xl btn-primary disabled:opacity-50 active:scale-[0.985]"
            disabled={
              (onboardingStep === 1 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0)) ||
              (onboardingStep === 3 && !Object.values(localConsents).every(Boolean))
            }
          >
            {onboardingStep < 3 ? 'Continuar el Ritual' : '¡SELLAR LOS VOTOS + ENTRAR AL PULSO VIVO!'}
          </button>
          <div className="text-center text-[9px] text-[#9CA3AF]">Tu perfil único en el Círculo • primer Pulso en &lt;90s. Hazlo real.</div>
        </div>
      </div>
    </div>
  );
};
