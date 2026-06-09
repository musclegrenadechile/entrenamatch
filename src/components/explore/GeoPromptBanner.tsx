import { MapPin, X } from 'lucide-react'

export const GEO_PROMPT_V2_KEY = 'entrenamatch_geo_prompt_v2_seen'

export interface GeoPromptBannerProps {
  onRequestLocation: () => void
  onDismiss: () => void
}

export function GeoPromptBanner({ onRequestLocation, onDismiss }: GeoPromptBannerProps) {
  return (
    <div className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-[#3b82f6]/15 to-[#1C1C20] border border-[#3b82f6]/30 flex gap-3 items-start">
      <MapPin size={20} className="text-[#3b82f6] flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white">Ver quién está cerca</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-snug">
          Activa ubicación para ordenar por distancia real y ver km en cada perfil.
        </p>
        <button
          type="button"
          onClick={onRequestLocation}
          className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#3b82f6] text-white active:brightness-90"
        >
          Activar ubicación
        </button>
      </div>
      <button type="button" onClick={onDismiss} className="text-[#9CA3AF] p-1" aria-label="Cerrar">
        <X size={14} />
      </button>
    </div>
  )
}
