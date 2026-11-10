/* A live slide with part of it invisible.

   After a presenter stepped back and forth across a linked morph and a group of
   states, an element on the live slide could compute `visibility: hidden` while
   its slide computed `visible`, with no rule, inline style or animation to
   explain it. Chromium passes an inherited visibility down by a fast path that
   skips an element whose last style came through an animation (the fades a
   linked morph runs on the arriving slide), so the element kept the `hidden` it
   inherited while its slide was off screen. The runtime now makes the slide's
   arrival restyle everything inside it. This walk reproduced the fault every
   time before that rule existed. */
import { test, expect } from '@playwright/test';

/** Every element with text on the live slide that computes hidden. */
const hiddenOnLive = (page) => page.evaluate(() => {
  const sec = document.querySelector('deck-stage > section[data-deck-active]');
  if (!sec || getComputedStyle(sec).visibility !== 'visible') return [];
  return [...sec.querySelectorAll('*')]
    .filter((el) => el.textContent.trim() && getComputedStyle(el).visibility === 'hidden')
    .map((el) => sec.dataset.slideId + ' ' + el.tagName + '.' + el.className);
});

test('stepping back and forth never leaves the live slide partly invisible', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/deck-revisit.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.waitForTimeout(300);
  // A fixed walk, so a failure replays: out to the end, back, and a jitter
  // across the linked pair and the states. Steps 22 and 34 were the faults.
  const keys = 'RRRRRRRLLLLLLRLRLRRLRLLRRRLLRLRLLLR';
  const waits = [200, 1600, 250, 900, 300, 1200, 220, 600];
  const bad = [];
  for (let i = 0; i < keys.length; i++) {
    await page.keyboard.press(keys[i] === 'R' ? 'ArrowRight' : 'ArrowLeft');
    await page.waitForTimeout(waits[i % waits.length]);
    bad.push(...(await hiddenOnLive(page)).map((s) => 'step ' + i + ': ' + s));
  }
  expect(bad).toEqual([]);
});
