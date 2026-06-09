import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

export interface ProfileCollapsibleSectionProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}

/** Fase 88/90 — collapsible profile blocks for new users. */
export function ProfileCollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: ProfileCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mx-4 mt-3 rounded-2xl border border-[#2F2F35] bg-[#141418] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left active:bg-white/5"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">{title}</div>
          {subtitle && <div className="text-[10px] text-[#9CA3AF] mt-0.5">{subtitle}</div>}
        </div>
        <ChevronDown
          size={18}
          className={`text-[#9CA3AF] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-[#2F2F35] pb-2">{children}</div>}
    </div>
  )
}
