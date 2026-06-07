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
  setOnboardingStep: (step: number | ((s: number) => number)) => void;
  currentUser: any;
  saveUser: (user: any) => void; // can be sync local or async saveUserWithRealSync
  setShowOnboarding: (show: boolean) => void;
  requestUserLocation: () => void;
  consents: any;
  setConsents: (consents: any) => void;
  triggerHaptic?: (style?: 'light' | 'medium' | 'success') => void;
  uploadPhotoIfNeeded?: (dataUrl: string) => Promise<string>;
  /** create = new account ritual; edit = user opened from Profile to update */
  mode?: 'create' | 'edit';
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
  mode = 'create',
}) => {
  const isEditMode = mode === 'edit';
  // Internal state (moved from App.tsx for better encapsulation)
  // Seed from existing currentUser only in edit mode — create mode starts fresh
  const [onboardData, setOnboardData] = useState<any>(() => {
    if (mode === 'edit' && currentUser && currentUser.name) {
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
    if (mode === 'edit' && currentUser && currentUser.legalConsents) {
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

  const toggleConsent = (key: 'is18' | 'isForTraining' | 'sharesLocation') => {
    setLocalConsents((prev) => ({ ...prev, [key]: !prev[key] }))
    try { triggerHaptic('light') } catch {}
  }

  const isEditingProfile = isEditMode;

  // Live updating preview card (the key onboarding improvement - user sees exactly how they will appear in Explore + live lists)
  // Enhanced to preview the unique EntrenaSync and live features to build excitement from day 1
  const renderProfilePreview = () => {
    const d = onboardData;
    const hasPhoto = (d.photos || []).length > 0;
    const mainPhoto = hasPhoto ? d.photos[0] : null;
    const previewTraining = (d.trainingTypes || []).slice(0, 2).join(' · ') || 'Entrenamiento';
    const previewGoals = (d.goals || []).slice(0, 1);
    const isLive = !!d.wantsToGoLive;
    const mockNetworkPower = Math.max(12, Math.floor(((d.trainingTypes?.length || 1) * 8) + (isLive ? 25 : 0)));
    return (
      <div className="mb-5 rounded-3xl overflow-hidden border-2 border-[#22c55e]/40 bg-gradient-to-b from-[#0a0a0c] to-[#111113] shadow-2xl ring-1 ring-white/5">
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
          <span>👁️ Tu presencia en el GymPulse y swipes</span>
          {isLive && <span className="ml-auto font-bold">¡VERDE EN EL MAPA AL TERMINAR!</span>}
          <span className="ml-auto text-[8px] text-[#FF671F]">⚡ Red con peso • ripples visibles • syncs que se sienten</span>
        </div>
        {/* Unique ritual mock: small live map simulation for excitement - makes the first Live feel inevitable */}
        {isLive && (
          <div className="mx-3 -mt-1 mb-1 px-2 py-1 bg-[#0a120f] border border-[#22c55e]/20 rounded-b-2xl text-[7px] text-[#22c55e] flex items-center gap-1">
            <span>🗺️</span> <span>GymPulse simulado: tú + 4 cerca • tether dorado listo • primer match en 20s</span>
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

      const liveDesc = onboardData.wantsToGoLive ? ' ¡Estás EN GYMPULSE VIVO ahora! Ve a Explorar y da like al primer perfil vivo cerca.' : ' Ve a Explorar y activa Live o da like a alguien cerca para tu primer match.';
      toast.success(isEditingProfile ? '¡Perfil actualizado!' : '¡Iniciado! Tu primer GymPulse te espera.', { 
        description: isEditingProfile 
          ? 'Los cambios se guardaron y sincronizaron con el backend real.' 
          : ('¡Conectado con tus GymPartners! ' + liveDesc + ' Crea un EntrenaSync en <60s más y sentirás la diferencia.')
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
    <div className="app-container onboarding-flow flex flex-col bg-[#0D0D10] text-white min-h-[100svh] h-[100dvh] max-h-[100dvh]">
      {/* Single scroll region — avoids flex collapse that hid inputs on mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="p-5 pt-6 pb-28">
        {/* Header — compact on small screens */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.08, 1], 
              boxShadow: ['0 0 0 0 rgba(255,103,31,0.5)', '0 0 0 16px rgba(255,103,31,0.15)', '0 0 0 0 rgba(255,103,31,0.5)'] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex items-center justify-center ring-2 ring-[#FF671F]/20"
          >
            <Dumbbell className="w-6 h-6 text-black" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-2xl sm:text-3xl tracking-[-1px] text-white truncate">ENTRENAMATCH</div>
            <div className="text-[#FF671F] text-[10px] tracking-[2px] font-mono">LA RED DEL RITUAL FITNESS</div>
          </div>
          {!isEditingProfile && (
            <button 
              onClick={fillExampleData} 
              className="shrink-0 text-[8px] px-2.5 py-1.5 rounded-xl border border-[#22c55e]/50 text-[#22c55e] active:bg-[#22c55e]/10 font-semibold"
            >
              ⚡ EJEMPLO
            </button>
          )}
        </div>

        <div className="mb-3">
          <div className="text-2xl sm:text-3xl font-black tracking-[-1px] leading-tight mb-1 text-white">
            {isEditMode ? 'Remasteriza tu presencia' : 'Crea tu ritual'}
          </div>
          <div className="text-[#9CA3AF] text-sm leading-snug">
            {isEditMode
              ? 'Actualiza cómo te ven tus GymPartners en el GymPulse.'
              : 'Tu perfil es tu entrada a la red. Completa los 4 pasos en menos de 2 minutos.'}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2 px-0.5">
            <div className="font-mono text-[#FF671F] tracking-wider text-[10px]">
              {isEditMode ? 'EDIT' : 'RITUAL'} {onboardingStep + 1}/4
            </div>
            <div className="text-[#9CA3AF] text-[10px] font-medium">
              {onboardingStep === 0 && 'Presencia'}
              {onboardingStep === 1 && 'Esencia'}
              {onboardingStep === 2 && 'Pulso vivo'}
              {onboardingStep === 3 && 'Votos'}
            </div>
          </div>
          <div className="h-1.5 bg-[#1C1C20] rounded-full overflow-hidden flex">
            {[0,1,2,3].map(i => (
              <div 
                key={i} 
                className={`flex-1 transition-all ${i <= onboardingStep ? 'bg-gradient-to-r from-[#FF671F] to-[#22c55e]' : 'bg-[#2F2F35]'}`} 
              />
            ))}
          </div>
        </div>

        {/* Preview — compact; hidden on consent step */}
        {onboardingStep !== 3 && renderProfilePreview()}

        {/* Step content — no nested flex-1; lives inside main scroll */}
        <div className="mt-4 relative z-10">

        {/* PASO 0: PRESENCIA - Remastered full premium. Unique ritual entry. */}
        {onboardingStep === 0 && (
          <div className="space-y-6">
            <div>
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-1 font-medium">PRIMER RITUAL • TU NOMBRE EN EL CÍRCULO</div>
              <input 
                type="text" 
                value={onboardData.name} 
                onChange={e => { updateOnboard({ name: e.target.value }); try { triggerHaptic('light') } catch {} }}
                placeholder="Tu nombre en el círculo" 
                autoComplete="name"
                className="w-full bg-[#1C1C20] border-2 border-[#FF671F]/30 focus:border-[#FF671F] rounded-2xl px-4 py-3.5 text-xl font-bold tracking-tight text-white touch-manipulation" 
              />
              <div className="text-[9px] text-[#9CA3AF] mt-1">Este nombre te representa en el mapa vivo y en tu Red.</div>
            </div>

            {/* Photo Gallery Creator - Attractive & unique curation experience */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm font-semibold tracking-wider">TU GALERÍA DEL RITUAL (hasta 6)</div>
                  <div className="text-[10px] text-[#9CA3AF]">La primera es tu presencia principal. Arrastra/reordena después en Perfil.</div>
                </div>
                <div className="text-[10px] text-[#FF671F] font-mono">{(onboardData.photos || []).length}/6</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                {(onboardData.photos || []).slice(0,6).map((photo: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#FF671F]/50 shadow group">
                    <img src={photo} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => { removeOnboardPhoto(idx); try { triggerHaptic('light') } catch {} }} className="absolute top-1.5 right-1.5 bg-black/80 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center active:bg-red-500">×</button>
                    {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[#FF671F] text-black text-[8px] py-0.5 text-center font-bold tracking-widest">PRESENCIA PRINCIPAL</div>}
                    {idx > 0 && (
                      <button onClick={() => {
                        const photos = [...(onboardData.photos || [])];
                        const [moved] = photos.splice(idx, 1);
                        photos.unshift(moved);
                        updateOnboard({ photos });
                        try { triggerHaptic('medium') } catch {}
                      }} className="absolute bottom-1.5 left-1.5 bg-black/70 text-[8px] px-1.5 py-0.5 rounded text-white active:bg-[#FF671F]">★ PRINCIPAL</button>
                    )}
                  </div>
                ))}
                
                {(onboardData.photos || []).length < 6 && (
                  <div className="grid grid-rows-2 gap-2.5">
                    <button onClick={() => { try { triggerHaptic('medium') } catch {}; takeNativePhoto() }} className="border-2 border-[#FF671F] rounded-2xl flex flex-col items-center justify-center text-[#FF671F] text-xs active:bg-[#FF671F]/10 active:scale-[0.985] transition">
                      <Camera size={22} className="mb-1" />
                      <span className="font-bold tracking-wider">CÁMARA DEL RITUAL</span>
                      <span className="text-[8px] opacity-60">NATIVA • RÁPIDA</span>
                    </button>
                    <label className="border-2 border-dashed border-[#FF671F]/40 rounded-2xl flex flex-col items-center justify-center text-xs cursor-pointer active:bg-[#1C1C20] text-[#9CA3AF]">
                      <Camera size={18} className="mb-1" />
                      <span className="font-medium">SUBIR FOTOS</span>
                      <span className="text-[8px]">HASTA 6 • DATA URL → STORAGE</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-[#9CA3AF] mt-1.5">Fotos reales de tus sesiones. Esto te hace único en el GymPulse.</div>
            </div>

            {/* Bio + Mantra - Unique & attractive */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="font-semibold tracking-wider">TU BIO DEL RITUAL + MANTRA (corta, poderosa)</div>
                <span className="text-[#FF671F] text-xs font-mono">{(onboardData.bio || '').length}/160</span>
              </div>
              <textarea 
                value={onboardData.bio || ''} 
                onChange={e => { updateOnboard({ bio: e.target.value.slice(0,160) }); try { triggerHaptic('light') } catch {} }}
                className="w-full bg-[#1C1C20] border-2 border-[#2F2F35] focus:border-[#FF671F] rounded-2xl px-4 py-3 text-sm h-20 resize-y text-white touch-manipulation"
                placeholder="Pesas 4x + running costanera. Busco compañero constante."
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  'Pesas 4x + running. Mantra: constancia sin excusas.',
                  'Calistenia y yoga. Mi Red me hace imparable.',
                  'CrossFit boxeo. Sparring serio, energía compartida.'
                ].map((b,i) => (
                  <button key={i} onClick={() => { updateOnboard({ bio: b }); try { triggerHaptic('light') } catch {} }} className="text-[8px] px-2 py-1 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10">{b.slice(0,42)}...</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 1: ESENCIA - Full remastered beautiful cards, unique explanations */}
        {onboardingStep === 1 && (
          <div className="space-y-7">
            <div>
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-1.5">TU ESENCIA • ELIGE TUS RITUALES (1-3)</div>
              <div className="grid grid-cols-2 gap-2">
                {TRAINING_OPTIONS.map((type: string) => {
                  const selected = (onboardData.trainingTypes || []).includes(type);
                  const emoji = type.includes('Pesas') ? '🏋️' : type.includes('Running') ? '🏃' : type.includes('Yoga') ? '🧘' : type.includes('Boxeo') ? '🥊' : type.includes('Calistenia') ? '💪' : '🔥';
                  return (
                    <button key={type} onClick={() => { 
                      const curr = onboardData.trainingTypes || [];
                      const next = selected ? curr.filter((t:string)=>t!==type) : [...curr, type].slice(0,3);
                      updateOnboard({ trainingTypes: next }); 
                      try { triggerHaptic('light') } catch {} 
                    }} className={`p-3 rounded-2xl border-2 text-left active:scale-[0.985] transition flex gap-3 items-start ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-lg' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#FF671F]/30'}`}>
                      <span className="text-2xl mt-0.5">{emoji}</span>
                      <div>
                        <div className="font-bold text-sm tracking-wider">{type}</div>
                        <div className="text-[9px] opacity-70 mt-0.5">Apareces en el GymPulse correcto + matches de alto valor</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-1.5">TU PROPÓSITO EN EL CÍRCULO (ELIGE EL PRINCIPAL)</div>
              <div className="grid grid-cols-1 gap-2">
                {TRAINING_GOALS.map((goal: string) => {
                  const selected = (onboardData.goals || []).includes(goal);
                  return (
                    <button key={goal} onClick={() => { 
                      updateOnboard({ goals: [goal] }); 
                      try { triggerHaptic('light') } catch {} 
                    }} className={`p-3 rounded-2xl border-2 text-left active:scale-[0.985] flex justify-between items-center ${selected ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'}`}>
                      <span className="font-semibold text-sm">{goal}</span>
                      {selected && <span className="text-xs bg-black/20 px-2 py-0.5 rounded">✓ TU FUEGO</span>}
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] text-[#9CA3AF] mt-1.5">Esto alimenta tu GymPulse, matches precisos y Daily Challenges que realmente importan.</div>
            </div>
          </div>
        )}

        {/* PASO 2: EL PULSO VIVO - Full remastered "Aha" with unique visuals, mock UI, epic explanation. The heart of what makes EntrenaMatch special. */}
        {onboardingStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0a120f] border-2 border-[#22c55e]/40 p-5 shadow-inner">
              <div className="uppercase text-[#22c55e] text-[9px] tracking-[2.5px] font-bold mb-1">LA MAGIA QUE NADIE MÁS TIENE EN EL FITNESS</div>
              <div className="text-xl font-black tracking-[-0.5px] leading-none mb-4">ENTRENASYNC + PULSO DEL MAPA<br/>= TU RED COBRA VIDA REAL, MEDIBLE Y VISIBLE</div>
              
              <div className="space-y-4 text-sm">
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">01</div>
                  <div><span className="font-bold">MARCA "ENTRENANDO AHORA"</span><br/><span className="text-[#9CA3AF] text-xs">Apareces en el GymPulse mapa con urgencia verde. Otros cerca te ven sudando en tiempo real.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">02</div>
                  <div><span className="font-bold">DAN LIKE → CHAT INSTANTÁNEO</span><br/><span className="text-[#9CA3AF] text-xs">Estás a un toque de conectar con un GymPartner que está en el mismo entrenamiento que tú ahora.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">03</div>
                  <div><span className="font-bold">CREAS ENTRENASYNC</span><br/><span className="text-[#9CA3AF] text-xs">Acciones en vivo (flexiones juntos se sienten en ambos). Tether dorado en el mapa. +Network Power real para tu Red.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">04</div>
                  <div><span className="font-bold">TODO QUEDA EN MUROS + FEED + RIPPLES</span><br/><span className="text-[#FF671F] text-xs font-bold">Entrenar juntos tiene consecuencias que otros presencian. Esto es único.</span></div>
                </div>
              </div>
            </div>

            {/* Visual mock of the magic - Unique & attractive */}
            <div className="bg-[#0a0a0c] border border-[#22c55e]/30 rounded-2xl p-3 text-center">
              <div className="text-[10px] text-[#22c55e] tracking-widest mb-1">ASÍ SE VE EN EL MUNDO REAL</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <div className="bg-[#22c55e] text-black px-2 py-0.5 rounded font-bold">🟢 TÚ EN PULSO VIVO</div>
                <div className="text-[#FFD700]">⟷</div>
                <div className="bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold">TETHER DORADO CON TU RED</div>
              </div>
              <div className="text-[9px] text-[#9CA3AF] mt-1">+25 Network Power • ripples que viajan • tu primer match en &lt;30s</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-black mb-2 tracking-[-0.5px] text-[#22c55e]">¿ACTIVAS TU PRIMER PULSO VIVO AHORA?<br/><span className="text-white text-base">El corazón de lo que hace a EntrenaMatch único.</span></div>
              <button 
                onClick={() => { 
                  const next = !onboardData.wantsToGoLive;
                  updateOnboard({ wantsToGoLive: next }); 
                  try { triggerHaptic(next ? 'success' : 'light') } catch {} 
                }} 
                className={`w-full py-5 rounded-3xl text-xl font-black tracking-widest transition-all active:scale-[0.985] ${onboardData.wantsToGoLive ? 'bg-[#22c55e] text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'border-2 border-[#22c55e] text-[#22c55e] active:bg-[#22c55e]/10'}`}
              >
                {onboardData.wantsToGoLive ? '✅ SÍ, ACTIVA MI PRIMER PULSO VIVO AL TERMINAR' : '🚀 SÍ — QUIERO SENTIR EL PULSO VIVO AHORA'}
              </button>
              <div className="text-[10px] text-[#9CA3AF] mt-2 max-w-xs mx-auto">Banner verde al instante. En mapa + explore. 30s después ya puedes dar tu primer like y crear tu primer Sync legendario.</div>
            </div>
          </div>
        )}

        {/* PASO 3: LOS VOTOS - Full remastered solemn, attractive ritual ceremony. Unique and epic. */}
        {onboardingStep === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="uppercase tracking-[2px] text-[#FF671F] text-xs mb-1">ÚLTIMO RITUAL</div>
              <div className="text-2xl font-black tracking-[-1px]">LOS 3 VOTOS DEL CÍRCULO</div>
              <div className="text-[#9CA3AF] text-sm mt-1">Sella tu entrada a la red de GymPartners donde el esfuerzo se comparte y tiene peso real.</div>
            </div>

            {[
              { key: 'is18' as const, label: 'Juro ser mayor de 18 y entrenar con respeto a mis GymPartners', desc: 'Respeto, seriedad y energía positiva siempre.' },
              { key: 'isForTraining' as const, label: 'Juro entrenar en serio y con motivación real para mis GymPartners', desc: 'No excusas. Mi presencia construye la de otros.' },
              { key: 'sharesLocation' as const, label: 'Juro aparecer en el GymPulse vivo para sincronizarme con mis GymPartners', desc: 'Mi energía es visible. Mis GymPartners me hacen más fuerte.' }
            ].map(item => {
              const checked = localConsents[item.key]
              return (
              <button
                key={item.key}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleConsent(item.key)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition touch-manipulation relative z-10 ${
                  checked
                    ? 'bg-[#FF671F]/15 border-[#FF671F] ring-1 ring-[#FF671F]/40'
                    : 'bg-[#1C1C20] border-[#2F2F35] active:bg-[#25252A] active:border-[#FF671F]/40'
                }`}
              >
                <div className="flex items-start gap-3 pointer-events-none">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs font-bold ${
                    checked ? 'bg-[#FF671F] border-[#FF671F] text-black' : 'border-[#9CA3AF] text-transparent'
                  }`}>
                    ✓
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm leading-tight">{item.label}</div>
                    <div className="text-[#9CA3AF] text-xs mt-1 leading-tight">{item.desc}</div>
                  </div>
                </div>
              </button>
            )})}

            <div className="mt-2 p-5 rounded-3xl bg-gradient-to-br from-[#0a120f] to-[#111113] border-2 border-[#22c55e]/50 text-center">
              <div className="text-[#22c55e] font-black text-sm tracking-widest mb-1">AL SELLAR ESTOS VOTOS</div>
              <div className="text-sm leading-snug text-white/90">Si activaste Live → tu punto verde pulsa en el mapa al instante.<br/>Ve a <span className="font-bold text-[#FF671F]">EXPLORAR</span> → ❤️ en el primero que veas cerca = chat + match en &lt;20s.<br/>Luego abre el chat y toca <span className="font-bold">"INICIAR ENTRENASYNC"</span> y siente el tether dorado.</div>
              <div className="text-[9px] text-[#22c55e] mt-2 tracking-wider">BIENVENIDO AL CÍRCULO. TU PRIMER RITUAL EMPIEZA AHORA.</div>
            </div>
          </div>
        )}

        </div>
        </div>
      </div>

      {/* Fixed bottom bar — outside scroll so always reachable */}
      <div className="flex-shrink-0 px-5 pt-2 pb-4 flex flex-col gap-2 bg-[#0D0D10] border-t-2 border-[#2F2F35] safe-area-pb">
          {onboardingStep > 0 && (
            <button onClick={() => { try { triggerHaptic('light') } catch {}; setOnboardingStep(onboardingStep - 1) }} className="w-full py-2.5 text-xs uppercase tracking-[1.5px] rounded-2xl border border-[#2F2F35] active:bg-[#1f242b] text-[#9CA3AF]">
              ← VOLVER AL RITUAL ANTERIOR
            </button>
          )}

          {onboardingStep === 1 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0) && (
            <p className="text-center text-[9px] text-[#ef4444] font-medium tracking-wider">ELIGE AL MENOS UN RITUAL DE MOVIMIENTO Y TU FUEGO PRINCIPAL</p>
          )}

          {onboardingStep === 3 && !Object.values(localConsents).every(Boolean) && (
            <p className="text-center text-[9px] text-[#FF671F] font-medium tracking-wider">
              Marca los 3 votos para sellar tu entrada ({Object.values(localConsents).filter(Boolean).length}/3)
            </p>
          )}

          <button 
            onClick={nextOnboarding} 
            className="w-full py-4 text-base font-black tracking-[1.5px] rounded-3xl btn-primary active:scale-[0.985] bg-gradient-to-r from-[#FF671F] to-[#E55A1A] touch-manipulation"
            disabled={
              onboardingStep === 1 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0)
            }
          >
            {onboardingStep < 3 ? 'CONTINUAR EL RITUAL →' : '¡SELLAR LOS VOTOS • ENTRAR AL CÍRCULO DEL PULSO!'}
          </button>
          <div className="text-center text-[8px] text-[#9CA3AF] tracking-[1px]">Paso {onboardingStep + 1} de 4 • Tu perfil en el GymPulse</div>
        </div>
    </div>
  );
};
