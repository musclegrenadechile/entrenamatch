import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E sync-mock — demo → mapa → iniciar sync (mock)', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(async () => {
    await window.__entrenamatchE2E!.enableLive()
  })
  await page.waitForTimeout(800)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openMapTab()
  })
  await expect(page.locator('#live-map-container')).toBeVisible({ timeout: 15000 })

  await page.evaluate(async () => {
    await window.__entrenamatchE2E!.startMockSync('p1', 'Camila Morales')
  })

  const arena = page.getByRole('dialog', { name: 'Sala Sync EntrenaSync' })
  await expect(arena).toBeVisible({ timeout: 15000 })
  await expect(arena.getByText(/Sala Sync/i)).toBeVisible({ timeout: 8000 })
})
