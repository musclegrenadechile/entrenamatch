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
    setTimeout(() => setShowOnboarding(true), 80);
    toast.success('Demo rápido activado', {
      description: 'Preview en vivo + opt-in EN VIVO en el paso final.',
    });
  }, [saveUser, setShowOnboarding, setDemoMode]);

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
