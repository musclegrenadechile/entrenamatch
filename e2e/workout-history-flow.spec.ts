import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-history-flow — historial Perfil con PR y sparkline', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.seedDemoFuelProfile()
    window.__entrenamatchE2E!.seedDemoWorkoutHistory()
    window.__entrenamatchE2E!.goToProfileTab()
  })

  const card = page.locator('.em-v2-card').filter({ hasText: 'Entreno de Hoy' })
  await expect(card).toBeVisible({ timeout: 12000 })
  await expect(card.getByText(/Últimos 2/i)).toBeVisible()
  await expect(card.getByText(/con PR/i)).toBeVisible()

  const summaries = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistoryRowSummaries()
  )
  expect(summaries.length).toBeGreaterThanOrEqual(1)
  expect(summaries.some((s) => /600 kg|600kg/i.test(s))).toBe(true)

  const prBadges = await page.evaluate(() =>
    window.__entrenamatchE2E!.countWorkoutHistoryPrBadges()
  )
  expect(prBadges).toBeGreaterThanOrEqual(1)

  const rowTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistoryRowToneClass()
  )
  expect(rowTone).toBe('em-v2-training-history__row--has-pr')
  const summaryTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySummaryToneClass()
  )
  expect(summaryTone).toBe('em-v2-training-history__summary--has-pr')
  const summaryPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySummaryPrAriaLabel()
  )
  expect(summaryPrAria).toMatch(/Resumen con PR/i)
  const rowPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWorkoutHistoryRowPrToneAriaExpected()
  )
  expect(rowPrAria).toBe(true)

  await expect(card.locator('.em-v2-training-history__sparkline--has-pr').first()).toBeVisible()
  const sparklineTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySparklineToneClass()
  )
  expect(sparklineTone).toBe('em-v2-training-history__sparkline--has-pr')
  const sparklinePrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySparklinePrAriaLabel()
  )
  expect(sparklinePrAria).toMatch(/récord personal/i)
  const sparklinePrAriaOk = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWorkoutHistorySparklinePrToneAriaExpected()
  )
  expect(sparklinePrAriaOk).toBe(true)

  const sparklineLabels = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySparklineAriaLabels()
  )
  expect(sparklineLabels.some((label) => /récord personal/i.test(label))).toBe(true)

  const kicker = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySectionKicker()
  )
  expect(kicker).toMatch(/Últimos 2/)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal({
      exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 65 }] }],
    })
  })
  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })

  const planCard = page.locator('.em-v2-plan').filter({ hasText: 'EntrenaPlan' })
  await expect(planCard).toBeVisible({ timeout: 12000 })
  await expect(planCard.locator('.em-v2-plan__history-hint')).toBeVisible({ timeout: 10000 })
  await expect(planCard.locator('.em-v2-plan__rotation-chip')).toBeVisible({ timeout: 10000 })

  const hint = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanHistoryHint())
  expect(hint).toMatch(/PR en Press banca/i)

  const chip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanRotationChip())
  expect(chip).toMatch(/rotación/i)
  const aria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanRotationAriaLabel()
  )
  expect(aria).toMatch(/tras PR|siguiente sesión/i)
})