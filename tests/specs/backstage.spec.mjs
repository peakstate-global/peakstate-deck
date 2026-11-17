/* The backstage layer: hidden slides after the content (planning, stories,
   numbers and the rest). Presenting must never land on one, and the export dump
   must mark each as hidden so it becomes a hidden PowerPoint slide.
   tests/test_backstage_export.py checks the .pptx itself. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, currentSlide } from './helpers.mjs';

const DECK = '/deck-backstage.html';

test('presenting steps past the backstage slides', async ({ page }) => {
  await openDeck(page, DECK);
  await goToSlide(page, 1);
  await page.locator('.dcx-bar [data-a="perform"]').click();
  for (let i = 0; i < 3; i++) await page.locator('body').press('ArrowRight');
  await page.waitForTimeout(200);
  expect(await currentSlide(page)).toBe(2);
});

test('the export dump marks every backstage slide hidden', async ({ page }) => {
  await page.goto(DECK + '?export');
  await page.waitForSelector('#layout', { state: 'attached' });
  const dump = JSON.parse(await page.$eval('#layout', (el) => el.textContent));
  expect(dump.map((s) => s.hidden)).toEqual([false, false, true, true]);
});
