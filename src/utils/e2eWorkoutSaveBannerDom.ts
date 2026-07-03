import { FUEL_LOG_PREFILL_CHIP_CLASS } from './fuelLogPrefillPrToneDisplay'
import { WORKOUT_SAVE_BANNER_CLASS } from './workoutSaveBannerPrToneDisplay'

export function readFuelLogPrefillChipAriaLabel(): string | null {
  const chip = document.querySelector(`.${FUEL_LOG_PREFILL_CHIP_CLASS}[role="status"]`)
  return chip?.getAttribute('aria-label')?.trim() ?? null
}

export function readFuelLogPrefillChipToneClass(): string | null {
  const chip = document.querySelector(`.${FUEL_LOG_PREFILL_CHIP_CLASS}`)
  if (!chip) return null
  for (const cls of chip.classList) {
    if (cls.startsWith(`${FUEL_LOG_PREFILL_CHIP_CLASS}--`)) return cls
  }
  return null
}

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