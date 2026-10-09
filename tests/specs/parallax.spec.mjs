/* Parallax: a layer marked data-parallax travels at that fraction of the push.
   Measured on screen at the push's midpoint, against its own slide. */
import { test, expect } from '@playwright/test';

const where = (id) => {
  const sec = document.querySelector(`section[data-slide-id="${id}"]`);
  const s = sec.getBoundingClientRect(), k = sec.querySelector('[data-parallax]').getBoundingClientRect();
  return { top: s.top, skyRel: k.top - s.top };
};

test('a far layer trails its slide during the push, by (1 - speed) of the travel', async ({ page }) => {
  await page.goto('/deck-parallax.html');
  await page.waitForFunction(() => customElements.get('deck-stage'));
  await page.waitForTimeout(300);
  const rest = await page.evaluate(`(${where})('one')`);

  await page.keyboard.press('ArrowRight');
  const m = await page.evaluate(`(() => {
    const anims = document.getAnimations();
    anims.forEach((a) => { a.pause(); a.currentTime = 310; });
    const w = ${where};
    return { count: anims.length, one: w('one'), two: w('two') };
  })()`);

  expect(m.count).toBeGreaterThanOrEqual(4);   // two slides and two layers
  // The leaving slide is offOne above its rest place; its sky has moved only 0.3
  // of that, so it sits 0.7 * offOne lower inside the slide. The entering slide
  // mirrors it from below.
  const offOne = rest.top - m.one.top, offTwo = m.two.top - rest.top;
  expect(offOne).toBeGreaterThan(50);
  expect((m.one.skyRel - rest.skyRel) / offOne).toBeCloseTo(0.7, 1);
  expect((rest.skyRel - m.two.skyRel) / offTwo).toBeCloseTo(0.7, 1);
});
