/* A hidden flag belongs to its slide, not to a position: a reorder and a
   reload must leave the same slides hidden. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, copyPayload } from './helpers.mjs';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const THREE = '/deck-three.html';
const KEY = 'deckComments:fixtures/deck-three.html';

/** Slide ids in DOM order, each with its hidden flag. */
function deckState(page) {
  return page.evaluate(() => [...document.querySelectorAll('deck-stage > section')]
    .map((s) => [s.dataset.slideId, s.hasAttribute('data-hidden')]));
}

test('a hidden slide stays hidden after it moves and the deck reloads', async ({ page }) => {
  await openDeck(page, THREE);
  await goToSlide(page, 2);
  await page.locator('.dcx-bar [data-a="hide"]').click();

  await page.locator('.dcx-bar [data-a="overview"]').click();
  await page.locator('.dcx-ovtile[data-slide="2"]').focus();
  await page.keyboard.press('Alt+ArrowLeft');
  await page.locator('.dcx-ovhdr [data-a="close"]').click();
  expect(await deckState(page)).toEqual([['slide-b', true], ['slide-a', false], ['slide-c', false]]);

  await page.reload();
  await page.waitForSelector('.dcx-bar');
  expect(await deckState(page)).toEqual([['slide-b', true], ['slide-a', false], ['slide-c', false]]);

  // The payload names the slide by id first, and its number is the reviewed build's.
  const p = await copyPayload(page);
  expect(Object.keys(p.hiddenSlides[0])[0]).toBe('slideId');
  expect(p.hiddenSlides).toEqual([expect.objectContaining({ slideId: 'slide-b', slide: 2 })]);
  expect(p.visibilityChanges).toEqual([expect.objectContaining({ slideId: 'slide-b', slide: 2, to: 'hidden' })]);
});

async function seed(page, stored) {
  await page.goto(THREE);
  await page.evaluate(({ k, s }) => localStorage.setItem(k, JSON.stringify(s)), { k: KEY, s: stored });
  await page.goto(THREE);
  await page.waitForSelector('.dcx-bar');
}
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);

test('a number-keyed hide with no reorder migrates through the saved labels', async ({ page }) => {
  await seed(page, { v: 1, hidden: { 2: true }, labels: { 1: 'slide-a', 2: 'slide-b', 3: 'slide-c' } });
  expect(await deckState(page)).toEqual([['slide-a', false], ['slide-b', true], ['slide-c', false]]);
  const s = await stored(page);
  expect(s.v).toBe(2);
  expect(s.hidden).toEqual({ 'slide-b': true });
});

test('a number-keyed hide saved after a reorder migrates through the build order, once', async ({ page }) => {
  // The broken shape: B hidden at build position 2, then moved first, so the
  // label snapshot says position 2 is A. The build order recovers B.
  await seed(page, { v: 1, hidden: { 2: true }, orderIds: ['slide-b', 'slide-a', 'slide-c'],
                     labels: { 1: 'slide-b', 2: 'slide-a', 3: 'slide-c' } });
  expect(await deckState(page)).toEqual([['slide-b', true], ['slide-a', false], ['slide-c', false]]);
  expect((await stored(page)).hidden).toEqual({ 'slide-b': true });

  await page.reload();
  await page.waitForSelector('.dcx-bar');
  expect(await deckState(page)).toEqual([['slide-b', true], ['slide-a', false], ['slide-c', false]]);
  expect((await stored(page)).v).toBe(2);
});
