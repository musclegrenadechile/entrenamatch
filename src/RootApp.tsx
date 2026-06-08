import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useProfile } from './contexts/ProfileContext'
import { useDemoAuth } from './hooks/useDemoAuth'
import { BootShell } from './boot/BootShell'
import { PublicAuthPage } from './pages/PublicAuthPage'
import { markQuickDemoSession, QUICK_DEMO_USER } from './utils/quickDemo'
import { BOOT_TIMEOUT_MS, bootMessages, type BootPhase } from './boot/bootConstants'

const LazyApp = lazy(() => import('./App'))

export default function RootApp() {
  const { currentUser: firebaseUser, loading: authBooting, isDemoMode, setDemoMode } = useAuth()
  const { currentUser: localProfile, profileHydrated, saveUser, setShowOnboarding } = useProfile()
  const { isDemoAuthenticated } = useDemoAuth()
  const [bootTimedOut, setBootTimedOut] = useState(false)

  const isAuthenticated = useMemo(() => {
    if (isDemoMode) return !!localProfile || isDemoAuthenticated
    return !!firebaseUser
  }, [isDemoMode, localProfile, isDemoAuthenticated, firebaseUser])

  const bootPhase: BootPhase | null = useMemo(() => {
    if (isDemoMode) return null
    if (authBooting) return 'auth'
    if (firebaseUser && !profileHydrated) return 'profile'
    return null
  }, [isDemoMode, authBooting, firebaseUser, profileHydrated])

  const isBooting = bootPhase !== null

  useEffect(() => {
    if (!isBooting) {
      setBootTimedOut(false)
      return undefined
    }
    const t = setTimeout(() => setBootTimedOut(true), BOOT_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isBooting, bootPhase])

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

  if (!isAuthenticated) {
    return <PublicAuthPage />
  }

  const appBoot = bootMessages('app', false)

  return (
    <Suspense
      fallback={
        <BootShell message={appBoot.message} submessage={appBoot.submessage} />
      }
    >
      <LazyApp />
    </Suspense>
  )
}
