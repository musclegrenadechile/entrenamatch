import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useProfile } from './contexts/ProfileContext'
import { useDemoAuth } from './hooks/useDemoAuth'
import { BootShell } from './boot/BootShell'
import { PublicAuthPage } from './pages/PublicAuthPage'
import { markQuickDemoSession, QUICK_DEMO_USER } from './utils/quickDemo'

const LazyApp = lazy(() => import('./App'))

const BOOT_TIMEOUT_MS = 8000

export default function RootApp() {
  const { currentUser: firebaseUser, loading: authBooting, isDemoMode, setDemoMode } = useAuth()
  const { currentUser: localProfile, profileHydrated, saveUser, setShowOnboarding } = useProfile()
  const { isDemoAuthenticated } = useDemoAuth()
  const [bootTimedOut, setBootTimedOut] = useState(false)

  const isAuthenticated = useMemo(() => {
    if (isDemoMode) return !!localProfile || isDemoAuthenticated
    return !!firebaseUser
  }, [isDemoMode, localProfile, isDemoAuthenticated, firebaseUser])

  const isBooting =
    !isDemoMode &&
    (authBooting || (!!firebaseUser && !profileHydrated))

  useEffect(() => {
    if (!isBooting) {
      setBootTimedOut(false)
      return undefined
    }
    const t = setTimeout(() => setBootTimedOut(true), BOOT_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isBooting])

  const handleBootRetry = useCallback(() => {
    setBootTimedOut(false)
    window.location.reload()
  }, [])

  const handleBootDemo = useCallback(() => {
    markQuickDemoSession()
    setDemoMode(true)
    saveUser(QUICK_DEMO_USER as any)
    setShowOnboarding(false)
    setBootTimedOut(false)
  }, [setDemoMode, saveUser, setShowOnboarding])

  if (authBooting && !isDemoMode) {
    return (
      <BootShell
        message="Verificando sesión…"
        submessage="Conectando con EntrenaMatch"
        timedOut={bootTimedOut}
        onRetry={handleBootRetry}
        onDemo={handleBootDemo}
      />
    )
  }

  if (!isDemoMode && firebaseUser && !profileHydrated) {
    return (
      <BootShell
        message="Cargando tu perfil…"
        submessage="Sincronizando datos de entrenamiento"
        timedOut={bootTimedOut}
        onRetry={handleBootRetry}
        onDemo={handleBootDemo}
      />
    )
  }

  if (!isAuthenticated) {
    return <PublicAuthPage />
  }

  return (
    <Suspense
      fallback={
        <BootShell
          message="Preparando tu arena…"
          submessage="Mapa, live y tu equipo"
        />
      }
    >
      <LazyApp />
    </Suspense>
  )
}
