import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-history-flow — historial Perfil con PR y sparkline', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
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

  await expect(card.locator('.em-v2-training-history__sparkline--has-pr').first()).toBeVisible()

  const sparklineLabels = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySparklineAriaLabels()
  )
  expect(sparklineLabels.some((label) => /PR/i.test(label))).toBe(true)

  const kicker = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutHistorySectionKicker()
  )
  expect(kicker).toMatch(/Últimos 2/)
})