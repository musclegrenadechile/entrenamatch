const STORAGE_PREFIX = 'entrenamatch_v1_';

function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export const demoStorage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(getKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(getKey(key));
  },

  clearAllDemoData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};

export const DEMO_KEYS = {
  USER: 'user',
  PROFILE: 'profile',
  LIKED: 'liked',
  PASSED: 'passed',
  MATCHES: 'matches',
  MESSAGES: 'messages',
  LOCATION: 'location',
  SESSIONS: 'sessions',
  SQUADS: 'squads',
  REVIEWS: 'reviews',
  SESSION_MESSAGES: 'session_messages',
  BLOCKED: 'blocked',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  DEMO_AUTH_USER: 'demo_auth_user',
} as const;
