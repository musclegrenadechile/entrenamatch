import { useState, useEffect, useCallback } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';
import type { CurrentUser } from '../types';

export function useProfile() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    return demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
  });

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load initial profile
  useEffect(() => {
    const saved = demoStorage.get<CurrentUser>(DEMO_KEYS.PROFILE);
    if (saved) {
      setCurrentUser(saved);
    } else {
      // In demo mode we usually want to go through auth first,
      // so we don't auto-force onboarding here (controlled from auth flow)
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

  return {
    currentUser,
    setCurrentUser,
    saveUser,
    showOnboarding,
    setShowOnboarding,
    clearProfile,
    hasProfile: !!currentUser,
  };
}
