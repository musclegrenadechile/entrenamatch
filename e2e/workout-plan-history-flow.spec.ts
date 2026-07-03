import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-plan-history-flow — guardar entreno y hint PR en EntrenaPlan', async ({
  page,
}) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.seedDemoFuelProfile()
    window.__entrenamatchE2E!.seedDemoFuelWeekLogs('surplus')
  })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await expect(workout.getByText('Press banca')).toBeVisible()
  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })

  const planCard = page.locator('.em-v2-plan').filter({ hasText: 'EntrenaPlan' })
  await expect(planCard).toBeVisible({ timeout: 12000 })

  const scenarioClass = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanScenarioClass()
  )
  expect(scenarioClass).toBe('em-v2-plan--surplus')

  await expect(planCard.locator('.em-v2-plan__fuel-row')).toBeVisible({ timeout: 10000 })
  const fuelRowTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelRowToneClass()
  )
  expect(fuelRowTone).toBe('em-v2-plan__fuel-row--surplus')

  const toneStackAligned = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackAligned()
  )
  expect(toneStackAligned).toBe(true)
  const toneStackExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackExpected('surplus')
  )
  expect(toneStackExpected).toBe(true)
  const nutritionTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionToneClass()
  )
  expect(nutritionTone).toBe('em-v2-plan__nutrition--surplus')
  const toneStackFullyExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackFullyExpected('surplus')
  )
  expect(toneStackFullyExpected).toBe(true)

  await expect(planCard.locator('.em-v2-plan__headline-fuel')).toBeVisible({ timeout: 10000 })
  const headlineFuelChip = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChip()
  )
  expect(headlineFuelChip).toMatch(/Superávit/i)
  const headlineFuelAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChipAriaLabel()
  )
  expect(headlineFuelAria).toMatch(/Escenario Fuel/i)
  const headlineFuelTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChipToneClass()
  )
  expect(headlineFuelTone).toBe('em-v2-plan__headline-fuel--surplus')

  await expect(planCard.locator('.em-v2-plan__history-hint')).toBeVisible({ timeout: 10000 })
  await expect(planCard.locator('.em-v2-plan__history-hint')).toContainText(/PR en Press banca/i)

  const hint = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanHistoryHint())
  expect(hint).toMatch(/10×60 kg|60 kg/)
  expect(hint).toContain('sigue progresando')
  const historyAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanHistoryAriaLabel()
  )
  expect(historyAria).toMatch(/Progreso reciente.*Superávit/i)
  const historyTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanHistoryToneClass()
  )
  expect(historyTone).toBe('em-v2-plan__history-hint--surplus')
  const historyFuelAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanHistoryFuelToneAriaExpected('surplus')
  )
  expect(historyFuelAria).toBe(true)

  await expect(planCard.locator('.em-v2-card__detail').first()).toContainText(/rotación/i)
  const detail = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanDetail())
  expect(detail).toMatch(/Tras PR|rotación/i)

  await expect(planCard.locator('.em-v2-plan__rotation-chip')).toBeVisible({ timeout: 10000 })
  const chip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanRotationChip())
  expect(chip).toMatch(/rotación/i)
  const aria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanRotationAriaLabel()
  )
  expect(aria).toMatch(/tras PR|Pecho|Pull/i)
  expect(aria).toMatch(/Superávit/i)
  const rotationTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanRotationToneClass()
  )
  expect(rotationTone).toBe('em-v2-plan__rotation-chip--surplus')
  const rotationFuelAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanRotationFuelToneAriaExpected('surplus')
  )
  expect(rotationFuelAria).toBe(true)

  await expect(planCard.locator('.em-v2-plan__fuel-week-chip')).toBeVisible({ timeout: 10000 })
  const fuelChip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanFuelWeekChip())
  expect(fuelChip).toMatch(/Δ \+\d+ kcal/)

  await expect(planCard.locator('.em-v2-plan__fuel-week-hint')).toBeVisible({ timeout: 10000 })
  const fuelWeekHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekHint()
  )
  expect(fuelWeekHint).toMatch(/Superávit/i)
  const fuelWeekTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekToneClass()
  )
  expect(fuelWeekTone).toBe('em-v2-plan__fuel-week-hint--surplus')

  await expect(planCard.locator('.em-v2-plan__nutrition')).toBeVisible({ timeout: 10000 })
  const nutrition = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionNote()
  )
  expect(nutrition).toMatch(/cena ligera|proteína magra/i)
  const nutritionAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionAriaLabel()
  )
  expect(nutritionAria).toMatch(/Nutrición EntrenaPlan.*Superávit/i)
  const toneAriaAligned = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneAriaAligned('surplus')
  )
  expect(toneAriaAligned).toBe(true)
  const cardAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanCardAriaLabel()
  )
  expect(cardAria).toMatch(/Plan de entreno recomendado.*Superávit/i)
  const cardToneAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelCardToneAriaExpected('surplus')
  )
  expect(cardToneAria).toBe(true)
  const toneStackFullySynced = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackFullySynced('surplus')
  )
  expect(toneStackFullySynced).toBe(true)
})