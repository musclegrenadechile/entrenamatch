export interface WeeklyMomentsReelProps {
  highlights: Array<{ label: string; emoji: string }>
}

export function WeeklyMomentsReel({ highlights }: WeeklyMomentsReelProps) {
  if (!highlights.length) return null
  return (
    <div className="rounded-2xl border border-[#FF4F79]/30 bg-gradient-to-r from-[#1a1018] to-[#1C1C20] p-4 mb-3">
      <p className="text-[10px] uppercase tracking-wider text-[#FF4F79] font-bold">EntrenaMatch Moments</p>
      <p className="text-xs text-white font-semibold mt-1">Tu semana en highlights</p>
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {highlights.map((h) => (
          <div key={h.label} className="flex-shrink-0 w-20 text-center p-2 rounded-xl bg-black/30">
            <div className="text-2xl">{h.emoji}</div>
            <p className="text-[8px] text-[#9CA3AF] mt-1">{h.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
