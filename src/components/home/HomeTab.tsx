// Home tab — typed props (Phase 63)
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { BRAND_COPY } from '../../constants/brandCopy'
import { DailyHome } from './DailyHome'
import { SkeletonList } from '../ui/SkeletonLoaders'
import { isGymCheckInFresh } from '../../services/localNetwork'
import { countRedLiveMembers } from '../../utils/syncFomo'
import { WorkoutPostCard } from '../workout'
import { NutritionPostCard } from '../fuel'
import { SyncReplayGallery } from '../sync/SyncReplayGallery'
import { WeeklyMomentsReel } from '../engagement/WeeklyMomentsReel'
import { HomeCoachBanner } from './HomeCoachBanner'
import { HomeShopBanner } from './HomeShopBanner'
import { PostLiveShareBanner, type PostLiveSession } from './PostLiveShareBanner'
import { WeeklyPactReminderStrip } from './WeeklyPactReminderStrip'
import { getFeedRankBadges } from '../../utils/feedRanking'
import { isHomeDayOneMode, shouldHideCoachAndMarketplace } from '../../utils/profileProgressive'

export type HomeSubTab = 'day' | 'feed'

export type HomeTabProps = Record<string, unknown>

export function HomeTab(props: HomeTabProps) {
  const completedSyncCount = Object.keys(
    (props.syncBonds as Record<string, unknown> | undefined) || {}
  ).length
  const hideCoachAndShop = shouldHideCoachAndMarketplace(
    props.currentUser as { legalConsents?: { acceptedAt?: number } } | null | undefined,
    completedSyncCount
  )
  const {
    currentUser,
    homeWeekDays,
    homeWeekTrainedCount,
    homeTeamMembers,
    liveCountForUI,
    activeSyncCount,
    isTogglingLive,
    toggleLiveTraining,
    setActiveTab,
    setShowLiveMap,
    startSyncWith,
    setActiveChat,
    setShowEntrenaLogModal,
    onOpenEntrenoDeHoy,
    entrenoWeekSummary,
    entrenoExerciseHighlights,
    entrenoPactProgress,
    entrenoPartnerCompare,
    entrenoRecentWorkouts,
    onRepeatYesterday,
    onOpenPactWizard,
    fuelProfile,
    fuelTodayTotals,
    fuelTodayLogs,
    fuelWeekDays,
    fuelWeekMacros,
    fuelWeekBalanceDays,
    fuelPostWorkoutTip,
    fuelEnergyBalance,
    openFuelWizard,
    setShowFuelSetupModal,
    exercisePRRecords,
    openFuelLogModal,
    onEditFuelLog,
    onDeleteFuelLog,
    deletingFuelLogId,
    onImportHealthBurn,
    healthImportHint,
    homeCityChallengeMerged,
    homeLocalLeaderboard,
    homeGymLeaderboard,
    homeMyLeaderboardRank,
    homeCityLiveCount,
    homeNearestGym,
    homeGymLiveCount,
    handleToggleLeaderboard,
    handleGymCheckIn,
    mapMyGymId,
    handleOpenGymMap,
    setShowFeedPostModal,
    feedSearch,
    setFeedSearch,
    feedOnlyReal,
    setFeedOnlyReal,
    feedOnlyLive,
    setFeedOnlyLive,
    feedShowPinnedOnly,
    setFeedShowPinnedOnly,
    feedMaxProfiles,
    setFeedMaxProfiles,
    feedDisplayLimit,
    setFeedDisplayLimit,
    loadGlobalFeed,
    isDemoMode,
    pilotDb,
    pilotInviteLink,
    cityDerby,
    onOpenDerbyMap,
    loadRealProfiles,
    isLoadingFeed,
    activeSyncPairs,
    liveTrainingNow,
    syncBonds,
    triggerHaptic,
    showFeedPublishSuccess,
    feedComputation,
    hasMoreGlobalFeed,
    effectiveUserId,
    setShowFullProfile,
    handleFeedReaction,
    handleFeedComment,
    toggleFeedPin,
    deleteFeedPost,
    reportFeedPost,
    shareFeedPost,
    formatFeedTime,
    getProfileById,
    toast,
    boostReaction,
    openFullComments,
    activeComment,
    commentDraft,
    setCommentDraft,
    submitComment,
    cancelComment,
    realProfiles,
    recentlyPublishedPostId,
    setFeedPhotoModal,
    getRelativeTime,
    handleCopyWorkoutFromPost,
    togglePinPost,
    deleteProfilePost,
    likeProfilePost,
    feedReactions,
    userLocation,
    weeklyPact,
    weeklyPactProgress,
    onPledgeWeeklyPact,
    weeklyPlan,
    weeklyPlanEnriching,
    onStartWeeklyPlan,
    onPublishWeeklyPlanToFeed,
    onShareWeeklyPlanExternally,
    homeCoachBanner,
    onDismissCoachBanner,
    onOpenTrainerCoach,
    postLiveSession,
    postLivePublishing,
    onPublishPostLive,
    onPostLiveWithPhoto,
    onPostLiveEntrenoLog,
    onDismissPostLive,
    pactReminderDismissed,
    onDismissPactReminder,
    marketplaceOrders,
    marketplaceProducts,
    showShopBanner,
    onDismissShopBanner,
    onOpenMarketplace,
    onOpenMarketplaceOrders,
    showPactWizard,
    profilePostsFeed,
    onQuickFeedTemplate,
    homeSubTab = 'day',
    onHomeSubTabChange,
  } = props

  const [showHomeTabsHint, setShowHomeTabsHint] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('entrenamatch_home_tabs_hint') !== '1') {
        setShowHomeTabsHint(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const dismissHomeTabsHint = () => {
    setShowHomeTabsHint(false)
    try {
      localStorage.setItem('entrenamatch_home_tabs_hint', '1')
    } catch {
      /* ignore */
    }
  }

  const redLiveCount = countRedLiveMembers(
    syncBonds,
    (liveTrainingNow || []).map((u) => u.id),
    effectiveUserId
  )

  return (
    <div className="flex-1 overflow-auto p-4">
      {showHomeTabsHint && (
        <div className="mb-3 p-3 rounded-2xl bg-[#FF671F]/10 border border-[#FF671F]/30 text-[11px] leading-snug relative">
          <button
            type="button"
            onClick={dismissHomeTabsHint}
            className="absolute top-2 right-2 text-[#9CA3AF] text-xs px-1"
            aria-label="Cerrar tip"
          >
            ✕
          </button>
          <strong className="text-[#FF671F] block mb-1">Dos vistas en Hoy</strong>
          <span className="text-[#9CA3AF]">
            <strong className="text-white">Mi día</strong> = tu rutina, equipo y metas.{' '}
            <strong className="text-white">{BRAND_COPY.communityWallTitle}</strong> = posts de tu zona.
          </span>
        </div>
      )}
      <div
        className="flex gap-1 p-1 rounded-2xl bg-[#1C1C20] border border-[#2F2F35] mb-3 sticky top-0 z-20"
        role="tablist"
        aria-label="Secciones de Hoy"
      >
        <button
          type="button"
          role="tab"
          aria-selected={homeSubTab === 'day'}
          onClick={() => {
            onHomeSubTabChange?.('day')
            dismissHomeTabsHint()
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            homeSubTab === 'day'
              ? 'bg-[#FF671F] text-black shadow-sm'
              : 'text-[#9CA3AF] active:bg-[#25252A]'
          }`}
        >
          Mi día
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={homeSubTab === 'feed'}
          onClick={() => {
            onHomeSubTabChange?.('feed')
            dismissHomeTabsHint()
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            homeSubTab === 'feed'
              ? 'bg-gradient-to-r from-[#FF671F] to-[#FF4F79] text-black shadow-sm'
              : 'text-[#9CA3AF] active:bg-[#25252A]'
          }`}
        >
          <span className="flex flex-col items-center leading-tight">
            <span>Muro</span>
            <span className="text-[8px] font-semibold tracking-wide">de la Comunidad</span>
          </span>
        </button>
      </div>

      {homeSubTab === 'day' && (
        <>
      {postLiveSession && (
        <PostLiveShareBanner
          session={postLiveSession as PostLiveSession}
          publishing={!!postLivePublishing}
          onPublish={onPublishPostLive as (text: string) => void | Promise<void>}
          onPublishWithPhoto={onPostLiveWithPhoto as () => void}
          onOpenEntrenoLog={onPostLiveEntrenoLog as () => void}
          onOpenCoach={
            hideCoachAndShop ? undefined : (onOpenTrainerCoach as (() => void) | undefined)
          }
          onDismiss={onDismissPostLive as () => void}
        />
      )}
      {homeCoachBanner && !postLiveSession && !hideCoachAndShop && (
        <HomeCoachBanner
          context={homeCoachBanner}
          onOpenCoach={onOpenTrainerCoach}
          onDismiss={onDismissCoachBanner}
        />
      )}
      {!pactReminderDismissed &&
        weeklyPactProgress?.pledged &&
        !weeklyPactProgress.isComplete && (
          <WeeklyPactReminderStrip
            progress={weeklyPactProgress}
            onOpenEntrenoLog={
              onOpenEntrenoDeHoy ? () => onOpenEntrenoDeHoy() : undefined
            }
            onDismiss={onDismissPactReminder}
          />
        )}
      {showShopBanner && !hideCoachAndShop && (
        <HomeShopBanner
          orders={marketplaceOrders || []}
          products={marketplaceProducts || []}
          onOpenShop={onOpenMarketplace}
          onOpenOrders={onOpenMarketplaceOrders}
          onDismiss={onDismissShopBanner}
        />
      )}
      <DailyHome
        userName={currentUser?.name || 'Atleta'}
        userGender={currentUser?.gender}
        weekDays={homeWeekDays}
        weekTrainedCount={homeWeekTrainedCount}
        teamMembers={homeTeamMembers}
        liveCount={liveCountForUI}
        redLiveCount={redLiveCount}
        syncCount={activeSyncCount}
        activeSyncPairs={activeSyncPairs}
        isLive={!!currentUser?.trainingNow}
        isTogglingLive={isTogglingLive}
        onToggleLive={() => toggleLiveTraining()}
        onOpenExplore={() => {
          setActiveTab('explore')
        }}
        onOpenMap={() => {
          setActiveTab('map')
        }}
        onJoinMember={(id, name) => startSyncWith(id, name)}
        onMessageMember={(id) => {
          setActiveTab('red')
          setActiveChat(id)
        }}
        onOpenMatches={() => setActiveTab('red')}
        onOpenEntrenaLog={
          onOpenEntrenoDeHoy
            ? () => onOpenEntrenoDeHoy()
            : setShowEntrenaLogModal
              ? () => setShowEntrenaLogModal(true)
              : undefined
        }
        entrenoWeekSummary={entrenoWeekSummary}
        entrenoExerciseHighlights={entrenoExerciseHighlights}
        entrenoPactProgress={entrenoPactProgress}
        entrenoPartnerCompare={entrenoPartnerCompare}
        entrenoRecentWorkouts={entrenoRecentWorkouts}
        onRepeatYesterday={onRepeatYesterday}
        onOpenPactWizard={onOpenPactWizard}
        pilotDb={pilotDb as import('firebase/firestore').Firestore | null | undefined}
        pilotInviteLink={pilotInviteLink as string | undefined}
        isDemoMode={isDemoMode as boolean | undefined}
        cityDerby={cityDerby as import('../../services/cityDerby').CityDerbyState | null | undefined}
        onOpenDerbyMap={onOpenDerbyMap as (() => void) | undefined}
        compactDayOne={isHomeDayOneMode(currentUser as { legalConsents?: { acceptedAt?: number } })}
        fuelProfile={fuelProfile}
        fuelTotals={fuelTodayTotals}
        fuelTodayLogs={fuelTodayLogs}
        fuelWeekDays={fuelWeekDays}
        fuelWeekMacros={fuelWeekMacros}
        fuelWeekBalanceDays={fuelWeekBalanceDays}
        fuelPostWorkoutTip={fuelPostWorkoutTip}
        fuelEnergyBalance={fuelEnergyBalance}
        onOpenFuelSetup={() => openFuelWizard()}
        onOpenFuelEdit={() => setShowFuelSetupModal(true)}
        onOpenFuelLog={() =>
          fuelProfile ? openFuelLogModal() : openFuelWizard()
        }
        exercisePRRecords={exercisePRRecords}
        onEditFuelLog={onEditFuelLog}
        onDeleteFuelLog={onDeleteFuelLog}
        deletingFuelLogId={deletingFuelLogId}
        onImportHealthBurn={onImportHealthBurn}
        healthImportHint={healthImportHint}
        cityLabel={currentUser?.city}
        localNetwork={{
          challenge: homeCityChallengeMerged,
          leaderboard: homeLocalLeaderboard,
          gymLeaderboard: homeGymLeaderboard,
          gymLeaderboardTitle: currentUser?.gymCheckIn?.gymName
            ? `Top en ${currentUser.gymCheckIn.gymName}`
            : undefined,
          myRank: homeMyLeaderboardRank,
          cityLiveCount: homeCityLiveCount,
          nearestGym: homeNearestGym,
          gymCheckIn: isGymCheckInFresh(currentUser?.gymCheckIn)
            ? currentUser.gymCheckIn
            : null,
          gymLiveCount: homeGymLiveCount,
          showOnLeaderboard: currentUser?.showOnLeaderboard !== false,
          onToggleLeaderboard: handleToggleLeaderboard,
          onGymCheckIn: handleGymCheckIn,
          onOpenMap: () => {
            setActiveTab('map')
          },
          onOpenGymMap: mapMyGymId ? handleOpenGymMap : undefined,
        }}
        weeklyPact={weeklyPact}
        weeklyPactProgress={weeklyPactProgress}
        onPledgeWeeklyPact={onPledgeWeeklyPact}
        forcePactWizard={showPactWizard}
        weeklyPlan={weeklyPlan as import('../../domain/weeklyPlan').WeeklyPlanResult | null | undefined}
        weeklyPlanEnriching={weeklyPlanEnriching as boolean | undefined}
        onStartWeeklyPlan={onStartWeeklyPlan as ((plan: import('../../domain/weeklyPlan').WeeklyPlanResult) => void) | undefined}
        onPublishWeeklyPlanToFeed={onPublishWeeklyPlanToFeed as ((plan: import('../../domain/weeklyPlan').WeeklyPlanResult) => void) | undefined}
        onShareWeeklyPlanExternally={onShareWeeklyPlanExternally as ((plan: import('../../domain/weeklyPlan').WeeklyPlanResult) => void) | undefined}
      />
        </>
      )}

      {homeSubTab === 'feed' && (
        <>
      <WeeklyMomentsReel
        highlights={[
          ...(homeWeekDays >= 3 ? [{ label: `${homeWeekDays} días`, emoji: '🔥' }] : []),
          ...(homeWeekTrainedCount > 0 ? [{ label: `${homeWeekTrainedCount} entrenos`, emoji: '💪' }] : []),
          ...(activeSyncCount > 0 ? [{ label: `${activeSyncCount} syncs`, emoji: '🔄' }] : []),
          ...(liveCountForUI > 0 ? [{ label: 'En vivo', emoji: '🟢' }] : []),
        ]}
      />
      {(profilePostsFeed || []).length > 0 && (
        <SyncReplayGallery posts={profilePostsFeed} />
      )}
      {/* CINEMATIC REMASTERED FEED HEADER — the social heart of the GymPulse */}
      <div className="feed-header-cinematic sticky top-0 z-10 -mx-4 px-4 pt-3 pb-3">
        <div className="flex items-start justify-between gap-3 px-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-3xl drop-shadow">🔥</div>
              <div>
                <div className="feed-title-gradient">{BRAND_COPY.communityWallTitle}</div>
                <div className="text-[11px] text-[#9CA3AF] -mt-0.5 tracking-[0.3px]">
                  {(currentUser as { city?: string } | null)?.city
                    ? `${(currentUser as { city?: string }).city} y alrededores`
                    : 'Posts de entrenadores cerca de ti'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="text-[#9CA3AF] text-xs">Feed icónico de la comunidad</div>
              {liveCountForUI > 0 && (
                <span className="feed-live-pulse text-[9px] px-2.5 py-0.5 rounded-full bg-[#22c55e] text-black font-black shadow-sm ring-1 ring-[#22c55e]/60 flex items-center gap-1">
                  🟢 {liveCountForUI} EN VIVO AHORA
                </span>
              )}
              {activeSyncCount > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-bold border border-[#22c55e]/30">🔄 {activeSyncCount} EN SYNC</span>
              )}
            </div>
          </div>

          {/* Big beautiful Publish CTA */}
          <button 
            onClick={() => setShowFeedPostModal(true)} 
            className="mt-0.5 flex-shrink-0 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF671F] via-[#FF4F79] to-[#FF671F] text-black font-extrabold text-sm shadow-lg active:scale-[0.975] transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> PUBLICAR
          </button>
        </div>

        {/* Search + Filters row — elegant chips */}
        <div className="mt-3 flex items-center gap-2 px-1">
          <input 
            type="text" 
            value={feedSearch} 
            onChange={e => setFeedSearch(e.target.value)}
            placeholder="Buscar en el Muro..."
            className="form-input text-sm py-1.5 px-3 flex-1 rounded-2xl min-w-[90px]"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1 snap-x snap-mandatory touch-pan-x scrollbar-hide -mr-1 pr-1">
            <button 
              onClick={() => setFeedOnlyReal(!feedOnlyReal)}
              className={`feed-filter-chip snap-start ${feedOnlyReal ? 'active' : ''}`}
            >
              {feedOnlyReal ? '★ Solo Reales' : 'Reales'}
            </button>
            <button 
              onClick={() => setFeedOnlyLive(!feedOnlyLive)}
              className={`feed-filter-chip live snap-start ${feedOnlyLive ? 'active' : ''}`}
            >
              {feedOnlyLive ? '🟢 Solo Live' : '🟢 Live'}
            </button>
            <button 
              onClick={() => setFeedShowPinnedOnly(!feedShowPinnedOnly)}
              className={`feed-filter-chip snap-start ${feedShowPinnedOnly ? 'active' : ''}`}
            >
              {feedShowPinnedOnly ? '📌 Fijados' : '📌 Fijados'}
            </button>
            <button 
              onClick={() => { setFeedMaxProfiles(15); setFeedDisplayLimit(10); loadGlobalFeed(); if (!isDemoMode) loadRealProfiles(); }} 
              disabled={isLoadingFeed}
              className="feed-filter-chip snap-start text-[#9CA3AF] border-[#9CA3AF]/30 hover:text-white"
            >
              {isLoadingFeed ? '...' : '↻'}
            </button>
          </div>
        </div>

        {/* Active Sync FOMO strip — kept powerful but prettier */}
        {activeSyncPairs.length > 0 && (
          <div className="mt-2.5 px-1 text-[10px] text-[#22c55e]/90 flex items-center gap-1.5">
            <span className="font-bold tracking-wide">🔄 {activeSyncPairs.length} SYNC ACTIVO{activeSyncPairs.length>1?'S':''} AHORA</span>
            {activeSyncPairs.slice(0,2).map((pr, i) => (
              <span key={i} className="px-2 py-px rounded-full bg-[#22c55e]/10 text-[#22c55e] text-[9px] border border-[#22c55e]/20">{pr.names} <span className="opacity-60">{pr.vibe}%</span></span>
            ))}
            <span className="text-[9px] text-[#9CA3AF]/70">— el grafo vivo del rendimiento</span>
          </div>
        )}
      </div>

      {showFeedPublishSuccess && (
        <div className="feed-publish-success mb-3 mx-1 p-3 rounded-2xl text-center text-sm font-semibold flex items-center justify-center gap-2">
          ✨ ¡Publicado en el Muro! Tu post ya está vivo para toda la {BRAND_COPY.community}.
        </div>
      )}

      {/* PREMIUM "EN EL PULSO AHORA" LIVE STRIP — much more attractive, tappable, FOMO-inducing */}
      {liveTrainingNow.length > 0 && (
        <div className="mb-4 -mx-1 px-1">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="text-[9px] uppercase tracking-[1.5px] text-[#22c55e] font-black flex items-center gap-1.5">
              🔥 ENTRENANDO EN VIVO <span className="text-[10px] text-[#22c55e]/70 font-normal">({liveTrainingNow.length})</span>
              {liveTrainingNow.length > 5 && <span className="text-red-400 text-[8px] font-bold tracking-wider">HOT ZONE</span>}
            </div>
            <div className="text-[8px] text-[#9CA3AF]">Toca para unirte o re-sync</div>
          </div>
          <div className="feed-live-strip flex gap-2 overflow-x-auto pb-2 px-1 snap-x snap-mandatory">
            {[...liveTrainingNow].sort((a,b)=> {
              const aInNet = !!syncBonds[a.id] ? -1 : 0;
              const bInNet = !!syncBonds[b.id] ? -1 : 0;
              if (aInNet !== bInNet) return aInNet - bInNet;
              return (a.distance||0)-(b.distance||0);
            }).slice(0,5).map((u, idx) => (
              <motion.div 
                key={u.id} 
                onClick={() => {
                  if (syncBonds[u.id]) { try { triggerHaptic('medium') } catch {}; startSyncWith(u.id, u.name) } 
                  else { setActiveTab('explore'); if (u.trainingNow) setTimeout(() => startSyncWith(u.id, u.name), 130) }
                }} 
                whileHover={{scale:1.02, y:-1}} 
                whileTap={{scale:0.97}} 
                initial={{opacity:0, x:12}}
                animate={{opacity:1, x:0}}
                transition={{delay: idx*0.025}}
                className={`feed-live-card snap-start min-w-[118px] px-3 py-2 rounded-2xl text-[10px] cursor-pointer flex flex-col gap-0.5 ${syncBonds[u.id] ? 'red' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="font-extrabold text-white text-[12px] leading-none tracking-[-0.2px]">{(u.name || 'U').split(' ')[0]}</div>
                  {userLocation && u.distance < 900 && <span className="text-[8px] text-[#9CA3AF] tabular-nums">{u.distance.toFixed(0)}km</span>}
                  {userLocation && u.distance < 5 && <span className="text-[7px] bg-[#22c55e]/25 text-[#22c55e] px-1 rounded">CERCA</span>}
                </div>

                {!!syncBonds[u.id] && <div className="text-[7px] bg-[#FFD700] text-black px-1.5 rounded font-black self-start -mt-0.5 tracking-wider">⭐ RED • EN VIVO</div>}

                {u.seVaEnMin > 0 && (
                  <div className="text-orange-400 text-[9px] font-medium flex items-center gap-1">
                    {u.seVaEnMin < 15 ? '🔥 se va YA' : `se va en ${u.seVaEnMin}m`}
                    <div className="flex-1 h-px bg-orange-400/30 ml-1"><div className="h-px bg-orange-400" style={{width: `${Math.max(12, Math.min(100, (95 - u.seVaEnMin)/95 * 100))}%`}} /></div>
                  </div>
                )}

                {u.joinCount > 0 && <div className="text-[8px] text-[#22c55e]/70">+{u.joinCount} ya se unieron</div>}
                {u.trainingSyncWith && <div className="text-[8px] text-[#22c55e] font-bold">🔄 EN SYNC — ÚNETE</div>}

                <div className="text-[8px] text-[#22c55e]/60 mt-0.5 leading-none">{syncBonds[u.id] ? 'Re-sync y sube tu poder' : 'Ver en mapa / unirte'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Living Echoes / Highlights strip — remastered to feel legendary */}
      {(() => {
        const { echoesSource } = feedComputation;
        const src = echoesSource || [];
        const recentEchoes = [...src].filter((p: any) => (p.text || '').includes('HIGHLIGHT') || (p.text || '').includes('ENTRENASYNC COMPLETADO') || (p.text || '').includes('fortalece nuestra red')).sort((a,b)=>b.timestamp-a.timestamp).slice(0, 3);
        if (recentEchoes.length === 0) return null;
        return (
          <div className="mb-4 -mx-1 px-1">
            <div className="text-[8px] uppercase tracking-[1.5px] text-[#FFD700] font-black mb-1.5 flex items-center gap-1">⭐ HIGHLIGHTS DE LA RED — momentos de la {BRAND_COPY.community}</div>
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
              {recentEchoes.map((e: any) => (
                <div key={e.id} className="min-w-[158px] snap-start p-3 rounded-2xl text-[10px] border border-[#FFD700]/40 bg-gradient-to-br from-[#1a160f] to-[#111] text-[#f5e8c7]">
                  <div className="line-clamp-3 leading-snug">{(e.text || '').substring(0, 118)}...</div>
                  <div className="text-[8px] text-[#FFD700]/70 mt-1.5 font-medium">Highlight de Sync — se propaga y da estatus</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {(() => {
        // Use the top-level feedComputation (hook always called at top of component)
        const { feedPosts, allCommunityPosts, hasActiveFilter, rankingCtx } = feedComputation;

        if (isLoadingFeed && feedPosts.length === 0) {
          return (
            <div className="mt-4 px-1">
              <SkeletonList count={3} variant="feed" />
            </div>
          );
        }
        if (feedPosts.length === 0) {
          const cityLabel = currentUser?.city || 'tu ciudad'
          return (
            <div className="feed-empty-epic mx-1 mt-8 p-9 rounded-3xl text-center border">
              <div className="big-icon mb-1">🏋️</div>
              <div className="font-black text-3xl tracking-[-1.5px] mb-2">Sé el primero en {cityLabel}</div>
              <p className="text-sm text-[#9CA3AF] max-w-[300px] mx-auto mb-6 leading-relaxed">
                El {BRAND_COPY.communityWallTitle} de tu ciudad está esperando la primera voz. Publica en 1 toque y otros entrenadores te verán.
              </p>
              <div className="flex flex-col gap-2.5 max-w-[280px] mx-auto">
                {onQuickFeedTemplate && (
                  <button
                    type="button"
                    onClick={() => onQuickFeedTemplate(`¡Hola desde ${cityLabel}! Entrenando hoy — ¿quién se suma? 💪`)}
                    className="feed-publish-btn py-3 rounded-2xl text-base"
                  >
                    Publicar plantilla en 1 toque
                  </button>
                )}
                <button type="button" onClick={() => setShowFeedPostModal(true)} className="py-2.5 border border-[#FF671F]/40 text-[#FF671F] rounded-2xl text-sm active:bg-[#FF671F]/10">
                  Escribir mi propio post
                </button>
                {!isDemoMode && (
                  <button type="button" onClick={() => { setFeedMaxProfiles(18); loadGlobalFeed(); }} className="py-2.5 border border-[#2F2F35] text-[#9CA3AF] rounded-2xl text-sm active:bg-[#25252A]">
                    Cargar comunidad real
                  </button>
                )}
              </div>
            </div>
          );
        }

        return (
          <>
            <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mb-3 px-1 font-medium tracking-wider">
              <span>{feedPosts.length} posts {hasActiveFilter ? 'filtrados' : 'en el pulso'}</span>
              {(feedSearch || feedOnlyReal || feedShowPinnedOnly || feedOnlyLive) && <button onClick={() => { setFeedSearch(''); setFeedOnlyReal(false); setFeedShowPinnedOnly(false); setFeedOnlyLive(false); }} className="text-[#FF671F] underline active:text-white">limpiar filtros</button>}
            </div>

            {(() => {
              const pinnedInFeed = allCommunityPosts.filter((p: any) => p.pinned);
              if (pinnedInFeed.length > 0 && !feedShowPinnedOnly && !feedSearch && !feedOnlyReal && !feedOnlyLive) {
                return <div className="text-[9px] text-[#FF671F] mb-2 px-1 flex items-center gap-1">📌 <span className="font-medium">{pinnedInFeed.length} posts fijados</span> — destacados por la comunidad</div>;
              }
              return null;
            })()}

            <AnimatePresence>
            {feedPosts.map((post: any, idx: number) => {
              const isMine = !!(post.isMine || post.ownerId === effectiveUserId);
              const ownerProfile = isMine ? (currentUser as any) : realProfiles.find(r => r.id === post.ownerId);
              const owner = ownerProfile || { name: currentUser?.name || 'Tú', id: post.ownerId, photos: (currentUser as any)?.photos || [] };
              const liked = (post.likes || []).includes(effectiveUserId);
              const isOwnPost = post.ownerId === effectiveUserId || isMine;
              const isLivePost = (post.text || '').toLowerCase().includes('entrenando ahora') || (post.text || '').includes('me uno al live');
              const isSyncPost = (post.text || '').toLowerCase().includes('sincronizado') || post.isSyncStory || (post.text || '').includes('ENTRENASYNC');
              const isEcho = (post.text || '').includes('HIGHLIGHT') || (post.text || '').includes('Destacado de Sesión Sync') || (post.text || '').includes('Fui testigo');
              const rankBadges = rankingCtx ? getFeedRankBadges(post, rankingCtx) : null;

              return (
                <motion.div 
                  key={post.id} 
                  className={`muro-post mb-4 ${post.pinned ? 'muro-post--pinned' : ''} ${isSyncPost ? 'muro-post--sync' : isLivePost ? 'muro-post--live' : isEcho ? 'muro-post--echo' : ''} ${recentlyPublishedPostId === post.id ? 'ring-2 ring-[#FF671F] shadow-[0_0_0_1px_#FF671F,0_20px_50px_-12px_rgba(255,103,31,0.3)]' : ''} ${post.ownerId && syncBonds[post.ownerId] ? 'border-[#FFD700]/40' : ''}`}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22, delay: Math.min(idx * 0.012, 0.18) }}
                >
                  {/* HERO MEDIA — dominant, cinematic when photo exists */}
                  {post.photo && (
                    <div 
                      className="muro-post-hero-media cursor-pointer group"
                      onClick={() => setFeedPhotoModal({ url: post.photo, postId: post.id })}
                    >
                      <img src={post.photo} className="w-full object-cover" />
                      <div className="muro-post-hero-overlay" />
                      <div className="muro-post-hero-label">FOTO DEL MOMENTO</div>
                      <div className="muro-post-hero-zoom group-hover:bg-black/80">
                        <span>🔍</span> <span className="font-semibold">ampliar</span>
                      </div>
                    </div>
                  )}

                  <div className={post.photo ? "px-4 pt-1 pb-4" : "p-4"}>

                    {/* REMASTERED AUTHOR ROW — bigger, richer, with live rings */}
                    <div className="feed-author-row" onClick={() => setShowFullProfile(owner as any)} style={{cursor:'pointer'}}>
                      <div className={`feed-author-avatar ${ownerProfile?.trainingNow ? 'live' : ''}`}>
                        {owner.photos && owner.photos[0] ? (
                          <img src={owner.photos[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2F2F35] flex items-center justify-center text-lg">👤</div>
                        )}
                      </div>
                      <div className="feed-author-meta min-w-0">
                        <div className="feed-author-name">
                          {owner.name}
                          {ownerProfile && ownerProfile.city && <span className="text-[#9CA3AF] text-[11px] font-normal">· {ownerProfile.city}</span>}
                          {isMine && <span className="feed-author-badge bg-[#FFD700] text-black">TÚ</span>}
                          {ownerProfile && !isMine && realProfiles.some(rp => rp.id === post.ownerId) && <span className="feed-author-badge bg-[#FF671F] text-black">REAL</span>}
                          {post.pinned && <span className="feed-author-badge bg-[#FF671F]/15 text-[#FF671F]">📌 FIJADO</span>}
                          {Date.now() - post.timestamp < 3600000 && <span className="feed-author-badge bg-[#22c55e] text-black">NUEVO</span>}
                          {recentlyPublishedPostId === post.id && <span className="feed-author-badge bg-[#FF671F] text-black animate-pulse">ACABAS DE PUBLICAR</span>}
                        </div>
                        <div className="feed-author-badges">
                          {ownerProfile && ownerProfile.level && <span className="feed-author-badge bg-white/10 text-white/80 border border-white/10">{ownerProfile.level}</span>}
                          {ownerProfile?.liveStreak > 0 && <span className="feed-author-badge bg-[#22c55e] text-black">🔥 {ownerProfile.liveStreak}d LIVE</span>}
                          {ownerProfile?.trainingSyncWith && <span className="feed-author-badge bg-[#22c55e]/15 text-[#22c55e]">EN SYNC</span>}
                          {isSyncPost && <span className="feed-author-badge bg-[#22c55e] text-black">SYNC</span>}
                          {isEcho && <span className="feed-author-badge bg-[#FFD700] text-black">HIGHLIGHT</span>}
                          {ownerProfile?.trainingNow && <span className="feed-author-badge bg-[#22c55e] text-black">🟢 LIVE AHORA</span>}
                          {!isMine && rankBadges?.live && !ownerProfile?.trainingNow && (
                            <span className="feed-author-badge bg-[#22c55e]/90 text-black">🟢 LIVE</span>
                          )}
                          {!isMine && rankBadges?.near && (
                            <span className="feed-author-badge bg-[#3b82f6] text-white">📍 CERCA</span>
                          )}
                          {!isMine && rankBadges?.bond && (
                            <span className="feed-author-badge bg-[#FFD700]/20 text-[#FFD700]">RED</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-[#9CA3AF] tabular-nums whitespace-nowrap ml-auto">{getRelativeTime(post.timestamp)}</div>
                    </div>

                    {/* BODY — workout card or plain text */}
                    {post.postType === 'workout' && post.workoutPreview ? (
                      <div className="muro-post-body mt-2">
                        <WorkoutPostCard
                          preview={post.workoutPreview}
                          compact
                          postId={post.id}
                          reactions={post.reactions}
                          feedReactions={feedReactions[post.id]}
                          effectiveUserId={effectiveUserId}
                          onReact={(emo) => {
                            boostReaction(post.id, emo, post.ownerId || post.userId)
                            triggerHaptic('light')
                          }}
                          onCopyRoutine={
                            post.workoutId && !isMine
                              ? () =>
                                  handleCopyWorkoutFromPost(
                                    post.workoutId,
                                    post.workoutPreview?.title
                                  )
                              : undefined
                          }
                        />
                      </div>
                    ) : post.postType === 'nutrition' && post.nutritionPreview ? (
                      <div className="muro-post-body mt-2">
                        <NutritionPostCard preview={post.nutritionPreview} />
                      </div>
                    ) : (
                    <div className="muro-post-body">
                      {isEcho && <span className="text-[#FFD700] font-semibold block mb-0.5">👁️ Highlight de EntrenaSync — se propaga en la red</span>}
                      <div className="whitespace-pre-wrap">{post.text}</div>
                    </div>
                    )}

                    {/* ACTIONS BAR — likes, comments, owner tools */}
                    <div className="flex items-center gap-4 text-sm mt-1">
                      <button 
                        onClick={() => likeProfilePost(post.id, post.ownerId)}
                        className={`flex items-center gap-1.5 transition active:scale-95 ${liked ? 'text-[#FF671F]' : 'text-[#9CA3AF] hover:text-[#FF671F]'}`}
                      >
                        <motion.span animate={{ scale: liked ? [1, 1.45, 1] : 1 }} transition={{duration: 0.18}} className="text-lg leading-none">{liked ? '❤️' : '🤍'}</motion.span> 
                        <span className="font-extrabold tabular-nums text-sm">{(post.likes || []).length}</span>
                      </button>
                      <button 
                        onClick={() => openFullComments(post.id, post.ownerId, owner.name)}
                        className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#FF671F] active:scale-95"
                      >
                        💬 <span className="font-extrabold tabular-nums text-sm">{(post.comments || []).length}</span>
                      </button>

                      {isOwnPost && (
                        <>
                          <button onClick={() => togglePinPost(post.id, post.ownerId, post.pinned)} className={`ml-0.5 text-xs px-1.5 py-0.5 rounded active:scale-95 ${post.pinned ? 'text-[#FF671F]' : 'text-[#9CA3AF] active:text-[#FF671F]'}`} title={post.pinned ? 'Desfijar' : 'Fijar en el Muro global'}>📌</button>
                          <button onClick={() => deleteProfilePost(post.id, post.ownerId)} className="text-red-400 text-xs px-1.5 py-0.5 active:text-red-500 active:scale-95">🗑</button>
                        </>
                      )}
                      <button onClick={() => setShowFullProfile(owner as any)} className="ml-auto text-[11px] text-[#FF671F] hover:text-white font-semibold tracking-wide active:underline">VER PERFIL →</button>
                    </div>

                    {/* ALIVE REACTIONS — big, satisfying, pop on tap */}
                    <div className="feed-reaction-bar">
                      {['🔥','💪','❤️','👏'].map(emo => {
                        const postReactors = post.reactions?.[emo] || []
                        const count = postReactors.length || (feedReactions[post.id]?.[emo] || 0)
                        const active = postReactors.includes(effectiveUserId) || ((feedReactions[post.id]?.[emo] || 0) > 0)
                        return (
                          <button 
                            key={emo}
                            onClick={() => { boostReaction(post.id, emo, post.ownerId || post.userId); triggerHaptic('light'); }}
                            className={`feed-reaction ${active ? 'active' : ''}`}
                          >
                            <span className="text-base">{emo}</span>
                            {count > 0 && <span className="count">{count}</span>}
                          </button>
                        )
                      })}
                    </div>

                    {/* Live FOMO callout */}
                    {isLivePost && (post.comments || []).length > 0 && (
                      <div className="mt-2 text-[9px] bg-[#22c55e]/8 text-[#22c55e] px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium">
                        🔥 {(post.comments || []).length} personas se unieron a este pulso • ¡Únete desde el mapa o el strip de arriba!
                      </div>
                    )}

                    {/* COMMENTS PREVIEW — elegant and tappable to open full thread */}
                    {(post.comments || []).length > 0 && (
                      <div onClick={() => openFullComments(post.id, post.ownerId, owner.name)} className="feed-comments-preview cursor-pointer">
                        {(post.comments || []).slice(-2).map((c: any) => (
                          <div key={c.id} className="feed-comment-row">
                            <span className="font-semibold text-white/85 text-[10px] mt-px flex-shrink-0">{c.userName}</span> 
                            <span className="truncate text-[10px] text-white/70 leading-snug">{c.text}</span>
                          </div>
                        ))}
                        {(post.comments || []).length > 2 && <div className="feed-comment-more">+{(post.comments || []).length-2} comentarios más — ver hilo completo</div>}
                      </div>
                    )}

                    {activeComment?.postId === post.id && (
                      <div className="mt-2 pt-2 border-t border-[#2F2F35]/60 flex items-center gap-2">
                        <input
                          type="text"
                          value={commentDraft}
                          onChange={e => setCommentDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                          placeholder={owner.name ? `Comentar en el muro de ${owner.name}...` : 'Escribe un comentario...'}
                          className="flex-1 form-input text-sm py-1.5"
                          maxLength={200}
                          autoFocus
                        />
                        <button
                          onClick={submitComment}
                          disabled={!commentDraft.trim()}
                          className="text-[#FF671F] text-sm font-semibold px-3 disabled:opacity-40 active:scale-95"
                        >
                          Enviar
                        </button>
                        <button onClick={cancelComment} className="text-[#9CA3AF] text-xs px-1">✕</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>

            {feedPosts.length < allCommunityPosts.length && (
              <div className="text-center mt-2 mb-4">
                <button
                  onClick={() => {
                    if (!isDemoMode && hasMoreGlobalFeed) loadGlobalFeed(true).catch(() => {})
                    setFeedDisplayLimit(feedDisplayLimit + 12)
                  }}
                  className="text-sm px-6 py-2 rounded-2xl border border-[#FF671F]/40 text-[#FF671F] active:bg-[#FF671F]/10 active:scale-95 font-medium"
                >
                  Cargar más posts de la comunidad →
                </button>
              </div>
            )}
          </>
        );
      })()}
        </>
      )}
    </div>
  )
}
