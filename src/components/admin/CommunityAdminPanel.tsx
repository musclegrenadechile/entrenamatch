import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Ban, Flag, RefreshCw, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Firestore } from 'firebase/firestore'
import type { Profile, Report } from '../../types'
import { isBetaBotProfile } from '../../utils/betaBots'
import {
  adminDeleteUserAccount,
  adminRecalculateSyncStreaks,
  attachAllReportsListener,
  attachUserBlocksListener,
  updateReportStatus,
  type AppAdminRecord,
  type SyncStreakRecalcResult,
  type UserBlockRecord,
} from '../../services/appAdmin'

export interface CommunityAdminPanelProps {
  open: boolean
  onClose: () => void
  db: Firestore | null
  admin: AppAdminRecord
  realProfiles: Profile[]
}

type Tab = 'reports' | 'blocks' | 'delete' | 'maintenance'

function displayName(
  id: string,
  stored: string | undefined,
  nameById: Map<string, string>
): string {
  return stored || nameById.get(id) || id
}

export function CommunityAdminPanel({
  open,
  onClose,
  db,
  admin,
  realProfiles,
}: CommunityAdminPanelProps) {
  const [tab, setTab] = useState<Tab>('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [blocks, setBlocks] = useState<UserBlockRecord[]>([])
  const [reportsError, setReportsError] = useState<string | null>(null)
  const [deleteUid, setDeleteUid] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [syncRecalcPreview, setSyncRecalcPreview] = useState<SyncStreakRecalcResult | null>(null)

  useEffect(() => {
    if (!open || !db) return
    setReportsError(null)
    const unsubR = attachAllReportsListener(
      db,
      setReports,
      () => setReportsError('No se pudo cargar reportes en tiempo real. Revisa permisos Admin.')
    )
    const unsubB = attachUserBlocksListener(db, setBlocks)
    return () => {
      unsubR()
      unsubB()
    }
  }, [open, db])

  const nameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of realProfiles) {
      if (p.id && p.name) m.set(p.id, p.name)
    }
    return m
  }, [realProfiles])

  if (!open) return null

  const pendingReports = reports.filter((r) => r.status === 'pending')

  const resolveReport = async (reportId: string, status: Report['status']) => {
    if (!db) return
    setBusy(reportId)
    try {
      await updateReportStatus(db, reportId, status)
      toast.success(status === 'resolved' ? 'Reporte resuelto' : 'Marcado revisado')
    } catch {
      toast.error('No se pudo actualizar el reporte')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async () => {
    const uid = deleteUid.trim()
    if (!uid) {
      toast.error('Ingresa el UID de la cuenta')
      return
    }
    if (!window.confirm(`¿Eliminar permanentemente la cuenta ${uid}? Esta acción no se puede deshacer.`)) {
      return
    }
    setBusy('delete')
    try {
      const res = await adminDeleteUserAccount(uid, deleteReason.trim() || undefined)
      toast.success(res.message || 'Cuenta eliminada')
      setDeleteUid('')
      setDeleteReason('')
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : 'Error'
      toast.error(msg)
    } finally {
      setBusy(null)
    }
  }

  const fillDeleteFromReport = (r: Report) => {
    setDeleteUid(r.reportedUserId)
    setDeleteReason([r.reason, r.details].filter(Boolean).join(' — '))
    setTab('delete')
  }

  const runSyncStreakRecalc = async (apply: boolean) => {
    if (apply && !window.confirm('¿Aplicar la limpieza de syncStreak en todos los perfiles afectados?')) {
      return
    }
    setBusy(apply ? 'sync-apply' : 'sync-preview')
    try {
      const res = await adminRecalculateSyncStreaks({ apply })
      setSyncRecalcPreview(res)
      if (apply) {
        toast.success(`Limpieza aplicada: ${res.profilesUpdated} perfiles actualizados`)
      } else if (res.totalChanges === 0) {
        toast.success('Nada que corregir — syncStreak ya coincide con evidencia ≥15 min')
      } else {
        toast.info(`Vista previa: ${res.totalChanges} perfiles a corregir`)
      }
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : 'Error'
      toast.error(msg)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="admin-ops-screen" role="dialog" aria-label="Panel admin comunidad">
      <header className="admin-ops__header">
        <button type="button" onClick={onClose} className="admin-ops__back" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="admin-ops__title">
            <Shield size={18} /> {admin.displayLabel || 'Admin'}
          </h1>
          <p className="admin-ops__sub">
            {admin.name || 'Moderador'} · reportes, bloqueos y cuentas
          </p>
        </div>
      </header>

      <div className="admin-ops__tabs">
        {(
          [
            { key: 'reports' as Tab, label: `Reportes (${reports.length})` },
            { key: 'blocks' as Tab, label: `Bloqueos (${blocks.length})` },
            { key: 'delete' as Tab, label: 'Eliminar cuenta' },
            { key: 'maintenance' as Tab, label: 'Mantenimiento' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            className={`admin-ops__tab ${tab === t.key ? 'admin-ops__tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-ops__body">
        {tab === 'reports' && (
          <div className="space-y-3">
            {reportsError && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                {reportsError}
              </p>
            )}
            {pendingReports.length > 0 && (
              <p className="text-xs text-[#9CA3AF]">{pendingReports.length} pendiente(s) de revisión</p>
            )}
            {reports.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">
                Sin reportes en Firestore. Si alguien reportó antes de esta actualización, puede que solo
                exista el bloqueo en la pestaña Bloqueos.
              </p>
            ) : (
              reports.map((r) => {
                const reportedName = displayName(r.reportedUserId, r.reportedUserName, nameById)
                const reporterName = displayName(r.reporterId, r.reporterName, nameById)
                const isBot = isBetaBotProfile({ id: r.reportedUserId, name: reportedName })
                return (
                  <div key={r.id} className="card p-3 rounded-2xl text-sm border border-[#2F2F35]">
                    <div className="flex justify-between gap-2 items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] mb-1">Reportado</p>
                        <p className="font-semibold text-base flex items-center gap-2 flex-wrap">
                          {reportedName}
                          {isBot && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200">
                              Beta IA
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          Por <strong className="text-[#E5E7EB]">{reporterName}</strong> · {r.context} ·{' '}
                          {new Date(r.timestamp).toLocaleString('es-CL')}
                        </p>
                        <div className="mt-2 p-2 rounded-lg bg-[#141418] border border-[#2F2F35]">
                          <p className="text-[10px] text-[#FF671F] font-semibold uppercase mb-0.5">Motivo</p>
                          <p className="text-[#E5E7EB]">{r.reason}</p>
                          {r.details && (
                            <>
                              <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase mt-2 mb-0.5">
                                Detalles
                              </p>
                              <p className="text-[#9CA3AF] text-xs whitespace-pre-wrap">{r.details}</p>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B7280] mt-2 font-mono break-all">
                          UID reportado: {r.reportedUserId}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full h-fit shrink-0 ${
                          r.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300'
                            : r.status === 'resolved'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-[#2F2F35] text-[#9CA3AF]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={() => resolveReport(r.id, 'reviewed')}
                            className="flex-1 min-w-[100px] py-2 rounded-xl bg-[#25252A] text-xs font-medium"
                          >
                            Revisado
                          </button>
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={() => resolveReport(r.id, 'resolved')}
                            className="flex-1 min-w-[100px] py-2 rounded-xl bg-[#22c55e]/20 text-[#22c55e] text-xs font-medium"
                          >
                            Resuelto
                          </button>
                        </>
                      )}
                      {!isBot && (
                        <button
                          type="button"
                          onClick={() => fillDeleteFromReport(r)}
                          className="py-2 px-3 rounded-xl bg-red-900/30 text-red-200 text-xs border border-red-800/40"
                        >
                          Eliminar cuenta
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'blocks' && (
          <div className="space-y-3">
            {blocks.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">
                Sin bloqueos registrados aún.
              </p>
            ) : (
              blocks.map((b) => (
                <div key={b.id} className="card p-3 rounded-2xl text-sm">
                  <div className="flex items-start gap-2">
                    <Ban size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p>
                        <strong>{displayName(b.blockerId, b.blockerName, nameById)}</strong>
                        <span className="text-[#9CA3AF]"> bloqueó a </span>
                        <strong>{displayName(b.blockedId, b.blockedName, nameById)}</strong>
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">
                        {new Date(b.timestamp).toLocaleString('es-CL')}
                        {b.source === 'report' ? ' · tras reporte' : b.source === 'manual' ? ' · bloqueo manual' : ''}
                      </p>
                      {b.reportReason && (
                        <div className="mt-2 p-2 rounded-lg bg-[#141418] border border-[#2F2F35]">
                          <p className="text-[10px] text-[#FF671F] font-semibold uppercase mb-0.5 flex items-center gap-1">
                            <Flag size={10} /> Motivo del reporte
                          </p>
                          <p className="text-[#E5E7EB] text-xs">{b.reportReason}</p>
                          {b.reportDetails && (
                            <p className="text-[#9CA3AF] text-xs mt-1 whitespace-pre-wrap">{b.reportDetails}</p>
                          )}
                        </div>
                      )}
                      {!b.reportReason && (
                        <p className="text-[10px] text-[#6B7280] mt-2 italic">
                          Sin motivo de reporte — fue bloqueo directo (no pasó por formulario de reporte).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'maintenance' && (
          <div className="space-y-4">
            <p className="text-sm text-[#9CA3AF]">
              Recalcula <code className="text-[#E5E7EB]">syncStreak</code> desde evidencia real (ratings,
              workouts sync y pilot) con mínimo de 15 minutos. Corrige contadores inflados del bug anterior.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                disabled={busy === 'sync-preview' || busy === 'sync-apply'}
                onClick={() => runSyncStreakRecalc(false)}
                className="flex-1 min-w-[140px] py-3 rounded-xl bg-[#25252A] text-sm font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} className={busy === 'sync-preview' ? 'animate-spin' : ''} />
                {busy === 'sync-preview' ? 'Analizando…' : 'Vista previa'}
              </button>
              <button
                type="button"
                disabled={
                  busy === 'sync-preview' ||
                  busy === 'sync-apply' ||
                  !syncRecalcPreview ||
                  syncRecalcPreview.totalChanges === 0
                }
                onClick={() => runSyncStreakRecalc(true)}
                className="flex-1 min-w-[140px] py-3 rounded-xl bg-[#22c55e]/20 text-[#22c55e] text-sm font-semibold border border-[#22c55e]/40 disabled:opacity-50"
              >
                {busy === 'sync-apply' ? 'Aplicando…' : 'Aplicar limpieza'}
              </button>
            </div>
            {syncRecalcPreview && (
              <div className="card p-3 rounded-2xl text-sm border border-[#2F2F35] space-y-2">
                <p className="text-xs text-[#9CA3AF]">
                  {syncRecalcPreview.dryRun ? 'Vista previa' : 'Aplicado'} ·{' '}
                  {syncRecalcPreview.totalChanges} cambio(s) · −{syncRecalcPreview.totalRemoved} syncs
                  inflados · mín. {syncRecalcPreview.minVerifiedMinutes} min
                </p>
                {syncRecalcPreview.changes.length === 0 ? (
                  <p className="text-[#9CA3AF] text-xs">Sin diferencias detectadas.</p>
                ) : (
                  <ul className="text-xs space-y-1 max-h-48 overflow-y-auto">
                    {syncRecalcPreview.changes.map((c) => (
                      <li key={c.uid} className="flex justify-between gap-2 font-mono">
                        <span className="truncate text-[#E5E7EB]">{c.name}</span>
                        <span className="text-[#22c55e] shrink-0">
                          {c.stored} → {c.recalculated}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {syncRecalcPreview.changesTruncated && (
                  <p className="text-[10px] text-[#6B7280]">Mostrando los primeros 50 cambios.</p>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'delete' && (
          <div className="space-y-4">
            <p className="text-sm text-[#9CA3AF]">
              Elimina la cuenta de Firebase Auth y anonimiza el perfil. Usa el UID desde un reporte o bloqueo.
            </p>
            <label className="block text-xs text-[#9CA3AF]">UID de la cuenta</label>
            <input
              value={deleteUid}
              onChange={(e) => setDeleteUid(e.target.value)}
              placeholder="ej. abc123FirebaseUid"
              className="w-full bg-[#1A1A1E] border border-[#2F2F35] rounded-xl px-3 py-2 text-sm"
            />
            <label className="block text-xs text-[#9CA3AF]">Motivo (opcional)</label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="Spam, acoso, cuenta falsa..."
              className="w-full bg-[#1A1A1E] border border-[#2F2F35] rounded-xl px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy === 'delete' || !deleteUid.trim()}
              onClick={handleDelete}
              className="w-full py-3 rounded-xl bg-red-900/40 border border-red-700/50 text-red-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {busy === 'delete' ? 'Eliminando…' : 'Eliminar cuenta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
