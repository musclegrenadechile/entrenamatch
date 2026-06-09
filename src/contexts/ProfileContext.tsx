import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
  const { currentUser: firebaseUser, userProfile, isDemoMode, loading: authLoading } = useAuth();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    return demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(() => {
    if (isDemoMode) return true;
    const cached = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    return !!cached?.name;
  });
  const hydratedUidRef = useRef<string | null>(null);
  const userProfileRef = useRef(userProfile);
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    const saved = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (saved) {
      setCurrentUser(saved);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  // Real users: hydrate profile from Firestore once per uid (avoid Android remount loops).
  useEffect(() => {
    if (isDemoMode) {
      setProfileHydrated(true);
      return;
    }

    const uid = firebaseUser?.uid;
    if (!uid) {
      return;
    }

    if (hydratedUidRef.current === uid) {
      return;
    }

    const cached = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (cached?.name) {
      hydratedUidRef.current = uid;
      setCurrentUser(cached);
      setProfileHydrated(true);
    }

    let cancelled = false;
    (async () => {
      try {
        const fromFs =
          userProfileRef.current ||
          (await getUserProfile(uid));
        if (cancelled) return;

        const cachedNow = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
        hydratedUidRef.current = uid;

        if (!isProfileComplete(fromFs)) {
          if (fromFs) {
            const merged = profileFromFirestore({
              ...(cachedNow || {}),
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
          ...(cachedNow || {}),
          ...fromFs,
        });
        demoStorage.set(DEMO_KEYS.PROFILE, merged);
        setCurrentUser(merged);
        setProfileHydrated(true);
      } catch (e) {
        console.warn('[ProfileContext] Firestore hydrate failed', e);
        if (!cancelled) {
          hydratedUidRef.current = uid;
          setProfileHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [firebaseUser?.uid, isDemoMode, authLoading]);

  // Recover when AuthContext fetched profile after a failed local hydrate.
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !userProfile) return;
    if (hydratedUidRef.current !== firebaseUser.uid) return;
    const cached = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (cached?.name && isProfileComplete(cached)) return;

    const merged = profileFromFirestore({
      ...(cached || {}),
      ...userProfile,
    });
    demoStorage.set(DEMO_KEYS.PROFILE, merged);
    setCurrentUser(merged);
    if (!isProfileComplete(userProfile)) {
      setShowOnboarding(true);
    }
    setProfileHydrated(true);
  }, [firebaseUser?.uid, userProfile, isDemoMode]);

  const saveUser = useCallback((user: CurrentUser) => {
    demoStorage.set(DEMO_KEYS.PROFILE, user);
    setCurrentUser(user);
  }, []);

  const clearProfile = useCallback(() => {
    hydratedUidRef.current = null;
    demoStorage.remove(DEMO_KEYS.PROFILE);
    setCurrentUser(null);
    setShowOnboarding(false);
    setProfileHydrated(isDemoMode);
  }, [isDemoMode]);

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
