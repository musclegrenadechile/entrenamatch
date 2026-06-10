import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  EXERCISE_LIBRARY,
  exerciseMatchesMuscleTab,
  filterExercises,
  filterLibraryByMuscleTab,
  type LibraryExercise,
} from '../../data/exerciseLibrary'

const MUSCLE_TABS = [
  'Todos',
  'Pecho',
  'Espalda',
  'Hombros',
  'Piernas',
  'Glúteos',
  'Bíceps',
  'Tríceps',
  'Antebrazos',
  'Trapecio',
  'Core',
  'Cardio',
] as const

export interface ArenaExercisePickerProps {
  value: string
  onChange: (name: string) => void
  /** Optional extra names (e.g. from current log) */
  extraOptions?: string[]
}

export function ArenaExercisePicker({ value, onChange, extraOptions = [] }: ArenaExercisePickerProps) {
  const [muscle, setMuscle] = useState<string>('Todos')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(true)

  const selectedMeta = useMemo(
    () => EXERCISE_LIBRARY.find((e) => e.name === value),
    [value]
  )

  const gridItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    let pool: LibraryExercise[]

    if (q) {
      pool = filterExercises(q, 64)
      if (muscle !== 'Todos') {
        pool = pool.filter((e) => exerciseMatchesMuscleTab(e, muscle))
      }
    } else {
      pool = filterLibraryByMuscleTab(muscle)
    }

    const names = new Set(pool.map((e) => e.name))
    for (const n of extraOptions) {
      if (!n || names.has(n)) continue

      const libEntry = EXERCISE_LIBRARY.find((e) => e.name === n)
      if (libEntry) {
        if (muscle !== 'Todos' && !q && !exerciseMatchesMuscleTab(libEntry, muscle)) continue
        pool.unshift(libEntry)
      } else if (muscle === 'Todos' || q || n === value) {
        pool.unshift({ name: n, muscle: 'Otro', type: 'compound' })
      }
      names.add(n)
    }

    const limit = !q && muscle === 'Todos' ? 16 : 20
    return pool.slice(0, limit)
  }, [muscle, search, extraOptions, value])

  return (
    <div className="arena-exercise-panel" role="listbox" aria-label="Elegir ejercicio">
      <button
        type="button"
        className="arena-exercise-panel__hero"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 text-left">
          <p className="arena-exercise-panel__hero-label">Ejercicio activo</p>
          <p className="arena-exercise-panel__hero-name">{value || 'Elige uno'}</p>
          {selectedMeta && (
            <p className="arena-exercise-panel__hero-muscle">{selectedMeta.muscle}</p>
          )}
        </div>
        <span className="arena-exercise-panel__hero-toggle">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <>
          <div className="arena-exercise-panel__search-wrap">
            <Search size={14} className="arena-exercise-panel__search-icon" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (e.target.value) setMuscle('Todos')
              }}
              placeholder="Buscar ejercicio o músculo…"
              className="arena-exercise-panel__search"
              aria-label="Buscar ejercicio"
            />
          </div>

          {!search && (
            <div className="arena-exercise-panel__tabs" role="tablist">
              {MUSCLE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={muscle === tab}
                  onClick={() => setMuscle(tab)}
                  className={`arena-exercise-panel__tab ${muscle === tab ? 'arena-exercise-panel__tab--active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className="arena-exercise-panel__grid">
            {gridItems.map((ex) => {
              const active = ex.name === value
              return (
                <button
                  key={ex.name}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onChange(ex.name)}
                  className={`arena-exercise-panel__tile ${active ? 'arena-exercise-panel__tile--active' : ''}`}
                >
                  <span className="arena-exercise-panel__tile-name">{ex.name}</span>
                  <span className="arena-exercise-panel__tile-muscle">{ex.muscle}</span>
                </button>
              )
            })}
          </div>

          {gridItems.length === 0 && (
            <p className="arena-exercise-panel__empty">Sin resultados — prueba otra búsqueda</p>
          )}
        </>
      )}
    </div>
  )
}
