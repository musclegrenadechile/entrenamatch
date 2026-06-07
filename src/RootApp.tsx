import { lazy, Suspense, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useProfile } from './contexts/ProfileContext';
import { useDemoAuth } from './hooks/useDemoAuth';
import { BootShell } from './boot/BootShell';
import { PublicAuthPage } from './pages/PublicAuthPage';

const LazyApp = lazy(() => import('./App'));

export default function RootApp() {
  const { currentUser: firebaseUser, loading: authBooting, isDemoMode } = useAuth();
  const { currentUser: localProfile, profileHydrated } = useProfile();
  const { isDemoAuthenticated } = useDemoAuth();

  const isAuthenticated = useMemo(() => {
    if (isDemoMode) return !!localProfile || isDemoAuthenticated;
    return !!firebaseUser;
  }, [isDemoMode, localProfile, isDemoAuthenticated, firebaseUser]);

  if (authBooting && !isDemoMode) {
    return (
      <BootShell
        message="Verificando sesión…"
        submessage="Un momento — conectando con EntrenaMatch"
      />
    );
  }

  if (!isDemoMode && firebaseUser && !profileHydrated) {
    return (
      <BootShell
        message="Cargando tu perfil…"
        submessage="Sincronizando datos de entrenamiento"
      />
    );
  }

  if (!isAuthenticated) {
    return <PublicAuthPage />;
  }

  return (
    <Suspense
      fallback={
        <BootShell
          message="Preparando tu arena…"
          submessage="Cargando mapa, live y tu equipo"
        />
      }
    >
      <LazyApp />
    </Suspense>
  );
}
