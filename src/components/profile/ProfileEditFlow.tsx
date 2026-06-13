import { useState, type ChangeEvent, type ReactNode } from 'react'
import { ArrowLeft, Camera, Crop, Quote } from 'lucide-react'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import { TRAINING_OPTIONS, TRAINING_GOALS, PROFILE_GENDER_OPTIONS } from '../../constants'
import type { ProfileGender } from '../../types'
import { REGISTRATION_REGION_HINT } from '../../constants/pilotProgram'
import { RegistrationRegionSelect } from './RegistrationRegionSelect'
import { PhotoCropModal } from '../photos/PhotoCropModal'

const BIO_MAX = 160

interface CapacitorCameraPlugin {
  getPhoto: (opts: {
    quality: number
    allowEditing: boolean
    resultType: string
  }) => Promise<{ base64String?: string } | null>
}

let CapacitorCamera: CapacitorCameraPlugin | null = null
if (typeof window !== 'undefined' && (window as Window & { Capacitor?: unknown }).Capacitor) {
  const plugins = (window as Window & { __CAPACITOR_PLUGINS__?: { Camera?: CapacitorCameraPlugin } })
    .__CAPACITOR_PLUGINS__ || {}
  CapacitorCamera = plugins.Camera || null
}

type EditData = {
  name: string
  age: number
  gender: ProfileGender
  city: string
  country: string
  lat: number
  lng: number
  bio: string
  photos: string[]
  trainingTypes: string[]
  goals: string[]
  level: 'Principiante' | 'Intermedio' | 'Avanzado'
  intensity: 'Relajado' | 'Moderado' | 'Intenso'
  wantsGhostMode: boolean
}

function profileToEditData(user: CurrentUser): EditData {
  return {
    name: user.name || '',
    age: user.age || 26,
    gender: user.gender || 'mujer',
    city: user.city || 'Viña del Mar',
    country: user.country || 'Chile',
    lat: user.lat ?? -33.0153,
    lng: user.lng ?? -71.5528,
    bio: user.bio || '',
    photos: user.photos || [],
    trainingTypes: user.trainingTypes || [],
    goals: user.goals || [],
    level: user.level || 'Intermedio',
    intensity: user.intensity || 'Moderado',
    wantsGhostMode: !!user.ghostMode,
  }
}

export interface ProfileEditFlowProps {
  currentUser: CurrentUser | null
  saveUser: (user: CurrentUser) => void | Promise<void>
  onClose: () => void
  requestUserLocation?: () => void
  triggerHaptic?: (style?: 'light' | 'medium' | 'success') => void
  uploadPhotoIfNeeded?: (dataUrl: string) => Promise<string>
}

function EditSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[#2F2F35] bg-[#111113] p-4 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export function ProfileEditFlow({
  currentUser,
  saveUser,
  onClose,
  requestUserLocation,
  triggerHaptic = () => {},
  uploadPhotoIfNeeded,
}: ProfileEditFlowProps) {
  const [editData, setEditData] = useState<EditData>(() =>
    currentUser ? profileToEditData(currentUser) : profileToEditData({ id: 'me' } as CurrentUser)
  )
  const [saving, setSaving] = useState(false)
  const [cropSession, setCropSession] = useState<{
    src: string
    queue: string[]
    replaceIndex?: number
  } | null>(null)

  const patch = (p: Partial<EditData>) => setEditData((prev) => ({ ...prev, ...p }))

  const slotsLeft = () => Math.max(0, 6 - (editData.photos || []).length)

  const startCropFlow = (sources: string[], replaceIndex?: number) => {
    if (!sources.length) return
    setCropSession({ src: sources[0], queue: sources.slice(1), replaceIndex })
  }

  const finishCroppedPhoto = async (cropped: string) => {
    let final = cropped
    if (uploadPhotoIfNeeded) final = await uploadPhotoIfNeeded(cropped)
    const current = editData.photos || []
    if (cropSession?.replaceIndex != null) {
      const photos = [...current]
      photos[cropSession.replaceIndex] = final
      patch({ photos })
    } else {
      patch({ photos: [...current, final].slice(0, 6) })
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
    const files = e.target.files
    if (!files) return
    const readers = Array.from(files).slice(0, slotsLeft()).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
    )
    const urls = await Promise.all(readers)
    e.target.value = ''
    if (!urls.length) {
      toast('Máximo 6 fotos')
      return
    }
    startCropFlow(urls)
  }

  const takeNativePhoto = async () => {
    if (!CapacitorCamera || typeof window === 'undefined' || !(window as Window & { Capacitor?: unknown }).Capacitor) {
      toast('Cámara nativa no disponible en esta versión web')
      return
    }
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: 'base64',
      })
      if (photo?.base64String) {
        if (slotsLeft() <= 0) {
          toast('Máximo 6 fotos')
          return
        }
        startCropFlow([`data:image/jpeg;base64,${photo.base64String}`])
      }
    } catch {
      toast('No se pudo tomar la foto')
    }
  }

  const handleGpsRequest = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        patch({ lat: position.coords.latitude, lng: position.coords.longitude })
        try { requestUserLocation?.() } catch {}
        toast.success('Ubicación actualizada')
      },
      () => toast.error('No pudimos obtener tu GPS')
    )
  }

  const handleSave = async () => {
    if (!currentUser) return
    if (!editData.name?.trim() || !editData.bio?.trim() || !editData.photos.length) {
      toast.error('Faltan datos', { description: 'Nombre, bio y al menos una foto son obligatorios.' })
      return
    }
    if (!editData.trainingTypes.length || !editData.goals.length) {
      toast.error('Faltan datos', { description: 'Elige al menos un deporte y un objetivo principal.' })
      return
    }
    if ((editData.age || 0) < 18) {
      toast.error('Debes ser mayor de 18 años')
      return
    }

    setSaving(true)
    try {
      let finalPhotos = editData.photos
      if (uploadPhotoIfNeeded && finalPhotos.some((p) => p.startsWith('data:'))) {
        finalPhotos = await Promise.all(finalPhotos.map((p) => uploadPhotoIfNeeded(p)))
      }

      const photosChanged =
        JSON.stringify(finalPhotos) !== JSON.stringify(currentUser.photos || [])

      const updated: CurrentUser = {
        ...currentUser,
        name: editData.name.trim(),
        age: editData.age,
        gender: editData.gender,
        city: editData.city,
        country: editData.country,
        lat: editData.lat,
        lng: editData.lng,
        bio: editData.bio.trim(),
        photos: finalPhotos,
        ...(photosChanged ? { photosUpdatedAt: Date.now() } : {}),
        trainingTypes: editData.trainingTypes,
        goals: editData.goals,
        level: editData.level,
        intensity: editData.intensity,
        ghostMode: editData.wantsGhostMode,
      }

      await Promise.resolve(saveUser(updated))
      try { triggerHaptic('success') } catch {}
      toast.success('Perfil actualizado')
      onClose()
    } catch (err) {
      console.error('[ProfileEditFlow] save failed', err)
      toast.error('No se pudo guardar', { description: 'Revisa tu conexión e intenta de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  const bioLen = (editData.bio || '').length

  return (
    <div className="app-container flex flex-col bg-[#0D0D10] text-white min-h-screen">
      <header className="flex-shrink-0 px-4 py-3 border-b border-[#2F2F35] flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center"
          aria-label="Volver al perfil"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold">Editar perfil</h1>
          <p className="text-[10px] text-[#9CA3AF]">Actualiza tu info sin repetir el onboarding</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4 pb-28">
        <EditSection title="Datos básicos" subtitle="Nombre, edad y género visibles en tu perfil y matches">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="w-full bg-[#1C1C20] border border-[#2F2F35] focus:border-[#FF671F] rounded-xl px-4 py-3 text-lg font-bold"
            placeholder="Tu nombre"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-age" className="block text-[11px] font-semibold text-[#9CA3AF] mb-1.5">
                Edad
              </label>
              <input
                id="edit-age"
                type="number"
                inputMode="numeric"
                min={18}
                max={99}
                value={editData.age || ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  const next = raw === '' ? 0 : Math.min(99, parseInt(raw, 10))
                  patch({ age: next })
                }}
                className="w-full bg-[#1C1C20] border border-[#2F2F35] focus:border-[#FF671F] rounded-xl px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-[#9CA3AF] mb-1.5">Género</span>
              <div className="grid grid-cols-3 gap-1.5">
                {PROFILE_GENDER_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => patch({ gender: value })}
                    className={`py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold transition ${
                      editData.gender === value
                        ? 'bg-[#FF671F] text-black'
                        : 'bg-[#1C1C20] border border-[#2F2F35] text-[#9CA3AF]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <RegistrationRegionSelect
            value={{
              country: editData.country,
              city: editData.city,
              lat: editData.lat,
              lng: editData.lng,
            }}
            onChange={(next) => patch(next)}
          />
          <p className="text-[9px] text-[#9CA3AF]">{REGISTRATION_REGION_HINT}</p>
          <button
            type="button"
            onClick={handleGpsRequest}
            className="w-full py-2.5 rounded-xl border border-[#22c55e]/40 text-[#22c55e] text-sm font-semibold"
          >
            📍 Actualizar GPS
          </button>
        </EditSection>

        <EditSection title="Fotos" subtitle="La primera es tu foto principal en explore y mapa">
          <div className="grid grid-cols-3 gap-2">
            {editData.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#FF671F]/40">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => patch({ photos: editData.photos.filter((_, i) => i !== idx) })}
                  className="absolute top-1 right-1 bg-black/80 text-white text-xs w-5 h-5 rounded-full"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => startCropFlow([photo], idx)}
                  className="absolute top-1 left-1 bg-black/75 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                >
                  <Crop size={10} /> Encuadrar
                </button>
                {idx === 0 ? (
                  <div className="absolute bottom-0 inset-x-0 bg-[#FF671F] text-black text-[8px] text-center font-bold py-0.5">
                    PRINCIPAL
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const photos = [...editData.photos]
                      const [moved] = photos.splice(idx, 1)
                      photos.unshift(moved)
                      patch({ photos })
                    }}
                    className="absolute bottom-1 left-1 bg-black/70 text-[8px] px-1 rounded text-white"
                  >
                    ★ Principal
                  </button>
                )}
              </div>
            ))}
            {slotsLeft() > 0 && (
              <div className="grid grid-rows-2 gap-2">
                <button
                  type="button"
                  onClick={takeNativePhoto}
                  className="border border-[#FF671F] rounded-xl flex flex-col items-center justify-center text-[#FF671F] text-[10px]"
                >
                  <Camera size={18} />
                  Cámara
                </button>
                <label className="border border-dashed border-[#FF671F]/40 rounded-xl flex flex-col items-center justify-center text-[10px] text-[#9CA3AF] cursor-pointer">
                  <Camera size={14} />
                  Subir
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            )}
          </div>
        </EditSection>

        <EditSection title="Bio" subtitle={`${bioLen}/${BIO_MAX} caracteres`}>
          <div className="flex items-center gap-2 text-[#FF671F] mb-1">
            <Quote size={14} aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-wide">Cómo te presentas</span>
          </div>
          <textarea
            value={editData.bio}
            onChange={(e) => patch({ bio: e.target.value.slice(0, BIO_MAX) })}
            rows={3}
            className="w-full bg-[#0D0D10] border border-[#2F2F35] focus:border-[#FF671F] rounded-xl px-3 py-2.5 text-sm resize-none"
            placeholder="Ej: Pesas 4x por semana. Busco compañero/a constante en Viña."
          />
        </EditSection>

        <EditSection title="Tu entreno" subtitle="Deportes y objetivo principal para mejores matches">
          <div className="grid grid-cols-2 gap-2">
            {TRAINING_OPTIONS.map((type) => {
              const selected = editData.trainingTypes.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const next = selected
                      ? editData.trainingTypes.filter((t) => t !== type)
                      : [...editData.trainingTypes, type].slice(0, 3)
                    patch({ trainingTypes: next })
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold ${
                    selected ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'
                  }`}
                >
                  {type}
                </button>
              )
            })}
          </div>
          <div className="space-y-1.5 pt-1">
            {TRAINING_GOALS.map((goal) => {
              const selected = editData.goals.includes(goal)
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => patch({ goals: [goal] })}
                  className={`w-full p-2.5 rounded-xl border text-left text-sm flex justify-between items-center ${
                    selected ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20]'
                  }`}
                >
                  <span>{goal}</span>
                  {selected && <span className="text-[9px] font-bold">✓ Principal</span>}
                </button>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <select
              value={editData.level}
              onChange={(e) => patch({ level: e.target.value as EditData['level'] })}
              className="bg-[#1C1C20] border border-[#2F2F35] rounded-xl px-3 py-2 text-sm"
            >
              {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select
              value={editData.intensity}
              onChange={(e) => patch({ intensity: e.target.value as EditData['intensity'] })}
              className="bg-[#1C1C20] border border-[#2F2F35] rounded-xl px-3 py-2 text-sm"
            >
              {(['Relajado', 'Moderado', 'Intenso'] as const).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </EditSection>

        <EditSection title="Privacidad en mapa" subtitle="El LIVE se activa desde tu perfil con el botón IR LIVE">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#a855f7]">Modo fantasma</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">Ubicación aproximada (~500 m) en el mapa</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={editData.wantsGhostMode}
              onClick={() => patch({ wantsGhostMode: !editData.wantsGhostMode })}
              className={`w-11 h-6 rounded-full transition-colors ${editData.wantsGhostMode ? 'bg-[#a855f7]' : 'bg-[#3f3f46]'}`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
                  editData.wantsGhostMode ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </EditSection>
      </div>

      <footer className="flex-shrink-0 fixed bottom-0 left-0 right-0 px-4 py-3 bg-[#0D0D10] border-t border-[#2F2F35] flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-[#2F2F35] text-sm font-semibold text-[#9CA3AF]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#E55A1A] text-black text-sm font-black disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </footer>

      <PhotoCropModal
        open={!!cropSession}
        imageSrc={cropSession?.src || ''}
        title="Encuadra tu foto"
        subtitle="Ajusta el recorte de tu foto de perfil."
        onConfirm={finishCroppedPhoto}
        onCancel={() => setCropSession(null)}
      />
    </div>
  )
}
