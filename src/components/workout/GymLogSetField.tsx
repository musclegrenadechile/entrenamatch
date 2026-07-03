import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { stepGymLogValue } from '../../utils/gymLogSetStep'

export type GymLogSetFieldProps = {
  value: number
  onChange: (n: number) => void
  step: number
  min?: number
  max?: number
  placeholder?: string
  ariaLabel: string
  wide?: boolean
  integer?: boolean
  showSteppers?: boolean
}

export function GymLogSetField({
  value,
  onChange,
  step,
  min = 0,
  max,
  placeholder,
  ariaLabel,
  wide = false,
  integer = true,
  showSteppers = false,
}: GymLogSetFieldProps) {
  const resolvedMax = max ?? (integer ? 999 : 500)
  const [draft, setDraft] = useState(integer ? String(value || '') : value > 0 ? String(value) : '')

  useEffect(() => {
    setDraft(integer ? String(value || '') : value > 0 ? String(value) : '')
  }, [value, integer])

  const commit = (n: number) => {
    onChange(stepGymLogValue(n, 0, { min, max: resolvedMax, integer }))
  }

  const bump = (dir: -1 | 1) => {
    const base = integer ? value || 0 : value
    commit(stepGymLogValue(base, dir * step, { min, max: resolvedMax, integer }))
  }

  const input = (
    <input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      value={draft}
      onChange={(e) => {
        if (integer) {
          const raw = e.target.value.replace(/\D/g, '')
          setDraft(raw)
          onChange(raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0))
          return
        }
        const raw = e.target.value.replace(',', '.')
        if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return
        setDraft(raw)
        if (raw === '' || raw === '.') {
          onChange(0)
          return
        }
        const n = parseFloat(raw)
        if (!Number.isNaN(n)) onChange(Math.max(0, n))
      }}
      className={`gym-log-set-input${wide ? ' gym-log-set-input--wide' : ''}`}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  )

  if (!showSteppers) return input

  return (
    <div className={`gym-log-set-field${wide ? ' gym-log-set-field--wide' : ''}`}>
      <button
        type="button"
        className="gym-log-set-step"
        onClick={() => bump(-1)}
        aria-label={`Menos ${ariaLabel}`}
      >
        <Minus className="w-3 h-3" />
      </button>
      {input}
      <button
        type="button"
        className="gym-log-set-step"
        onClick={() => bump(1)}
        aria-label={`Más ${ariaLabel}`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}