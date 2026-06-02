// @ts-nocheck
import React from 'react';
import { Dumbbell, MapPin, Camera, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { TRAINING_OPTIONS, TRAINING_GOALS, TRAINING_INTENSITIES } from '../../constants';

// Capacitor Camera (only used on native)
let CapacitorCamera: any = null;
try {
  // Dynamic so web build doesn't break
  import('@capacitor/camera').then(mod => { CapacitorCamera = mod.Camera; });
} catch (e) {}

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
  const [onboardData, setOnboardData] = React.useState<any>(() => {
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
        availability: currentUser.availability || []
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
      availability: []
    }
  });

  // Consents fully managed internally now (previous props were dummy)
  // For edit mode, pre-fill from existing legalConsents so user doesn't have to re-tap to save changes
  const [localConsents, setLocalConsents] = React.useState(() => {
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!CapacitorCamera) {
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
      availability: onboardData.availability!.length ? onboardData.availability! : ['Tarde'],
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

      toast.success(isEditingProfile ? '¡Perfil actualizado!' : '¡Perfil creado!', { 
        description: isEditingProfile 
          ? 'Los cambios se guardaron y sincronizaron con el backend real.' 
          : 'Bienvenido a EntrenaMatch. ¡Explora y encuentra tu compañero de entrenamiento!' 
      });
    } catch (err) {
      console.error('Error guardando perfil en onboarding:', err);
      toast.error('No se pudo guardar el perfil', { description: 'Revisa tu conexión e intenta de nuevo.' });
      // Do not close the flow on error so user can retry
    }
  };

  return (
    <div className="app-container flex flex-col bg-[#0a0b0f] text-white">
      <div className="flex-1 flex flex-col p-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#14b8a6] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="font-bold text-3xl tracking-tighter">EntrenaMatch</div>
            <div className="text-[#14b8a6] text-xs -mt-1">ENTRENA EN TODO EL MUNDO</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-3xl font-semibold tracking-tighter leading-none mb-2">
            {isEditingProfile ? 'Edita tu perfil' : 'Crea tu perfil'}
          </div>
          <div className="text-[#94a3b8]">Conecta con personas que entrenan cerca de ti en todo el mundo</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`step-dot ${i <= onboardingStep ? 'active' : ''}`} />
          ))}
        </div>

        {/* Scrollable step content */}
        <div className="flex-1 overflow-auto -mx-1 px-1 pb-8 min-h-0">

        {/* Step 0: Basic info */}
        {onboardingStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-[#94a3b8] mb-1.5 block font-medium">¿Cómo te llamas?</label>
              <input value={onboardData.name} onChange={e => updateOnboard({ name: e.target.value })} 
                className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-4 text-xl placeholder:text-[#475569] focus:border-[#14b8a6] focus:outline-none" placeholder="Tu nombre" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#94a3b8] mb-1.5 block">Edad</label>
                <input 
                  type="number" 
                  value={onboardData.age || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    // Permitir campo vacío mientras se escribe, solo parsear cuando hay valor
                    const num = val === '' ? '' : parseInt(val);
                    updateOnboard({ age: num });
                  }} 
                  className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-4 text-xl" 
                  min="18" 
                  max="80"
                  placeholder="Ej: 28"
                />
              </div>
              <div>
                <label className="text-sm text-[#94a3b8] mb-1.5 block">Género</label>
                <div className="flex gap-2">
                  {(['mujer','hombre'] as const).map(g => (
                    <button key={g} onClick={() => updateOnboard({ gender: g })}
                      className={`flex-1 py-4 rounded-2xl border text-sm font-medium ${onboardData.gender === g ? 'bg-[#14b8a6] text-black border-[#14b8a6]' : 'border-[#272b33] bg-[#121418]'}`}>
                      {g === 'mujer' ? 'Mujer' : 'Hombre'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-[#94a3b8] mb-1.5 block font-medium">¿En qué sector de Viña vives / entrenas?</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#94a3b8] mb-1 block">Ciudad</label>
                  <input value={onboardData.city || ''} onChange={e => updateOnboard({ city: e.target.value })} 
                    className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3 focus:border-[#14b8a6] focus:outline-none" placeholder="Ej: Viña del Mar" />
                </div>
                <div>
                  <label className="text-xs text-[#94a3b8] mb-1 block">País</label>
                  <input value={onboardData.country || ''} onChange={e => updateOnboard({ country: e.target.value })} 
                    className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3 focus:border-[#14b8a6] focus:outline-none" placeholder="Ej: Chile" />
                </div>
              </div>
              <button 
                onClick={requestUserLocation}
                className="mt-3 w-full text-sm flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#14b8a6] text-[#14b8a6] active:bg-[#14b8a6] active:text-black"
              >
                <MapPin size={16} /> Usar mi ubicación actual (GPS)
              </button>
            </div>

            {/* Bio - required field */}
            <div>
              <label className="text-sm text-[#94a3b8] mb-1.5 block font-medium">Cuéntanos un poco sobre ti (bio)</label>
              <textarea 
                value={onboardData.bio || ''} 
                onChange={e => updateOnboard({ bio: e.target.value })}
                className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3 h-20 resize-y text-sm focus:border-[#14b8a6] focus:outline-none"
                placeholder="Me encanta entrenar pesas y salir a correr por la costanera los fines de semana..."
              />
            </div>
          </div>
        )}

        {/* Step 1: Photos - Attractive upload */}
        {onboardingStep === 1 && (
          <div>
            <div className="mb-4">
              <div className="text-xl font-semibold mb-1">Sube tus fotos</div>
              <div className="text-[#94a3b8] text-sm">Máximo 6. La primera es la principal y más importante.</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(onboardData.photos || []).map((photo: string, idx: number) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#121418] border border-[#272b33]">
                  <img src={photo} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeOnboardPhoto(idx)} className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full active:bg-black">
                    <Trash2 size={15} />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">Principal</div>
                  )}
                </div>
              ))}
              {(onboardData.photos || []).length < 6 && (
                <label className="aspect-[4/3] border-2 border-dashed border-[#272b33] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#121418] active:bg-[#1a1d23]">
                  <Camera className="mb-2 text-[#14b8a6]" />
                  <span className="text-xs text-[#94a3b8]">Agregar foto</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
              {/* Native camera (shows only when running as real APK via Capacitor) */}
              {(onboardData.photos || []).length < 6 && CapacitorCamera && (
                <button
                  type="button"
                  onClick={takeNativePhoto}
                  className="aspect-[4/3] border-2 border-[#14b8a6] text-[#14b8a6] rounded-2xl flex flex-col items-center justify-center text-xs active:bg-[#14b8a6]/10"
                >
                  <Camera className="mb-1" />
                  Cámara del teléfono
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#64748b]">Usa fotos recientes donde se te vea bien y con buena luz.</p>
          </div>
        )}

        {/* Step 2: Training Types + Goals - Attractive multi-select */}
        {onboardingStep === 2 && (
          <div className="space-y-7">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold flex items-center gap-2">
                  <Dumbbell size={20} className="text-[#14b8a6]" /> ¿Qué tipos de entrenamiento haces?
                </div>
                {(onboardData.trainingTypes || []).length > 0 && (
                  <span className="text-xs text-[#14b8a6] font-medium">{(onboardData.trainingTypes || []).length} seleccionados</span>
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
                      className={`px-3 py-1.5 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-sm' : 'border-[#272b33] bg-[#121418] hover:border-[#3a3f48] hover:bg-[#1a1d23]'}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => updateOnboard({ trainingTypes: TRAINING_OPTIONS })} className="text-[10px] text-[#14b8a6] underline">Seleccionar todos</button>
                <button onClick={() => updateOnboard({ trainingTypes: [] })} className="text-[10px] text-[#64748b] underline">Limpiar</button>
              </div>
              {(onboardData.trainingTypes || []).length === 0 && (
                <p className="text-xs text-[#ef4444] mt-1.5">Selecciona al menos uno para continuar</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold">¿Cuáles son tus objetivos principales?</div>
                {(onboardData.goals || []).length > 0 && (
                  <span className="text-xs text-[#14b8a6] font-medium">{(onboardData.goals || []).length} seleccionados</span>
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
                      className={`px-3 py-1.5 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-sm' : 'border-[#272b33] bg-[#121418] hover:border-[#3a3f48] hover:bg-[#1a1d23]'}`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => updateOnboard({ goals: TRAINING_GOALS })} className="text-[10px] text-[#14b8a6] underline">Seleccionar todos</button>
                <button onClick={() => updateOnboard({ goals: [] })} className="text-[10px] text-[#64748b] underline">Limpiar</button>
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
                <Star size={20} className="text-[#14b8a6]" /> Nivel actual
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Principiante', 'Intermedio', 'Avanzado'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => updateOnboard({ level: lvl })}
                    className={`py-4 rounded-3xl border text-sm font-semibold transition-all active:scale-[0.985] ${onboardData.level === lvl ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-sm' : 'border-[#272b33] bg-[#121418] hover:border-[#3a3f48] hover:bg-[#1a1d23]'}`}
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
                    className={`py-4 rounded-3xl border text-sm font-semibold transition-all active:scale-[0.985] ${onboardData.intensity === int ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-sm' : 'border-[#272b33] bg-[#121418] hover:border-[#3a3f48] hover:bg-[#1a1d23]'}`}
                  >
                    {int}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Consents - Clean, trustworthy checkboxes */}
        {onboardingStep === 4 && (
          <div className="space-y-4">
            <div>
              <div className="text-xl font-semibold mb-1">Consentimientos obligatorios</div>
              <p className="text-sm text-[#94a3b8]">{isEditingProfile ? 'Confirma que sigues de acuerdo para guardar los cambios.' : 'Debes aceptar todos para crear tu perfil y usar la plataforma.'}</p>
            </div>

            {[
              { key: 'is18', label: 'Confirmo que tengo 18 años o más' },
              { key: 'isForTraining', label: 'Estoy buscando entrenar de forma seria y respetuosa' },
              { key: 'sharesLocation', label: 'Acepto compartir mi ubicación aproximada para encontrar gente cerca' }
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 p-4 bg-[#121418] rounded-2xl border border-[#272b33] cursor-pointer active:bg-[#1a1d23] transition-colors">
                <input
                  type="checkbox"
                  checked={(localConsents as any)[item.key]}
                  onChange={(e) => setLocalConsents(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="mt-1 w-4 h-4 accent-[#14b8a6]"
                />
                <span className="text-sm leading-snug">{item.label}</span>
              </label>
            ))}
            <p className="text-[10px] text-[#64748b] mt-2">
              Al continuar aceptas nuestra <a href="/entrenamatch/privacy.html" target="_blank" className="underline">Política de Privacidad</a> y <a href="/entrenamatch/terms.html" target="_blank" className="underline">Términos de Servicio</a>.
            </p>
          </div>
        )}

        </div> {/* end scrollable step content */}

        {/* Fixed bottom navigation - always visible */}
        <div className="pt-3 pb-2 flex flex-col gap-2 bg-[#0a0b0f] border-t border-[#272b33]">
          {onboardingStep > 0 && (
            <button onClick={() => setOnboardingStep(onboardingStep - 1)} className="w-full py-3 text-sm rounded-2xl border border-[#272b33] active:bg-[#1f242b]">
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
