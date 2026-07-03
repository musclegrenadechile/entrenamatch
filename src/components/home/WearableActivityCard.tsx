import { Footprints, Flame, RefreshCw, Timer, Watch } from 'lucide-react'
import type { WearableDayActivity } from '../../services/wearableSync'
import { wearableActivityHasData } from '../../services/wearableSync'

function formatSteps(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString('es-CL')
}

function formatSyncedAt(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export type WearableActivityCardProps = {
  activity: WearableDayActivity | null
  syncing?: boolean
  needsConnect?: boolean
  onRefresh?: () => void | Promise<void>
  onConnect?: () => void
}

export function WearableActivityCard({
  activity,
  syncing = false,
  needsConnect = false,
  onRefresh,
  onConnect,
}: WearableActivityCardProps) {
  const hasData = wearableActivityHasData(activity)

  return (
    <div className="em-v2-card em-v2-card--live em-v2-card--compact mx-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e]/15 flex items-center justify-center shrink-0">
            <Watch size={18} className="text-[#4ade80]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[1.5px] text-[#4ade80]">
              Actividad del reloj
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {hasData
                ? 'Sincronizado hoy'
                : needsConnect
                  ? 'Conecta tu reloj'
                  : syncing
                    ? 'Leyendo datos…'
                    : 'Sin datos hoy'}
            </h3>
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={syncing}
            className="shrink-0 p-2 rounded-lg border border-white/10 text-[#9CA3AF] hover:text-white hover:border-[#22c55e]/40 disabled:opacity-50"
            aria-label="Actualizar actividad del reloj"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {hasData ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="em-v2-wearable__stat">
            <Footprints size={14} className="mx-auto text-[#a5b4fc] mb-0.5" />
            <div className="text-base font-bold text-white tabular-nums">
              {formatSteps(activity!.steps)}
            </div>
            <div className="text-[9px] text-[#6B7280] uppercase tracking-wide">Pasos</div>
          </div>
          <div className="em-v2-wearable__stat">
            <Flame size={14} className="mx-auto text-[#f97316] mb-0.5" />
            <div className="text-base font-bold text-white tabular-nums">
              {activity!.activeCaloriesKcal > 0 ? activity!.activeCaloriesKcal : '—'}
            </div>
            <div className="text-[9px] text-[#6B7280] uppercase tracking-wide">Kcal activas</div>
          </div>
          <div className="em-v2-wearable__stat">
            <Timer size={14} className="mx-auto text-[#22c55e] mb-0.5" />
            <div className="text-base font-bold text-white tabular-nums">
              {activity!.exerciseMinutes > 0
                ? activity!.exerciseMinutes
                : activity!.workoutCount > 0
                  ? activity!.workoutCount
                  : '—'}
            </div>
            <div className="text-[9px] text-[#6B7280] uppercase tracking-wide">
              {activity!.exerciseMinutes > 0 ? 'Min ejercicio' : 'Workouts'}
            </div>
          </div>
        </div>
      ) : syncing ? (
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          Leyendo Health Connect… puede tardar unos segundos en Samsung.
        </p>
      ) : (
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          {needsConnect
            ? 'Perfil → Conectar wearable → autoriza Ejercicio, Pasos y Calorías activas en Health Connect.'
            : activity?.message ||
              'Abre Health Connect y verifica que aparecen ejercicios de hoy. Huawei: Health Sync → sincronizar actividad.'}
        </p>
      )}

      {activity?.syncedAt ? (
        <p className="text-[9px] text-[#6B7280] mt-2">
          {syncing
            ? `Última sync ${formatSyncedAt(activity.syncedAt)} · actualizando…`
            : activity.fromCache
              ? `Última sync ${formatSyncedAt(activity.syncedAt)} · caché`
              : `Actualizado ${formatSyncedAt(activity.syncedAt)}`}
        </p>
      ) : null}

      {needsConnect && onConnect && (
        <button
          type="button"
          onClick={onConnect}
          className="em-v2-card__cta em-v2-card__cta--outline mt-2 w-full"
        >
          Conectar wearable en Perfil
        </button>
      )}
    </div>
  )
}
