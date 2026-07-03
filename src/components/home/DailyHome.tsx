import { useState } from 'react'
import { EntrenoDeHoyWeekSummary } from '../workout/EntrenoDeHoyWeekSummary'
import { ExercisePRStrip } from '../workout/ExercisePRStrip'
import { MessageCircle, RefreshCw, Users } from 'lucide-react'
import { FuelDayCard } from '../fuel/FuelDayCard'
import { WeeklyPlanCard } from '../plan/WeeklyPlanCard'
import type { WeeklyPlanResult } from '../../domain/weeklyPlan'
import { LocalNetworkCard } from './LocalNetworkCard'
import { HomeLoopStepper, resolveHomeLoopStep } from './HomeLoopStepper'
import { formatRedSyncFomoLine } from '../../utils/syncFomo'
import type { WeeklyPact, WeeklyPactProgress } from '../../services/weeklyPact'
import { WeeklyPactCard } from './WeeklyPactCard'
import { DailyHomeHeroCard } from './DailyHomeHeroCard'
import { WorkoutDraftResumeBanner } from '../workout/WorkoutDraftResumeBanner'
import { isWorkoutDraftFresh, loadWorkoutDraft } from '../../utils/workoutDraft'
import { PilotProgramStrip } from './PilotProgramStrip'
import { CityDerbyCard, CityDerbyCompactStrip } from './CityDerbyCard'
import { SyncHourBanner } from './SyncHourBanner'
import { BRAND_COPY } from '../../constants/brandCopy'
import { isDerbyParticipantCity } from '../../services/cityDerby'
import { GymInviteQrSheet } from '../growth/GymInviteQrSheet'
import { buildGymInviteLink } from '../../utils/sparseCityDefaults'
import type { CityDerbyState } from '../../services/cityDerby'
import type { LocalNetworkCardProps } from './LocalNetworkCard'
import type { Firestore } from 'firebase/firestore'
import type { ProfileGender } from '../../utils/genderedCopy'
import type { GymSoundDisplay } from '../../types'
import { GymSoundLiveStrip } from '../music/GymSoundLiveStrip'
import { WearableActivityCard } from './WearableActivityCard'
import type { WearableDayActivity } from '../../services/wearableSync'

export type TeamMemberStatus = 'live' | 'recent' | 'this_week' | 'inactive'

export interface TeamMemberView {
  id: string
  name: string
  status: TeamMemberStatus
  lastLiveLabel?: string
  isBond: boolean
}

export interface ActiveSyncPairView {
  names: string
  vibe?: number
  minutes?: number
}

