import { useState, useCallback } from 'react';
import type { Profile } from '../types';

export function useSwipe(
  deck: Profile[],
  onLike: (profileId: string) => void,
  onPass: (profileId: string) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = deck[currentIndex] || null;
  const hasMore = currentIndex < deck.length;

  const like = useCallback(() => {
    if (currentProfile) {
      onLike(currentProfile.id);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentProfile, onLike]);

  const pass = useCallback(() => {
    if (currentProfile) {
      onPass(currentProfile.id);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentProfile, onPass]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  return {
    currentProfile,
    currentIndex,
    hasMore,
    like,
    pass,
    reset,
  };
}
