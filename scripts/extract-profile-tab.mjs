import fs from 'fs'
import path from 'path'

const appPath = path.join(process.cwd(), 'src/App.tsx')
const lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/)

const start = lines.findIndex((l) => l.includes("activeTab === 'profile' && currentUser"))
const end = lines.findIndex((l, i) => i > start && l.includes('DUPLICATE ORPHAN PROFILE'))

if (start < 0 || end < 0) {
  console.error('markers not found', { start, end })
  process.exit(1)
}

const innerStart = start + 1
const innerEnd = end - 3
const inner = lines.slice(innerStart, innerEnd + 1)

const header = `// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Download, Dumbbell, Edit2, Heart, Mic, Pause, Play, RefreshCw, Send, Star, User, Users, Zap,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { APP_VERSION } from '../../constants'
import { ProfileSectionNav, TuRedPowerCard } from './index'
import type { ProfileSection } from './index'

/** Context bag passed from App — typed loosely until App.tsx drops @ts-nocheck */
export type ProfileTabProps = Record<string, any>

export function ProfileTab(props: ProfileTabProps) {
  const p = props
  const {
    currentUser,
    showDailyPulseBanner,
    dailyPulse,
    triggerHaptic,
    setShowDailyPulseBanner,
    isDemoMode,
    isSyncingProfile,
    setIsSyncingProfile,
    loadRealProfiles,
    loadRealSessions,
    loadMyFeedbacks,
    firebaseUser,
    getUserProfile,
    saveUser,
    setLastSync,
    lastSync,
    handleLogout,
    openProfileEditor,
    profileSection,
    setProfileSection,
    networkStats,
    syncBonds,
    setMapForceTick,
    saveUserWithRealSync,
    setActiveTab,
    matches,
    squads,
    liveCountForUI,
    liveTrainingNow,
    profilePosts,
    effectiveUserId,
    getUnlockedGadgets,
    getTodayStr,
    setDailyPulse,
    debugLogsRef,
    SEED_PROFILES,
    realProfiles,
    startSyncWith,
    tryAutoStartSync,
    setShowFullProfile,
    refreshDailyPulse,
    completeDailyChallenge,
    getNextGadget,
    muroComposerRef,
    loadingPersonalMuro,
    setLoadingPersonalMuro,
    loadProfilePosts,
    processIncomingLiveJoins,
    muroComposerText,
    setMuroComposerText,
    muroComposerPhoto,
    setMuroComposerPhoto,
    muroPhotoUploading,
    muroPhotoUploadProgress,
    muroPublishing,
    setMuroPublishing,
    createProfilePost,
    handleMuroPhotoFile,
    deleteProfilePost,
    togglePinPost,
    toggleLikePost,
    addReactionToPost,
    activeComment,
    commentDraft,
    setCommentDraft,
    openFullComments,
    submitComment,
    cancelComment,
    deleteCommentFromPost,
    isEditingBio,
    setIsEditingBio,
    editBioDraft,
    setEditBioDraft,
    saveBioEdit,
    testIntegrityNonce,
    setTestIntegrityNonce,
    checkPlayIntegrity,
    integrityChecking,
    lastIntegrity,
    toggleLiveTraining,
    isTogglingLive,
    syncPartnerId,
    showSyncArena,
    setShowSyncArena,
    syncVibe,
    syncStartedAt,
    setShowLegal,
    setShowVerificationFlow,
    setVerificationStep,
    feedbackType,
    setFeedbackType,
    feedbackRating,
    setFeedbackRating,
    feedbackText,
    setFeedbackText,
    myFeedbacks,
    loadingMyFeedbacks,
    db,
    requestWebNotificationPermission,
    requestNativePushPermission,
    PushNotifications,
    notifPrefs,
    setNotifPrefs,
    setShowPwaInstall,
  } = p

  return (
`

const footer = `  )
}
`

const outPath = path.join(process.cwd(), 'src/components/profile/ProfileTab.tsx')
const body = inner.map((line) => line.replace(/^          /, '    ')).join('\n')
fs.writeFileSync(outPath, header + body + '\n' + footer)