export interface DailyHomeProps {
  userName: string
  weekDays: Array<{ label: string; trained: boolean; isToday: boolean }>
  weekTrainedCount: number
  teamMembers: TeamMemberView[]
  liveCount: number
  redLiveCount?: number
  syncCount: number
  activeSyncPairs?: ActiveSyncPairView[]
  isLive: boolean
  isTogglingLive: boolean
  onToggleLive: () => void
  onOpenExplore: () => void
  onOpenMap: () => void
  onJoinMember?: (id: string, name: string) => void
  onMessageMember?: (id: string) => void
  onOpenMatches?: () => void
  onOpenEntrenaLog?: () => void
  workoutDraftUserId?: string | null
  workoutDraftRefresh?: number
  onResumeWorkoutDraft?: () => void
  onDiscardWorkoutDraft?: () => void
  entrenoWeekSummary?: import('../../utils/workoutProgress').WeekWorkoutSummary | null
  entrenoExerciseHighlights?: Array<{ name: string; bestWeightKg: number; trend: 'up' | 'flat' | 'down' }>
  entrenoPactProgress?: WeeklyPactProgress | null
  entrenoPartnerCompare?: {
    partnerName: string
    selfSessions: number
    partnerSessions: number
    selfSets: number
    partnerSets: number
  } | null
  fuelProfile?: import('../../types').FuelProfile | null
  fuelTotals?: import('../../types').FuelDayTotals
  fuelTodayLogs?: import('../../types').FuelLogEntry[]
  fuelWeekDays?: import('../../services/fuel').FuelWeekDay[]
  fuelWeekMacros?: import('../../services/fuel').FuelWeekMacroDay[]
  fuelWeekBalanceDays?: import('../../utils/fuelWeekBalance').FuelWeekBalanceDay[]
  fuelPostWorkoutTip?: string
  fuelEnergyBalance?: import('../../domain/fuelBalance').DailyEnergyBalance | null
  onOpenFuelSetup?: () => void
  onOpenFuelEdit?: () => void
  onOpenFuelLog?: () => void
  exercisePRRecords?: import('../../services/exercisePRs').ExercisePRRecord[]
  onEditFuelLog?: (log: import('../../types').FuelLogEntry) => void
  onDeleteFuelLog?: (logId: string) => void
  deletingFuelLogId?: string | null
  onImportHealthBurn?: () => void | Promise<void>
  healthImportHint?: string
  wearableActivity?: WearableDayActivity | null
  wearableSyncing?: boolean
  onRefreshWearableActivity?: () => void | Promise<void>
  onOpenWearableConnect?: () => void
  cityLabel?: string
  localNetwork?: Omit<LocalNetworkCardProps, 'cityLabel'> & { cityLabel?: string }
  weeklyPact?: WeeklyPact | null
  weeklyPactProgress: WeeklyPactProgress
  onPledgeWeeklyPact?: (
    partial: Omit<WeeklyPact, 'weekKey' | 'pledgedAt'> & { weekKey?: string }
  ) => void
  forcePactWizard?: boolean
  entrenoRecentWorkouts?: import('../../types').Workout[]
  onRepeatYesterday?: () => void
  onOpenPactWizard?: () => void
  pilotDb?: Firestore | null
  pilotInviteLink?: string
  isDemoMode?: boolean
  cityDerby?: CityDerbyState | null
  onOpenDerbyMap?: () => void
  /** Fase 101 — día 1: oculta plan semanal y meta; Fuel AI queda visible. */
  compactDayOne?: boolean
  userGender?: ProfileGender
  weeklyPlan?: WeeklyPlanResult | null
  weeklyPlanEnriching?: boolean
  onStartWeeklyPlan?: (plan: WeeklyPlanResult) => void
  onPublishWeeklyPlanToFeed?: (plan: WeeklyPlanResult) => void
  onShareWeeklyPlanExternally?: (plan: WeeklyPlanResult) => void
  /** GymSound Phase 2 — strip while LIVE + share enabled */
  gymSoundLive?: boolean
  gymSoundNowPlaying?: GymSoundDisplay | null
}

function statusLine(member: TeamMemberView): string {
  if (member.status === 'live') return 'Entrenando ahora'
  if (member.lastLiveLabel) return member.lastLiveLabel
  if (member.status === 'this_week') return 'Entrenó esta semana'
  return 'Sin actividad esta semana'
}

function SectionLabel({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#FF671F]/20 text-[#FF671F] text-[10px] font-black flex items-center justify-center">
            {step}
          </span>
          <p className="text-[12px] font-bold text-white">{title}</p>
        </div>
        {hint && <p className="text-[10px] text-[#9CA3AF] mt-0.5 ml-7">{hint}</p>}
      </div>
    </div>
  )
}

