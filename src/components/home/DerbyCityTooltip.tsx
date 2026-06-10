import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import { derbyCityTooltipKind, type DerbyCityTooltipKind } from '../../services/cityDerby'

export interface DerbyCityTooltipProps {
  userCity?: string | null
}

function tooltipLines(kind: DerbyCityTooltipKind): string[] {
  const lines = [BRAND_COPY.copaZona.tooltipIndex]
  if (kind === 'home') lines.unshift(BRAND_COPY.copaZona.tooltipHome)
  else if (kind === 'away') lines.unshift(BRAND_COPY.copaZona.tooltipAway)
  else lines.unshift(BRAND_COPY.copaZona.tooltipNeutral)
  return lines
}

export function DerbyCityTooltip({ userCity }: DerbyCityTooltipProps) {
  const [open, setOpen] = useState(false)
  const kind = derbyCityTooltipKind(userCity)

  return (
    <div className="relative mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF] font-semibold active:text-white"
        aria-expanded={open}
      >
        <HelpCircle size={13} className="text-[#FF671F]" aria-hidden />
        {BRAND_COPY.copaZona.tooltipTitle}
      </button>
      {open && (
        <div
          className="mt-2 p-3 rounded-xl bg-[#0D0D10] border border-[#FF671F]/25 text-[10px] text-[#9CA3AF] leading-snug space-y-1.5"
          role="note"
        >
          {tooltipLines(kind).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
