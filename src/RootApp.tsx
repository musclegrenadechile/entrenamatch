import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useProfile } from './contexts/ProfileContext'
import { useDemoAuth } from './hooks/useDemoAuth'
import { BootShell } from './boot/BootShell'
import { PublicAuthPage } from './pages/PublicAuthPage'
import { markQuickDemoSession, QUICK_DEMO_USER } from './utils/quickDemo'
import { BOOT_TIMEOUT_MS, bootMessages, type BootPhase } from './boot/bootConstants'
import App from './App'

export default function RootApp() {
  const { currentUser: firebaseUser, loading: authBooting, isDemoMode, setDemoMode } = useAuth()
  const { currentUser: localProfile, profileHydrated, saveUser, setShowOnboarding } = useProfile()
  const { isDemoAuthenticated } = useDemoAuth()
  const [bootTimedOut, setBootTimedOut] = useState(false)
  const [authSplashDismissed, setAuthSplashDismissed] = useState(false)
  const appSessionUidRef = useRef<string | null>(null)

  // Latch uid synchronously so transient auth gaps never unmount App (Android boot loop).
  if (firebaseUser?.uid) {
    appSessionUidRef.current = firebaseUser.uid
  }

  const isAuthenticated = useMemo(() => {
    if (isDemoMode) return !!localProfile || isDemoAuthenticated
    return !!firebaseUser
  }, [isDemoMode, localProfile, isDemoAuthenticated, firebaseUser])

  useEffect(() => {
    if (!authBooting || firebaseUser?.uid || appSessionUidRef.current) {
      setAuthSplashDismissed(false)
      return undefined
    }
    const t = setTimeout(() => setAuthSplashDismissed(true), BOOT_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [authBooting, firebaseUser?.uid])

  const bootPhase: BootPhase | null = useMemo(() => {
    if (isDemoMode) return null
    if (authSplashDismissed) return null
    if (authBooting && !firebaseUser?.uid && !appSessionUidRef.current) return 'auth'
    return null
  }, [isDemoMode, authBooting, firebaseUser?.uid, authSplashDismissed])

  const isBooting = bootPhase !== null
  const profileBootOverlay =
    !isDemoMode && !!firebaseUser?.uid && !profileHydrated && !authBooting

  const shouldMountApp = isDemoMode
    ? isAuthenticated
    : !!firebaseUser?.uid || !!appSessionUidRef.current

  useEffect(() => {
    if (!isBooting && !profileBootOverlay) {
      setBootTimedOut(false)
      return undefined
    }
    setBootTimedOut(false)
    const t = setTimeout(() => setBootTimedOut(true), BOOT_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isBooting, bootPhase, profileBootOverlay])

  const handleBootRetry = useCallback(() => {
    setBootTimedOut(false)
    window.location.reload()
  }, [])

  const handleBootDemo = useCallback(() => {
    markQuickDemoSession()
    setDemoMode(true)
    saveUser(QUICK_DEMO_USER)
    setTimeout(() => setShowOnboarding(true), 80)
    setBootTimedOut(false)
  }, [setDemoMode, saveUser, setShowOnboarding])

  if (isBooting && bootPhase) {
    const { message, submessage } = bootMessages(bootPhase, bootTimedOut)
    return (
      <BootShell
        message={message}
        submessage={submessage}
        timedOut={bootTimedOut}
        onRetry={handleBootRetry}
        onDemo={handleBootDemo}
      />
    )
  }

  if (!shouldMountApp) {
    return <PublicAuthPage />
  }

  const profileBoot = bootMessages('profile', bootTimedOut)

  return (
    <>
      {profileBootOverlay && (
        <div className="fixed inset-0 z-[9999]">
          <BootShell
            message={profileBoot.message}
            submessage={profileBoot.submessage}
            timedOut={bootTimedOut}
            onRetry={handleBootRetry}
            onDemo={handleBootDemo}
          />
        </div>
      )}
      <App />
    </>
  )
}
