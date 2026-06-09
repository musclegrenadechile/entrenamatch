import { toast } from 'sonner'
import { TuRedPowerCard } from './TuRedPowerCard'
import { ConstanciaStore } from './ConstanciaStore'
import { PartnerGymDashboard } from '../partner/PartnerGymDashboard'
import { ProfileEntrenoDeHoySection } from './ProfileEntrenoDeHoySection'
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
    partnerGymStats,
    partnerGymLoading,
    constanciaBalance,
    onConstanciaProtect,
    onConstanciaInsurance,
    entrenoRecentWorkouts = [],
    entrenoRecentLoading = false,
    onOpenEntrenoDeHoy,
    onCopyEntrenoWorkout,
  } = profileTabBindings(props)

  const gymName =
    currentUser?.gymCheckIn?.gymName || (currentUser as { gymName?: string }).gymName
  const balance = constanciaBalance ?? dailyPulse?.momentum ?? 0

  const handleProtect = onConstanciaProtect ?? (() => {
    if (!dailyPulse || (dailyPulse.momentum || 0) < 50) return
    const t = getTodayStr()
    const pp = { ...dailyPulse, streakProtectedDate: t, momentum: (dailyPulse.momentum || 0) - 50 }
    setDailyPulse(pp)
    saveUserWithRealSync({ ...(currentUser as any), streakProtectedDate: t, momentumPoints: pp.momentum } as any)
    toast.success('Racha protegida con Constancia')
  })

  const handleInsurance = onConstanciaInsurance ?? (() => {
    if (!dailyPulse || (dailyPulse.momentum || 0) < 120) {
      toast.error('Necesitas 120 pts de Constancia')
      return
    }
    const t = getTodayStr()
    const pp = { ...dailyPulse, streakInsuranceWeek: t, momentum: (dailyPulse.momentum || 0) - 120 }
    setDailyPulse(pp)
    saveUserWithRealSync({ ...(currentUser as any), streakInsuranceWeek: t, momentumPoints: pp.momentum } as any)
    toast.success('Seguro semanal activado')
  })

  return (
    <>
<div className={profileSection !== 'actividad' ? 'hidden' : undefined}>
{onOpenEntrenoDeHoy && onCopyEntrenoWorkout && (
  <ProfileEntrenoDeHoySection
    recentWorkouts={entrenoRecentWorkouts}
    loading={entrenoRecentLoading}
    onOpenEntrenoDeHoy={onOpenEntrenoDeHoy}
    onCopyWorkout={onCopyEntrenoWorkout}
  />
)}
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
    balance={balance}
    onProtectStreak={handleProtect}
    onBuyInsurance={handleInsurance}
  />
</div>
{gymName && (
  <div className="px-4 mt-3">
    <PartnerGymDashboard
      gymName={gymName}
      checkInsToday={partnerGymStats?.checkInsToday ?? 0}
      liveNow={partnerGymStats?.liveNow ?? 0}
      promos={partnerGymStats?.promos}
      loading={partnerGymLoading}
    />
  </div>
)}
</div>

    </>
  )
}
