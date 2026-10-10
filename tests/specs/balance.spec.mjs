/* ?audit BALANCE: content sits centred between the slide heading and the footer. */
import { test, expect } from '@playwright/test';

test('the audit flags content hugging the heading, and spares a centred or opted-out slide', async ({ page }) => {
  await page.goto('/deck-balance.html?audit');
  const report = await page.locator('pre').textContent({ timeout: 15000 });
  expect(report.match(/BALANCE/g) || []).toHaveLength(1);
  expect(report).toContain('1 PROBLEM(S)');
});
