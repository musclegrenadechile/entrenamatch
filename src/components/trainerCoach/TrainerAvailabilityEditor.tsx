import { Clock } from 'lucide-react'
import type { TrainerAvailabilitySlot } from '../../types'
import { DOW_LABELS, minToTime, timeToMin } from '../../services/trainerAvailability'

export interface TrainerAvailabilityEditorProps {
  slots: TrainerAvailabilitySlot[]
  onChange: (slots: TrainerAvailabilitySlot[]) => void
}

function slotForDay(slots: TrainerAvailabilitySlot[], dow: number): TrainerAvailabilitySlot | undefined {
  return slots.find((s) => s.dow === dow)
}

export function TrainerAvailabilityEditor({ slots, onChange }: TrainerAvailabilityEditorProps) {
  const toggleDay = (dow: number, enabled: boolean) => {
    if (enabled) {
      onChange([
        ...slots.filter((s) => s.dow !== dow),
        { dow, startMin: timeToMin('09:00'), endMin: timeToMin('18:00') },
      ])
    } else {
      onChange(slots.filter((s) => s.dow !== dow))
    }
  }

  const updateDay = (dow: number, patch: Partial<TrainerAvailabilitySlot>) => {
    onChange(
      slots.map((s) => (s.dow === dow ? { ...s, ...patch } : s))
    )
  }

  return (
    <div className="trainer-avail">
      <p className="trainer-avail__title">
        <Clock size={14} /> Disponibilidad semanal
      </p>
      <p className="trainer-avail__hint">
        Sin días marcados = aceptas reservas en cualquier horario. Los clientes solo podrán reservar
        dentro de estos bloques.
      </p>
      <div className="trainer-avail__grid">
        {DOW_LABELS.map((label, dow) => {
          const slot = slotForDay(slots, dow)
          const enabled = !!slot
          return (
            <div key={dow} className={`trainer-avail__row${enabled ? ' trainer-avail__row--on' : ''}`}>
              <label className="trainer-avail__day">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => toggleDay(dow, e.target.checked)}
                />
                {label}
              </label>
              {enabled && slot && (
                <div className="trainer-avail__times">
                  <input
                    type="time"
                    value={minToTime(slot.startMin)}
                    onChange={(e) => updateDay(dow, { startMin: timeToMin(e.target.value) })}
                  />
                  <span>–</span>
                  <input
                    type="time"
                    value={minToTime(slot.endMin)}
                    onChange={(e) => updateDay(dow, { endMin: timeToMin(e.target.value) })}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
