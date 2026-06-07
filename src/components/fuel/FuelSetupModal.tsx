import { useState } from 'react'
import { X } from 'lucide-react'
import { buildFuelProfile } from '../../utils/fuelCalculator'
import type { FuelGoal, FuelProfile } from '../../types'

export interface FuelSetupModalProps {
  open: boolean
  initial?: FuelProfile | null
  defaultAge?: number
  defaultGender?: 'hombre' | 'mujer'
  onClose: () => void
  onSave: (profile: Omit<FuelProfile, 'updatedAt'>) => Promise<void>
  saving?: boolean
}

const GOALS: { id: FuelGoal; label: string }[] = [
  { id: 'lose', label: 'Perder grasa' },
  { id: 'maintain', label: 'Mantener' },
  { id: 'muscle', label: 'Ganar músculo' },
  { id: 'gain', label: 'Subir peso' },
]

const ACTIVITY = [
  { id: 'light' as const, label: 'Ligera (1–2 d/sem)' },
  { id: 'moderate' as const, label: 'Moderada (3–4 d/sem)' },
  { id: 'active' as const, label: 'Activa (5 d/sem)' },
  { id: 'very_active' as const, label: 'Muy activa (2× día)' },
]

export function FuelSetupModal({
  open,
  initial,
  defaultAge = 28,
  defaultGender = 'hombre',
  onClose,
  onSave,
  saving = false,
}: FuelSetupModalProps) {
  const [weightKg, setWeightKg] = useState(initial?.weightKg ?? 75)
  const [heightCm, setHeightCm] = useState(initial?.heightCm ?? 175)
  const [age, setAge] = useState(initial?.age ?? defaultAge)
  const [gender, setGender] = useState<'hombre' | 'mujer'>(initial?.gender ?? defaultGender)
  const [goal, setGoal] = useState<FuelGoal>(initial?.goal ?? 'muscle')
  const [activityLevel, setActivityLevel] = useState<FuelProfile['activityLevel']>(
    initial?.activityLevel ?? 'moderate'
  )
  const [restrictions, setRestrictions] = useState(initial?.restrictions ?? '')

  if (!open) return null

  const preview = buildFuelProfile({
    weightKg,
    heightCm,
    age,
    gender,
    goal,
    activityLevel,
    restrictions,
  })

  const handleSave = async () => {
    await onSave(preview)
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#12121a] border border-[#a855f7]/30 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 sticky top-0 bg-[#12121a] z-10">
          <div>
            <p className="text-sm font-black text-white">Fuel AI — tu perfil</p>
            <p className="text-[10px] text-[#9CA3AF]">TDEE y macros diarios</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/5">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] text-[#9CA3AF] font-bold">Peso (kg)</span>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value) || 70)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-[#9CA3AF] font-bold">Altura (cm)</span>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value) || 170)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] text-[#9CA3AF] font-bold">Edad</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || 25)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1a1a22] border border-white/10 text-white"
              />
            </label>
            <div>
              <span className="text-[10px] text-[#9CA3AF] font-bold">Género</span>
              <div className="flex gap-1 mt-1">
                {(['hombre', 'mujer'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold capitalize ${
                      gender === g ? 'bg-[#a855f7] text-black' : 'bg-white/5 text-[#9CA3AF]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#9CA3AF] font-bold">Objetivo</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-full font-bold ${
                    goal === g.id ? 'bg-[#a855f7] text-black' : 'bg-white/5 text-[#9CA3AF]'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#9CA3AF] font-bold">Actividad</span>
            <div className="space-y-1 mt-1">
              {ACTIVITY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActivityLevel(a.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] ${
                    activityLevel === a.id
                      ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-white'
                      : 'bg-white/5 text-[#9CA3AF] border border-transparent'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] text-[#9CA3AF] font-bold">Restricciones (opcional)</span>
            <input
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ej. sin lactosa, vegetariano…"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-[#1a1a22] border border-white/10 text-white text-xs"
            />
          </label>

          <div className="rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/25 p-3 text-[11px] text-[#e9d5ff]">
            <p className="font-bold text-white">Tu target estimado</p>
            <p className="mt-1 tabular-nums">
              {preview.targetKcal} kcal · P{preview.targetProteinG} · C{preview.targetCarbsG} · G
              {preview.targetFatG}
            </p>
            <p className="text-[10px] text-[#9CA3AF] mt-1">TDEE base: {preview.tdee} kcal</p>
          </div>
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
            disabled={saving}
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-[#a855f7] text-black font-extrabold text-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </div>
      </div>
    </div>
  )
}
