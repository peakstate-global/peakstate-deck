/* Tables pad every cell on both sides.
 *
 * A cell with no side padding puts its text hard against the neighbouring
 * cell's fill, so a highlighted cell's colour runs into the next cell's words.
 * The theme makes padding the standard (treatments.css, "table house style").
 * This drives the real theme through its example deck, adds a table with a
 * filled cell, and measures the gap between the fill and the next cell's text.
 */
import { test, expect } from '@playwright/test';

const MIN = 16; // px: the least side padding that still reads as a gap

test('every table cell is padded on both sides, matrix variants included', async ({ page }) => {
  await page.goto('/theme/deck.html');
  await page.waitForSelector('deck-stage > section');
  const out = await page.evaluate(() => {
    const sec = document.querySelector('deck-stage > section');
    sec.insertAdjacentHTML('beforeend', `
      <table id="t1"><tr><th>A</th><th>B</th><th>C</th></tr>
        <tr><td class="home" style="background:#D0B561">Filled</td><td id="next">Next words</td><td>Last</td></tr></table>
      <table id="t2" class="matrix refs"><tr><td class="move">Move</td><td class="scale">Scale</td><td class="own">Own</td><td>Last</td></tr></table>`);
    return [...sec.querySelectorAll('#t1 th, #t1 td, #t2 td')].map(c => {
      const cs = getComputedStyle(c);
      return { text: c.textContent, left: parseFloat(cs.paddingLeft), right: parseFloat(cs.paddingRight) };
    });
  });
  for (const c of out) {
    expect(c.left, `${c.text} left padding`).toBeGreaterThanOrEqual(MIN);
    expect(c.right, `${c.text} right padding`).toBeGreaterThanOrEqual(MIN);
  }
});

test('text never sits flush against a filled neighbour', async ({ page }) => {
  await page.goto('/theme/deck.html');
  await page.waitForSelector('deck-stage > section');
  const gap = await page.evaluate(() => {
    const sec = document.querySelector('deck-stage > section');
    sec.insertAdjacentHTML('beforeend', `<table style="border-collapse:collapse"><tr>
      <td id="fill" style="background:#D0B561">Filled</td><td id="next">Next words</td></tr></table>`);
    const fill = sec.querySelector('#fill').getBoundingClientRect();
    const r = document.createRange(); r.selectNodeContents(sec.querySelector('#next'));
    const text = r.getBoundingClientRect();
    const scale = fill.width / sec.querySelector('#fill').offsetWidth || 1;
    return (text.left - fill.right) / scale;
  });
  expect(gap).toBeGreaterThanOrEqual(MIN);
});
