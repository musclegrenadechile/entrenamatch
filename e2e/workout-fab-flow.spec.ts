import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-fab-flow — minimizar gym-log y chip sesión en FAB', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await expect(workout.getByText('Press banca')).toBeVisible()

  await workout.getByRole('button', { name: 'Minimizar sesión' }).click()

  await expect(workout).not.toBeVisible({ timeout: 10000 })

  const fab = page.getByRole('button', { name: 'Volver a Modo Entreno' })
  await expect(fab).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('status').filter({ hasText: /1 serie/i })).toBeVisible()
  const fabSessionChip = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogFabSessionChipText()
  )
  expect(fabSessionChip).toMatch(/1 ejercicio · 1 serie/i)
  const fabSessionAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogFabSessionChipAriaLabel()
  )
  expect(fabSessionAria).toMatch(/Sesión activa.*PR en vivo/i)
  const fabSessionTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogFabSessionChipToneClass()
  )
  expect(fabSessionTone).toBe('em-v2-workout-fab__session-chip--has-pr')
  const fabSessionPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isGymLogFabSessionPrToneAriaExpected()
  )
  expect(fabSessionPrAria).toBe(true)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.resumeWorkoutModal()
  })

  await expect(workout).toBeVisible({ timeout: 10000 })
  await expect(workout.getByText('Press banca')).toBeVisible()
})