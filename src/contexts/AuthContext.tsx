import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../services/auth';
import { onAuthStateChange, getUserProfile, handleGoogleRedirectResult } from '../services/auth';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Auto-enable demo mode for public GitHub Pages or when Firebase is not configured
  const isPublicDemo = typeof window !== 'undefined' && 
    (window.location.hostname.includes('github.io') || !isFirebaseConfigured);
  
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoMode] = useState(isPublicDemo);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode (public GitHub Pages), we use pure localStorage - no real auth
      setLoading(false);
      return;
    }

    // Handle Google redirect result on app load (important for localhost)
    handleGoogleRedirectResult().catch(console.error);

    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch profile from Firestore
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
