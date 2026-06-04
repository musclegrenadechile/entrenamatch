// @ts-nocheck
import React, { useState, type ChangeEvent } from 'react';
import { Dumbbell, MapPin, Camera, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { TRAINING_OPTIONS, TRAINING_GOALS, TRAINING_INTENSITIES } from '../../constants';

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
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onboardingStep,
  setOnboardingStep,
  currentUser,
  saveUser,
  setShowOnboarding,
  requestUserLocation,
  consents,
  setConsents,
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
        wantsToGoLive: false
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

  const updateOnboard = (patch: any) => {
    setOnboardData((prev: any) => ({ ...prev, ...patch }));
  };

  const isEditingProfile = !!(currentUser && currentUser.name);

  // Live updating preview card (the key onboarding improvement - user sees exactly how they will appear in Explore + live lists)
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
          <span>👁️ Así te verán en Explorar y en el banner EN VIVO</span>
          {isLive && <span className="ml-auto font-bold">¡Aparecerás en el radar live al terminar!</span>}
        </div>
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
      wantsToGoLive: true
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

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers = Array.from(files).slice(0, 6).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(urls => {
      const current = onboardData.photos || [];
      updateOnboard({ photos: [...current, ...urls].slice(0, 6) });
    });
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
        resultType: 'base64', // easy to turn into data URL
      });
      if (photo && photo.base64String) {
        const dataUrl = `data:image/jpeg;base64,${photo.base64String}`;
        const current = onboardData.photos || [];
        if (current.length < 6) {
          updateOnboard({ photos: [...current, dataUrl] });
        } else {
          toast('Máximo 6 fotos');
        }
      }
    } catch (err) {
      toast('No se pudo tomar la foto (permiso o cancelación)');
    }
  };
  const nextOnboarding = () => {
    if (onboardingStep < 4) {
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
      photos: onboardData.photos!,
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

      const liveDesc = onboardData.wantsToGoLive ? ' ¡Estás EN VIVO ahora — otros te verán en el banner!' : ' Activa "Entrenando ahora" en Perfil para aparecer en vivo.';
      toast.success(isEditingProfile ? '¡Perfil actualizado!' : '¡Perfil creado!', { 
        description: isEditingProfile 
          ? 'Los cambios se guardaron y sincronizaron con el backend real.' 
          : ('Bienvenido a EntrenaMatch. ¡El Spark del Movimiento!' + liveDesc)
      });
    } catch (err) {
      console.error('Error guardando perfil en onboarding:', err);
      toast.error('No se pudo guardar el perfil', { description: 'Revisa tu conexión e intenta de nuevo.' });
      // Do not close the flow on error so user can retry
    }
  };

  return (
    <div className="app-container flex flex-col bg-[#0D0D10] text-white">
      <div className="flex-1 flex flex-col p-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#FF671F] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="font-bold text-3xl tracking-tighter">EntrenaMatch</div>
            <div className="text-[#FF671F] text-xs -mt-1">ENTRENA EN TODO EL MUNDO</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-semibold tracking-tighter leading-none mb-1">
                {isEditingProfile ? 'Edita tu perfil' : 'Crea tu perfil'}
              </div>
              <div className="text-[#9CA3AF] text-sm">El Spark del Movimiento • Conecta + entrena en vivo cerca</div>
            </div>
            {!isEditingProfile && (
              <button onClick={fillExampleData} className="text-[10px] px-3 py-1 rounded-2xl border border-[#22c55e]/40 text-[#22c55e] active:bg-[#22c55e]/10">Rellenar ejemplo</button>
            )}
          </div>
        </div>

        {/* Progress - clearer labels + step count */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5 px-0.5">
            <div className="font-medium text-[#FF671F]">Paso {onboardingStep + 1} de 5</div>
            <div className="text-[#9CA3AF]">
              {onboardingStep === 0 && 'Info básica + disponibilidad'}
              {onboardingStep === 1 && 'Tus fotos (principal primero)'}
              {onboardingStep === 2 && 'Tipos de entreno + objetivos'}
              {onboardingStep === 3 && 'Nivel e intensidad'}
              {onboardingStep === 4 && 'Consentimientos + preview final'}
            </div>
          </div>
          <div className="flex gap-2">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`step-dot flex-1 ${i <= onboardingStep ? 'active' : ''}`} style={i <= onboardingStep ? {width: 'auto', minWidth: 28} : {}} />
            ))}
          </div>
        </div>

        {/* LIVE PREVIEW - ALWAYS VISIBLE, updates in real-time as user types/selects. THIS IS THE KEY IMPROVEMENT for onboarding. */}
        {renderProfilePreview()}

        {/* Scrollable step content */}
        <div className="flex-1 overflow-auto -mx-1 px-1 pb-8 min-h-0">

        {/* Step 0: Basic info */}
        {onboardingStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">¿Cómo te llamas?</label>
              <input value={onboardData.name} onChange={e => updateOnboard({ name: e.target.value })} 
                className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-5 py-4 text-xl placeholder:text-[#475569] focus:border-[#FF671F] focus:outline-none" placeholder="Tu nombre" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#9CA3AF] mb-1.5 block">Edad</label>
                <input 
                  type="number" 
                  value={onboardData.age || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    // Permitir campo vacío mientras se escribe, solo parsear cuando hay valor
                    const num = val === '' ? '' : parseInt(val);
                    updateOnboard({ age: num });
                  }} 
                  className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-5 py-4 text-xl" 
                  min="18" 
                  max="80"
                  placeholder="Ej: 28"
                />
              </div>
              <div>
                <label className="text-sm text-[#9CA3AF] mb-1.5 block">Género</label>
                <div className="flex gap-2">
                  {(['mujer','hombre'] as const).map(g => (
                    <button key={g} onClick={() => updateOnboard({ gender: g })}
                      className={`flex-1 py-4 rounded-2xl border text-sm font-medium ${onboardData.gender === g ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'}`}>
                      {g === 'mujer' ? 'Mujer' : 'Hombre'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">¿En qué sector de Viña vives / entrenas?</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">Ciudad</label>
                  <input value={onboardData.city || ''} onChange={e => updateOnboard({ city: e.target.value })} 
                    className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-4 py-3 focus:border-[#FF671F] focus:outline-none" placeholder="Ej: Viña del Mar" />
                </div>
                <div>
                  <label className="text-xs text-[#9CA3AF] mb-1 block">País</label>
                  <input value={onboardData.country || ''} onChange={e => updateOnboard({ country: e.target.value })} 
                    className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-4 py-3 focus:border-[#FF671F] focus:outline-none" placeholder="Ej: Chile" />
                </div>
              </div>
              <button 
                onClick={handleGpsRequest}
                className="mt-3 w-full text-sm flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#FF671F] text-[#FF671F] active:bg-[#FF671F] active:text-black"
              >
                <MapPin size={16} /> Usar mi ubicación actual (GPS)
              </button>
              {onboardData.lat && onboardData.lng && (
                <div className="text-[10px] text-[#22c55e] mt-1 text-center">✓ GPS capturado para tu perfil</div>
              )}
            </div>

            {/* Bio - required field + examples + counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-[#9CA3AF] font-medium">Cuéntanos un poco sobre ti (bio) — obligatorio</label>
                <span className="text-[10px] text-[#9CA3AF]">{(onboardData.bio || '').length}/180</span>
              </div>
              <textarea 
                value={onboardData.bio || ''} 
                onChange={e => updateOnboard({ bio: e.target.value.slice(0,180) })}
                className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl px-4 py-3 h-16 resize-y text-sm focus:border-[#FF671F] focus:outline-none"
                placeholder="Ej: Pesas + correr. Busco compañero constante..."
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {suggestedBios.map((b, idx) => (
                  <button key={idx} onClick={() => updateOnboard({ bio: b })} className="text-[9px] px-2 py-0.5 rounded-full border border-[#2F2F35] bg-[#1C1C20] text-[#9CA3AF] active:bg-[#25252A] active:text-white">
                    {b.slice(0,38)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Availability - now collected in onboarding (key filter for "disponibles ahora") */}
            <div>
              <label className="text-sm text-[#9CA3AF] mb-1.5 block font-medium">¿Cuándo sueles estar disponible para entrenar?</label>
              <div className="flex gap-2">
                {['Mañana','Tarde','Noche'].map(t => {
                  const sel = (onboardData.availability || []).includes(t);
                  return (
                    <button key={t} onClick={() => toggleAvailability(t)} className={`flex-1 py-2 rounded-2xl text-sm border ${sel ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1">Se usa para el filtro "Disponibles ahora" y matching.</p>
            </div>
          </div>
        )}

        {/* Step 1: Photos - Attractive upload */}
        {onboardingStep === 1 && (
          <div>
            <div className="mb-4">
              <div className="text-xl font-semibold mb-1">Sube tus fotos</div>
              <div className="text-[#9CA3AF] text-sm">Máximo 6. La primera es la principal y más importante.</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(onboardData.photos || []).map((photo: string, idx: number) => (
                <div key={idx} className="relative aspect-[3/3.2] rounded-2xl overflow-hidden bg-[#1C1C20] border border-[#2F2F35]">
                  <img src={photo} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeOnboardPhoto(idx)} className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full active:bg-black">
                    <Trash2 size={15} />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">Principal (la que ven primero)</div>
                  )}
                  {idx > 0 && (
                    <button onClick={() => {
                      const photos = [...(onboardData.photos || [])];
                      const [moved] = photos.splice(idx, 1);
                      photos.unshift(moved);
                      updateOnboard({ photos });
                    }} className="absolute bottom-2 right-2 bg-black/70 text-[9px] px-1.5 py-0.5 rounded active:bg-black">Hacer principal</button>
                  )}
                </div>
              ))}
              {(onboardData.photos || []).length < 6 && (
                <label className="aspect-[3/3.2] border-2 border-dashed border-[#2F2F35] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#1C1C20] active:bg-[#25252A]">
                  <Camera className="mb-2 text-[#FF671F]" />
                  <span className="text-xs text-[#9CA3AF]">Agregar foto</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              {/* Native camera (shows only when running as real APK via Capacitor) */}
              {(onboardData.photos || []).length < 6 && typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera && (
                <button
                  type="button"
                  onClick={takeNativePhoto}
                  className="aspect-[3/3.2] border-2 border-[#FF671F] text-[#FF671F] rounded-2xl flex flex-col items-center justify-center text-xs active:bg-[#FF671F]/10"
                >
                  <Camera className="mb-1" />
                  Cámara del teléfono
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#9CA3AF]">Usa fotos recientes con buena luz. La primera es la que aparece en swipe y live cards. Toca "Hacer principal" para reordenar.</p>
          </div>
        )}

        {/* Step 2: Training Types + Goals - Attractive multi-select */}
        {onboardingStep === 2 && (
          <div className="space-y-7">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold flex items-center gap-2">
                  <Dumbbell size={20} className="text-[#FF671F]" /> ¿Qué tipos de entrenamiento haces?
                </div>
                {(onboardData.trainingTypes || []).length > 0 && (
                  <span className="text-xs text-[#FF671F] font-medium">{(onboardData.trainingTypes || []).length} seleccionados</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRAINING_OPTIONS.map((type: string) => {
                  const selected = (onboardData.trainingTypes || []).includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        const current = onboardData.trainingTypes || [];
                        const newTypes = selected ? current.filter((t: string) => t !== type) : [...current, type];
                        updateOnboard({ trainingTypes: newTypes });
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3A3A3F] hover:bg-[#25252A]'}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => updateOnboard({ trainingTypes: TRAINING_OPTIONS })} className="text-[10px] text-[#FF671F] underline">Seleccionar todos</button>
                <button onClick={() => updateOnboard({ trainingTypes: [] })} className="text-[10px] text-[#9CA3AF] underline">Limpiar</button>
              </div>
              {(onboardData.trainingTypes || []).length === 0 && (
                <p className="text-xs text-[#ef4444] mt-1.5">Selecciona al menos uno para continuar</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold">¿Cuáles son tus objetivos principales?</div>
                {(onboardData.goals || []).length > 0 && (
                  <span className="text-xs text-[#FF671F] font-medium">{(onboardData.goals || []).length} seleccionados</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRAINING_GOALS.map((goal: string) => {
                  const selected = (onboardData.goals || []).includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => {
                        const current = onboardData.goals || [];
                        const newGoals = selected ? current.filter((g: string) => g !== goal) : [...current, goal];
                        updateOnboard({ goals: newGoals });
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3A3A3F] hover:bg-[#25252A]'}`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => updateOnboard({ goals: TRAINING_GOALS })} className="text-[10px] text-[#FF671F] underline">Seleccionar todos</button>
                <button onClick={() => updateOnboard({ goals: [] })} className="text-[10px] text-[#9CA3AF] underline">Limpiar</button>
              </div>
              {(onboardData.goals || []).length === 0 && (
                <p className="text-xs text-[#ef4444] mt-1.5">Selecciona al menos uno para continuar</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Level + Intensity - Attractive segmented controls */}
        {onboardingStep === 3 && (
          <div className="space-y-8">
            <div>
              <div className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Star size={20} className="text-[#FF671F]" /> Nivel actual
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Principiante', 'Intermedio', 'Avanzado'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => updateOnboard({ level: lvl })}
                    className={`py-4 rounded-3xl border text-sm font-semibold transition-all active:scale-[0.985] ${onboardData.level === lvl ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3A3A3F] hover:bg-[#25252A]'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xl font-semibold mb-3">Intensidad preferida</div>
              <div className="grid grid-cols-3 gap-3">
                {TRAINING_INTENSITIES.map((int: string) => (
                  <button
                    key={int}
                    onClick={() => updateOnboard({ intensity: int })}
                    className={`py-4 rounded-3xl border text-sm font-semibold transition-all active:scale-[0.985] ${onboardData.intensity === int ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3A3A3F] hover:bg-[#25252A]'}`}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Consents + LIVE OPT-IN (sells the killer "Entrenando Ahora" feature as the exciting closer) */}
        {onboardingStep === 4 && (
          <div className="space-y-4">
            <div>
              <div className="text-xl font-semibold mb-1">Consentimientos obligatorios</div>
              <p className="text-sm text-[#9CA3AF]">{isEditingProfile ? 'Confirma que sigues de acuerdo para guardar los cambios.' : 'Debes aceptar todos para crear tu perfil y usar la plataforma.'}</p>
            </div>

            {[
              { key: 'is18', label: 'Confirmo que tengo 18 años o más' },
              { key: 'isForTraining', label: 'Estoy buscando entrenar de forma seria y respetuosa' },
              { key: 'sharesLocation', label: 'Acepto compartir mi ubicación aproximada para encontrar gente cerca' }
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 p-4 bg-[#1C1C20] rounded-2xl border border-[#2F2F35] cursor-pointer active:bg-[#25252A] transition-colors">
                <input
                  type="checkbox"
                  checked={(localConsents as any)[item.key]}
                  onChange={(e) => setLocalConsents(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="mt-1 w-4 h-4 accent-[#FF671F]"
                />
                <span className="text-sm leading-snug">{item.label}</span>
              </label>
            ))}

            {/* THE KEY SELL: Opt-in to live right here in onboarding - makes the unique feature the exciting finish */}
            <label className="flex items-start gap-3 p-4 bg-[#22c55e]/10 border border-[#22c55e]/40 rounded-2xl cursor-pointer active:bg-[#22c55e]/15">
              <input
                type="checkbox"
                checked={!!onboardData.wantsToGoLive}
                onChange={(e) => updateOnboard({ wantsToGoLive: e.target.checked })}
                className="mt-1 w-4 h-4 accent-[#22c55e]"
              />
              <div className="text-sm leading-snug">
                <span className="font-semibold text-[#22c55e]">¡Quiero aparecer EN VIVO ahora mismo!</span> <span className="text-[#9CA3AF]">(recomendado)</span><br />
                <span className="text-xs text-[#9CA3AF]">Al terminar activaré "Entrenando ahora". La gente cerca me verá con contador de urgencia en el banner verde. ¡Es la función más fuerte de la app!</span>
              </div>
            </label>

            <p className="text-[10px] text-[#9CA3AF] mt-2">
              Al continuar aceptas nuestra <a href="/entrenamatch/privacy.html" target="_blank" className="underline">Política de Privacidad</a> y <a href="/entrenamatch/terms.html" target="_blank" className="underline">Términos de Servicio</a>.
            </p>

            <div className="text-[10px] text-center text-[#22c55e] mt-1">La preview arriba muestra exactamente cómo te verán los demás (incluyendo si vas EN VIVO).</div>
          </div>
        )}

        </div> {/* end scrollable step content */}

        {/* Fixed bottom navigation - always visible */}
        <div className="pt-3 pb-2 flex flex-col gap-2 bg-[#0D0D10] border-t border-[#2F2F35]">
          {onboardingStep > 0 && (
            <button onClick={() => setOnboardingStep(onboardingStep - 1)} className="w-full py-3 text-sm rounded-2xl border border-[#2F2F35] active:bg-[#1f242b]">
              Atrás
            </button>
          )}

          {onboardingStep === 2 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0) && (
            <p className="text-center text-[10px] text-[#ef4444] font-medium">
              Selecciona al menos un tipo de entrenamiento y un objetivo
            </p>
          )}

          <button 
            onClick={nextOnboarding} 
            className="w-full py-3.5 text-base font-semibold rounded-3xl btn-primary disabled:opacity-50"
            disabled={
              (onboardingStep === 2 && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0)) ||
              (onboardingStep === 4 && !Object.values(localConsents).every(Boolean))
            }
          >
            {onboardingStep < 4 ? 'Continuar' : 'Completar mi perfil'}
          </button>
        </div>
      </div>
    </div>
  );
};
