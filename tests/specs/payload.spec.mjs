/* The payload, the two chrome-free modes, and comment re-anchoring. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, selectOnSlide, writeComment, copyPayload,
         MINTED, RELABELLED, LEGACY } from './helpers.mjs';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

/** Every array in a version 3 payload that names a slide. */
const SLIDE_ARRAYS = ['comments', 'starredSlides', 'hiddenSlides', 'visibilityChanges',
                      'noteEdits', 'slideOrder'];

test('a minted deck emits a valid version 4 payload with slideId on every slide array', async ({ page }) => {
  await openDeck(page, MINTED);

  await goToSlide(page, 2);
  await selectOnSlide(page, 'the cards laid across it');
  await writeComment(page, 'Say which cards.');

  await goToSlide(page, 5);
  await page.locator('.dcx-bar [data-a="slide"]').click();
  await writeComment(page, 'This slide needs the check a reader can run.');

  await goToSlide(page, 3);
  await page.locator('body').press('s');
  await page.locator('.dcx-bar [data-a="hide"]').click();

  await page.locator('.dcx-bar [data-a="notes"]').click();
  await page.locator('.dcx-tray textarea').fill('Turn here, and let it land.');
  await page.locator('.dcx-tray [data-a="close"]').click();

  await page.locator('.dcx-bar [data-a="overview"]').click();
  await page.locator('.dcx-ovtile[data-slide="1"]').focus();
  await page.keyboard.press('Alt+ArrowRight');
  await page.locator('.dcx-ovhdr [data-a="close"]').click();

  const p = await copyPayload(page);

  expect(p.kind).toBe('deck-comments');
  expect(p.version).toBe(4);
  expect(p.slideCount).toBe(8);
  expect(p.deck.file).toBe('fixtures/deck-minted.html');
  expect(p.deck.source).toBe('fixtures/build_minted.py');
  expect(p.deck.buildHash).toBe('84c3ea6ae5e8');
  expect(typeof p.instruction).toBe('string');
  expect(new Date(p.capturedAt).toString()).not.toBe('Invalid Date');

  expect(p.openCount).toBe(2);
  expect(p.comments.map((c) => c.target).sort()).toEqual(['selection', 'slide']);
  expect(p.comments.find((c) => c.target === 'selection').quote).toBe('the cards laid across it');
  expect(p.orderChanged).toBe(true);
  expect(p.slideOrder).toHaveLength(8);
  expect(p.slideOrder[0]).toMatchObject({ position: 1, wasSlide: 2, slideId: 'the-board' });
  expect(p.slideOrder[1]).toMatchObject({ position: 2, wasSlide: 1, slideId: 'opening' });
  expect(p.starredSlides.map((s) => s.slideId)).toContain('the-pivot');
  // Version 4 lists only slides the READER hid. `costs` carries data-hidden-src, so it is
  // already hidden in the generator, needs no action, and is counted in `unchanged` instead.
  expect(p.hiddenSlides.map((h) => h.slideId).sort()).toEqual(['the-pivot']);
  expect(p.hiddenSlides.find((h) => h.slideId === 'the-pivot').inSource).toBe(false);
  expect(p.unchanged.hiddenInSource).toBe(1);
  expect(p.visibilityChanges).toHaveLength(1);
  expect(p.visibilityChanges[0]).toMatchObject({ slideId: 'the-pivot', from: 'visible', to: 'hidden' });
  expect(p.noteEdits.map((n) => n.slideId)).toEqual(['the-pivot']);
  expect(p.noteEdits[0].note).toBe('Turn here, and let it land.');

  for (const key of SLIDE_ARRAYS) {
    for (const [i, row] of (p[key] || []).entries()) {
      expect(typeof row.slideId, `${key}[${i}] carries no slideId`).toBe('string');
      expect(row.slideId.length, `${key}[${i}] has an empty slideId`).toBeGreaterThan(0);
      expect(typeof row.slideLabel, `${key}[${i}] carries no slideLabel`).toBe('string');
    }
  }
});

