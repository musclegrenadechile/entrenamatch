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
import { GoogleAuthError } from '../services/googleAuth';
import { isFirebaseConfigured } from '../services/firebase';
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
  const [isDemoMode, setDemoMode] = useState(shouldForceDemo);
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

    (async () => {
      setLoading(true);

      // CRITICAL: finish redirect BEFORE onAuthStateChanged — otherwise getRedirectResult returns null
      // and the user lands back on the login screen after choosing a Google account.
      try {
        const redirectUser = await handleGoogleRedirectResult();
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
            description:
              'Prueba de nuevo o usa email/contraseña. Si persiste, revisa que musclegrenadechile.github.io esté en Firebase → Authorized domains.',
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
          const profile = await getUserProfile(user.uid);
          if (!cancelled) setUserProfile(profile);
        } else {
          setUserProfile(null);
        }

        if (firstAuthEvent) {
          firstAuthEvent = false;
          if (!cancelled) setLoading(false);
        }
      });
    })();

    return () => {
      cancelled = true;
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
