import { BarChart3 } from 'lucide-react'

export interface ChatPactCompareData {
  partnerName: string
  selfSessions: number
  partnerSessions: number
  selfSets: number
  partnerSets: number
}

export interface ChatPactCompareStripProps {
  compare: ChatPactCompareData
  onOpenEntrenoLog?: () => void
}

export function ChatPactCompareStrip({ compare, onOpenEntrenoLog }: ChatPactCompareStripProps) {
  const ahead =
    compare.selfSessions > compare.partnerSessions
      ? 'self'
      : compare.partnerSessions > compare.selfSessions
        ? 'partner'
        : 'tie'

  const headline =
    ahead === 'tie'
      ? 'Empate esta semana'
      : ahead === 'self'
        ? 'Vas adelante en logs'
        : `${compare.partnerName.split(' ')[0]} va adelante`

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-[#FFD700]/10 to-[#FF671F]/5 border-b border-[#2F2F35]">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-white truncate">{headline} · pacto semanal</p>
          <p className="text-[9px] text-[#9CA3AF]">
            Tú {compare.selfSessions} ses · {compare.selfSets} sets ·{' '}
            {compare.partnerName.split(' ')[0]} {compare.partnerSessions} ses · {compare.partnerSets}{' '}
            sets
          </p>
        </div>
        {onOpenEntrenoLog && (
          <button
            type="button"
            onClick={onOpenEntrenoLog}
            className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#FF671F]/15 text-[#FF671F] shrink-0 active:bg-[#FF671F]/25"
          >
            + Log
          </button>
        )}
      </div>
    </div>
  )
}
