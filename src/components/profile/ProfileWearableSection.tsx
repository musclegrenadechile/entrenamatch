import { useCallback, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Activity, Settings2, Watch } from 'lucide-react'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import {
  connectWearableHealth,
  fetchWearableDaySummary,
  getWearableConnectionStatus,
  openWearableSettings,
  type WearableConnectionStatus,
} from '../../services/wearableHealth'
import { importHealthCaloriesForDate } from '../../services/healthImport'
import { toLocalDateStr } from '../../utils/fuelCalculator'

export function ProfileWearableSection(props: ProfileTabProps) {
  const { currentUser, saveUserWithRealSync, triggerHaptic } = props
  const [status, setStatus] = useState<WearableConnectionStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewKcal, setPreviewKcal] = useState<number | null>(null)
  const [previewMin, setPreviewMin] = useState<number | null>(null)
  const isNative = Capacitor.isNativePlatform()

  const refresh = useCallback(async () => {
    const next = await getWearableConnectionStatus()
    setStatus(next)
    if (next.connected) {
      const summary = await fetchWearableDaySummary(toLocalDateStr())
      setPreviewKcal(summary.activeCaloriesKcal > 0 ? summary.activeCaloriesKcal : null)
      setPreviewMin(summary.exerciseMinutes > 0 ? summary.exerciseMinutes : null)
    } else {
      setPreviewKcal(null)
      setPreviewMin(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const persistConnected = async (connected: boolean, platform?: string) => {
    const patch = {
      ...currentUser,
      wearableHealthConnected: connected,
      wearableHealthPlatform: connected ? platform : undefined,
      wearableHealthConnectedAt: connected ? Date.now() : undefined,
    } as typeof currentUser
    try {
      await saveUserWithRealSync(patch)
    } catch {
      /* demo / offline */
    }
  }

  const handleConnect = async () => {
    setBusy(true)
    try {
      try {
        triggerHaptic('medium')
      } catch {}
      const next = await connectWearableHealth()
      setStatus(next)
      if (next.connected) {
        await persistConnected(true, next.platform)
        await refresh()
        toast.success('Wearable conectado', {
          description: 'Apple Health / Health Connect listo para Fuel y EntrenaSync.',
        })
      } else {
        toast.info(next.reason || 'Permite acceso a calorías y ejercicio en Salud.')
      }
    } catch (e) {
      console.warn('wearable connect failed', e)
      toast.error('No se pudo conectar el wearable')
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async () => {
    setBusy(true)
    try {
      const result = await importHealthCaloriesForDate(toLocalDateStr())
      if (result.totalBurnKcal > 0) {
        toast.success(`+${result.totalBurnKcal} kcal activas importadas`, {
          description: result.exerciseMinutes
            ? `${result.exerciseMinutes} min de ejercicio detectados`
            : result.message,
        })
        await refresh()
      } else if (result.needsConnect) {
        await handleConnect()
      } else {
        toast.info(result.message)
      }
    } catch {
      toast.error('No se pudo importar desde el wearable')
    } finally {
      setBusy(false)
    }
  }

  const connected = !!status?.connected
  const platformLabel =
    status?.platform === 'ios'
      ? 'Apple Health'
      : status?.platform === 'android'
        ? 'Health Connect'
        : 'Wearable'

  return (
    <div className="mx-4 mb-3 card p-3 rounded-2xl border border-[#6366f1]/25 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0D0D10]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#6366f1]/20 flex items-center justify-center shrink-0">
          <Watch size={20} className="text-[#a5b4fc]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[1.5px] text-[#a5b4fc] mb-0.5">
            Salud conectada
          </div>
          <h3 className="text-sm font-bold text-white leading-tight">Conecta tu reloj</h3>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
            Apple Watch, Samsung, Garmin* y más vía {isNative ? platformLabel : 'app nativa'}.
            Importa calorías a Fuel y registra pulso/kcal automáticamente en EntrenaSync.
          </p>
          {!isNative && (
            <p className="text-[10px] text-amber-300/90 mt-2">
              Disponible en la app iOS/Android — no en navegador.
            </p>
          )}
          {isNative && status && !status.available && (
            <p className="text-[10px] text-amber-300/90 mt-2">{status.reason}</p>
          )}
          {connected && (previewKcal || previewMin) && (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              {previewKcal ? (
                <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                  Hoy: {previewKcal} kcal activas
                </span>
              ) : null}
              {previewMin ? (
                <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/15 text-[#a5b4fc] border border-[#6366f1]/30">
                  {previewMin} min ejercicio
                </span>
              ) : null}
            </div>
          )}
          {currentUser.wearableHealthConnected && !connected && isNative && (
            <p className="text-[10px] text-[#6B7280] mt-2">
              Antes estaba vinculado — vuelve a autorizar en Ajustes de salud.
            </p>
          )}
        </div>
      </div>

      {isNative && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {!connected ? (
            <button
              type="button"
              disabled={busy || status?.available === false}
              onClick={handleConnect}
              className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white text-[11px] font-bold disabled:opacity-50"
            >
              {busy ? 'Conectando…' : 'Conectar wearable'}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={handleImport}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <Activity size={14} />
                {busy ? 'Importando…' : 'Importar a Fuel'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => openWearableSettings().catch(() => {})}
                className="py-2.5 px-3 rounded-xl border border-[#2F2F35] text-[#9CA3AF] text-[11px] font-medium flex items-center gap-1"
                aria-label="Ajustes de salud"
              >
                <Settings2 size={14} />
              </button>
            </>
          )}
        </div>
      )}

      <p className="text-[8px] text-[#6B7280] mt-2 leading-snug">
        *Garmin, Fitbit y otros sincronizan vía Apple Health o Health Connect. Solo lectura — no
        compartimos series de FC con otros usuarios.
      </p>
    </div>
  )
}
