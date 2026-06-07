import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../services/auth';
import {
  onAuthStateChange,
  getUserProfile,
  handleGoogleRedirectResult,
  completeGoogleSignInProfile,
  getDemoUser,
} from '../services/auth';
import { GoogleAuthError, getGoogleRedirectFailureMessage } from '../services/googleAuth';
import { isFirebaseConfigured } from '../services/firebase';
import { isQuickDemoSession } from '../utils/quickDemo';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  googleNewUser: boolean;
  clearGoogleNewUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const shouldForceDemo = typeof window !== 'undefined' && !isFirebaseConfigured;

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoMode] = useState(() => {
    if (shouldForceDemo) return true
    return isQuickDemoSession()
  })
  const [googleNewUser, setGoogleNewUser] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      setCurrentUser(getDemoUser());

      const handleDemoAuthChange = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        setCurrentUser(detail?.user ?? getDemoUser());
      };
      window.addEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);
      return () => {
        window.removeEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);
      };
    }

    let cancelled = false;
    let unsubscribe = () => {};
    let bootTimeout: ReturnType<typeof setTimeout> | undefined;

    const finishBoot = () => {
      if (!cancelled) setLoading(false);
    };

    // Never leave mobile users on a blank/dark screen if Auth hangs (Safari storage quirks, slow networks).
    bootTimeout = setTimeout(() => {
      if (cancelled) return;
      console.warn('[Auth] Boot timeout — showing login');
      finishBoot();
    }, 10000);

    (async () => {
      setLoading(true);

      // CRITICAL: finish redirect BEFORE onAuthStateChanged — otherwise getRedirectResult returns null.
      // Race with timeout so mobile Safari / slow networks never block the UI forever.
      try {
        const redirectUser = await Promise.race([
          handleGoogleRedirectResult(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
        ]);
        if (cancelled) return;

        if (redirectUser) {
          sessionStorage.removeItem('entrenamatch_google_redirect_pending');
          const { profile, isNewUser } = await completeGoogleSignInProfile(redirectUser);
          if (cancelled) return;
          setCurrentUser(redirectUser);
          setUserProfile(profile);
          if (isNewUser) setGoogleNewUser(true);
          toast.success('Sesión iniciada con Google');
        } else if (sessionStorage.getItem('entrenamatch_google_redirect_pending') === '1') {
          sessionStorage.removeItem('entrenamatch_google_redirect_pending');
          toast.error('No se completó el login con Google', {
            description: getGoogleRedirectFailureMessage(),
          });
        }
      } catch (error) {
        if (cancelled) return;
        sessionStorage.removeItem('entrenamatch_google_redirect_pending');
        const msg =
          error instanceof GoogleAuthError
            ? error.message
            : 'Error al completar inicio de sesión con Google';
        console.error('Google redirect sign-in failed:', error);
        toast.error(msg);
      }

      if (cancelled) return;

      let firstAuthEvent = true;
      unsubscribe = onAuthStateChange(async (user) => {
        if (cancelled) return;
        setCurrentUser(user);

        if (user) {
          try {
            const profile = await getUserProfile(user.uid);
            if (!cancelled) setUserProfile(profile);
          } catch (e) {
            console.warn('[Auth] getUserProfile failed', e);
          }
        } else {
          setUserProfile(null);
        }

        if (firstAuthEvent) {
          firstAuthEvent = false;
          finishBoot();
        }
      });
    })();

    return () => {
      cancelled = true;
      if (bootTimeout) clearTimeout(bootTimeout);
      unsubscribe();
    };
  }, [isDemoMode]);

  const value = {
    currentUser,
    userProfile,
    loading,
    isDemoMode,
    setDemoMode,
    googleNewUser,
    clearGoogleNewUser: () => setGoogleNewUser(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
