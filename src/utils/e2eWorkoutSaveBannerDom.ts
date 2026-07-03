import { WORKOUT_SAVE_BANNER_CLASS } from './workoutSaveBannerPrToneDisplay'

export function readWorkoutSaveBannerAriaLabel(): string | null {
  const banner = document.querySelector(`.${WORKOUT_SAVE_BANNER_CLASS}[role="status"]`)
  return banner?.getAttribute('aria-label')?.trim() ?? null
}

export function readWorkoutSaveBannerToneClass(): string | null {
  const banner = document.querySelector(`.${WORKOUT_SAVE_BANNER_CLASS}`)
  if (!banner) return null
  for (const cls of banner.classList) {
    if (cls.startsWith(`${WORKOUT_SAVE_BANNER_CLASS}--`)) return cls
  }
  return null
}