import { lazy, Suspense, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useProfile } from './contexts/ProfileContext';
import { useDemoAuth } from './hooks/useDemoAuth';
import { BootShell } from './boot/BootShell';
import { PublicAuthPage } from './pages/PublicAuthPage';

const LazyApp = lazy(() => import('./App'));

function hasSessionStorageAuthOk(): boolean {
  try {
    return sessionStorage.getItem('entrenamatch_auth_ok') === '1';
  } catch {
    return false;
  }
}

export default function RootApp() {
  const { currentUser: firebaseUser, loading: authBooting, isDemoMode } = useAuth();
  const { currentUser: localProfile } = useProfile();
  const { isDemoAuthenticated } = useDemoAuth();

  const isAuthenticated = useMemo(() => {
    if (isDemoMode) return !!localProfile || isDemoAuthenticated;
    return !!firebaseUser || hasSessionStorageAuthOk();
  }, [isDemoMode, localProfile, isDemoAuthenticated, firebaseUser]);

  if (authBooting && !isDemoMode) {
    return (
      <BootShell
        message="Verificando sesión…"
        submessage="Un momento — conectando con EntrenaMatch"
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
