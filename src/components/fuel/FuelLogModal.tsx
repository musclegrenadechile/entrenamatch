import { useRef, useState, useEffect } from 'react'
import { Camera, Sparkles, X } from 'lucide-react'
import { estimateMacrosFromDescription } from '../../utils/fuelCalculator'
import type { AnalyzeFoodResult } from '../../services/fuel'
import type { FuelLogEntry } from '../../types'
import type { FuelLogPrefill } from '../../utils/fuelLogPrefill'

export interface FuelLogModalProps {
  open: boolean
  editEntry?: FuelLogEntry | null
  prefill?: FuelLogPrefill | null
  onClose: () => void
  onSave: (payload: {
    editId?: string
    mealLabel: string
    kcal: number
    proteinG: number
    carbsG: number
    fatG: number
    photoDataUrl?: string
    source: 'manual' | 'photo_ai' | 'text_ai'
    publishToMuro: boolean
  }) => Promise<void>
  onAnalyzePhoto?: (imageBase64: string, mealDescription?: string) => Promise<AnalyzeFoodResult>
  saving?: boolean
}

const EMPTY = {
  mealLabel: '',
  description: '',
  kcal: 450,
  proteinG: 35,
  carbsG: 40,
  fatG: 15,
  photoPreview: null as string | null,
  photoBase64: null as string | null,
  source: 'manual' as 'manual' | 'photo_ai' | 'text_ai',
  aiTip: null as string | null,
  aiSource: null as 'gemini' | 'heuristic' | null,
  publishToMuro: false,
}

