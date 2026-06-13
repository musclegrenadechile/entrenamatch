import { useMemo } from 'react'
import type { AnalyzeFoodResult } from '../../services/fuel'
import type { CurrentUser, FuelLogEntry, FuelProfile } from '../../types'
import type { FuelWizardHints } from '../../utils/fuelWizardDefaults'
import { FuelLogModal } from './FuelLogModal'
import { FuelSetupModal } from './FuelSetupModal'
import { FuelSetupWizard } from './FuelSetupWizard'

export type FuelLogSavePayload = {
  editId?: string
  mealLabel: string
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  photoDataUrl?: string
  source: 'manual' | 'photo_ai' | 'text_ai'
  publishToMuro: boolean
}

export type FuelOverlaysMountProps = {
  showFuelSetupWizard: boolean
  showFuelSetupModal: boolean
  showFuelLogModal: boolean
  onCloseFuelSetupWizard: () => void
  onCloseFuelSetupModal: () => void
  onCloseFuelLogModal: () => void
  onOpenAdvancedFuelSetup: () => void
  fuelProfile: FuelProfile | null
  editingFuelLog: FuelLogEntry | null
  currentUser: CurrentUser | null
  homeWeekTrainedCount: number
  onSaveFuelProfile: (profile: Omit<FuelProfile, 'updatedAt'>) => Promise<void>
  onSaveFuelLog: (payload: FuelLogSavePayload) => Promise<void>
  onAnalyzeFood?: (
    imageBase64: string,
    mealDescription?: string
  ) => Promise<AnalyzeFoodResult>
  savingFuel?: boolean
}

/** Stable wizard hints — inline object in App.tsx reseteaba el paso del wizard cada render. */
export function buildFuelWizardHints(
  user: Pick<CurrentUser, 'age' | 'gender' | 'goals'> | null | undefined,
  weekTrainedCount: number
): FuelWizardHints {
  return {
    age: user?.age,
    gender: user?.gender,
    weekTrainedCount,
    goals: user?.goals,
  }
}

/** Fase 380 — Fuel setup wizard, advanced setup y log modal extraídos de App.tsx. */
export function FuelOverlaysMount({
  showFuelSetupWizard,
  showFuelSetupModal,
  showFuelLogModal,
  onCloseFuelSetupWizard,
  onCloseFuelSetupModal,
  onCloseFuelLogModal,
  onOpenAdvancedFuelSetup,
  fuelProfile,
  editingFuelLog,
  currentUser,
  homeWeekTrainedCount,
  onSaveFuelProfile,
  onSaveFuelLog,
  onAnalyzeFood,
  savingFuel = false,
}: FuelOverlaysMountProps) {
  const fuelWizardHints = useMemo(
    () => buildFuelWizardHints(currentUser, homeWeekTrainedCount),
    [currentUser?.age, currentUser?.gender, currentUser?.goals, homeWeekTrainedCount]
  )

  return (
    <>
      <FuelSetupWizard
        open={showFuelSetupWizard}
        hints={fuelWizardHints}
        onClose={onCloseFuelSetupWizard}
        onSave={onSaveFuelProfile}
        onAdvancedSetup={onOpenAdvancedFuelSetup}
        saving={savingFuel}
      />
      <FuelSetupModal
        open={showFuelSetupModal}
        initial={fuelProfile}
        defaultAge={currentUser?.age}
        defaultGender={currentUser?.gender}
        onClose={onCloseFuelSetupModal}
        onSave={onSaveFuelProfile}
        saving={savingFuel}
      />
      <FuelLogModal
        open={showFuelLogModal}
        editEntry={editingFuelLog}
        onClose={onCloseFuelLogModal}
        onSave={onSaveFuelLog}
        onAnalyzePhoto={onAnalyzeFood}
        saving={savingFuel}
      />
    </>
  )
}
