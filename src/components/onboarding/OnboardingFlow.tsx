// @ts-nocheck
import React from 'react';
import { Dumbbell, MapPin, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingFlowProps {
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  currentUser: any;
  saveUser: (user: any) => void;
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
  const [onboardData, setOnboardData] = React.useState<any>({
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
  });

  const updateOnboard = (patch: any) => {
    setOnboardData((prev: any) => ({ ...prev, ...patch }));
  };

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
  const nextOnboarding = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(s => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    if (!onboardData.name || !onboardData.bio || onboardData.photos?.length === 0 || onboardData.trainingTypes?.length === 0 || (onboardData.goals?.length || 0) === 0) {
      toast.error('Faltan datos', { description: 'Nombre, bio, foto, tipos de entrenamiento y al menos un objetivo son obligatorios' });
      return;
    }
    if ((onboardData.age || 0) < 18) {
      toast.error('Debes ser mayor de 18 años', { description: 'EntrenaMatch es solo para personas mayores de 18 años' });
      return;
    }
    const allConsents = Object.values(consents).every(v => v === true);
    if (!allConsents) {
      toast.error('Faltan aceptaciones', { description: 'Debes aceptar todos los consentimientos para continuar' });
      return;
    }

    const newUser: any = {
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
        is18: consents.is18,
        isForTraining: consents.isForTraining,
        sharesLocation: consents.sharesLocation,
      }
    };

    saveUser(newUser);
    setShowOnboarding(false);
    setOnboardingStep(0);

    toast.success('¡Perfil creado!', { 
      description: 'Bienvenido a EntrenaMatch. ¡Explora y encuentra tu compañero de entrenamiento!' 
    });
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
          <div className="text-3xl font-semibold tracking-tighter leading-none mb-2">Crea tu perfil</div>
          <div className="text-[#94a3b8]">Conecta con personas que entrenan cerca de ti en todo el mundo</div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`step-dot ${i <= onboardingStep ? 'active' : ''}`} />
          ))}
        </div>

        {/* Step 0: Basic info */}
        {onboardingStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-[#94a3b8] mb-1.5 block">¿Cómo te llamas?</label>
              <input value={onboardData.name} onChange={e => updateOnboard({ name: e.target.value })} 
                className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-4 text-xl placeholder:text-[#475569]" placeholder="Tu nombre" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#94a3b8] mb-1.5 block">Edad</label>
                <input type="number" value={onboardData.age} onChange={e => updateOnboard({ age: parseInt(e.target.value) || 25 })}
                  className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-5 py-4 text-xl" />
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
              <label className="text-sm text-[#94a3b8] mb-1.5 block">¿En qué sector de Viña vives / entrenas?</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#94a3b8] mb-1 block">Ciudad</label>
                  <input value={onboardData.city || ''} onChange={e => updateOnboard({ city: e.target.value })} 
                    className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" placeholder="Ej: Viña del Mar" />
                </div>
                <div>
                  <label className="text-xs text-[#94a3b8] mb-1 block">País</label>
                  <input value={onboardData.country || ''} onChange={e => updateOnboard({ country: e.target.value })} 
                    className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" placeholder="Ej: Chile" />
                </div>
              </div>
              <button 
                onClick={requestUserLocation}
                className="mt-3 w-full text-sm flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#14b8a6] text-[#14b8a6] active:bg-[#14b8a6] active:text-black"
              >
                <MapPin size={16} /> Usar mi ubicación actual (GPS)
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Photos */}
        {onboardingStep === 1 && (
          <div>
            <div className="mb-4">
              <div className="text-xl font-semibold mb-1">Sube tus fotos</div>
              <div className="text-[#94a3b8] text-sm">Máximo 6. La primera es la principal.</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(onboardData.photos || []).map((photo: string, idx: number) => (
                <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#121418]">
                  <img src={photo} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeOnboardPhoto(idx)} className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {(onboardData.photos || []).length < 6 && (
                <label className="aspect-[4/3] border-2 border-dashed border-[#272b33] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#121418] active:bg-[#1a1d23]">
                  <Camera className="mb-2 text-[#14b8a6]" />
                  <span className="text-xs text-[#94a3b8]">Agregar foto</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Steps 2-4 abbreviated for aggressive pace - full content will be moved in next wave */}
        {onboardingStep === 2 && <div className="text-center py-12 text-[#94a3b8]">Paso 2: Tipos de entrenamiento y objetivos (movido en siguiente iteración agresiva)</div>}
        {onboardingStep === 3 && <div className="text-center py-12 text-[#94a3b8]">Paso 3: Nivel e intensidad (movido en siguiente iteración agresiva)</div>}
        {onboardingStep === 4 && (
          <div className="bg-[#121418] border border-[#272b33] rounded-2xl p-4 text-sm space-y-3">
            <div className="font-medium mb-2">Último paso: Consentimientos obligatorios</div>
            {/* Legal checkboxes would be here - moved in next aggressive wave */}
            <p className="text-xs text-[#64748b]">Los consentimientos completos se moverán en la siguiente oleada de extracción.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-auto pt-8 flex gap-3">
          {onboardingStep > 0 && (
            <button onClick={() => setOnboardingStep(onboardingStep - 1)} className="flex-1 py-4 rounded-3xl border border-[#272b33]">
              Atrás
            </button>
          )}
          <button 
            onClick={nextOnboarding} 
            className="flex-1 btn-primary"
            disabled={onboardingStep === 4 && !Object.values(consents).every(Boolean)}
          >
            {onboardingStep < 4 ? 'Continuar' : 'Completar perfil'}
          </button>
        </div>
      </div>
    </div>
  );
};
