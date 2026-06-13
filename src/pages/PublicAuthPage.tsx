import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthScreen } from '../components/auth/AuthScreen';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuthActions } from '../hooks/useAuthActions';
import { isFirebaseConfigured } from '../services/firebase';
import {
  isQuickDemoSession,
  markQuickDemoSession,
  QUICK_DEMO_USER,
} from '../utils/quickDemo';
import { isProfileComplete } from '../utils/profileComplete';
import { isE2EHarnessActive } from '../utils/e2eHarness';
import { parseTabFromUrl } from '../utils/tabUrlSync';

function triggerHaptic(_style?: 'light' | 'medium' | 'heavy' | 'success') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  } catch {}
}

export function PublicAuthPage() {
  const { isDemoMode, setDemoMode } = useAuth();
  const { saveUser, setShowOnboarding } = useProfile();
  const {
    authMode,
    setAuthMode,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authLoading,
    authError,
    handleEmailAuth,
    handleGoogleAuth,
    handleForgotPassword,
  } = useAuthActions();

  const startQuickDemo = useCallback(() => {
    markQuickDemoSession();
    setDemoMode(true);
    saveUser(QUICK_DEMO_USER);
    if (!isE2EHarnessActive() && !isProfileComplete(QUICK_DEMO_USER)) {
      setTimeout(() => setShowOnboarding(true), 80);
    }
    toast.success('Modo prueba activado', {
      description: isProfileComplete(QUICK_DEMO_USER)
        ? 'Perfil demo listo — explora mapa, explore y derby.'
        : 'Datos solo en este dispositivo. Completa el setup.',
    });
  }, [saveUser, setShowOnboarding, setDemoMode]);

  useEffect(() => {
    try {
      const tab = parseTabFromUrl(window.location.search)
      if (tab === 'explore') {
        toast.info('Inicia sesión para explorar y hacer match', { duration: 5000 })
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Resume after reload (Capacitor / mobile browsers)
  useEffect(() => {
    try {
      const quickDemo =
        (window as any).__ENTRENAMATCH_QUICK_DEMO__ || isQuickDemoSession();
      if (!quickDemo) return;
      (window as any).__ENTRENAMATCH_QUICK_DEMO__ = false;
      startQuickDemo();
    } catch {}
  }, [startQuickDemo]);

  return (
    <AuthScreen
      authMode={authMode}
      setAuthMode={setAuthMode}
      authEmail={authEmail}
      setAuthEmail={setAuthEmail}
      authPassword={authPassword}
      setAuthPassword={setAuthPassword}
      authLoading={authLoading}
      authError={authError}
      handleEmailAuth={handleEmailAuth}
      handleGoogleAuth={handleGoogleAuth}
      googleAuthEnabled={!isDemoMode && isFirebaseConfigured}
      handleForgotPassword={handleForgotPassword}
      isDemoMode={isDemoMode}
      triggerHaptic={triggerHaptic}
      onQuickDemo={startQuickDemo}
    />
  );
}
