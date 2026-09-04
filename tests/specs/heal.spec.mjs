/* A stranded exit animation is invisible text.

   Both mechanisms that hide a leaving slide — `.deck-exiting` on the section and
   the fill-both `deck-flash-out-*` class on its elements — are undone on a
   setTimeout. A timer is a promise, not a guarantee, so the arriving slide
   clears its own leftovers instead. This asserts it does, because the fault it
   prevents has never reproduced on demand and would otherwise ship unnoticed. */
import { expect, test } from '@playwright/test';
import { goToSlide, openDeck } from './helpers.mjs';

/** Put a slide in the state a timer that never fired would have left it in. */
async function strand(page, index) {
  await page.evaluate((i) => {
    const sec = document.querySelectorAll('deck-stage > section')[i];
    sec.classList.add('deck-exiting');
    sec.querySelector('*')?.classList.add('deck-flash-out-y');
  }, index);
}

test('a slide arriving mid-exit clears its own stranded animation', async ({ page }) => {
  await openDeck(page);
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));

  await goToSlide(page, 3);
  await strand(page, 1); // slide 2, the one we are about to step back onto
  await goToSlide(page, 2);

  const state = await page.evaluate(() => {
    const sec = document.querySelector('deck-stage > section[data-deck-active]');
    return {
      id: sec.getAttribute('data-slide-id'),
      exiting: sec.classList.contains('deck-exiting'),
      outFlashes: sec.querySelectorAll('.deck-flash-out-x,.deck-flash-out-y').length,
      visibility: getComputedStyle(sec).visibility,
    };
  });

  expect(state.exiting).toBe(false);
  expect(state.outFlashes).toBe(0);
  expect(state.visibility).toBe('visible');
  expect(warnings.join('\n')).toContain('healed a stranded animation');
});

test('an ordinary step leaves no warning behind', async ({ page }) => {
  await openDeck(page);
  const warnings = [];
  page.on('console', (m) => m.type() === 'warning' && warnings.push(m.text()));
  await goToSlide(page, 2);
  await goToSlide(page, 3);
  await goToSlide(page, 2);
  expect(warnings.filter((w) => w.includes('healed'))).toEqual([]);
});
