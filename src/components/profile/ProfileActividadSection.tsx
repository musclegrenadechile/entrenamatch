import { toast } from 'sonner'
import { TuRedPowerCard } from './TuRedPowerCard'
import { ConstanciaStore } from './ConstanciaStore'
import { PartnerGymDashboard } from '../partner/PartnerGymDashboard'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileActividadSection(props: ProfileTabProps) {
  const {
    profileSection,
    networkStats,
    syncBonds,
    currentUser,
    dailyPulse,
    getUnlockedGadgets,
    getTodayStr,
    setDailyPulse,
    saveUserWithRealSync,
  } = profileTabBindings(props)

  return (
    <>
<div className={profileSection !== 'actividad' ? 'hidden' : undefined}>
<TuRedPowerCard
  networkPower={networkStats?.networkPower || 0}
  bondsCount={Object.keys(syncBonds || {}).length}
  liveStreak={currentUser?.liveStreak || 0}
  level={dailyPulse?.level || 1}
  gadgets={dailyPulse ? getUnlockedGadgets(dailyPulse.level || 1).map((g) => g.icon) : []}
  momentum={dailyPulse?.momentum}
  onAmplifyPulse={() => {
    if (!dailyPulse || (dailyPulse.momentum || 0) < 30) return
    const t = getTodayStr()
    const ap = { ...dailyPulse, pulseAmplifiedDate: t, momentum: (dailyPulse.momentum || 0) - 30 }
    setDailyPulse(ap)
    saveUserWithRealSync({ ...(currentUser as any), pulseAmplifiedDate: t, momentumPoints: ap.momentum } as any)
    toast.success('Pulso amplificado 24h')
  }}
  onProtectStreak={() => {
    if (!dailyPulse || (dailyPulse.momentum || 0) < 50) return
    const t = getTodayStr()
    const pp = { ...dailyPulse, streakProtectedDate: t, momentum: (dailyPulse.momentum || 0) - 50 }
    setDailyPulse(pp)
    saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: t, momentumPoints: pp.momentum } as any)
    toast.success('Racha protegida hoy')
  }}
/>
<div className="px-4 mt-3">
  <ConstanciaStore
    balance={dailyPulse?.momentum || 0}
    onProtectStreak={() => {
      if (!dailyPulse || (dailyPulse.momentum || 0) < 50) return
      const t = getTodayStr()
      const pp = { ...dailyPulse, streakProtectedDate: t, momentum: (dailyPulse.momentum || 0) - 50 }
      setDailyPulse(pp)
      saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: t, momentumPoints: pp.momentum } as any)
      toast.success('Racha protegida con Constancia')
    }}
    onBuyInsurance={() => {
      if (!dailyPulse || (dailyPulse.momentum || 0) < 120) {
        toast.error('Necesitas 120 pts de Constancia')
        return
      }
      const t = getTodayStr()
      const pp = { ...dailyPulse, streakInsuranceWeek: t, momentum: (dailyPulse.momentum || 0) - 120 }
      setDailyPulse(pp)
      saveUserWithRealSync({ ...(currentUser as any), streakInsuranceWeek: t, momentumPoints: pp.momentum } as any)
      toast.success('Seguro semanal activado')
    }}
  />
</div>
{currentUser?.gymName && (
  <div className="px-4 mt-3">
    <PartnerGymDashboard
      gymName={currentUser.gymName}
      checkInsToday={Math.max(1, Object.keys(syncBonds || {}).length % 12)}
      liveNow={Math.max(0, (currentUser as { liveStreak?: number }).liveStreak || 0)}
    />
  </div>
)}
</div>

    </>
  )
}
