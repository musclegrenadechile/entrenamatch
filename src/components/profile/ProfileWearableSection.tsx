import { useCallback, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Activity, Settings2, Watch } from 'lucide-react'
import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import {
  connectWearableHealth,
  fetchWearableDaySummary,
  getWearableConnectionStatus,
  openHealthConnectInstall,
  openWearableSettings,
  type WearableConnectionStatus,
} from '../../services/wearableHealth'
import { ensureHealthPluginReady, getCapacitorApp } from '../../utils/capacitorRuntimePlugins'
import { toLocalDateStr } from '../../utils/fuelCalculator'

export function ProfileWearableSection(props: ProfileTabProps) {
  const { currentUser, saveUserWithRealSync, triggerHaptic, onImportHealthBurn } = props
  const [status, setStatus] = useState<WearableConnectionStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewKcal, setPreviewKcal] = useState<number | null>(null)
  const [previewMin, setPreviewMin] = useState<number | null>(null)
  const isNative = Capacitor.isNativePlatform()

  const persistConnected = useCallback(
    async (connected: boolean, platform?: string) => {
      const patch = {
        ...currentUser,
        wearableHealthConnected: connected,
        wearableHealthPlatform: connected ? platform : undefined,
        wearableHealthConnectedAt: connected ? Date.now() : undefined,
      } as typeof currentUser
      await saveUserWithRealSync(patch)
    },
    [currentUser, saveUserWithRealSync]
  )

  const refresh = useCallback(async () => {
    if (!isNative) {
      setStatus({
        platform: 'web',
        available: false,
        connected: false,
        reason: 'Solo en la app nativa (iOS / Android).',
        authorizedTypes: [],
      })
      return
    }
    try {
      await ensureHealthPluginReady()
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''
      setStatus({
        platform: Capacitor.getPlatform() as 'ios' | 'android',
        available: false,
        connected: false,
        reason: msg || 'Plugin de salud no cargado.',
        authorizedTypes: [],
        needsHealthConnectInstall: Capacitor.getPlatform() === 'android',
      })
      return
    }
    const next = await getWearableConnectionStatus({ skipTodayProbe: false })
    setStatus(next)
    if (next.connected) {
      if (!currentUser.wearableHealthConnected) {
        try {
          await persistConnected(true, next.platform)
        } catch {
          /* offline */
        }
      }
      const summary = await fetchWearableDaySummary(toLocalDateStr(), {
        assumeConnected: true,
        platform: next.platform,
        fastImport: true,
        workoutLimit: 5,
      })
      setPreviewKcal(summary.activeCaloriesKcal > 0 ? summary.activeCaloriesKcal : null)
      setPreviewMin(summary.exerciseMinutes > 0 ? summary.exerciseMinutes : null)
    } else {
      setPreviewKcal(null)
      setPreviewMin(null)
      // Do not clear profile flag when HC SDK falsely reports disconnected on Samsung.
    }
  }, [isNative, currentUser.wearableHealthConnected, persistConnected])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!isNative) return undefined
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    const App = getCapacitorApp()
    let resumeHandle: { remove: () => void } | null = null
    if (App) {
      void App.addListener('resume', () => {
        void refresh()
      }).then((h) => {
        resumeHandle = h
      })
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      resumeHandle?.remove()
    }
  }, [isNative, refresh])

  const handleConnect = async () => {
    setBusy(true)
    let next: WearableConnectionStatus | null = null
    try {
      try {
        triggerHaptic('medium')
      } catch {}
      await ensureHealthPluginReady()
      next = await connectWearableHealth()
      setStatus(next)
      if (next.connected) {
        if (next.hasTodayWearableData) {
          toast.success('Wearable conectado', {
            description: 'Datos del reloj detectados en Health Connect.',
          })
        } else {
          toast.info('Permisos de salud activos', {
            description:
              next.reason ||
              'Falta que el reloj envíe calorías (Health Sync si usas Huawei).',
            duration: 8000,
          })
        }
      } else {
        const androidHint =
          'Tus permisos en Health Connect pueden estar OK. Abre Health Connect → Permisos de apps → EntrenaMatch. Luego Samsung Health o Health Sync (Huawei) debe enviar calorías.'
        toast.info(next.reason || 'Permite acceso a calorías y ejercicio en Salud.', {
          description: next.platform === 'ios'
            ? 'Ajustes → Salud → EntrenaMatch → activa Calorías activas y Frecuencia cardíaca.'
            : androidHint,
          duration: 10000,
        })
        if (next.platform === 'android') {
          try {
            await openWearableSettings()
          } catch {
            /* user can open manually */
          }
        }
      }
    } catch (e) {
      console.warn('wearable connect failed', e)
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''
      toast.error('No se pudo conectar el wearable', {
        description: msg || 'Actualiza la app o instala Health Connect desde Play Store.',
      })
      if (Capacitor.getPlatform() === 'android') {
        try {
          await openWearableSettings()
        } catch (openErr) {
          console.warn('open health connect failed', openErr)
          toast.info('Abre Health Connect manualmente', {
            description: 'Ajustes → Health Connect → Permisos de apps → EntrenaMatch.',
            duration: 10000,
          })
        }
      }
    } finally {
      setBusy(false)
    }

    if (next?.connected) {
      void persistConnected(true, next.platform).catch(() => {})
      // Keep connected UI — full refresh can be slow on Samsung HC.
      void (async () => {
        try {
          const summary = await fetchWearableDaySummary(toLocalDateStr(), {
            assumeConnected: true,
            platform: next!.platform,
            fastImport: true,
          })
          setPreviewKcal(summary.activeCaloriesKcal > 0 ? summary.activeCaloriesKcal : null)
          setPreviewMin(summary.exerciseMinutes > 0 ? summary.exerciseMinutes : null)
        } catch {
          /* preview optional */
        }
      })()
    }
  }

  const handleImport = async () => {
    if (!onImportHealthBurn) {
      toast.error('Importación no disponible')
      return
    }
    setBusy(true)
    try {
      try {
        triggerHaptic('medium')
      } catch {}
      await onImportHealthBurn()
      await refresh()
    } catch (e) {
      console.warn('wearable import failed', e)
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : ''
      toast.error('No se pudo importar desde el wearable', {
        description: msg || 'Revisa Health Connect y que el reloj haya sincronizado hoy.',
        duration: 8000,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleOpenSettings = async () => {
    if (status?.platform === 'ios') {
      toast.info('Permisos en iOS', {
        description: 'Ajustes → Salud → EntrenaMatch → activa Calorías activas y Frecuencia cardíaca.',
      })
      return
    }
    try {
      await openWearableSettings()
    } catch {
      toast.error('No se pudo abrir Health Connect')
    }
  }

  const permissionsOk = !!status?.connected
  const hasWatchData = !!(status?.hasTodayWearableData || previewKcal || previewMin)
  const connected = permissionsOk
  const pluginReady = status != null && status.available !== false
  const needsHealthConnect = status?.needsHealthConnectInstall || (status?.platform === 'android' && status?.available === false)
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
            {permissionsOk
              ? hasWatchData
                ? 'Reloj sincronizado'
                : 'Permisos OK · sin datos hoy'
              : 'Salud conectada'}
          </div>
          <h3 className="text-sm font-bold text-white leading-tight">
            {permissionsOk ? 'Wearable vinculado' : 'Conecta tu reloj'}
          </h3>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
            Apple Watch, Samsung, Garmin* y más vía {isNative ? platformLabel : 'app nativa'}.
            Importa calorías a Fuel y sincroniza pasos al abrir EntrenaMatch (Hoy → Actividad del reloj).
          </p>
          {!isNative && (
            <p className="text-[10px] text-amber-300/90 mt-2">
              Disponible en la app iOS/Android — no en navegador.
            </p>
          )}
          {isNative && status && !status.available && (
            <p className="text-[10px] text-amber-300/90 mt-2 whitespace-pre-line">{status.reason}</p>
          )}
          {isNative && status?.platform === 'android' && !connected && status.available && (
            <p className="text-[10px] text-[#9CA3AF] mt-2 leading-snug">
              Samsung / Garmin / Fitbit: vía Health Connect.{' '}
              <strong className="text-[#a5b4fc]">Huawei:</strong> Huawei Health no enlaza directo —
              usa la app <strong className="text-[#E5E7EB]">Health Sync</strong> (origen: Huawei Health
              → destino: Health Connect), luego conecta aquí.
            </p>
          )}
          {permissionsOk && status?.reason && !hasWatchData && (
            <p className="text-[10px] text-amber-300/90 mt-2 leading-snug whitespace-pre-line">
              {status.reason}
            </p>
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
          {permissionsOk && status?.authorizedTypes.length > 0 && (
            <p className="text-[10px] text-[#6B7280] mt-2">
              Permisos: {status.authorizedTypes.join(', ')}
            </p>
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
          {needsHealthConnect && (
            <button
              type="button"
              disabled={busy}
              onClick={() => { void openHealthConnectInstall() }}
              className="w-full py-2.5 rounded-xl bg-amber-900/30 text-amber-100 border border-amber-700/40 text-[11px] font-bold"
            >
              Instalar Health Connect (Play Store)
            </button>
          )}
          {!connected ? (
            <>
              <button
                type="button"
                disabled={busy || (status != null && status.available === false && !needsHealthConnect)}
                onClick={() => { void handleConnect() }}
                className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white text-[11px] font-bold disabled:opacity-50"
              >
                {busy ? 'Conectando…' : status == null ? 'Cargando…' : 'Conectar wearable'}
              </button>
              {status?.platform === 'android' && status.available && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { void handleOpenSettings() }}
                  className="py-2.5 px-3 rounded-xl border border-[#6366f1]/40 text-[#a5b4fc] text-[11px] font-semibold"
                >
                  Health Connect
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy || !onImportHealthBurn}
                onClick={() => { void handleImport() }}
                className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border ${
                  hasWatchData
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                    : 'bg-amber-900/20 text-amber-200 border-amber-700/40'
                }`}
              >
                <Activity size={14} />
                {busy ? 'Importando…' : hasWatchData ? 'Importar a Fuel' : 'Revisar / importar'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => { void handleOpenSettings() }}
                className="py-2.5 px-3 rounded-xl border border-[#2F2F35] text-[#9CA3AF] text-[11px] font-medium flex items-center gap-1"
                aria-label="Ajustes de salud"
              >
                <Settings2 size={14} />
              </button>
            </>
          )}
          {!pluginReady && status != null && (
            <button
              type="button"
              onClick={() => { void refresh() }}
              className="w-full py-2 rounded-xl border border-[#6366f1]/30 text-[#a5b4fc] text-[10px] font-semibold"
            >
              Reintentar carga del plugin
            </button>
          )}
        </div>
      )}

      <p className="text-[8px] text-[#6B7280] mt-2 leading-snug">
        *Garmin, Fitbit, Huawei (con Health Sync) y otros vía Apple Health o Health Connect. Solo
        lectura — no compartimos series de FC con otros usuarios.
      </p>
    </div>
  )
}
