import { useState, type ChangeEvent } from 'react';
import { Dumbbell, MapPin, Camera, Users, RefreshCw, Crop, Sparkles, Quote, X } from 'lucide-react';
import { PhotoCropModal } from '../photos/PhotoCropModal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TRAINING_OPTIONS, TRAINING_GOALS } from '../../constants';
import { BRAND_COPY } from '../../constants/brandCopy';
import { PILOT_CITY_OPTIONS, PILOT_PROGRAM_TITLE } from '../../constants/pilotProgram';
import type { CurrentUser } from '../../types';
import { QUICK_DEMO_USER } from '../../utils/quickDemo';

const ONBOARDING_LAST_STEP = 4;
const SHOW_DEV_FILL = import.meta.env.DEV;

interface CapacitorCameraPlugin {
  getPhoto: (opts: {
    quality: number;
    allowEditing: boolean;
    resultType: string;
  }) => Promise<{ base64String?: string } | null>;
}

let CapacitorCamera: CapacitorCameraPlugin | null = null;

if (typeof window !== 'undefined' && (window as Window & { Capacitor?: unknown }).Capacitor) {
  const plugins = (window as Window & { __CAPACITOR_PLUGINS__?: { Camera?: CapacitorCameraPlugin } }).__CAPACITOR_PLUGINS__ || {};
  CapacitorCamera = plugins.Camera || null;
}

interface OnboardingConsents {
  is18: boolean;
  isForTraining: boolean;
  sharesLocation: boolean;
}

interface OnboardData {
  name: string;
  age: number;
  gender: 'hombre' | 'mujer';
  city: string;
  country: string;
  lat: number;
  lng: number;
  bio: string;
  photos: string[];
  trainingTypes: string[];
  goals: string[];
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  intensity: 'Relajado' | 'Moderado' | 'Intenso';
  availability: string[];
  wantsToGoLive: boolean;
  wantsGhostMode: boolean;
}

