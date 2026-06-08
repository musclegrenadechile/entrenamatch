import { Plus, Trash2 } from 'lucide-react'
import type { TrainerSessionPackage } from '../../types'
import {
  PACKAGE_PRESETS,
  formatPackageLabel,
  newPackageId,
} from '../../services/trainerAvailability'

export interface TrainerPackagesEditorProps {
  packages: TrainerSessionPackage[]
  onChange: (packages: TrainerSessionPackage[]) => void
}

export function TrainerPackagesEditor({ packages, onChange }: TrainerPackagesEditorProps) {
  const addPreset = (preset: Omit<TrainerSessionPackage, 'id'>) => {
    if (packages.some((p) => p.sessions === preset.sessions)) return
    onChange([...packages, { ...preset, id: newPackageId() }])
  }

  const remove = (id: string) => onChange(packages.filter((p) => p.id !== id))

  return (
    <div className="trainer-packages">
      <p className="trainer-packages__title">Paquetes multi-sesión</p>
      <p className="trainer-packages__hint">
        Ofrece descuento por volumen. El cliente paga el total al reservar el paquete.
      </p>
      {packages.length > 0 && (
        <ul className="trainer-packages__list">
          {packages.map((p) => (
            <li key={p.id} className="trainer-packages__item">
              <span>{formatPackageLabel(p)}</span>
              <button type="button" onClick={() => remove(p.id)} aria-label="Eliminar paquete">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="trainer-packages__presets">
        {PACKAGE_PRESETS.map((preset) => (
          <button
            key={preset.sessions}
            type="button"
            className="trainer-packages__preset"
            disabled={packages.some((p) => p.sessions === preset.sessions)}
            onClick={() => addPreset(preset)}
          >
            <Plus size={12} /> {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
