import { motion } from 'framer-motion'
import { Edit2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import { ProfileSectionNav } from './ProfileSectionNav'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

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
    profileSection,
    setProfileSection,
  } = profileTabBindings(props)

  return (
    <>
{/* Daily Pulse Banner - strong reason to engage immediately on open */}
{showDailyPulseBanner && dailyPulse && (
  <motion.div 
    initial={{ opacity: 0, y: -10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="daily-pulse-banner mx-4 mt-3 p-3.5 rounded-2xl border flex items-center gap-3 shadow-sm"
  >
    <div className="text-2xl">🌅</div>
    <div className="flex-1">
      <div className="text-sm font-bold text-[#FF671F] tracking-tight">¡GymPulse Diario activado!</div>
      <div className="text-xs text-[#9CA3AF]">Streak {dailyPulse.trainingStreak}d • {dailyPulse.currentChallenge?.title}</div>
    </div>
    <button 
      onClick={() => { 
        try { triggerHaptic('light') } catch {} 
        setShowDailyPulseBanner(false); 
      }} 
      className="text-xs px-3.5 py-1.5 bg-[#FF671F] text-black rounded-full font-bold active:bg-[#E55A1A] active:scale-95 transition-transform shadow"
    >
      Ver Pulso
    </button>
  </motion.div>
)}
{/* Sticky header with escape hatches - polished aesthetics */}
<div className="sticky top-0 z-20 bg-[#0D0D10]/95 backdrop-blur-xl border-b border-[#2F2F35] px-4 py-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div>
      <div className="section-header text-xl">Tu legado 🔥</div>
      <div className="text-[10px] text-[#9CA3AF] -mt-1">Tu red de rendimiento • comparte y crece</div>
      {!isDemoMode && <div className="live-pill !text-[8px] !py-0.5 !mt-0.5">REAL • Firebase</div>}
    </div>
    {!isDemoMode && (
      <button onClick={async () => { 
        setIsSyncingProfile(true);
        try {
          await loadRealProfiles(); 
          await loadRealSessions(); 
          await loadMyFeedbacks(); 
          if (firebaseUser?.uid) {
            try {
              const rp = await getUserProfile(firebaseUser.uid);
              if (rp && rp.name) {
                const merged: CurrentUser = {
                  ...currentUser,
                  id: 'me' as any,
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
                };
                saveUser(merged);
              }
            } catch {}
          }
          setLastSync(new Date()); 
          toast.success('Datos reales sincronizados') 
        } finally {
          setIsSyncingProfile(false);
        }
      }} disabled={isSyncingProfile} className="text-[10px] px-2.5 py-1 rounded-xl border border-[#FF671F]/40 text-[#FF671F] active:bg-[#FF671F]/10 disabled:opacity-60 flex items-center gap-1">
        <RefreshCw size={12} className={isSyncingProfile ? 'animate-spin' : ''} /> {isSyncingProfile ? 'Sync...' : 'Sincronizar'}
      </button>
    )}
    {lastSync && <span className="text-[9px] text-[#9CA3AF] ml-1">hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
  </div>
  <div className="flex gap-2">
    <button type="button" onClick={() => void handleLogout()} className="text-[10px] px-3 py-1 rounded-2xl border border-[#3f2a2a] text-[#f87171] active:bg-[#1f1616] active:text-white">Cambiar cuenta</button>
    <button onClick={openProfileEditor} className="text-[10px] px-3 py-1 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#E55A1A] text-black font-semibold active:opacity-90 flex items-center gap-1"><Edit2 size={13} /> Personalizar</button>
  </div>
</div>

<ProfileSectionNav active={profileSection} onChange={setProfileSection} />

    </>
  )
}
