/* Layout limits for the default's treatments.
 *
 * A slide canvas is 1920×1080 with `overflow: hidden`, so a page that holds one
 * row too many does not break — it silently clips the last one. Nothing on
 * screen says so, and the fault survives every review that looks at the deck
 * instead of measuring it. These specs measure it.
 *
 * They drive `/default/example.html`, the shipped example deck that links the
 * real slides/deck.css, rather than a fixture
 * carrying its own copy of the canvas rules — a copy goes on passing after the
 * real canvas changes, which is the one thing a layout test must not do.
 *
 * The ceilings below are *floors on the ceiling*: the assertion is that the page
 * still holds N, not that it fails at N+1. Tightening the type or the padding
 * should make these pass by more, and only a regression should make them fail.
 */
import { test, expect } from '@playwright/test';
import { shot } from './helpers.mjs';
import { readFileSync } from 'node:fs';

const DECK = '/default/example.html';

/** Lay every slide out at once: the runtime is not needed to measure a box. */
async function openStatic(page) {
  await page.goto(DECK);
  await page.waitForSelector('deck-stage > section');
  await page.evaluate(() => {
    for (const s of document.querySelectorAll('deck-stage > section')) {
      s.style.position = 'static';
      s.style.opacity = '1';
      s.style.transform = 'none';
    }
  });
  // A kit may embed fonts; a metric measured mid-swap is a metric that lies.
  await page.evaluate(() => document.fonts.ready);
}

/** True when a slide is holding more than its 1080px canvas can show. */
function clipped(page, selector) {
  return page.evaluate((sel) => {
    const s = document.querySelector(sel).closest('deck-stage > section');
    // 2px of slack: sub-pixel line-height rounding is not a clipped row.
    return s.scrollHeight > s.clientHeight + 2;
  }, selector);
}

/** Grow a list to `n` items by cloning its last one, then re-measure. */
function grow(page, selector, n) {
  return page.evaluate(({ sel, count }) => {
    const list = document.querySelector(sel);
    const proto = list.lastElementChild;
    while (list.children.length < count) list.appendChild(proto.cloneNode(true));
    while (list.children.length > count) list.lastElementChild.remove();
    return list.children.length;
  }, { sel: selector, count: n });
}

test.describe('agenda page', () => {
  test('numbering runs on across the two columns', async ({ page }) => {
    await openStatic(page);
    // CSS counters ignore <ol start>, so the right-hand column has to set its
    // own origin. Without --ag-from it silently restarts at 01, which reads as
    // two lists of two rather than one list of four.
    const numbers = await page.evaluate(() =>
      [...document.querySelectorAll('.agenda li')].map((li) =>
        getComputedStyle(li, '::before').getPropertyValue('content')));
    expect(numbers).toHaveLength(4);

    const shown = await page.evaluate(() => {
      const seen = [];
      for (const ol of document.querySelectorAll('.agenda ol')) {
        // counter-reset on the second list is what continues the run.
        seen.push(getComputedStyle(ol).counterReset);
      }
      return seen;
    });
    expect(shown[0]).toContain('ag 0');
    expect(shown[1], 'the second column must continue the first').toContain('ag 2');
  });

  // Measured in the default's system sans and in Verdana (a wide stand-in for
  // the generic sans on CI): twelve parts fit, fourteen clip. Agenda rows are
  // one line each, so the ceiling is set by line height, not by the font.
  test('holds twelve parts without clipping', async ({ page }) => {
    await openStatic(page);
    await grow(page, '.agenda ol', 6);          // six each side, twelve in all
    await grow(page, '.agenda ol + ol', 6);
    await page.evaluate(() => {
      document.querySelector('.agenda ol + ol').style.setProperty('--ag-from', '6');
    });
    expect(await clipped(page, '.agenda'), 'twelve parts should fit').toBe(false);
    await shot(page, 'agenda-12-parts');
  });

  test('fourteen parts is past the ceiling, and says so by clipping', async ({ page }) => {
    await openStatic(page);
    await grow(page, '.agenda ol', 7);
    await grow(page, '.agenda ol + ol', 7);
    // Recorded rather than asserted as a failure: this is the documented limit,
    // and the point is that an author who needs fourteen parts needs two slides,
    // not smaller type. If a future change makes fourteen fit, raise the number
    // in slides/README.md rather than deleting this.
    const over = await clipped(page, '.agenda');
    expect(over, 'fourteen parts is expected to overrun one slide').toBe(true);
    await shot(page, 'agenda-14-parts-clipped');
  });
});