test('Copy clears the unsent-changes mark, and only after the payload is on the clipboard', async ({ page }) => {
  await openDeck(page, MINTED);
  const badge = page.locator('.dcx-bar .dcx-count');
  await expect(badge).toHaveText('0');
  await expect(badge).toHaveClass(/zero/);

  await goToSlide(page, 2);
  await page.locator('body').press('s');
  await expect(badge).toHaveClass(/dirty/);
  await expect(badge).toHaveText('● 0');
  await expect(page.locator('.dcx-bar [data-a="list"]'))
    .toHaveAttribute('aria-label', /Unsent changes: .*star/);

  await copyPayload(page);
  await expect(badge).not.toHaveClass(/dirty/);
  await expect(badge).toHaveText('0');
});

test('Copy refuses when nothing has changed', async ({ page }) => {
  await openDeck(page, MINTED);
  await page.locator('.dcx-bar [data-a="copy"]').click();
  await expect(page.locator('.dcx-toast')).toHaveText('Nothing to copy yet');
});

test('a legacy deck with no minted ids still emits a valid payload, with slideId absent', async ({ page }) => {
  await openDeck(page, LEGACY);

  await goToSlide(page, 2);
  await selectOnSlide(page, 'the base it was measured against');
  await writeComment(page, 'Give the base.');
  await page.locator('body').press('s');
  await page.locator('.dcx-bar [data-a="hide"]').click();

  const p = await copyPayload(page);
  expect(p.kind).toBe('deck-comments');
  expect(p.version).toBe(4);
  expect(p.slideCount).toBe(4);
  expect(p.comments).toHaveLength(1);
  expect(p.comments[0].slide).toBe(2);
  expect(p.comments[0].slideLabel).toBe('What we found');
  expect(p.starredSlides).toHaveLength(1);
  expect(p.hiddenSlides).toHaveLength(1);

  for (const key of SLIDE_ARRAYS) {
    for (const [i, row] of (p[key] || []).entries()) {
      // The key is simply omitted. Never empty, and never the label wearing an
      // id's name, which would send the agent to the wrong slide.
      expect('slideId' in row && row.slideId !== undefined,
        `${key}[${i}] carries a slideId on an unminted deck`).toBe(false);
      expect(typeof row.slideLabel, `${key}[${i}] carries no slideLabel to fall back to`).toBe('string');
    }
  }
});

test('a comment survives the slide it is on being relabelled', async ({ page }) => {
  await openDeck(page, MINTED);
  await goToSlide(page, 5);
  await selectOnSlide(page, 'The provenance mark');
  await writeComment(page, 'Name the thing it stamps.');

  // The next build renames slide 5 from "The stamp" to "Confabulation stamp".
  // Same deck-file, so the same stored review, and the same minted id.
  await openDeck(page, RELABELLED);
  await expect(page.locator('.dcx-bar .dcx-count')).toHaveText(/1/);

  await page.locator('.dcx-bar [data-a="list"]').click();
  // .item also covers the unsent-changes and orphan rows, so name the comment.
  const item = page.locator('.dcx-panel .item:not(.dirtyrow):not(.orphanrow)').first();
  await expect(item, 'the comment orphaned when the heading was rewritten')
    .not.toContainText('ORPHANED');
  await expect(page.locator('.dcx-panel .orphanrow')).toHaveCount(0);
  // The record keeps the label it was WRITTEN about. The deck now says
  // "Confabulation stamp"; the comment still says what the reader saw.
  await expect(item.locator('.slide')).toHaveText('Slide 5 · The stamp');

  const p = await copyPayload(page);
  expect(p.comments).toHaveLength(1);
  expect(p.comments[0].slideId).toBe('the-stamp');
  expect(p.comments[0].slide).toBe(5);
  expect(p.orphanedComments || []).toHaveLength(0);
});

test('?export renders no review chrome at all', async ({ page }) => {
  await page.goto(`${MINTED}?export`);
  await page.waitForSelector('deck-stage > section[data-deck-active]');
  await expect(page.locator('.dcx')).toHaveCount(0);
  await expect(page.locator('.dcx-bar')).toHaveCount(0);
});

