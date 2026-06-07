/**
 * Wire ExploreLivePanel + HomeTab into App.tsx (replace inline JSX blocks)
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const appPath = path.join(root, 'src/App.tsx')
let content = fs.readFileSync(appPath, 'utf8')
const lines = content.split(/\r?\n/)

const exploreStart = lines.findIndex((l) =>
  l.includes('LIVE TRAINING BANNER - ALWAYS VISIBLE')
)
if (exploreStart < 0) throw new Error('explore banner marker not found')
const exploreBlockStart = exploreStart - 1 // comment line before
let exploreEnd = -1
for (let i = exploreStart; i < lines.length; i++) {
  if (lines[i].trim() === ')}' && lines.slice(i + 1, i + 6).some((l) => l.includes('ExploreTab'))) {
    exploreEnd = i
    break
  }
}
if (exploreEnd < 0) throw new Error('explore block end not found')

const homeStart = lines.findIndex((l) =>
  l.includes('GLOBAL FEED TAB - Muro Comunitario')
)
if (homeStart < 0) throw new Error('home marker not found')
const homeBlockStart = homeStart
let homeEnd = -1
for (let i = homeStart; i < lines.length; i++) {
  if (
    lines[i].trim() === ')}' &&
    lines.slice(i + 1, i + 6).some((l) => l.includes('FEED COMPOSER'))
  ) {
    homeEnd = i
    break
  }
}
if (homeEnd < 0) throw new Error('home block end not found')

const exploreReplacement = `        {/* ===== EXPLORE live banner + map (ExploreLivePanel) ===== */}
        {activeTab === 'explore' && (
          <ExploreLivePanel
            liveCountForUI={liveCountForUI}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            dailyPulse={dailyPulse}
            activeSyncCount={activeSyncCount}
            currentUser={currentUser}
            userLocation={userLocation}
            joiningSyncWith={joiningSyncWith}
            setShowFullProfile={setShowFullProfile}
            handleSwipe={handleSwipe}
            setShowLiveMap={setShowLiveMap}
            setActiveTab={setActiveTab}
            setShowLiveModal={setShowLiveModal}
            triggerHaptic={triggerHaptic}
            showLiveMap={showLiveMap}
            networkStats={networkStats}
            gymPulseMapRef={gymPulseMapRef}
            mapLiveTrainingNow={mapLiveTrainingNow}
            effectiveUserId={effectiveUserId}
            ritualRipples={ritualRipples}
            partnerLocations={partnerLocations}
            echoPins={echoPins}
            mapNearOnly={mapNearOnly}
            selectedMapZone={selectedMapZone}
            showOnlyLegends={showOnlyLegends}
            showPartners={showPartners}
            mapMyGymOnly={mapMyGymOnly}
            mapMyGymId={mapMyGymId}
            mapForceTick={mapForceTick}
            isDeveloper={isDeveloper}
            isPlacingPartner={isPlacingPartner}
            isQuickAddPartner={isQuickAddPartner}
            setMapNearOnly={setMapNearOnly}
            setSelectedMapZone={setSelectedMapZone}
            setShowOnlyLegends={setShowOnlyLegends}
            setShowPartners={setShowPartners}
            setMapForceTick={setMapForceTick}
            openAddPartner={openAddPartner}
            openManagePartners={openManagePartners}
            setIsQuickAddPartner={setIsQuickAddPartner}
            logoutDeveloper={logoutDeveloper}
            addPartnerAtCurrentCenter={addPartnerAtCurrentCenter}
            reloadPartners={reloadPartners}
            spawnDevTestLives={spawnDevTestLives}
            clearDevTestLives={clearDevTestLives}
            startSyncWith={startSyncWith}
            witnessEchoPin={witnessEchoPin}
            witnessRipple={witnessRipple}
            isQuickAddPartnerRef={isQuickAddPartnerRef}
            isDemoMode={isDemoMode}
            db={db}
            setPartnerLocations={setPartnerLocations}
            startEditPartner={startEditPartner}
            setPartnerFormLat={setPartnerFormLat}
            setPartnerFormLng={setPartnerFormLng}
            setIsPlacingPartner={setIsPlacingPartner}
            setEditingPartner={setEditingPartner}
            setPartnerForm={setPartnerForm}
            setShowPartnerForm={setShowPartnerForm}
            devTestLives={devTestLives}
            toast={toast}
            partnerForm={partnerForm}
            editingPartner={editingPartner}
            showPartnerForm={showPartnerForm}
            isSavingPartner={isSavingPartner}
            savePartner={savePartner}
            deletePartner={deletePartner}
            partnerFormLat={partnerFormLat}
            partnerFormLng={partnerFormLng}
            handlePartnerEditFromMap={handlePartnerEditFromMap}
            cancelPartnerForm={cancelPartnerForm}
            partnerFormName={partnerFormName}
            partnerFormType={partnerFormType}
            partnerFormAddress={partnerFormAddress}
            setPartnerFormName={setPartnerFormName}
            setPartnerFormType={setPartnerFormType}
            setPartnerFormAddress={setPartnerFormAddress}
            showAddPartnerForm={showAddPartnerForm}
            editingPartnerId={editingPartnerId}
            setEditingPartnerId={setEditingPartnerId}
            setShowAddPartnerForm={setShowAddPartnerForm}
            partnerLocationsRef={partnerLocationsRef}
            requestUserLocation={requestUserLocation}
            showDevLogin={showDevLogin}
            setShowDevLogin={setShowDevLogin}
            devPassword={devPassword}
            setDevPassword={setDevPassword}
            loginAsDeveloper={loginAsDeveloper}
            showManagePartners={showManagePartners}
            setShowManagePartners={setShowManagePartners}
            partnerLogoPreview={partnerLogoPreview}
            partnerLogoFile={partnerLogoFile}
            setPartnerLogoFile={setPartnerLogoFile}
            setPartnerLogoPreview={setPartnerLogoPreview}
            handlePartnerLogoSelect={handlePartnerLogoSelect}
            CapacitorCamera={CapacitorCamera}
            uploadPartnerLogoIfNeeded={uploadPartnerLogoIfNeeded}
          />
        )}`

const homeReplacement = `        {/* ===== HOME — DailyRitual + Muro (HomeTab) ===== */}
        {activeTab === 'home' && (
          <HomeTab
            currentUser={currentUser}
            homeWeekDays={homeWeekDays}
            homeWeekTrainedCount={homeWeekTrainedCount}
            homeTeamMembers={homeTeamMembers}
            liveCountForUI={liveCountForUI}
            activeSyncCount={activeSyncCount}
            isTogglingLive={isTogglingLive}
            toggleLiveTraining={toggleLiveTraining}
            setActiveTab={setActiveTab}
            setShowLiveMap={setShowLiveMap}
            startSyncWith={startSyncWith}
            setActiveChat={setActiveChat}
            setShowEntrenaLogModal={setShowEntrenaLogModal}
            fuelProfile={fuelProfile}
            fuelTodayTotals={fuelTodayTotals}
            fuelPostWorkoutTip={fuelPostWorkoutTip}
            setShowFuelSetupModal={setShowFuelSetupModal}
            setShowFuelLogModal={setShowFuelLogModal}
            homeCityChallengeMerged={homeCityChallengeMerged}
            homeLocalLeaderboard={homeLocalLeaderboard}
            homeMyLeaderboardRank={homeMyLeaderboardRank}
            homeCityLiveCount={homeCityLiveCount}
            homeNearestGym={homeNearestGym}
            homeGymLiveCount={homeGymLiveCount}
            handleToggleLeaderboard={handleToggleLeaderboard}
            handleGymCheckIn={handleGymCheckIn}
            mapMyGymId={mapMyGymId}
            handleOpenGymMap={handleOpenGymMap}
            setShowFeedPostModal={setShowFeedPostModal}
            feedSearch={feedSearch}
            setFeedSearch={setFeedSearch}
            feedOnlyReal={feedOnlyReal}
            setFeedOnlyReal={setFeedOnlyReal}
            feedOnlyLive={feedOnlyLive}
            setFeedOnlyLive={setFeedOnlyLive}
            feedShowPinnedOnly={feedShowPinnedOnly}
            setFeedShowPinnedOnly={setFeedShowPinnedOnly}
            feedMaxProfiles={feedMaxProfiles}
            setFeedMaxProfiles={setFeedMaxProfiles}
            feedDisplayLimit={feedDisplayLimit}
            setFeedDisplayLimit={setFeedDisplayLimit}
            loadGlobalFeed={loadGlobalFeed}
            isDemoMode={isDemoMode}
            loadRealProfiles={loadRealProfiles}
            isLoadingFeed={isLoadingFeed}
            activeSyncPairs={activeSyncPairs}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            triggerHaptic={triggerHaptic}
            showFeedPublishSuccess={showFeedPublishSuccess}
            feedComputation={feedComputation}
            hasMoreGlobalFeed={hasMoreGlobalFeed}
            effectiveUserId={effectiveUserId}
            setShowFullProfile={setShowFullProfile}
            boostReaction={boostReaction}
            openFullComments={openFullComments}
            activeComment={activeComment}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            submitComment={submitComment}
            cancelComment={cancelComment}
            realProfiles={realProfiles}
            recentlyPublishedPostId={recentlyPublishedPostId}
            setFeedPhotoModal={setFeedPhotoModal}
            getRelativeTime={getRelativeTime}
            handleCopyWorkoutFromPost={handleCopyWorkoutFromPost}
            togglePinPost={togglePinPost}
            deleteProfilePost={deleteProfilePost}
            toast={toast}
          />
        )}`

const newLines = [
  ...lines.slice(0, exploreBlockStart),
  ...exploreReplacement.split('\n'),
  ...lines.slice(exploreEnd + 1, homeBlockStart),
  ...homeReplacement.split('\n'),
  ...lines.slice(homeEnd + 1),
]

content = newLines.join('\n')

if (!content.includes("import { ExploreLivePanel }")) {
  content = content.replace(
    "import { ExploreTab } from './components/explore/ExploreTab'",
    "import { ExploreTab } from './components/explore/ExploreTab'\nimport { ExploreLivePanel } from './components/explore/ExploreLivePanel'"
  )
}
if (!content.includes("import { HomeTab }")) {
  content = content.replace(
    "import { DailyRitualHome } from './components/home'",
    "import { HomeTab } from './components/home/HomeTab'"
  )
}

fs.writeFileSync(appPath, content)
console.log(
  `App.tsx: replaced explore lines ${exploreBlockStart + 1}-${exploreEnd + 1}, home lines ${homeBlockStart + 1}-${homeEnd + 1}`
)
console.log('New line count:', newLines.length)