test.describe('references page', () => {
  test('holds fourteen entries beside the provenance block', async ({ page }) => {
    await openStatic(page);
    // Measured with two-line entries (the example deck's last entry, which grow()
    // clones): .dense (15px) holds seventeen, the default 21px holds eleven.
    // Fourteen is the floor asserted here, with room for a wider font on CI.
    // Past fourteen, split the page rather than shrinking the type again.
    await page.evaluate(() => document.querySelector('.refpage ol.apa').classList.add('dense'));
    await grow(page, '.refpage ol.apa', 14);
    expect(await clipped(page, '.refpage'), 'fourteen entries should fit').toBe(false);
    await shot(page, 'refs-14-entries');
  });

  test('nineteen entries in .dense is past the ceiling, and says so by clipping', async ({ page }) => {
    await openStatic(page);
    // Two past the measured .dense ceiling of seventeen, so this tests the edge
    // that matters: even the smaller type cannot take it.
    await page.evaluate(() => document.querySelector('.refpage ol.apa').classList.add('dense'));
    await grow(page, '.refpage ol.apa', 19);
    expect(await clipped(page, '.refpage'),
      'nineteen entries is expected to overrun one slide, even in .dense').toBe(true);
    await shot(page, 'refs-19-dense-entries-clipped');
  });

  test('the provenance block stays one column inside the references page', async ({ page }) => {
    await openStatic(page);
    // .pblock.small.boxed sets its own two-column grid; .refpage has to win, or
    // the block reflows into two narrow columns against the entries.
    const cols = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.refpage .pblock')).gridTemplateColumns);
    expect(cols.split(' ')).toHaveLength(1);
  });

  test('entries carry no quoted passages', async ({ page }) => {
    await openStatic(page);
    // A deck cites; it does not quote. The passages live in the .sourced
    // sidecar, because one quote per source turns one page into four.
    const quotes = await page.locator('.refpage blockquote').count();
    expect(quotes, 'quoted passages belong in the sidecar, not on a slide').toBe(0);
  });
});

test('no slide in the shipped example deck clips', async ({ page }) => {
  await openStatic(page);
  const over = await page.evaluate(() =>
    [...document.querySelectorAll('deck-stage > section')]
      .map((s, i) => ({ i: i + 1, label: s.dataset.screenLabel,
                        by: s.scrollHeight - s.clientHeight }))
      .filter((x) => x.by > 2));
  expect(over, `slides overrun the canvas: ${JSON.stringify(over)}`).toEqual([]);
  await shot(page, 'theme-deck-all-slides');
});

test.describe('counters survive the PowerPoint export', () => {
  /* innerText does not see a ::before, so a CSS counter is invisible to the
     layout dump the exporter reads. Left alone, an agenda exports with no
     numbers and a references list exports with none either — which silently
     breaks every <sup class="cite">n</sup> pointing at it from another slide.
     deck-tools.js recomputes the value; this is the check that it still does. */
  async function withCounterText(page) {
    const src = readFileSync(new URL('../../slides/deck-tools.js', import.meta.url), 'utf8');
    const fn = src.match(/var counterText = function \(el\) \{[\s\S]*?\n      \};/);
    expect(fn, 'counterText has been renamed or removed from deck-tools.js').not.toBeNull();
    await page.evaluate((body) => {
      window.counterText = eval('(' + body.replace(/^var counterText = /, '').replace(/;$/, '') + ')');
    }, fn[0]);
  }

  test('agenda numbers reach the dump, running on across both columns', async ({ page }) => {
    await openStatic(page);
    await withCounterText(page);
    const nums = await page.evaluate(() =>
      [...document.querySelectorAll('.agenda li')].map((li) => window.counterText(li).trim()));
    expect(nums).toEqual(['01', '02', '03', '04']);
  });

  test('reference numbers reach the dump, with the stop the list is read by', async ({ page }) => {
    await openStatic(page);
    await withCounterText(page);
    const nums = await page.evaluate(() =>
      [...document.querySelectorAll('.refpage ol.apa li')].map((li) => window.counterText(li).trim()));
    expect(nums).toEqual(['1.', '2.', '3.']);
  });

  test('an element with no counter is left alone', async ({ page }) => {
    await openStatic(page);
    await withCounterText(page);
    const blank = await page.evaluate(() =>
      window.counterText(document.querySelector('.slide-foot')));
    expect(blank).toBe('');
  });
});