const replacement = `        {activeTab === 'profile' && currentUser && (
          <ProfileTab
            currentUser={currentUser}
            showDailyPulseBanner={showDailyPulseBanner}
            dailyPulse={dailyPulse}
            triggerHaptic={triggerHaptic}
            setShowDailyPulseBanner={setShowDailyPulseBanner}
            isDemoMode={isDemoMode}
            isSyncingProfile={isSyncingProfile}
            setIsSyncingProfile={setIsSyncingProfile}
            loadRealProfiles={loadRealProfiles}
            loadRealSessions={loadRealSessions}
            loadMyFeedbacks={loadMyFeedbacks}
            firebaseUser={firebaseUser}
            getUserProfile={getUserProfile}
            saveUser={saveUser}
            setLastSync={setLastSync}
            lastSync={lastSync}
            handleLogout={handleLogout}
            openProfileEditor={openProfileEditor}
            profileSection={profileSection}
            setProfileSection={setProfileSection}
            networkStats={networkStats}
            syncBonds={syncBonds}
            setMapForceTick={setMapForceTick}
            saveUserWithRealSync={saveUserWithRealSync}
            setActiveTab={setActiveTab}
            matches={matches}
            squads={squads}
            liveCountForUI={liveCountForUI}
            liveTrainingNow={liveTrainingNow}
            profilePosts={profilePosts}
            effectiveUserId={effectiveUserId}
            getUnlockedGadgets={getUnlockedGadgets}
            getTodayStr={getTodayStr}
            setDailyPulse={setDailyPulse}
            debugLogsRef={debugLogsRef}
            SEED_PROFILES={SEED_PROFILES}
            realProfiles={realProfiles}
            startSyncWith={startSyncWith}
            tryAutoStartSync={tryAutoStartSync}
            setShowFullProfile={setShowFullProfile}
            refreshDailyPulse={refreshDailyPulse}
            completeDailyChallenge={completeDailyChallenge}
            getNextGadget={getNextGadget}
            muroComposerRef={muroComposerRef}
            loadingPersonalMuro={loadingPersonalMuro}
            setLoadingPersonalMuro={setLoadingPersonalMuro}
            loadProfilePosts={loadProfilePosts}
            processIncomingLiveJoins={processIncomingLiveJoins}
            muroComposerText={muroComposerText}
            setMuroComposerText={setMuroComposerText}
            muroComposerPhoto={muroComposerPhoto}
            setMuroComposerPhoto={setMuroComposerPhoto}
            muroPhotoUploading={muroPhotoUploading}
            muroPhotoUploadProgress={muroPhotoUploadProgress}
            muroPublishing={muroPublishing}
            setMuroPublishing={setMuroPublishing}
            createProfilePost={createProfilePost}
            handleMuroPhotoFile={handleMuroPhotoFile}
            deleteProfilePost={deleteProfilePost}
            togglePinPost={togglePinPost}
            toggleLikePost={toggleLikePost}
            addReactionToPost={addReactionToPost}
            activeComment={activeComment}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            openFullComments={openFullComments}
            submitComment={submitComment}
            cancelComment={cancelComment}
            deleteCommentFromPost={deleteCommentFromPost}
            isEditingBio={isEditingBio}
            setIsEditingBio={setIsEditingBio}
            editBioDraft={editBioDraft}
            setEditBioDraft={setEditBioDraft}
            saveBioEdit={saveBioEdit}
            testIntegrityNonce={testIntegrityNonce}
            setTestIntegrityNonce={setTestIntegrityNonce}
            checkPlayIntegrity={checkPlayIntegrity}
            integrityChecking={integrityChecking}
            lastIntegrity={lastIntegrity}
            toggleLiveTraining={toggleLiveTraining}
            isTogglingLive={isTogglingLive}
            syncPartnerId={syncPartnerId}
            showSyncArena={showSyncArena}
            setShowSyncArena={setShowSyncArena}
            syncVibe={syncVibe}
            syncStartedAt={syncStartedAt}
            setShowLegal={setShowLegal}
            setShowVerificationFlow={setShowVerificationFlow}
            setVerificationStep={setVerificationStep}
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            feedbackRating={feedbackRating}
            setFeedbackRating={setFeedbackRating}
            feedbackText={feedbackText}
            setFeedbackText={setFeedbackText}
            myFeedbacks={myFeedbacks}
            loadingMyFeedbacks={loadingMyFeedbacks}
            db={db}
            requestWebNotificationPermission={requestWebNotificationPermission}
            requestNativePushPermission={requestNativePushPermission}
            PushNotifications={PushNotifications}
            notifPrefs={notifPrefs}
            setNotifPrefs={setNotifPrefs}
            setShowPwaInstall={setShowPwaInstall}
          />
        )}`

const newLines = [...lines.slice(0, start), replacement, ...lines.slice(end)]
fs.writeFileSync(appPath, newLines.join('\n'))

console.log('ProfileTab.tsx written,', inner.length, 'lines extracted')
console.log('App.tsx updated at lines', start + 1, '-', end)
