const ARENA_TUTORIAL_KEY = 'entrenamatch_arena_sync_tutorial_seen'

export function hasSeenArenaSyncTutorial(): boolean {
  try {
    return localStorage.getItem(ARENA_TUTORIAL_KEY) === '1'
  } catch {
    return false
  }
}

export function markArenaSyncTutorialSeen(): void {
  try {
    localStorage.setItem(ARENA_TUTORIAL_KEY, '1')
  } catch {
    /* ignore */
  }
}