import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../services/auth';
import { onAuthStateChange, getUserProfile, handleGoogleRedirectResult, getDemoUser } from '../services/auth';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
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
  // Only force demo mode if Firebase is truly not configured.
  // Now that we have real config, GitHub Pages demo will use real Firebase for multi-user interaction.
  const shouldForceDemo = typeof window !== 'undefined' && !isFirebaseConfigured;
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoMode] = useState(shouldForceDemo);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: load user from localStorage immediately
      setLoading(false);
      const demoUser = getDemoUser();
      setCurrentUser(demoUser);

      // Listen for login/register/logout from the demo auth functions
      const handleDemoAuthChange = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        setCurrentUser(detail?.user ?? getDemoUser());
      };
      window.addEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);

      return () => {
        window.removeEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);
      };
    }

    // Real Firebase mode
    handleGoogleRedirectResult().catch(console.error);

    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const value = {
    currentUser,
    userProfile,
    loading,
    isDemoMode,
    setDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