interface OnboardingFlowProps {
  onboardingStep: number;
  setOnboardingStep: (step: number | ((s: number) => number)) => void;
  currentUser: CurrentUser | null;
  saveUser: (user: CurrentUser) => void | Promise<void>;
  setShowOnboarding: (show: boolean) => void;
  requestUserLocation: () => void;
  consents: OnboardingConsents;
  setConsents: (consents: OnboardingConsents) => void;
  triggerHaptic?: (style?: 'light' | 'medium' | 'success') => void;
  uploadPhotoIfNeeded?: (dataUrl: string) => Promise<string>;
  mode?: 'create' | 'edit';
  /** Create mode only — logs out and returns to the login screen */
  onExitToLogin?: () => void;
  /** Modo prueba — atajo para testers internos */
  isDemoMode?: boolean;
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
  onExitToLogin,
  isDemoMode = false,
}) => {
  const isEditMode = mode === 'edit';
  const [onboardData, setOnboardData] = useState<OnboardData>(() => {
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
        wantsToGoLive: !!currentUser?.trainingNow,
        wantsGhostMode: !!currentUser?.ghostMode,
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
      wantsToGoLive: false,
      wantsGhostMode: false,
    }
  });

  // Consents fully managed internally now (previous props were dummy)
  // For edit mode, pre-fill from existing legalConsents so user doesn't have to re-tap to save changes
  const [cropSession, setCropSession] = useState<{
    src: string
    queue: string[]
    replaceIndex?: number
  } | null>(null)

  const [localConsents, setLocalConsents] = useState<OnboardingConsents>(() => {
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

  const updateOnboard = (patch: Partial<OnboardData>) => {
    setOnboardData((prev) => ({ ...prev, ...patch }));
  };

  const toggleConsent = (key: 'is18' | 'isForTraining' | 'sharesLocation') => {
    setLocalConsents((prev) => ({ ...prev, [key]: !prev[key] }))
    try { triggerHaptic('light') } catch {}
  }

  const isEditingProfile = isEditMode;
  const lastStep = isEditMode ? 3 : ONBOARDING_LAST_STEP;
  const totalSteps = lastStep + 1;
  const isPresenceStep = isEditMode ? onboardingStep === 0 : onboardingStep === 1;
  const isEssenceStep = isEditMode ? onboardingStep === 1 : onboardingStep === 2;
  const isPulseStep = isEditMode ? onboardingStep === 2 : onboardingStep === 3;
  const isConsentsStep = isEditMode ? onboardingStep === 3 : onboardingStep === 4;
  const showIntroStep = !isEditMode && onboardingStep === 0;

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
          <span>👁️ Así te verán en Explorar y en tu perfil</span>
          {isLive && <span className="ml-auto font-bold text-[#22c55e]">Punto verde en el mapa</span>}
        </div>
        {/* Unique ritual mock: small live map simulation for excitement - makes the first Live feel inevitable */}
        {isLive && (
          <div className="mx-3 -mt-1 mb-1 px-2 py-1 bg-[#0a120f] border border-[#22c55e]/20 rounded-b-2xl text-[7px] text-[#22c55e] flex items-center gap-1">
            <span>🗺️</span> <span>Mapa LIVE simulado: tú + 4 cerca • sync listo • primer match en 20s</span>
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
      wantsToGoLive: false,
      photos: [ // unique demo photos for attractive preview
        'https://picsum.photos/id/1011/600/800',
        'https://picsum.photos/id/1005/600/800',
        'https://picsum.photos/id/201/600/800'
      ]
    });
    toast.success('¡Datos de ejemplo cargados!', { description: 'Ajusta lo que quieras. La preview se actualiza en vivo.' });
  };

  const BIO_MAX = 160
  const bioInspirations = [
    {
      emoji: '🏋️',
      vibe: 'Constancia',
      text: 'Pesas 4x + running costanera. Busco constancia y buena vibra.',
    },
    {
      emoji: '🧘',
      vibe: 'Flow outdoor',
      text: 'Calistenia y yoga en los cerros. Mi Red me hace imparable.',
    },
    {
      emoji: '🥊',
      vibe: 'Intensidad',
      text: 'CrossFit y boxeo. Sparring serio, energía compartida.',
    },
    {
      emoji: '🏃',
      vibe: 'Kms juntos',
      text: 'Running y pilates 3x semana. Busco compañero/a para sumar kms.',
    },
  ] as const

  const toggleAvailability = (time: string) => {
    const curr = onboardData.availability || [];
    const next = curr.includes(time) ? curr.filter((t: string) => t !== time) : [...curr, time];
    updateOnboard({ availability: next });
  };

  const slotsLeft = () => Math.max(0, 6 - (onboardData.photos || []).length)

  const startCropFlow = (sources: string[], replaceIndex?: number) => {
    if (!sources.length) return
    setCropSession({ src: sources[0], queue: sources.slice(1), replaceIndex })
  }

  const finishCroppedPhoto = async (cropped: string) => {
    let final = cropped
    if (uploadPhotoIfNeeded) {
      final = await uploadPhotoIfNeeded(cropped)
    }
    const current = onboardData.photos || []
    if (cropSession?.replaceIndex != null) {
      const photos = [...current]
      photos[cropSession.replaceIndex] = final
      updateOnboard({ photos })
    } else {
      updateOnboard({ photos: [...current, final].slice(0, 6) })
    }
    try { triggerHaptic('light') } catch {}

    if (cropSession?.queue.length) {
      setCropSession({
        src: cropSession.queue[0],
        queue: cropSession.queue.slice(1),
        replaceIndex: cropSession.replaceIndex,
      })
    } else {
      setCropSession(null)
    }
  }

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxNew = slotsLeft()
    const readers = Array.from(files).slice(0, maxNew).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    const urls = await Promise.all(readers);
    e.target.value = ''
    if (!urls.length) {
      toast('Máximo 6 fotos')
      return
    }
    startCropFlow(urls)
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
        if (slotsLeft() <= 0) {
          toast('Máximo 6 fotos');
          return
        }
        startCropFlow([dataUrl])
      }
    } catch (err) {
      toast('No se pudo tomar la foto (permiso o cancelación)');
    }
  };
  const nextOnboarding = () => {
    if (onboardingStep < lastStep) {
      try { triggerHaptic('light') } catch {}
      setOnboardingStep(s => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleExitToLogin = () => {
    if (!onExitToLogin || isEditMode) return
    const ok = window.confirm(
      '¿Volver al login?\n\nSi ya creaste cuenta, podrás iniciar sesión después y terminar tu perfil.'
    )
    if (ok) onExitToLogin()
  }

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

  const enterDemoNow = async () => {
    try {
      await Promise.resolve(saveUser({ ...QUICK_DEMO_USER, id: currentUser?.id || 'me' }));
      setShowOnboarding(false);
      setOnboardingStep(0);
      toast.success('Perfil demo listo — explora sin Firebase');
      try { triggerHaptic('success') } catch {}
    } catch (err) {
      console.error('demo enter failed:', err);
      toast.error('No se pudo cargar el perfil demo');
    }
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
      toast.error('Faltan casillas', { description: 'Marca las 3 confirmaciones para entrar a EntrenaMatch' });
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
    const newUser: CurrentUser = {
      ...(currentUser || { id: 'me' }),
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
      ghostMode: !!onboardData.wantsGhostMode,
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
      try { triggerHaptic('success') } catch {}
    } catch (err) {
      console.error('Error guardando perfil en onboarding:', err);
      toast.error('No se pudo guardar el perfil', { description: 'Revisa tu conexión e intenta de nuevo.' });
      // Do not close the flow on error so user can retry
    }
  };

  return (
    <div className="app-container flex flex-col bg-[#0D0D10] text-white h-[100svh] max-h-[100svh]">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-shrink-0 px-6 pt-6 pb-2">
        {/* Epic Remastered Header - Unique ritual vibe */}
        <div className="flex items-center gap-4 mb-5">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1], 
              rotate: [0, 5, -5, 0],
              boxShadow: ['0 0 0 0 rgba(255,103,31,0.5)', '0 0 0 20px rgba(255,103,31,0.2)', '0 0 0 0 rgba(255,103,31,0.5)'] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex items-center justify-center ring-4 ring-[#FF671F]/20 shadow-2xl"
          >
            <Dumbbell className="w-8 h-8 text-black" />
          </motion.div>
          <div className="flex-1">
            <div className="font-black text-4xl tracking-[-2px] text-white">ENTRENAMATCH</div>
            <div className="text-[#FF671F] text-xs tracking-[3px] font-mono -mt-1">{BRAND_COPY.taglineMono}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {!isEditMode && onExitToLogin && (
              <button
                type="button"
                onClick={handleExitToLogin}
                className="w-9 h-9 rounded-full bg-[#1C1C20] border border-[#2F2F35] flex items-center justify-center text-[#9CA3AF] active:bg-[#25252A] active:text-white"
                aria-label="Volver al login"
                title="Volver al login"
              >
                <X size={18} />
              </button>
            )}
            {isDemoMode && !isEditMode && (
              <button
                type="button"
                onClick={() => void enterDemoNow()}
                className="text-[9px] px-3 py-1.5 rounded-xl bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 font-bold active:bg-[#FFD700]/30"
              >
                Entrar ya
              </button>
            )}
            {!isEditingProfile && SHOW_DEV_FILL && (
              <button
                onClick={fillExampleData}
                className="text-[9px] px-4 py-2 rounded-2xl border-2 border-[#22c55e]/50 text-[#22c55e] active:bg-[#22c55e]/10 active:border-[#22c55e] font-semibold tracking-wider"
              >
                Rellenar demo (dev)
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-black tracking-[-1.5px] leading-none mb-1 text-white">
                {isEditMode ? 'REMASTERIZA TU PRESENCIA' : 'CREA TU PERFIL'}
              </div>
              <div className="text-[#9CA3AF] text-base max-w-md">Tu perfil es tu entrada a la {BRAND_COPY.community}. Entrena en vivo, sincronízate y deja historial compartido en el mapa.</div>
            </div>
          </div>
        </div>

        {/* Epic Ritual Progress - Visual path, not boring dots */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2 px-1">
            <div className="font-mono text-[#FF671F] tracking-[2px]">{isEditMode ? 'EDIT' : 'PASO'} {onboardingStep + 1} / {totalSteps} • {Math.round((onboardingStep + 1) / totalSteps * 100)}%</div>
            <div className="text-[#9CA3AF] text-[10px] font-medium">
              {showIntroStep && 'QUÉ ES ENTRENAMATCH'}
              {isPresenceStep && (isEditMode ? 'TU PERFIL' : 'CREA TU PERFIL')}
              {isEssenceStep && 'TU ENTRENO Y OBJETIVO'}
              {isPulseStep && '¿ENTRENAR EN VIVO?'}
              {isConsentsStep && (isEditMode ? 'GUARDAR CAMBIOS' : 'LISTO • ENTRAR A LA RED')}
            </div>
          </div>
          <div className="h-1.5 bg-[#1C1C20] rounded-full overflow-hidden flex">
            {Array.from({ length: totalSteps }, (_, i) => i).map(i => (
              <div 
                key={i} 
                className={`flex-1 transition-all ${i <= onboardingStep ? 'bg-gradient-to-r from-[#FF671F] to-[#22c55e]' : 'bg-[#2F2F35]'}`} 
              />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-[#9CA3AF]/60 mt-1 px-0.5 font-mono tracking-widest">
            {(!isEditMode
              ? (['INICIO', 'PERFIL', 'ENTRENO', 'EN VIVO', 'ENTRAR'] as const)
              : (['PERFIL', 'ENTRENO', 'EN VIVO', 'ENTRAR'] as const)
            ).map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </div>
      </div>

        {/* Scrollable step content + preview */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-6 min-h-0 pb-36">
        {!isConsentsStep && !showIntroStep && renderProfilePreview()}

        <div className="-mx-1 px-1">

        {/* PASO 0 (solo create): Qué es EntrenaMatch */}
        {showIntroStep && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-2 font-medium">BIENVENIDO</div>
              <div className="text-2xl font-black tracking-[-1px] leading-tight">Encuentra quien entrena como tú,<br />en vivo y conecta</div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 bg-[#1C1C20] p-4 rounded-2xl border border-[#2F2F35]">
                <MapPin className="text-[#FF671F] shrink-0 mt-0.5" size={22} />
                <div>
                  <div className="font-bold text-sm">Mapa en vivo</div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">Ve quién entrena cerca de ti ahora y conéctate al instante.</div>
                </div>
              </div>
              <div className="flex gap-3 bg-[#1C1C20] p-4 rounded-2xl border border-[#2F2F35]">
                <RefreshCw className="text-[#22c55e] shrink-0 mt-0.5" size={22} />
                <div>
                  <div className="font-bold text-sm">EntrenaSync</div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">Entrena a la par con alguien en tiempo real — mismo ritmo, distinta ubicación.</div>
                </div>
              </div>
              <div className="flex gap-3 bg-[#1C1C20] p-4 rounded-2xl border border-[#2F2F35]">
                <Users className="text-[#FF671F] shrink-0 mt-0.5" size={22} />
                <div>
                  <div className="font-bold text-sm">{BRAND_COPY.networkTitle}</div>
                  <div className="text-[#9CA3AF] text-xs mt-0.5">Matches, chat y metas semanales con tu {BRAND_COPY.community}.</div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#9CA3AF] text-center leading-snug">
              En 4 pasos creas tu perfil. Luego eliges si apareces en el mapa en vivo.
            </p>
          </div>
        )}

        {/* PASO PRESENCIA */}
        {isPresenceStep && (
          <div className="space-y-6">
            <div>
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-1 font-medium">PASO 1 • TU NOMBRE EN LA RED</div>
              <input 
                type="text" 
                value={onboardData.name} 
                onChange={e => { updateOnboard({ name: e.target.value }); try { triggerHaptic('light') } catch {} }}
                placeholder="ALEX RIVERA • GUERRERO DEL PULSO" 
                className="w-full bg-[#1C1C20] border-2 border-[#FF671F]/30 focus:border-[#FF671F] rounded-2xl px-5 py-4 text-2xl font-black tracking-[-1px]" 
              />
              <div className="text-[9px] text-[#9CA3AF] mt-1">Este nombre te representa en el mapa vivo y en tu Red.</div>
            </div>

            {/* Photo Gallery Creator - Attractive & unique curation experience */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm font-semibold tracking-wider">TUS FOTOS DE ENTRENO (hasta 6)</div>
                  <div className="text-[10px] text-[#9CA3AF]">La primera es tu presencia principal. Arrastra/reordena después en Perfil.</div>
                </div>
                <div className="text-[10px] text-[#FF671F] font-mono">{(onboardData.photos || []).length}/6</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5">
                {(onboardData.photos || []).slice(0,6).map((photo: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#FF671F]/50 shadow group">
                    <img src={photo} className="w-full h-full object-cover" alt={`Foto de perfil ${idx + 1}`} />
                    <button onClick={() => { removeOnboardPhoto(idx); try { triggerHaptic('light') } catch {} }} className="absolute top-1.5 right-1.5 bg-black/80 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center active:bg-red-500">×</button>
                    <button
                      type="button"
                      onClick={() => { try { triggerHaptic('light') } catch {}; startCropFlow([photo], idx) }}
                      className="absolute top-1.5 left-1.5 bg-black/75 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 active:bg-[#FF671F] active:text-black"
                    >
                      <Crop size={10} /> Encuadrar
                    </button>
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
                      <span className="font-bold tracking-wider">CÁMARA</span>
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
              <div className="text-[9px] text-[#9CA3AF] mt-1.5">Fotos reales de tus sesiones. Así te ven en Explorar y el mapa.</div>
            </div>

            <div className="rounded-2xl border border-[#FF671F]/25 bg-[#111113] p-4 space-y-3">
              <div>
                <div className="text-sm font-semibold tracking-wide">Tu ciudad y ubicación</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                  {PILOT_PROGRAM_TITLE} — acceso anticipado solo en estas ciudades.
                </div>
              </div>
              <select
                value={onboardData.city}
                onChange={(e) => updateOnboard({ city: e.target.value })}
                className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-xl px-3 py-2.5 text-sm"
              >
                {PILOT_CITY_OPTIONS.map((c) => (
                  <option key={c.norm} value={c.label}>{c.label}</option>
                ))}
              </select>
              <p className="text-[9px] text-[#FF671F]/90">
                Otras ciudades: lista de espera desde Explorar cuando lancemos tu zona.
              </p>
              <button
                type="button"
                onClick={() => { try { triggerHaptic('light') } catch {}; handleGpsRequest() }}
                className="w-full py-3 rounded-xl border-2 border-[#22c55e]/50 text-[#22c55e] text-sm font-bold active:bg-[#22c55e]/10"
              >
                📍 Usar mi GPS ahora
              </button>
              {Number.isFinite(onboardData.lat) && Number.isFinite(onboardData.lng) && (
                <div className="text-[9px] text-[#22c55e]/90 text-center">
                  GPS listo · {onboardData.lat.toFixed(2)}, {onboardData.lng.toFixed(2)}
                </div>
              )}
            </div>

            {/* Bio */}
            {(() => {
              const bioLen = (onboardData.bio || '').length
              const bioProgress = Math.min(100, Math.round((bioLen / BIO_MAX) * 100))
              const bioSweetSpot = bioLen >= 48 && bioLen <= 130
              return (
                <div className="rounded-3xl overflow-hidden border border-[#FF671F]/25 bg-gradient-to-br from-[#1a1208] via-[#111113] to-[#0a0a0c] shadow-lg shadow-[#FF671F]/5">
                  <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF671F] to-[#f59e0b] flex items-center justify-center shrink-0 shadow-md shadow-[#FF671F]/25">
                      <Quote size={18} className="text-black" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] uppercase tracking-[2px] text-[#FF671F] font-bold">Tu voz en la Red</p>
                      <p className="text-sm font-black text-white mt-0.5">Tu bio</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">
                        Una línea sobre cómo entrenas — aparece en swipes y tu perfil.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold ${bioSweetSpot ? 'text-[#22c55e]' : 'text-[#FF671F]'}`}>
                        {bioLen}/{BIO_MAX}
                      </span>
                      {bioSweetSpot && (
                        <p className="text-[8px] text-[#22c55e] mt-0.5">✓ longitud ideal</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pt-3">
                    <div className="h-1 rounded-full bg-[#2F2F35] overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          bioSweetSpot ? 'bg-gradient-to-r from-[#22c55e] to-[#4ade80]' : 'bg-gradient-to-r from-[#FF671F] to-[#f59e0b]'
                        }`}
                        style={{ width: `${bioProgress}%` }}
                      />
                    </div>

                    <div className="relative">
                      <textarea
                        value={onboardData.bio || ''}
                        onChange={(e) => {
                          updateOnboard({ bio: e.target.value.slice(0, BIO_MAX) })
                          try { triggerHaptic('light') } catch {}
                        }}
                        rows={3}
                        className="w-full bg-[#0D0D10]/80 border border-[#FF671F]/20 focus:border-[#FF671F]/60 focus:ring-2 focus:ring-[#FF671F]/15 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-[#6B7280] resize-none leading-relaxed"
                        placeholder="Ej: Pesas 4x + running costanera. Busco compañero/a con buena energía."
                      />
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2">
                    <p className="text-[9px] uppercase tracking-wider text-[#9CA3AF] font-semibold mb-2 flex items-center gap-1.5">
                      <Sparkles size={11} className="text-[#FF671F]" aria-hidden />
                      Inspiración rápida — toca para usar
                    </p>
                    <div className="space-y-2">
                      {bioInspirations.map((item) => {
                        const selected = onboardData.bio === item.text
                        return (
                          <button
                            key={item.vibe}
                            type="button"
                            onClick={() => {
                              updateOnboard({ bio: item.text })
                              try { triggerHaptic('light') } catch {}
                            }}
                            className={`w-full text-left p-3 rounded-2xl border transition active:scale-[0.99] ${
                              selected
                                ? 'border-[#FF671F] bg-[#FF671F]/15 ring-1 ring-[#FF671F]/30'
                                : 'border-[#2F2F35] bg-[#1C1C20]/80 hover:border-[#FF671F]/35 active:bg-[#FF671F]/8'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base leading-none" aria-hidden>{item.emoji}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF671F]">{item.vibe}</span>
                              {selected && (
                                <span className="ml-auto text-[9px] text-[#22c55e] font-bold">EN USO</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#d1d5db] leading-snug">{item.text}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* PASO ESENCIA */}
        {isEssenceStep && (
          <div className="space-y-7">
            <div>
              <div className="uppercase text-[9px] tracking-[2px] text-[#FF671F] mb-1.5">TU ENTRENO • ELIGE TUS DEPORTES (1-3)</div>
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
                        <div className="text-[9px] opacity-70 mt-0.5">Apareces en el mapa correcto + matches de alto valor</div>
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
                      {selected && <span className="text-[10px] font-bold bg-black/25 px-2 py-0.5 rounded-full tracking-wide">✓ Objetivo principal</span>}
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] text-[#9CA3AF] mt-1.5">Esto mejora tus matches, el mapa en vivo y los retos diarios que importan.</div>
            </div>
          </div>
        )}

        {/* PASO PULSO VIVO */}
        {isPulseStep && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0a120f] border-2 border-[#22c55e]/40 p-5 shadow-inner">
              <div className="uppercase text-[#22c55e] text-[9px] tracking-[2.5px] font-bold mb-1">LA MAGIA QUE NADIE MÁS TIENE EN EL FITNESS</div>
              <div className="text-xl font-black tracking-[-0.5px] leading-none mb-4">ENTRENASYNC + PULSO DEL MAPA<br/>= TU RED COBRA VIDA REAL, MEDIBLE Y VISIBLE</div>
              
              <div className="space-y-4 text-sm">
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">01</div>
                  <div><span className="font-bold">MARCA "ENTRENANDO AHORA"</span><br/><span className="text-[#9CA3AF] text-xs">Apareces en el mapa en vivo con punto verde. Otros cerca te ven entrenando en tiempo real.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">02</div>
                  <div><span className="font-bold">DAN LIKE → CHAT INSTANTÁNEO</span><br/><span className="text-[#9CA3AF] text-xs">Estás a un toque de conectar con {BRAND_COPY.partnerGeneric} que entrena ahora como tú.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">03</div>
                  <div><span className="font-bold">CREAS ENTRENASYNC</span><br/><span className="text-[#9CA3AF] text-xs">Acciones en vivo (flexiones juntos se sienten en ambos). En el mapa aparece una línea dorada entre ustedes. +Fuerza del equipo real para tu Red.</span></div>
                </div>
                <div className="flex gap-4 bg-[#111113] p-3 rounded-2xl border border-[#22c55e]/20">
                  <div className="text-[#22c55e] text-xl font-black mt-0.5">04</div>
                  <div><span className="font-bold">QUEDA EN TU MURO, FEED Y MAPA</span><br/><span className="text-[#FF671F] text-xs font-bold">Cada EntrenaSync deja actividad visible — quien entrena cerca ve que estuvieron juntos.</span></div>
                </div>
              </div>
            </div>

            {/* Visual mock of the magic - Unique & attractive */}
            <div className="bg-[#0a0a0c] border border-[#22c55e]/30 rounded-2xl p-3 text-center">
              <div className="text-[10px] text-[#22c55e] tracking-widest mb-1">ASÍ SE VE EN EL MUNDO REAL</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <div className="bg-[#22c55e] text-black px-2 py-0.5 rounded font-bold">🟢 TÚ EN PULSO VIVO</div>
                <div className="text-[#FFD700]">⟷</div>
                <div className="bg-[#FFD700] text-black px-2 py-0.5 rounded font-bold">🔗 LÍNEA DORADA EN MAPA</div>
              </div>
              <div className="text-[9px] text-[#9CA3AF] mt-1">+25 Fuerza del equipo • ondas en el mapa • tu primer match en &lt;30s</div>
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
              <div className="text-[10px] text-[#9CA3AF] mt-2 max-w-xs mx-auto leading-snug">
                Apareces en el mapa para que otros te encuentren mientras entrenas.
              </div>
            </div>

            <div className="rounded-2xl border border-[#a855f7]/35 bg-[#120a18] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#a855f7]">Modo fantasma</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">
                    Privacidad ~500 m — tu pin aparece con imprecisión en el mapa
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={onboardData.wantsGhostMode}
                  onClick={() => {
                    const next = !onboardData.wantsGhostMode
                    updateOnboard({ wantsGhostMode: next })
                    try { triggerHaptic('light') } catch {}
                  }}
                  className={`shrink-0 w-11 h-6 rounded-full transition-colors ${onboardData.wantsGhostMode ? 'bg-[#a855f7]' : 'bg-[#3f3f46]'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${onboardData.wantsGhostMode ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO ENTRAR — confirmaciones */}
        {isConsentsStep && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="uppercase tracking-[2px] text-[#FF671F] text-xs mb-1">Último paso</div>
              <div className="text-2xl font-black tracking-[-1px]">Confirma y entra</div>
              <div className="text-[#9CA3AF] text-sm mt-1 leading-snug">
                Marca las 3 casillas. Son los requisitos básicos para usar la {BRAND_COPY.community}.
              </div>
            </div>

            {[
              {
                key: 'is18' as const,
                tag: '1 · Edad',
                label: 'Tengo 18 años o más',
                desc: 'EntrenaMatch es solo para mayores de edad.',
              },
              {
                key: 'isForTraining' as const,
                tag: '2 · Comunidad',
                label: 'Usaré la app para entrenar en serio y con respeto',
                desc: 'Espacio para motivarnos — no para perder el tiempo.',
              },
              {
                key: 'sharesLocation' as const,
                tag: '3 · Mapa en vivo',
                label: 'Entiendo que solo aparezco en el mapa si activo “Entrenando ahora”',
                desc: 'Tú decides cuándo estar visible. Puedes apagar LIVE cuando quieras.',
              },
            ].map((item) => {
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
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs font-bold ${
                        checked ? 'bg-[#FF671F] border-[#FF671F] text-black' : 'border-[#9CA3AF] text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#FF671F] mb-0.5">{item.tag}</p>
                      <div className="font-bold text-sm leading-tight text-white">{item.label}</div>
                      <div className="text-[#9CA3AF] text-xs mt-1 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                </button>
              )
            })}

            <div className="p-4 rounded-2xl bg-[#111113] border border-[#2F2F35]">
              <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold mb-3">
                Qué puedes hacer al entrar
              </p>
              <ol className="space-y-2.5 text-sm text-[#d1d5db] leading-snug">
                <li className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">1.</span>
                  <span>
                    Si activaste LIVE, tu <strong className="text-white">punto verde</strong> aparece en el mapa en vivo.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">2.</span>
                  <span>
                    Ve a <strong className="text-[#FF671F]">Explorar</strong> y dale ❤️ a alguien cerca → match y chat al instante.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#22c55e] font-bold shrink-0">3.</span>
                  <span>
                    En el chat, toca <strong className="text-white">Iniciar EntrenaSync</strong> para entrenar juntos — verán la línea dorada en el mapa.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        )}

        </div>
        </div> {/* end scrollable step content */}

      </div>

        {/* Fixed bottom — always visible (overflow:hidden on app-container was clipping this) */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-6 pt-2 pb-4 flex flex-col gap-2 bg-[#0D0D10]/98 border-t-2 border-[#2F2F35] z-30">
          {onboardingStep > 0 && (
            <button onClick={() => { try { triggerHaptic('light') } catch {}; setOnboardingStep(onboardingStep - 1) }} className="w-full py-2.5 text-xs uppercase tracking-[1.5px] rounded-2xl border border-[#2F2F35] active:bg-[#1f242b] text-[#9CA3AF]">
              ← VOLVER AL PASO ANTERIOR
            </button>
          )}

          {isEssenceStep && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0) && (
            <p className="text-center text-[9px] text-[#ef4444] font-medium tracking-wider">ELIGE AL MENOS UN TIPO DE ENTRENO Y UN OBJETIVO PRINCIPAL</p>
          )}

          {isConsentsStep && !Object.values(localConsents).every(Boolean) && (
            <p className="text-center text-[9px] text-[#FF671F] font-medium tracking-wider">
              Marca las 3 casillas para entrar ({Object.values(localConsents).filter(Boolean).length}/3)
            </p>
          )}

          <button 
            onClick={nextOnboarding} 
            className="w-full py-4 text-base font-black tracking-[1.5px] rounded-3xl btn-primary active:scale-[0.985] bg-gradient-to-r from-[#FF671F] to-[#E55A1A] touch-manipulation disabled:opacity-45 disabled:pointer-events-none"
            disabled={
              (isEssenceStep && ((onboardData.trainingTypes || []).length === 0 || (onboardData.goals || []).length === 0)) ||
              (isConsentsStep && !Object.values(localConsents).every(Boolean))
            }
          >
            {onboardingStep < lastStep ? 'CONTINUAR →' : isEditMode ? 'GUARDAR CAMBIOS' : '¡ENTRAR A ENTRENAMATCH!'}
          </button>
          <div className="text-center text-[8px] text-[#9CA3AF] tracking-[1px]">
            {isEditMode ? 'GUARDA CAMBIOS AL TERMINAR' : 'TU PERFIL EN LA RED • PRIMER LIVE EN <90s'}
          </div>
          {!isEditMode && onExitToLogin && (
            <button
              type="button"
              onClick={handleExitToLogin}
              className="w-full py-1 text-[10px] text-[#9CA3AF] underline active:text-[#FF671F]"
            >
              ¿Entraste por error? Volver al login
            </button>
          )}
        </div>

      <PhotoCropModal
        open={!!cropSession}
        imageSrc={cropSession?.src || ''}
        title="Encuadra tu foto"
        subtitle="Cuadra el recorte — así te verán en swipes, mapa y perfil."
        onConfirm={finishCroppedPhoto}
        onCancel={() => setCropSession(null)}
      />
    </div>
  );
};