export function DailyHome({
  userName,
  weekDays,
  weekTrainedCount,
  teamMembers,
  liveCount,
  redLiveCount = 0,
  syncCount,
  activeSyncPairs = [],
  isLive,
  isTogglingLive,
  onToggleLive,
  onOpenExplore,
  onOpenMap,
  onJoinMember,
  onMessageMember,
  onOpenMatches,
  onOpenEntrenaLog,
  workoutDraftUserId = null,
  workoutDraftRefresh = 0,
  onResumeWorkoutDraft,
  onDiscardWorkoutDraft,
  entrenoWeekSummary = null,
  entrenoExerciseHighlights = [],
  entrenoPactProgress = null,
  entrenoPartnerCompare = null,
  fuelProfile,
  fuelTotals,
  fuelTodayLogs,
  fuelWeekDays,
  fuelWeekMacros,
  fuelWeekBalanceDays = [],
  fuelPostWorkoutTip,
  fuelEnergyBalance = null,
  onOpenFuelSetup,
  onOpenFuelEdit,
  onOpenFuelLog,
  exercisePRRecords = [],
  onEditFuelLog,
  onDeleteFuelLog,
  deletingFuelLogId,
  onImportHealthBurn,
  healthImportHint,
  wearableActivity = null,
  wearableSyncing = false,
  onRefreshWearableActivity,
  onOpenWearableConnect,
  cityLabel,
  localNetwork,
  weeklyPact = null,
  weeklyPactProgress,
  onPledgeWeeklyPact,
  forcePactWizard = false,
  entrenoRecentWorkouts = [],
  onRepeatYesterday,
  onOpenPactWizard,
  pilotDb = null,
  pilotInviteLink,
  isDemoMode = false,
  cityDerby = null,
  onOpenDerbyMap,
  compactDayOne = false,
  userGender,
  weeklyPlan = null,
  weeklyPlanEnriching = false,
  onStartWeeklyPlan,
  onPublishWeeklyPlanToFeed,
  onShareWeeklyPlanExternally,
  gymSoundLive = false,
  gymSoundNowPlaying = null,
}: DailyHomeProps) {
  const firstName = (userName || 'Atleta').split(' ')[0]
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const liveTeamMembers = teamMembers.filter((m) => m.status === 'live')
  const loopStep = resolveHomeLoopStep({
    isLive,
    teamCount: teamMembers.length,
    liveTeamCount: liveTeamMembers.length,
    syncCount,
    pactPledged: weeklyPactProgress.pledged,
    pactComplete: weeklyPactProgress.isComplete,
  })
  const syncFomoLine = formatRedSyncFomoLine(redLiveCount, syncCount)
  void workoutDraftRefresh
  const workoutDraft =
    workoutDraftUserId && onResumeWorkoutDraft && onDiscardWorkoutDraft
      ? loadWorkoutDraft(workoutDraftUserId)
      : null
  /** El gadget flotante de sesión reemplaza este banner (Fase A). */
  const showWorkoutDraftBanner = false
  const [showGymQr, setShowGymQr] = useState(false)
  const [showHomeMore, setShowHomeMore] = useState(false)
  const derbyParticipates = isDerbyParticipantCity(cityLabel)

  const referralCode = (() => {
    if (!pilotInviteLink) return 'invite'
    try {
      return new URL(pilotInviteLink).searchParams.get('ref') || 'invite'
    } catch {
      return 'invite'
    }
  })()

  const gymForInvite =
    localNetwork?.nearestGym ||
    (localNetwork?.gymCheckIn
      ? { id: localNetwork.gymCheckIn.gymId, name: localNetwork.gymCheckIn.gymName }
      : null)

  const gymInviteUrl = pilotInviteLink
    ? buildGymInviteLink(referralCode, gymForInvite)
    : ''

  return (
    <div className="daily-home em-v2-home mb-4 -mx-1 px-1 space-y-3">
      <div className="px-0.5">
        <p className="em-v2-home__eyebrow">Hoy</p>
        <h2 className="em-v2-home__hero-title">¿Quién entrena cerca?</h2>
        <p className="em-v2-home__hero-sub">
          <strong>{greeting}, {firstName}</strong>
          {liveCount > 0 ? (
            <>
              {' · '}
              <span className="em-v2-home__live-count">
                {liveCount} en {BRAND_COPY.liveMapLabel}
              </span>
            </>
          ) : (
            <> · Activa LIVE para aparecer en el mapa</>
          )}
        </p>

        <button
          type="button"
          onClick={onOpenMap}
          className="em-v2-map-cta w-full mt-2.5"
        >
          <span className="em-v2-map-cta__title">
            {liveCount > 0
              ? `🟢 ${liveCount} entrenando ahora`
              : `Abre el ${BRAND_COPY.liveMapLabel}`}
            {cityLabel ? ` · ${cityLabel}` : ''}
          </span>
          <span className="em-v2-map-cta__arrow">Mapa →</span>
        </button>

        <HomeLoopStepper activeStep={loopStep} />
      </div>

      {compactDayOne ? (
        derbyParticipates ? (
          <CityDerbyCompactStrip
            derby={cityDerby}
            onOpenMap={onOpenDerbyMap ?? onOpenMap}
            userCity={cityLabel}
          />
        ) : (
          <div className="rounded-2xl border border-[#FF671F]/25 bg-[#1a1208]/60 p-3 mb-2">
            <p className="text-[10px] font-bold text-[#FF671F] uppercase tracking-wide">
              {BRAND_COPY.pilotGeo.outsidePilotTitle}
            </p>
            <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
              {BRAND_COPY.pilotGeo.outsidePilotBody(cityLabel || 'tu ciudad')}
            </p>
          </div>
        )
      ) : derbyParticipates ? (
        <>
          <PilotProgramStrip
            cityLabel={cityLabel}
            db={pilotDb}
            isDemoMode={isDemoMode}
            inviteLink={pilotInviteLink}
            onOpenMap={onOpenDerbyMap}
            liveCount={liveCount}
          />

          <CityDerbyCard
            derby={cityDerby}
            onOpenMap={onOpenDerbyMap}
            userGender={userGender}
            userCity={cityLabel}
            inviteLink={pilotInviteLink}
            db={pilotDb}
            isDemoMode={isDemoMode}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-[#FF671F]/25 bg-[#1a1208]/60 p-4 mb-2">
          <p className="text-[10px] font-bold text-[#FF671F] uppercase tracking-wide">
            {BRAND_COPY.pilotGeo.outsidePilotTitle}
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
            {BRAND_COPY.pilotGeo.outsidePilotBody(cityLabel || 'tu ciudad')}
          </p>
          {pilotInviteLink && (
            <button
              type="button"
              onClick={() => setShowGymQr(true)}
              className="mt-2 text-[10px] font-bold text-[#22c55e] px-3 py-1.5 rounded-lg border border-[#22c55e]/40"
            >
              {BRAND_COPY.explore.inviteTitle}
            </button>
          )}
        </div>
      )}

      <DailyHomeHeroCard
        isLive={isLive}
        weeklyPactProgress={weeklyPactProgress}
        entrenoRecentWorkouts={entrenoRecentWorkouts}
        weekTrainedCount={weekTrainedCount}
        onOpenMap={onOpenMap}
        onOpenEntrenoLog={onOpenEntrenaLog}
        onRepeatYesterday={onRepeatYesterday}
        onOpenPact={onOpenPactWizard}
      />

      {onOpenEntrenaLog && compactDayOne && (
        <button type="button" onClick={onOpenEntrenaLog} className="em-v2-cta-secondary w-full flex items-center justify-center gap-2">
          <span>🏋️</span> Entreno de Hoy — registrar sesión
        </button>
      )}

      {compactDayOne && (weeklyPlan || onOpenFuelSetup) && (
        <WeeklyPlanCard
          plan={weeklyPlan ?? null}
          showEmptyState={!weeklyPlan}
          enriching={weeklyPlanEnriching}
          onStartWorkout={onStartWeeklyPlan}
          onPublishPlanToFeed={onPublishWeeklyPlanToFeed}
          onSharePlanExternally={onShareWeeklyPlanExternally}
          onOpenFuelSetup={onOpenFuelSetup}
          onOpenFuelLog={onOpenFuelLog}
          hasFuelProfile={!!fuelProfile}
          weeklyDeltaKcal={weeklyPlan?.energySummary.weeklyDeltaKcal}
        />
      )}

      {!compactDayOne && (entrenoWeekSummary || exercisePRRecords.length > 0 || weeklyPlan) && (
        <section className="space-y-3" aria-label="Tu entrenamiento">
          {weeklyPlan && (
            <WeeklyPlanCard
              plan={weeklyPlan}
              showEmptyState={false}
              enriching={weeklyPlanEnriching}
              onStartWorkout={onStartWeeklyPlan}
              onPublishPlanToFeed={onPublishWeeklyPlanToFeed}
              onSharePlanExternally={onShareWeeklyPlanExternally}
              onOpenFuelSetup={onOpenFuelSetup}
              onOpenFuelLog={onOpenFuelLog}
              hasFuelProfile={!!fuelProfile}
              weeklyDeltaKcal={weeklyPlan.energySummary.weeklyDeltaKcal}
            />
          )}
          {entrenoWeekSummary && (
            <EntrenoDeHoyWeekSummary
              summary={entrenoWeekSummary}
              onOpenEntrenoDeHoy={onOpenEntrenaLog}
              exerciseHighlights={entrenoExerciseHighlights}
              pactProgress={entrenoPactProgress}
              partnerCompare={entrenoPartnerCompare}
            />
          )}
          {exercisePRRecords.length > 0 && (
            <ExercisePRStrip records={exercisePRRecords} onOpenEntrenoLog={onOpenEntrenaLog} />
          )}
        </section>
      )}

      {!compactDayOne && (
        <>
          <button
            type="button"
            onClick={() => setShowHomeMore((open) => !open)}
            className={`em-v2-home-more-toggle ${showHomeMore ? 'em-v2-home-more-toggle--open' : ''}`}
            aria-expanded={showHomeMore}
          >
            <span>{showHomeMore ? 'Menos de tu día' : 'Más de tu día'}</span>
            <span className="text-[11px] font-bold">{showHomeMore ? '▲' : '▼'}</span>
          </button>

          {showHomeMore && (
            <div className="em-v2-home-more-panel">
              <SyncHourBanner
                isLive={isLive}
                onOpenMap={onOpenDerbyMap ?? onOpenMap}
                onActivateLive={onToggleLive}
                db={pilotDb}
                city={cityLabel}
                isDemoMode={isDemoMode}
              />

              {showWorkoutDraftBanner && workoutDraft && (
                <WorkoutDraftResumeBanner
                  draft={workoutDraft}
                  onResume={onResumeWorkoutDraft!}
                  onDiscard={onDiscardWorkoutDraft!}
                />
              )}

              {(wearableActivity || onRefreshWearableActivity) && (
                <WearableActivityCard
                  activity={wearableActivity}
                  syncing={wearableSyncing}
                  needsConnect={!!wearableActivity?.needsConnect}
                  onRefresh={onRefreshWearableActivity}
                  onConnect={onOpenWearableConnect}
                />
              )}

              <FuelDayCard
                profile={fuelProfile ?? null}
                totals={fuelTotals ?? { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 }}
                energyBalance={fuelEnergyBalance}
                todayLogs={fuelTodayLogs}
                weekDays={fuelWeekDays}
                weekBalanceDays={fuelWeekBalanceDays}
                postWorkoutTip={fuelPostWorkoutTip}
                onSetup={onOpenFuelSetup ?? (() => {})}
                onEditProfile={onOpenFuelEdit}
                onLogMeal={onOpenFuelLog ?? (() => {})}
                onEditLog={onEditFuelLog}
                onDeleteLog={onDeleteFuelLog}
                deletingLogId={deletingFuelLogId}
                onImportHealth={onImportHealthBurn}
                healthImportHint={healthImportHint}
                wearableActivity={wearableActivity}
                weeklyDeltaKcal={weeklyPlan?.energySummary.weeklyDeltaKcal}
              />

            </div>
          )}
        </>
      )}

      <section
        className={`em-v2-home-live ${loopStep === 'live' || isLive ? 'em-v2-home-live--active' : ''}`}
        aria-label="Paso Live"
      >
        <SectionLabel
          step={1}
          title="Live"
          hint={
            isLive
              ? 'Estás en el mapa — tu equipo puede verte.'
              : 'Enciende live cuando empieces a entrenar.'
          }
        />

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white">Tu semana</span>
          <span className="text-[10px] text-[#9CA3AF] tabular-nums">{weekTrainedCount}/7 días</span>
        </div>
        <div className="flex justify-between gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full max-w-[36px] aspect-square rounded-xl flex items-center justify-center transition-all ${
                  d.trained
                    ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                    : d.isToday && isLive
                      ? 'bg-[#22c55e]/25 border-2 border-[#22c55e] text-[#22c55e] animate-pulse'
                      : d.isToday
                        ? 'bg-[#FF671F]/15 border-2 border-[#FF671F]/50 text-[#FF671F]'
                        : 'bg-white/5 border border-white/10 text-[#6B7280]'
                }`}
              >
                {d.trained ? '✓' : ''}
              </div>
              <span
                className={`text-[9px] font-bold ${d.isToday ? 'text-[#FF671F]' : 'text-[#6B7280]'}`}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-[#6B7280] mb-3">20+ min en live cuentan para tu semana.</p>

        {isLive ? (
          <p className="text-[11px] text-[#22c55e] font-semibold text-center py-2 mb-1 leading-snug">
            Estás en el mapa — usa <span className="font-black">EN VIVO</span> abajo a la derecha para terminar.
          </p>
        ) : (
          <p className="text-[11px] text-[#9CA3AF] text-center py-2 mb-1 leading-snug">
            Cuando empieces, toca <span className="text-[#22c55e] font-black">IR LIVE</span> (botón flotante abajo a la derecha).
          </p>
        )}

        <button type="button" onClick={onOpenMap} className="em-v2-map-cta w-full mt-2">
          <span className="em-v2-map-cta__title">
            {liveCount > 0
              ? `🟢 ${liveCount} en ${BRAND_COPY.liveMapLabel}`
              : `Ver ${BRAND_COPY.liveMapLabel}`}
            {cityLabel ? ` · ${cityLabel}` : ''}
          </span>
          <span className="em-v2-map-cta__arrow">Mapa →</span>
        </button>

        {isLive && gymSoundLive && (
          <GymSoundLiveStrip nowPlaying={gymSoundNowPlaying} />
        )}
      </section>

      {/* 2 · EQUIPO */}
      <section
        className={`rounded-3xl p-4 border ${
          loopStep === 'team'
            ? 'bg-[#141418] border-[#FF671F]/40 ring-1 ring-[#FF671F]/20'
            : 'bg-[#141418] border-[#2F2F35]'
        }`}
        aria-label="Paso Equipo"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#FF671F]/20 text-[#FF671F] text-[10px] font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-[12px] font-bold text-white">Tu equipo</p>
              <p className="text-[10px] text-[#9CA3AF]">Matches y socios con los que ya entrenaste.</p>
            </div>
          </div>
          {onOpenMatches && (
            <button
              type="button"
              onClick={onOpenMatches}
              className="text-[10px] text-[#FF671F] font-bold underline active:opacity-70 shrink-0"
            >
              Ver todos
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-4 px-2">
            <p className="text-sm text-[#9CA3AF]">Sin equipo aún — el sync empieza aquí.</p>
            <button
              type="button"
              onClick={onOpenExplore}
              className="mt-2 text-[11px] px-4 py-2 rounded-xl bg-[#FF671F]/15 text-[#FF671F] font-bold active:bg-[#FF671F]/25 inline-flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              Buscar gym partner
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {teamMembers.slice(0, 5).map((member) => (
              <li
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${
                  member.status === 'live'
                    ? 'bg-[#22c55e]/8 border-[#22c55e]/35'
                    : 'bg-white/[0.03] border-white/8'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                    member.status === 'live'
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#2F2F35] text-white'
                  }`}
                >
                  {(member.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">
                      {member.name.split(' ')[0]}
                    </span>
                    {member.isBond && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-bold">
                        BOND
                      </span>
                    )}
                    {member.status === 'live' && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#22c55e] text-black font-black animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] truncate">{statusLine(member)}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {member.status === 'live' && onJoinMember && (
                    <button
                      type="button"
                      onClick={() => onJoinMember(member.id, member.name)}
                      className="text-[10px] px-3 py-1.5 rounded-xl bg-[#22c55e] text-black font-extrabold active:scale-95"
                    >
                      Sync
                    </button>
                  )}
                  {member.status !== 'live' && onMessageMember && (
                    <button
                      type="button"
                      onClick={() => onMessageMember(member.id)}
                      className="text-[10px] px-2.5 py-1.5 rounded-xl border border-white/15 text-white/80 font-semibold active:bg-white/10 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3 · SYNC */}
      <section
        className={`rounded-3xl p-4 border ${
          loopStep === 'sync'
            ? 'bg-gradient-to-br from-[#0a1f14] to-[#141418] border-[#22c55e]/40 ring-1 ring-[#22c55e]/25'
            : 'bg-gradient-to-br from-[#0a1f14]/80 to-[#141418] border-[#22c55e]/20'
        }`}
        aria-label="Paso Sync"
      >
        <SectionLabel
          step={3}
          title="EntrenaSync"
          hint={
            isLive
              ? 'Entrena en sync con alguien de tu equipo o del mapa.'
              : 'Primero activa live — luego invita a un sync.'
          }
        />

        {syncFomoLine && (
          <p className="text-[10px] text-[#22c55e]/90 font-semibold mb-3 ml-7">{syncFomoLine}</p>
        )}

        {!isLive && (
          <div className="mb-3 p-3 rounded-2xl bg-black/30 border border-white/10 text-center">
            <p className="text-[11px] text-[#9CA3AF] leading-snug">
              Activa live con <span className="text-[#22c55e] font-bold">IR LIVE</span> para iniciar un EntrenaSync.
            </p>
          </div>
        )}

        {activeSyncPairs.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] uppercase tracking-wider text-[#22c55e] font-bold mb-1.5">
              🔄 {activeSyncPairs.length} sync activo{activeSyncPairs.length > 1 ? 's' : ''} ahora
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeSyncPairs.slice(0, 4).map((pair, i) => (
                <span
                  key={i}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-medium border border-[#22c55e]/25"
                >
                  {pair.names}
                  {pair.minutes != null && pair.minutes > 0 ? ` · ${pair.minutes} min` : ''}
                  {pair.vibe != null ? ` · ${pair.vibe}%` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {liveTeamMembers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] text-[#9CA3AF]">De tu equipo, en live ahora:</p>
            {liveTeamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onJoinMember?.(member.id, member.name)}
                className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/35 active:scale-[0.99] text-left"
              >
                <span className="text-sm font-bold text-white">{member.name.split(' ')[0]}</span>
                <span className="text-[10px] font-extrabold text-[#22c55e] flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Iniciar sync
                </span>
              </button>
            ))}
          </div>
        ) : isLive ? (
          <div className="text-center py-3 px-2 rounded-2xl bg-black/25 border border-dashed border-[#22c55e]/30">
            <p className="text-[11px] text-[#9CA3AF] mb-2">
              Nadie de tu equipo está en live. Busca en el mapa o explora.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={onOpenMap}
                className="text-[10px] px-3 py-1.5 rounded-xl bg-[#22c55e]/15 text-[#22c55e] font-bold"
              >
                Abrir mapa
              </button>
              <button
                type="button"
                onClick={onOpenExplore}
                className="text-[10px] px-3 py-1.5 rounded-xl border border-[#FF671F]/40 text-[#FF671F] font-bold"
              >
                Explorar
              </button>
            </div>
          </div>
        ) : null}

        {syncCount > 0 && (
          <p className="text-[10px] text-[#22c55e]/80 mt-3 text-center font-medium">
            {syncCount} persona{syncCount === 1 ? '' : 's'} en sync en la red
          </p>
        )}
      </section>

      {!compactDayOne && showHomeMore && (
      <>
      {/* 4 · META SEMANAL */}
      <section
        className={`rounded-3xl p-4 border transition-colors ${
          loopStep === 'pact'
            ? 'bg-gradient-to-br from-[#1a1208] to-[#141418] border-[#FF671F]/45 ring-1 ring-[#FF671F]/25'
            : weeklyPactProgress.isComplete
              ? 'bg-gradient-to-br from-[#0a1f14]/80 to-[#141418] border-[#22c55e]/30'
              : 'bg-gradient-to-br from-[#141418] to-[#0f0f12] border-[#2F2F35]'
        }`}
        aria-label="Paso Meta de la semana"
      >
        <SectionLabel
          step={4}
          title="Meta de la semana"
          hint={
            weeklyPactProgress.isComplete
              ? 'Semana sellada — sigue sumando Constancia.'
              : weeklyPactProgress.pledged
                ? 'Tu meta de live + sync esta semana.'
                : 'Define tu meta y cierra la semana con tu equipo.'
          }
        />
        {onPledgeWeeklyPact && (
          <WeeklyPactCard
            progress={weeklyPactProgress}
            pact={weeklyPact}
            teamMembers={teamMembers}
            isLoopActive={loopStep === 'pact'}
            isLive={isLive}
            onPledge={onPledgeWeeklyPact}
            onSyncWithPartner={onJoinMember}
            onMessagePartner={onMessageMember}
            forceWizard={forcePactWizard}
          />
        )}
      </section>

      {localNetwork && (
        <LocalNetworkCard
          cityLabel={cityLabel}
          {...localNetwork}
          inviteUrl={gymInviteUrl}
          onShowGymQr={gymInviteUrl ? () => setShowGymQr(true) : undefined}
        />
      )}
      </>
      )}

      <GymInviteQrSheet
        open={showGymQr}
        inviteUrl={gymInviteUrl}
        gymName={gymForInvite?.name || cityLabel}
        onClose={() => setShowGymQr(false)}
        db={pilotDb}
        city={cityLabel}
        isDemoMode={isDemoMode}
      />
    </div>
  )
}
