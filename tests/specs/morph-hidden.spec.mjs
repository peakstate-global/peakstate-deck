/* Two morph faults on a linked hand-off.

   A hidden slide between a linked pair stopped the morph: the presenter steps
   straight from one to the other, but adjacency was counted over every section.

   The fade that holds back the rest of the arriving slide ran to opacity 1, so a
   background drawing set at .2 flashed to full and snapped back down when the
   fade ended. */
import { test, expect } from '@playwright/test';

const live = (page) => page.evaluate(() =>
  document.querySelector('section[data-deck-active]')?.dataset.slideId);

async function open(page) {
  await page.goto('/deck-morph-hidden.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.waitForTimeout(300);
}

test('a linked pair still morphs with a hidden slide between them', async ({ page }) => {
  await open(page);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => live(page)).toBe('b');
  const n = await page.evaluate(() => document.getAnimations().filter((x) => x.id === 'deck-morph').length);
  expect(n).toBeGreaterThan(0);
});

test('a faded element fades to its own opacity, never above it', async ({ page }) => {
  await open(page);
  await page.evaluate(() => document.querySelector('deck-stage').goTo(3));
  await expect.poll(() => live(page)).toBe('c');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => live(page)).toBe('d');
  // Walk each fade through its whole run and read the opacity it draws at.
  const peaks = await page.evaluate(() => Object.fromEntries(['.faint', '.lead'].map((sel) => {
    const el = document.querySelector('section[data-slide-id="d"] ' + sel);
    const anims = el.getAnimations().filter((x) => x.id === 'deck-morph');
    let peak = 0;
    anims.forEach((a) => {
      a.pause();
      const t = a.effect.getComputedTiming();
      for (let f = 0; f <= 1; f += 0.1) {
        a.currentTime = (t.delay || 0) + f * t.duration;
        peak = Math.max(peak, +getComputedStyle(el).opacity);
      }
    });
    return [sel, [anims.length, peak]];
  })));
  expect(peaks['.faint'][0]).toBeGreaterThan(0);
  expect(peaks['.lead'][0]).toBeGreaterThan(0);
  expect(peaks['.faint'][1]).toBeLessThanOrEqual(0.2 + 0.01);
  expect(peaks['.lead'][1]).toBeLessThanOrEqual(0.3 + 0.01);
});
