import { GYM_LOG_FAB_SESSION_CHIP_CLASS } from './gymLogFabSessionPrToneDisplay'

export function readGymLogFabSessionChipText(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_FAB_SESSION_CHIP_CLASS}`)
  return chip?.textContent?.trim() ?? null
}

export function readGymLogFabSessionChipAriaLabel(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_FAB_SESSION_CHIP_CLASS}`)
  return chip?.getAttribute('aria-label')?.trim() ?? null
}

export function readGymLogFabSessionChipToneClass(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_FAB_SESSION_CHIP_CLASS}`)
  if (!chip) return null
  for (const cls of chip.classList) {
    if (cls.startsWith(`${GYM_LOG_FAB_SESSION_CHIP_CLASS}--`)) return cls
  }
  return null
}