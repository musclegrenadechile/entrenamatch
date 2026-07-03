import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Ban,
  Flag,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserX,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Firestore } from 'firebase/firestore'
import type { Profile, Report } from '../../types'
import { isBetaBotProfile } from '../../utils/betaBots'
import {
  adminActionLabel,
  canAdminBanProfile,
  filterProfilesForAdminSearch,
  formatLiveDuration,
  sortLiveUsersForAdmin,
} from '../../utils/adminModeration'
import { isActiveLiveUser, type LiveUserLike } from '../../utils/gymPulseLive'
import { attachLiveUsersListener } from '../../services/liveUsers'
import {
  adminDeleteUserAccount,
  adminModerateUser,
  adminRecalculateSyncStreaks,
  attachAdminAuditListener,
  attachAllReportsListener,
  attachSuspendedProfilesListener,
  attachUserBlocksListener,
  updateReportStatus,
  type AdminAuditRecord,
  type AppAdminRecord,
  type SuspendedProfileRecord,
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

type Tab =
  | 'live'
  | 'reports'
  | 'users'
  | 'suspended'
  | 'blocks'
  | 'delete'
  | 'maintenance'
  | 'audit'

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
  const [tab, setTab] = useState<Tab>('live')
  const [reports, setReports] = useState<Report[]>([])
  const [blocks, setBlocks] = useState<UserBlockRecord[]>([])
  const [liveUsers, setLiveUsers] = useState<LiveUserLike[]>([])
  const [suspended, setSuspended] = useState<SuspendedProfileRecord[]>([])
  const [auditLog, setAuditLog] = useState<AdminAuditRecord[]>([])
  const [reportsError, setReportsError] = useState<string | null>(null)
  const [deleteUid, setDeleteUid] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [syncRecalcPreview, setSyncRecalcPreview] = useState<SyncStreakRecalcResult | null>(null)
  const [liveNow, setLiveNow] = useState(Date.now())

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => setLiveNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!open || !db) return
    setReportsError(null)
    const unsubR = attachAllReportsListener(
      db,
      setReports,
      () => setReportsError('No se pudo cargar reportes en tiempo real. Revisa permisos Admin.')
    )
    const unsubB = attachUserBlocksListener(db, setBlocks)
    const unsubL = attachLiveUsersListener(db, setLiveUsers, {
      adminMode: true,
      maxResults: 200,
      activeOnly: false,
    })
    const unsubS = attachSuspendedProfilesListener(db, setSuspended)
    const unsubA = attachAdminAuditListener(db, setAuditLog)
    return () => {
      unsubR()
      unsubB()
      unsubL()
      unsubS()
      unsubA()
    }
  }, [open, db])

  const nameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of realProfiles) {
      if (p.id && p.name) m.set(p.id, p.name)
    }
    for (const u of liveUsers) {
      if (u.id && u.name) m.set(u.id, String(u.name))
    }
    for (const s of suspended) {
      if (s.id && s.name) m.set(s.id, s.name)
    }
    return m
  }, [realProfiles, liveUsers, suspended])

  const sortedLive = useMemo(
    () => sortLiveUsersForAdmin(liveUsers, liveNow),
    [liveUsers, liveNow]
  )

  const staleLive = useMemo(
    () => liveUsers.filter((u) => u?.id && !isActiveLiveUser(u, liveNow)),
    [liveUsers, liveNow]
  )

  const sweepStaleLive = async () => {
    if (!staleLive.length) return
    const ok = window.confirm(
      `¿Apagar LIVE caducado en Firestore para ${staleLive.length} perfil(es)?`
    )
    if (!ok) return
    setBusy('sweep_stale')
    let done = 0
    for (const u of staleLive) {
      try {
        await adminModerateUser(u.id, 'end_live', 'LIVE caducado — limpieza automática admin')
        done += 1
      } catch {
        /* continue */
      }
    }
    setBusy(null)
    toast.success(`LIVE apagado en ${done}/${staleLive.length} perfiles caducados`)
  }

  const searchResults = useMemo(
    () => filterProfilesForAdminSearch(realProfiles, userSearch),
    [realProfiles, userSearch]
  )

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

  const runModerate = async (
    uid: string,
    action: 'end_live' | 'suspend' | 'unsuspend',
    reason?: string
  ) => {
    const label =
      action === 'end_live' ? 'apagar LIVE' : action === 'suspend' ? 'suspender' : 'reactivar'
    if (
      action !== 'unsuspend' &&
      !window.confirm(`¿Confirmas ${label} a ${displayName(uid, undefined, nameById)}?`)
    ) {
      return
    }
    setBusy(`${action}:${uid}`)
    try {
      const res = await adminModerateUser(uid, action, reason)
      toast.success(res.message || 'Listo')
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e ? String((e as { code?: string }).code) : ''
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as Error).message) : 'Error'
      if (code === 'functions/internal' || msg === 'internal') {
        toast.error('No se pudo contactar adminModerateUser. Recarga la página e inténtalo de nuevo.')
      } else if (code === 'functions/permission-denied') {
        toast.error('Sin permiso de administrador en appAdmins.')
      } else {
        toast.error(msg)
      }
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

  const fillModerateFromUid = (uid: string, reason?: string) => {
    setDeleteUid(uid)
    setDeleteReason(reason || '')
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

  const moderationActions = (uid: string, reason?: string, compact = false) => {
    const profile = { id: uid, name: nameById.get(uid) }
    const canBan = canAdminBanProfile(profile)
    const isBot = isBetaBotProfile(profile)
    const btnClass = compact
      ? 'py-1.5 px-2.5 rounded-lg text-[10px] font-medium'
      : 'py-2 px-3 rounded-xl text-xs font-medium'

    return (
      <div className={`flex gap-2 flex-wrap ${compact ? '' : 'mt-3'}`}>
        <button
          type="button"
          disabled={busy === `end_live:${uid}`}
          onClick={() => runModerate(uid, 'end_live', reason)}
          className={`${btnClass} bg-amber-900/30 text-amber-200 border border-amber-700/40`}
        >
          <Zap size={compact ? 10 : 12} className="inline mr-1" />
          Apagar LIVE
        </button>
        {canBan && (
          <button
            type="button"
            disabled={busy === `suspend:${uid}`}
            onClick={() => runModerate(uid, 'suspend', reason)}
            className={`${btnClass} bg-orange-900/30 text-orange-200 border border-orange-700/40`}
          >
            <UserX size={compact ? 10 : 12} className="inline mr-1" />
            Suspender
          </button>
        )}
        {canBan && (
          <button
            type="button"
            onClick={() => {
              fillModerateFromUid(uid, reason)
              setTab('delete')
            }}
            className={`${btnClass} bg-red-900/30 text-red-200 border border-red-800/40`}
          >
            <Trash2 size={compact ? 10 : 12} className="inline mr-1" />
            Eliminar
          </button>
        )}
        {isBot && (
          <span className="text-[10px] text-violet-300 self-center">Beta IA — solo apagar LIVE</span>
        )}
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'live', label: `En vivo (${sortedLive.length})` },
    { key: 'reports', label: `Reportes (${pendingReports.length})` },
    { key: 'users', label: 'Usuarios' },
    { key: 'suspended', label: `Suspendidos (${suspended.length})` },
    { key: 'blocks', label: `Bloqueos (${blocks.length})` },
    { key: 'delete', label: 'Eliminar' },
    { key: 'maintenance', label: 'Mant.' },
    { key: 'audit', label: 'Registro' },
  ]

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
            {admin.name || 'Moderador'} · LIVE, reportes, suspensiones y cuentas
          </p>
        </div>
      </header>

      <div className="admin-ops__stats">
        <div className="admin-ops__stat">
          <Radio size={14} className="text-[#22c55e]" />
          <strong>{sortedLive.length}</strong>
          <span>En vivo</span>
        </div>
        <div className="admin-ops__stat">
          <Flag size={14} className="text-amber-400" />
          <strong>{pendingReports.length}</strong>
          <span>Pendientes</span>
        </div>
        <div className="admin-ops__stat">
          <Ban size={14} className="text-red-400" />
          <strong>{suspended.length}</strong>
          <span>Suspendidos</span>
        </div>
      </div>

      <div className="admin-ops__tabs admin-ops__tabs--scroll">
        {tabs.map((t) => (
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
        {tab === 'live' && (
          <div className="space-y-3">
            <p className="text-xs text-[#9CA3AF]">
              Personas con LIVE activo ahora mismo. Puedes apagar la sesión o suspender por incumplimiento
              de normas.
            </p>
            {staleLive.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <p className="text-amber-200 font-semibold">
                  {staleLive.length} LIVE caducado(s) en Firestore (&gt;3 h o sin señal válida)
                </p>
                <p className="text-[#9CA3AF] mt-1">
                  No aparecen en el mapa pero siguen con trainingNow:true. Límpialos para corregir
                  contadores y queries.
                </p>
                <button
                  type="button"
                  disabled={busy === 'sweep_stale'}
                  onClick={() => void sweepStaleLive()}
                  className="mt-2 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-100 font-bold text-[11px] active:opacity-90 disabled:opacity-50"
                >
                  {busy === 'sweep_stale' ? 'Limpiando…' : `Apagar ${staleLive.length} caducados`}
                </button>
              </div>
            )}
            {sortedLive.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">Nadie en LIVE activo ahora.</p>
            ) : (
              sortedLive.map((u) => {
                const isBot = isBetaBotProfile({ id: u.id, name: String(u.name) })
                const gym = u.gymCheckIn?.gymName || u.gymCheckIn?.gymId
                return (
                  <div key={u.id} className="em-v2-card em-v2-card--compact text-sm">
                    <div className="flex justify-between gap-2 items-start">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base flex items-center gap-2 flex-wrap">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                          {u.name}
                          {isBot && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-200">
                              Beta IA
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-1 flex-wrap">
                          <MapPin size={11} />
                          {[u.city, u.country].filter(Boolean).join(', ') || 'Sin ubicación'}
                          {gym ? ` · ${gym}` : ''}
                        </p>
                        <p className="text-[10px] text-[#6B7280] mt-1">
                          LIVE hace {formatLiveDuration(u.trainingNowSince, liveNow)}
                          {u.liveMotionIdle === false ? ' · en movimiento' : u.liveMotionIdle ? ' · quieto' : ''}
                        </p>
                        <p className="text-[10px] text-[#6B7280] font-mono break-all mt-1">UID: {u.id}</p>
                      </div>
                    </div>
                    {moderationActions(u.id, undefined, true)}
                  </div>
                )
              })
            )}
          </div>
        )}

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
                const modReason = [r.reason, r.details].filter(Boolean).join(' — ')
                return (
                  <div key={r.id} className="em-v2-card em-v2-card--compact text-sm">
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
                    </div>
                    {moderationActions(r.reportedUserId, modReason)}
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            <p className="text-xs text-[#9CA3AF]">
              Busca por nombre, ciudad o UID. Útil para moderar sin esperar un reporte.
            </p>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Nombre, ciudad o UID…"
                className="w-full bg-[#1A1A1E] border border-[#2F2F35] rounded-xl pl-9 pr-3 py-2.5 text-sm"
              />
            </div>
            {userSearch.trim().length < 2 ? (
              <p className="text-sm text-[#9CA3AF] py-6 text-center">Escribe al menos 2 caracteres.</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-6 text-center">Sin coincidencias en perfiles cargados.</p>
            ) : (
              searchResults.map((p) => (
                <div key={p.id} className="em-v2-card em-v2-card--compact text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {[p.city, p.country].filter(Boolean).join(', ')}
                    {p.accountStatus === 'suspended' ? ' · suspendido' : ''}
                    {p.trainingNow ? ' · LIVE ahora' : ''}
                  </p>
                  <p className="text-[10px] text-[#6B7280] font-mono break-all mt-1">{p.id}</p>
                  {moderationActions(p.id, undefined, true)}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'suspended' && (
          <div className="space-y-3">
            <p className="text-xs text-[#9CA3AF]">
              Cuentas suspendidas no pueden iniciar sesión y quedan ocultas del mapa, explorar y matches.
            </p>
            {suspended.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">No hay cuentas suspendidas.</p>
            ) : (
              suspended.map((s) => (
                <div key={s.id} className="em-v2-card em-v2-card--compact em-v2-card--warn text-sm">
                  <p className="font-semibold text-orange-100">{s.name}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {s.city || 'Sin ciudad'}
                    {s.suspendedAt
                      ? ` · ${new Date(s.suspendedAt).toLocaleString('es-CL')}`
                      : ''}
                  </p>
                  {s.suspendReason && (
                    <p className="text-xs text-[#9CA3AF] mt-2 whitespace-pre-wrap">{s.suspendReason}</p>
                  )}
                  <p className="text-[10px] text-[#6B7280] font-mono break-all mt-2">{s.id}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      disabled={busy === `unsuspend:${s.id}`}
                      onClick={() => runModerate(s.id, 'unsuspend')}
                      className="py-2 px-3 rounded-xl bg-[#22c55e]/20 text-[#22c55e] text-xs font-medium"
                    >
                      Reactivar cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fillModerateFromUid(s.id, s.suspendReason)
                        setTab('delete')
                      }}
                      className="py-2 px-3 rounded-xl bg-red-900/30 text-red-200 text-xs border border-red-800/40"
                    >
                      Eliminar definitivamente
                    </button>
                  </div>
                </div>
              ))
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
                <div key={b.id} className="em-v2-card em-v2-card--compact text-sm">
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
                      {moderationActions(
                        b.blockedId,
                        [b.reportReason, b.reportDetails].filter(Boolean).join(' — '),
                        true
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
              <div className="em-v2-card em-v2-card--compact text-sm space-y-2">
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
              Elimina la cuenta de Firebase Auth y anonimiza el perfil. Usa el UID desde un reporte, LIVE o
              búsqueda.
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

        {tab === 'audit' && (
          <div className="space-y-3">
            <p className="text-xs text-[#9CA3AF]">Historial de acciones de moderación (últimas 80).</p>
            {auditLog.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] py-8 text-center">Sin registros aún.</p>
            ) : (
              auditLog.map((row) => (
                <div key={row.id} className="em-v2-card em-v2-card--compact text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold text-[#E5E7EB]">{adminActionLabel(row.action)}</span>
                    <span className="text-[#6B7280] shrink-0">
                      {new Date(row.createdAt).toLocaleString('es-CL')}
                    </span>
                  </div>
                  {row.targetName && (
                    <p className="text-[#9CA3AF] mt-1">
                      {row.targetName}
                      {row.targetUserId ? (
                        <span className="font-mono text-[10px] ml-1">({row.targetUserId.slice(0, 8)}…)</span>
                      ) : null}
                    </p>
                  )}
                  {row.reason && (
                    <p className="text-[#6B7280] mt-1 whitespace-pre-wrap">{row.reason}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
