import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

import { getUserProfile, updateUserProfile } from '../services/auth';

import { useAuth } from './AuthContext';

import type { CurrentUser } from '../types';

import { enrichReturningProfile, isProfileComplete } from '../utils/profileComplete';

import { latestPhotosUpdatedAt, resolveProfilePhotos } from '../utils/profilePhotos';

import { clearCachedProfile, readCachedProfile, writeCachedProfile } from '../utils/profileLocalCache';



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



async function fetchProfileWithRetry(uid: string, attempts = 3): Promise<Record<string, unknown> | null> {

  let lastErr: unknown

  for (let i = 0; i < attempts; i++) {

    try {

      const profile = await getUserProfile(uid);

      if (profile) return profile as Record<string, unknown>;

      if (i < attempts - 1) {

        await new Promise((r) => setTimeout(r, 400 * (i + 1)));

      }

    } catch (e) {

      lastErr = e

      if (i < attempts - 1) {

        await new Promise((r) => setTimeout(r, 500 * (i + 1)));

      }

    }

  }

  if (lastErr) console.warn('[ProfileContext] fetchProfileWithRetry failed', lastErr);

  return null;

}



export function ProfileProvider({ children }: { children: ReactNode }) {

  const { currentUser: firebaseUser, userProfile, isDemoMode, loading: authLoading } = useAuth();



  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {

    return readCachedProfile(undefined);

  });



  const [showOnboarding, setShowOnboarding] = useState(false);

  const [profileHydrated, setProfileHydrated] = useState(() => {

    if (isDemoMode) return true;

    return !!readCachedProfile(undefined)?.name?.trim();

  });

  const hydratedUidRef = useRef<string | null>(null);

  const userProfileRef = useRef(userProfile);

  useEffect(() => {

    userProfileRef.current = userProfile;

  }, [userProfile]);



  const applyResolvedProfile = useCallback(

    (uid: string, merged: CurrentUser, enriched: ReturnType<typeof enrichReturningProfile>) => {

      writeCachedProfile(uid, merged);

      setCurrentUser(merged);

      setShowOnboarding(!isProfileComplete(enriched));

      setProfileHydrated(true);

    },

    []

  );



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



    const cached = readCachedProfile(uid);

    if (cached?.name?.trim()) {

      hydratedUidRef.current = uid;

      setCurrentUser(cached);

      setProfileHydrated(true);

    }



    let cancelled = false;

    (async () => {

      try {

        const rawFromFs =

          (userProfileRef.current as Record<string, unknown> | null) ||

          (await fetchProfileWithRetry(uid));

        if (cancelled) return;



        if (!rawFromFs) {

          hydratedUidRef.current = uid;

          if (cached?.name?.trim()) {

            setShowOnboarding(!isProfileComplete(enrichReturningProfile(cached)));

          } else {

            setShowOnboarding(true);

          }

          setProfileHydrated(true);

          return;

        }



        const fromFs = enrichReturningProfile(rawFromFs);

        const cachedNow = readCachedProfile(uid);

        hydratedUidRef.current = uid;



        if (fromFs && rawFromFs && !rawFromFs.legalConsents && fromFs.legalConsents) {

          void updateUserProfile(uid, { legalConsents: fromFs.legalConsents }).catch((e) =>

            console.warn('[ProfileContext] legalConsents backfill failed', e)

          );

        }



        const resolvedPhotos = resolveProfilePhotos(

          cachedNow?.photos,

          fromFs?.photos,

          cachedNow?.photosUpdatedAt,

          fromFs?.photosUpdatedAt

        );

        const resolvedPhotosUpdatedAt = latestPhotosUpdatedAt(

          cachedNow?.photosUpdatedAt,

          fromFs?.photosUpdatedAt

        );



        const merged = profileFromFirestore({

          ...(cachedNow || {}),

          ...fromFs,

          photos: resolvedPhotos,

          photosUpdatedAt: resolvedPhotosUpdatedAt,

        });

        applyResolvedProfile(uid, merged, fromFs);

      } catch (e) {

        console.warn('[ProfileContext] Firestore hydrate failed', e);

        if (!cancelled) {

          hydratedUidRef.current = uid;

          const cachedFallback = readCachedProfile(uid);

          if (cachedFallback?.name?.trim()) {

            setCurrentUser(cachedFallback);

            setShowOnboarding(!isProfileComplete(enrichReturningProfile(cachedFallback)));

          }

          setProfileHydrated(true);

        }

      }

    })();



    return () => {

      cancelled = true;

    };

  }, [firebaseUser?.uid, isDemoMode, authLoading, applyResolvedProfile]);



  // Recover when AuthContext fetched profile after a failed local hydrate.

  useEffect(() => {

    if (isDemoMode || !firebaseUser?.uid || !userProfile) return;

    if (hydratedUidRef.current !== firebaseUser.uid) return;

    const cached = readCachedProfile(firebaseUser.uid);

    if (cached?.name?.trim() && isProfileComplete(enrichReturningProfile(cached))) return;



    const enriched = enrichReturningProfile(userProfile);

    const resolvedPhotos = resolveProfilePhotos(

      cached?.photos,

      enriched?.photos,

      cached?.photosUpdatedAt,

      enriched?.photosUpdatedAt

    );

    const resolvedPhotosUpdatedAt = latestPhotosUpdatedAt(

      cached?.photosUpdatedAt,

      enriched?.photosUpdatedAt

    );

    const merged = profileFromFirestore({

      ...(cached || {}),

      ...enriched,

      photos: resolvedPhotos,

      photosUpdatedAt: resolvedPhotosUpdatedAt,

    });

    applyResolvedProfile(firebaseUser.uid, merged, enriched);

  }, [firebaseUser?.uid, userProfile, isDemoMode, applyResolvedProfile]);



  const saveUser = useCallback(

    (user: CurrentUser) => {

      writeCachedProfile(firebaseUser?.uid, user);

      setCurrentUser(user);

    },

    [firebaseUser?.uid]

  );



  const clearProfile = useCallback(() => {

    const uid = hydratedUidRef.current || firebaseUser?.uid;

    hydratedUidRef.current = null;

    clearCachedProfile(uid);

    setCurrentUser(null);

    setShowOnboarding(false);

    setProfileHydrated(isDemoMode);

  }, [isDemoMode, firebaseUser?.uid]);



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


