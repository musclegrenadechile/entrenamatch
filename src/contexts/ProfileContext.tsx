import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';
import { getUserProfile } from '../services/auth';
import { useAuth } from './AuthContext';
import type { CurrentUser } from '../types';
import { isProfileComplete } from '../utils/profileComplete';

interface ProfileContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  saveUser: (user: CurrentUser) => void;
  showOnboarding: boolean;
  setShowOnboarding: (value: boolean) => void;
  clearProfile: () => void;
  hasProfile: boolean;
  profileHydrated: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function profileFromFirestore(raw: Record<string, unknown>): CurrentUser {
  return {
    ...(raw as object),
    id: 'me',
  } as CurrentUser;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { currentUser: firebaseUser, userProfile, isDemoMode } = useAuth();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    return demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(isDemoMode);

  useEffect(() => {
    const saved = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (saved) {
      setCurrentUser(saved);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  // Real users: hydrate profile from AuthContext / Firestore before App lazy-loads
  useEffect(() => {
    if (isDemoMode) {
      setProfileHydrated(true);
      return;
    }
    if (!firebaseUser?.uid) {
      setProfileHydrated(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const fromFs =
          userProfile ||
          (await getUserProfile(firebaseUser.uid));
        if (cancelled) return;

        const cached = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);

        if (!isProfileComplete(fromFs)) {
          if (fromFs) {
            const merged = profileFromFirestore({
              ...(cached || {}),
              ...fromFs,
            });
            demoStorage.set(DEMO_KEYS.PROFILE, merged);
            setCurrentUser(merged);
          }
          setShowOnboarding(true);
          setProfileHydrated(true);
          return;
        }

        const merged = profileFromFirestore({
          ...(cached || {}),
          ...fromFs,
        });
        demoStorage.set(DEMO_KEYS.PROFILE, merged);
        setCurrentUser(merged);
      } catch (e) {
        console.warn('[ProfileContext] Firestore hydrate failed', e);
      } finally {
        if (!cancelled) setProfileHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser?.uid, userProfile, isDemoMode]);

  const saveUser = useCallback((user: CurrentUser) => {
    demoStorage.set(DEMO_KEYS.PROFILE, user);
    setCurrentUser(user);
  }, []);

  const clearProfile = useCallback(() => {
    demoStorage.remove(DEMO_KEYS.PROFILE);
    setCurrentUser(null);
    setShowOnboarding(false);
    setProfileHydrated(isDemoMode);
  }, [isDemoMode]);

  // Real mode: drop cached profile when Firebase session ends (logout / expired token).
  useEffect(() => {
    if (isDemoMode) return;
    if (!firebaseUser?.uid && currentUser) {
      demoStorage.remove(DEMO_KEYS.PROFILE);
      setCurrentUser(null);
      setShowOnboarding(false);
    }
  }, [firebaseUser?.uid, isDemoMode, currentUser]);

  return (
    <ProfileContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        saveUser,
        showOnboarding,
        setShowOnboarding,
        clearProfile,
        hasProfile: !!currentUser,
        profileHydrated,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
