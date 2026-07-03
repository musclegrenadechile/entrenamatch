import { motion } from 'framer-motion'
import { Edit2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'
import { BRAND_COPY } from '../../constants/brandCopy'

export function ProfileHeaderSection(props: ProfileTabProps) {
  const {
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
    currentUser,
    setLastSync,
    lastSync,
    handleLogout,
    openProfileEditor,
  } = profileTabBindings(props)

  const syncAgeSec = lastSync
    ? Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))
    : null

  return (
    <>
      {showDailyPulseBanner && dailyPulse && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="em-v2-profile-banner mx-4 mt-3 p-3.5 rounded-2xl border flex items-center gap-3"
        >
          <div className="text-2xl" aria-hidden>🌅</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#FF671F] tracking-tight">
              {BRAND_COPY.profile.dailyChallengeActivated}
            </div>
            <div className="text-xs text-[#9CA3AF] truncate">
              Streak {dailyPulse.trainingStreak}d · {dailyPulse.currentChallenge?.title}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              try { triggerHaptic('light') } catch {}
              setShowDailyPulseBanner(false)
            }}
            className="em-v2-profile-banner__cta text-xs px-3 py-1.5 rounded-full font-bold"
          >
            {BRAND_COPY.profile.seeDailyChallenge}
          </button>
        </motion.div>
      )}

      <div className="em-v2-profile-header px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="em-v2-profile-header__eyebrow">Tu perfil</p>
          <h1 className="em-v2-profile-header__title">{BRAND_COPY.profile.headerTitle}</h1>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isDemoMode && (
            <button
              type="button"
              onClick={async () => {
                setIsSyncingProfile(true)
                try {
                  await loadRealProfiles()
                  await loadRealSessions()
                  await loadMyFeedbacks()
                  if (firebaseUser?.uid) {
                    try {
                      const rp = await getUserProfile(firebaseUser.uid)
                      if (rp && rp.name) {
                        const merged: CurrentUser = {
                          ...currentUser,
                          id: 'me' as CurrentUser['id'],
                          name: rp.name,
                          age: rp.age,
                          gender: rp.gender,
                          city: rp.city,
                          country: rp.country,
                          bio: rp.bio,
                          photos: rp.photos || [],
                          trainingTypes: rp.trainingTypes || [],
                          goals: rp.goals || [],
                          level: rp.level || 'Intermedio',
                          intensity: rp.intensity || 'Moderado',
                          availability: rp.availability || ['Tarde'],
                          lat: rp.lat || currentUser?.lat || -33.0153,
                          lng: rp.lng || currentUser?.lng || -71.5528,
                          legalConsents: rp.legalConsents || currentUser?.legalConsents,
                        }
                        saveUser(merged)
                      }
                    } catch { /* ignore */ }
                  }
                  setLastSync(new Date())
                  toast.success('Datos sincronizados')
                } finally {
                  setIsSyncingProfile(false)
                }
              }}
              disabled={isSyncingProfile}
              className="em-v2-profile-header__sync"
              title="Sincronizar datos"
            >
              <RefreshCw size={12} className={isSyncingProfile ? 'animate-spin' : ''} />
              {isSyncingProfile ? '…' : syncAgeSec != null ? `${syncAgeSec}s` : 'Sync'}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="em-v2-profile-header__logout"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={openProfileEditor}
            className="em-v2-profile-header__edit"
          >
            <Edit2 size={12} /> Editar
          </button>
        </div>
      </div>
    </>
  )
}