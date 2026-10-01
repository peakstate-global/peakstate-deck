/* Morph between two linked slides: a named element starts exactly where it was
   on the slide before, at that slide's size, and ends at its own.

   Three kinds of element each broke this once. An inline <svg> has no
   offsetWidth, so the scale was read as 1 and it flew a whole screen width. An
   image was resized by its box, which reflows the text around it. A box anchored
   by its right edge moves when its width changes, so a translate measured at
   the end size started it in the wrong place. */
import { test, expect } from '@playwright/test';

const KEYS = ['note', 'pic', 'box'];

function rects(page, slideId) {
  return page.evaluate(([id, keys]) => Object.fromEntries(keys.map((k) => {
    const r = document.querySelector(`section[data-slide-id="${id}"] [data-morph="${k}"]`).getBoundingClientRect();
    return [k, [r.left, r.top, r.width, r.height].map(Math.round)];
  })), [slideId, KEYS]);
}

test('each named element starts where it was and ends where it belongs', async ({ page }) => {
  await page.goto('/deck-morph.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.waitForTimeout(300);
  const before = await rects(page, 'from');

  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.evaluate(() =>
    document.querySelector('section[data-deck-active]')?.dataset.slideId)).toBe('to');

  // Freeze every morph at its first frame and measure where each element is drawn.
  const running = await page.evaluate(() => {
    const a = document.getAnimations().filter((x) => x.id === 'deck-morph');
    a.forEach((x) => { x.pause(); x.currentTime = 0; });
    return a.length;
  });
  expect(running).toBeGreaterThanOrEqual(3);
  const start = await rects(page, 'to');
  for (const k of KEYS) {
    start[k].forEach((v, i) => expect(Math.abs(v - before[k][i]), `${k} at the start`).toBeLessThanOrEqual(2));
  }

  // Release them, and every element lands at its own place and size.
  await page.evaluate(() => document.getAnimations().filter((x) => x.id === 'deck-morph').forEach((x) => x.finish()));
  const end = await rects(page, 'to');
  expect(end.box[2]).toBeGreaterThan(before.box[2]);
  expect(end.note[2]).toBeLessThan(before.note[2]);
  expect(end.pic[2]).toBeGreaterThan(before.pic[2]);
});
