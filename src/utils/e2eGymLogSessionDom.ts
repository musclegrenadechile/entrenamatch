import { GYM_LOG_SESSION_CHIP_CLASS } from './gymLogSessionPrToneDisplay'

export function readGymLogSessionChipText(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_SESSION_CHIP_CLASS}`)
  return chip?.textContent?.trim() ?? null
}

export function readGymLogSessionChipAriaLabel(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_SESSION_CHIP_CLASS}`)
  return chip?.getAttribute('aria-label')?.trim() ?? null
}

export function readGymLogSessionChipToneClass(): string | null {
  const chip = document.querySelector(`.${GYM_LOG_SESSION_CHIP_CLASS}`)
  if (!chip) return null
  for (const cls of chip.classList) {
    if (cls.startsWith(`${GYM_LOG_SESSION_CHIP_CLASS}--`)) return cls
  }
  return null
}