export function FuelLogModal({
  open,
  editEntry = null,
  prefill = null,
  onClose,
  onSave,
  onAnalyzePhoto,
  saving = false,
}: FuelLogModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mealLabel, setMealLabel] = useState(EMPTY.mealLabel)
  const [description, setDescription] = useState(EMPTY.description)
  const [kcal, setKcal] = useState(EMPTY.kcal)
  const [proteinG, setProteinG] = useState(EMPTY.proteinG)
  const [carbsG, setCarbsG] = useState(EMPTY.carbsG)
  const [fatG, setFatG] = useState(EMPTY.fatG)
  const [photoPreview, setPhotoPreview] = useState<string | null>(EMPTY.photoPreview)
  const [photoBase64, setPhotoBase64] = useState<string | null>(EMPTY.photoBase64)
  const [source, setSource] = useState<'manual' | 'photo_ai' | 'text_ai'>(EMPTY.source)
  const [aiTip, setAiTip] = useState<string | null>(EMPTY.aiTip)
  const [aiSource, setAiSource] = useState<'gemini' | 'heuristic' | null>(EMPTY.aiSource)
  const [analyzing, setAnalyzing] = useState(false)
  const [publishToMuro, setPublishToMuro] = useState(EMPTY.publishToMuro)

  useEffect(() => {
    if (!open) return
    if (editEntry) {
      setMealLabel(editEntry.mealLabel)
      setDescription('')
      setKcal(editEntry.kcal)
      setProteinG(editEntry.proteinG)
      setCarbsG(editEntry.carbsG)
      setFatG(editEntry.fatG)
      setPhotoPreview(editEntry.photoUrl || null)
      setPhotoBase64(null)
      setSource(editEntry.source)
      setAiTip(null)
      setAiSource(null)
      setPublishToMuro(false)
    } else if (prefill) {
      setMealLabel(prefill.mealLabel || EMPTY.mealLabel)
      setDescription(prefill.description || EMPTY.description)
      setKcal(prefill.suggestedKcal ?? EMPTY.kcal)
      setProteinG(prefill.suggestedProteinG ?? EMPTY.proteinG)
      setCarbsG(prefill.suggestedCarbsG ?? EMPTY.carbsG)
      setFatG(prefill.suggestedFatG ?? EMPTY.fatG)
      setPhotoPreview(EMPTY.photoPreview)
      setPhotoBase64(EMPTY.photoBase64)
      setSource(EMPTY.source)
      setAiTip(prefill.contextHint || EMPTY.aiTip)
      setAiSource(EMPTY.aiSource)
      setPublishToMuro(EMPTY.publishToMuro)
    } else {
      setMealLabel(EMPTY.mealLabel)
      setDescription(EMPTY.description)
      setKcal(EMPTY.kcal)
      setProteinG(EMPTY.proteinG)
      setCarbsG(EMPTY.carbsG)
      setFatG(EMPTY.fatG)
      setPhotoPreview(EMPTY.photoPreview)
      setPhotoBase64(EMPTY.photoBase64)
      setSource(EMPTY.source)
      setAiTip(EMPTY.aiTip)
      setAiSource(EMPTY.aiSource)
      setPublishToMuro(EMPTY.publishToMuro)
    }
    if (fileRef.current) fileRef.current.value = ''
  }, [open, editEntry, prefill])

  if (!open) return null

  const resolvedMealLabel = () => {
    const label = mealLabel.trim()
    if (label) return label
    const fromDesc = description.trim()
    if (fromDesc) return fromDesc.slice(0, 80)
    return 'Comida'
  }

  const canSave = Boolean(mealLabel.trim() || description.trim() || editEntry)

  const handleSave = async () => {
    if (!canSave) return
    try {
      await onSave({
        editId: editEntry?.id,
        mealLabel: resolvedMealLabel(),
        kcal,
        proteinG,
        carbsG,
        fatG,
        photoDataUrl: photoPreview || undefined,
        source,
        publishToMuro,
      })
    } catch {
      /* App handler muestra toast de error */
    }
  }

  const applyEstimate = (est: AnalyzeFoodResult, src: 'photo_ai' | 'text_ai') => {
    setKcal(est.kcal)
    setProteinG(est.proteinG)
    setCarbsG(est.carbsG)
    setFatG(est.fatG)
    if (!mealLabel) setMealLabel(est.label)
    setAiTip(est.geminiErrorMessage ? `${est.geminiErrorMessage}\n\n${est.tip}` : est.tip)
    setAiSource(est.source)
    setSource(src)
  }

  const handleAnalyzeText = async () => {
    if (!description.trim()) return
    setAnalyzing(true)
    try {
      if (onAnalyzePhoto) {
        const est = await onAnalyzePhoto('', description.trim())
        applyEstimate(est, 'text_ai')
      } else {
        applyEstimate({ ...estimateMacrosFromDescription(description), source: 'heuristic' }, 'text_ai')
      }
    } catch {
      applyEstimate({ ...estimateMacrosFromDescription(description), source: 'heuristic' }, 'text_ai')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyzePhoto = async () => {
    if (!photoBase64) return
    setAnalyzing(true)
    try {
      if (onAnalyzePhoto) {
        const est = await onAnalyzePhoto(photoBase64, description || mealLabel)
        applyEstimate(est, 'photo_ai')
      } else {
        applyEstimate(
          { ...estimateMacrosFromDescription(description || mealLabel || 'Comida con foto'), source: 'heuristic' },
          'photo_ai'
        )
      }
    } catch {
      applyEstimate(
        { ...estimateMacrosFromDescription(description || mealLabel || 'Comida'), source: 'heuristic' },
        'text_ai'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      setPhotoPreview(dataUrl)
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
      setPhotoBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#12121a] border border-[#a855f7]/30 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 sticky top-0 bg-[#12121a] z-10">
          <div>
            <p className="text-sm font-black text-white">
              {editEntry ? 'Editar comida' : 'Registrar comida'}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">
              {editEntry ? 'Ajusta macros manualmente' : 'Foto IA · texto · manual'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/5">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          {!editEntry && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl border-2 border-dashed border-[#a855f7]/40 bg-[#a855f7]/5 flex flex-col items-center gap-2 active:bg-[#a855f7]/10"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="max-h-32 rounded-xl object-cover" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-[#c084fc]" />
                    <span className="text-[11px] font-bold text-[#c084fc]">Foto de tu comida</span>
                  </>
                )}
              </button>

              {photoBase64 && (
                <button
                  type="button"
                  disabled={analyzing}
                  onClick={handleAnalyzePhoto}
                  className="w-full py-2.5 rounded-xl bg-[#a855f7]/20 text-[#c084fc] text-[11px] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {analyzing ? 'Analizando con IA…' : 'Analizar foto (Fuel AI)'}
                </button>
              )}

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la comida (ej. pollo con arroz)…"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm"
              />
              <button
                type="button"
                disabled={analyzing || !description.trim()}
                onClick={() => void handleAnalyzeText()}
                className="text-[10px] text-[#c084fc] font-bold underline disabled:opacity-50"
              >
                {analyzing ? 'Analizando texto…' : 'Estimar macros con Fuel AI'}
              </button>
            </>
          )}

          {editEntry && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-2 rounded-xl border border-[#a855f7]/40 text-[#c084fc] text-[11px] font-bold flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" /> Volver a tomar foto
            </button>
          )}

          {editEntry?.photoUrl && !photoBase64 && (
            <img src={editEntry.photoUrl} alt="" className="max-h-32 rounded-xl object-cover w-full" />
          )}

          <input
            value={mealLabel}
            onChange={(e) => setMealLabel(e.target.value)}
            placeholder="Nombre de la comida"
            className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-sm"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <label>
              kcal
              <input
                type="number"
                value={kcal}
                onChange={(e) => {
                  setSource('manual')
                  setKcal(Number(e.target.value) || 0)
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
            <label>
              Proteína (g)
              <input
                type="number"
                value={proteinG}
                onChange={(e) => {
                  setSource('manual')
                  setProteinG(Number(e.target.value) || 0)
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
            <label>
              Carbs (g)
              <input
                type="number"
                value={carbsG}
                onChange={(e) => {
                  setSource('manual')
                  setCarbsG(Number(e.target.value) || 0)
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
            <label>
              Grasa (g)
              <input
                type="number"
                value={fatG}
                onChange={(e) => {
                  setSource('manual')
                  setFatG(Number(e.target.value) || 0)
                }}
                className="mt-1 w-full px-2 py-2 rounded-lg bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
          </div>

          {aiTip && (
            <div className="text-[10px] text-[#9CA3AF] bg-white/5 rounded-xl p-2 leading-snug space-y-1">
              {aiSource === 'gemini' && (
                <span className="inline-block text-[9px] font-bold text-[#c084fc] bg-[#a855f7]/15 px-2 py-0.5 rounded-full">
                  ✨ Gemini
                </span>
              )}
              {aiSource === 'heuristic' && (
                <span className="inline-block text-[9px] font-bold text-[#9CA3AF] bg-white/5 px-2 py-0.5 rounded-full">
                  Estimación local
                </span>
              )}
              <p>{aiTip}</p>
            </div>
          )}

          {!editEntry && (
            <label className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
              <input
                type="checkbox"
                checked={publishToMuro}
                onChange={(e) => setPublishToMuro(e.target.checked)}
                className="rounded"
              />
              Publicar Fuel check en el muro
            </label>
          )}
        </div>

        <div className="p-4 border-t border-white/8 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-white/15 text-[#9CA3AF] font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving || !canSave}
            onClick={() => void handleSave()}
            className="flex-1 py-3 rounded-2xl bg-[#a855f7] text-black font-extrabold text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : editEntry ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