test('?audit renders no review chrome at all', async ({ page }) => {
  await page.goto(`${MINTED}?audit`);
  await page.waitForSelector('deck-stage > section[data-deck-active]');
  await expect(page.locator('.dcx')).toHaveCount(0);
});

test('presentation mode hides the bar, and Escape brings it back', async ({ page }) => {
  await openDeck(page, MINTED);
  await expect(page.locator('.dcx-bar')).toBeVisible();
  await page.locator('.dcx-bar [data-a="perform"]').click();
  await expect(page.locator('body')).toHaveClass(/dcx-performing/);
  await expect(page.locator('.dcx-bar')).toBeHidden();
  await expect(page.locator('.dcx-count')).toBeHidden();

  await page.locator('body').press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/dcx-performing/);
  await expect(page.locator('.dcx-bar')).toBeVisible();
});

test('S does nothing while presenting', async ({ page }) => {
  await openDeck(page, MINTED);
  await page.locator('.dcx-bar [data-a="perform"]').click();
  await page.locator('body').press('s');
  await page.locator('body').press('Escape');
  await expect(page.locator('.dcx-bar [data-a="star"]')).toHaveAttribute('aria-pressed', 'false');
});

/* ── the stored shape carries a version ───────────────────────────────────
   A review lives only in localStorage and outlives the build it was written
   against. Before this, the stored state announced nothing about its shape, so
   a change to a field's meaning would merge silently into the new defaults and
   look fine while meaning something else. These cover the two cases that lose
   a reader's work if they go wrong: a review written before versioning, and one
   written by a build newer than the runtime opening it. */

/** Plant a saved review under the key the runtime reads, then load the deck.
 *  `labels` is filled in from the deck itself unless the caller sets it: a real
 *  saved review always carries that snapshot, and without it re-anchoring
 *  correctly refuses to place a number-keyed record — which is a different
 *  behaviour from the one these tests are about. */
async function seedReview(page, url, stored) {
  await page.goto(url);                       // an origin to write localStorage against
  await page.evaluate(({ u, s }) => {
    const file = document.querySelector('meta[name="deck-file"]')?.content;
    if (!s.labels) {
      s.labels = {};
      [...document.querySelectorAll('deck-stage > section')].forEach((sec, i) => {
        s.labels[i + 1] = sec.dataset.slideId || sec.dataset.screenLabel;
      });
    }
    localStorage.setItem('deckComments:' + (file || new URL(u).pathname), JSON.stringify(s));
  }, { u: page.url(), s: stored });
  await page.goto(url);
  await page.waitForSelector('.dcx-bar');
}

function readStored(page) {
  return page.evaluate(() => {
    const file = document.querySelector('meta[name="deck-file"]')?.content;
    return JSON.parse(localStorage.getItem('deckComments:' + (file || location.pathname)) || '{}');
  });
}

test('an unversioned review is adopted, not discarded, and stamped', async ({ page }) => {
  await seedReview(page, MINTED, {
    comments: [{ at: 1, slide: 2, slideLabel: 'The board', text: 'kept', body: 'kept', status: 'new' }],
    starred: { 3: true },
  });
  // The reader's work survives the bump; that is the whole point of the seam.
  const payload = await copyPayload(page);
  expect(payload.commentCount, 'a pre-version review must not be dropped').toBe(1);
  expect(payload.stateVersion).toBe(1);

  const stored = await readStored(page);
  expect(stored.v, 'the shape is stamped once it has been read').toBe(1);
  expect(stored.starred['3'], 'unrelated fields survive the migration').toBe(true);
});

test('a review from a newer build keeps its unknown fields', async ({ page }) => {
  await seedReview(page, MINTED, {
    v: 99,
    comments: [{ at: 2, slide: 2, slideLabel: 'The board', text: 'future', body: 'future', status: 'new' }],
    somethingWeDoNotKnowAbout: { keep: 'me' },
  });
  const stored = await readStored(page);
  // Opening a deck on an older build and closing it again must not strip work
  // the reader did on a newer one.
  expect(stored.v, 'a newer shape is not downgraded').toBe(99);
  expect(stored.somethingWeDoNotKnowAbout, 'unknown fields are preserved')
    .toEqual({ keep: 'me' });
});
