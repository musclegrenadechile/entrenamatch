import { useMemo } from 'react'

export interface ArenaExercisePickerProps {
  options: string[]
  value: string
  onChange: (name: string) => void
}

export function ArenaExercisePicker({ options, value, onChange }: ArenaExercisePickerProps) {
  const list = useMemo(() => {
    const set = new Set(options.filter(Boolean))
    if (value) set.add(value)
    return Array.from(set)
  }, [options, value])

  if (list.length === 0) {
    return (
      <p className="text-[10px] text-[#9CA3AF] text-center py-1">
        Elige un ejercicio abajo o escribe en Set listo
      </p>
    )
  }

  return (
    <div className="arena-exercise-picker" role="listbox" aria-label="Ejercicio activo">
      <div className="arena-exercise-picker__scroll">
        {list.map((name) => {
          const active = name === value
          return (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onChange(name)}
              className={`arena-exercise-picker__chip ${active ? 'arena-exercise-picker__chip--active' : ''}`}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
