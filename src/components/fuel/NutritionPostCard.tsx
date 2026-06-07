import type { NutritionPreview } from '../../types'

export function NutritionPostCard({ preview }: { preview: NutritionPreview }) {
  return (
    <div className="rounded-2xl border border-[#a855f7]/30 bg-gradient-to-br from-[#a855f7]/10 via-[#141418] to-[#0f0f12] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wider text-[#c084fc] font-bold">Fuel check</p>
      <p className="text-sm font-black text-white mt-0.5">{preview.mealLabel}</p>
      <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-medium">
        <span className="text-[#c084fc] tabular-nums">{preview.kcal} kcal</span>
        <span className="text-[#9CA3AF]">P {preview.proteinG}g</span>
        <span className="text-[#9CA3AF]">C {preview.carbsG}g</span>
        <span className="text-[#9CA3AF]">G {preview.fatG}g</span>
      </div>
    </div>
  )
}
