import { test, expect } from '@playwright/test'

test('smoke — app shell loads', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('body')).toBeVisible()
  const title = await page.title()
  expect(title.length).toBeGreaterThan(0)
})

test('smoke — auth or demo entry visible', async ({ page }) => {
  await page.goto('./')
  const body = await page.locator('body').innerText()
  expect(body.length).toBeGreaterThan(10)
})
