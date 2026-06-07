import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';
import type { CurrentUser } from '../types';

interface ProfileContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  saveUser: (user: CurrentUser) => void;
  showOnboarding: boolean;
  setShowOnboarding: (value: boolean) => void;
  clearProfile: () => void;
  hasProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    return demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const saved = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (saved) {
      setCurrentUser(saved);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  const saveUser = useCallback((user: CurrentUser) => {
    demoStorage.set(DEMO_KEYS.PROFILE, user);
    setCurrentUser(user);
  }, []);

  const clearProfile = useCallback(() => {
    demoStorage.remove(DEMO_KEYS.PROFILE);
    setCurrentUser(null);
    setShowOnboarding(false);
  }, []);

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
