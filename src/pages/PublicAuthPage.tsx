import { useEffect } from 'react';
import { AuthScreen } from '../components/auth/AuthScreen';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useAuthActions } from '../hooks/useAuthActions';
import { isFirebaseConfigured } from '../services/firebase';

function triggerHaptic(_style?: 'light' | 'medium' | 'heavy' | 'success') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  } catch {}
}

export function PublicAuthPage() {
  const { isDemoMode } = useAuth();
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

  useEffect(() => {
    try {
      if ((window as any).__ENTRENAMATCH_QUICK_DEMO__) {
        (window as any).__ENTRENAMATCH_QUICK_DEMO__ = false;
        const demoSeed = {
          id: 'me' as const,
          name: 'Demo Tester',
          age: 28,
          gender: 'mujer' as const,
          city: 'Viña del Mar',
          country: 'Chile',
          lat: -33.0153,
          lng: -71.5528,
          bio: 'Demo lista para probar live + muro. Entreno pesas y running. ¡Conectemos!',
          photos: ['https://picsum.photos/id/1011/600/800'],
          trainingTypes: ['Pesas/Gym', 'Running'],
          goals: ['Ganar músculo', 'Socializar y motivación'],
          level: 'Intermedio',
          intensity: 'Moderado',
          availability: ['Tarde'],
          wantsToGoLive: true,
        };
        saveUser(demoSeed as any);
        setTimeout(() => setShowOnboarding(true), 80);
      }
    } catch {}
  }, [saveUser, setShowOnboarding]);

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
    />
  );
}
