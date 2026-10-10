/* Click builds: a click fast-forwards whatever is still playing, and builds
   sharing a data-build value arrive and leave on one click. */
import { test, expect } from '@playwright/test';

const op = (page, sel) => page.evaluate((s) => getComputedStyle(document.querySelector(s)).opacity, sel);
const built = (page) => page.evaluate(() => [...document.querySelectorAll('[data-build]')].map((e) => e.hasAttribute('data-built')));

test('a click lands earlier animations at their end before it builds', async ({ page }) => {
  await page.goto('/deck-builds.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.waitForTimeout(200);
  expect(await op(page, '.slowfade')).toBe('1');          // still in its 5s delay
  await page.keyboard.press('ArrowRight');
  expect(Number(await op(page, '.slowfade'))).toBeCloseTo(0.2, 2);
  expect(await built(page)).toEqual([true, false, false]);
});

test('a grouped build arrives and leaves on one click, and the next click finishes its delay', async ({ page }) => {
  await page.goto('/deck-builds.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  expect(await built(page)).toEqual([true, true, true]);
  expect(await op(page, '#b2')).toBe('0');                // waiting on its 3s delay
  await page.keyboard.press('ArrowLeft');
  expect(await built(page)).toEqual([true, false, false]);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');                // moves on, landing b2 first
  expect(await op(page, '#b2')).toBe('1');
});
