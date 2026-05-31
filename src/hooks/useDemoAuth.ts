import { useState, useEffect, useCallback } from 'react';
import { demoStorage, DEMO_KEYS } from '../services/demoStorage';

export interface DemoAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function useDemoAuth() {
  const [demoUser, setDemoUser] = useState<DemoAuthUser | null>(() => {
    return demoStorage.get<DemoAuthUser>(DEMO_KEYS.DEMO_AUTH_USER);
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleDemoAuthChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDemoUser(detail?.user ?? demoStorage.get<DemoAuthUser>(DEMO_KEYS.DEMO_AUTH_USER));
    };

    window.addEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);
    return () => {
      window.removeEventListener('demo-auth-changed', handleDemoAuthChange as EventListener);
    };
  }, []);

  const createDemoUser = useCallback((email: string): DemoAuthUser => {
    return {
      uid: 'demo_' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
    };
  }, []);

  const signInDemo = useCallback(async (email: string) => {
    setIsLoading(true);
    const user = createDemoUser(email);
    demoStorage.set(DEMO_KEYS.DEMO_AUTH_USER, user);
    window.dispatchEvent(new CustomEvent('demo-auth-changed', { detail: { user } }));
    setDemoUser(user);
    setIsLoading(false);
    return user;
  }, [createDemoUser]);

  const signUpDemo = useCallback(async (email: string) => {
    return signInDemo(email); // Same behavior in current demo
  }, [signInDemo]);

  const logoutDemo = useCallback(() => {
    demoStorage.remove(DEMO_KEYS.DEMO_AUTH_USER);
    window.dispatchEvent(new CustomEvent('demo-auth-changed', { detail: { user: null } }));
    setDemoUser(null);
  }, []);

  return {
    demoUser,
    isLoading,
    signInDemo,
    signUpDemo,
    logoutDemo,
    isAuthenticated: !!demoUser,
  };
}
