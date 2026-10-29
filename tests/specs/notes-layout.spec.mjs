/* The notes panel layout: bottom (notes 66, sources 34, height dragged from the
   top edge) or a side column 20% wide with its own sources toggle. The slide
   rescales into the space the panel leaves. The layout is one global record,
   so every deck opens its notes the same way. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, shot, MINTED, LEGACY } from './helpers.mjs';

// Outline the slide so the screenshots show where the canvas sits.
async function outline(page) {
  await page.addStyleTag({ content: 'deck-stage > section{outline:6px solid #D0B561;outline-offset:-6px}' });
}
function canvasBox(page) {
  return page.evaluate(() => {
    const r = document.querySelector('deck-stage').shadowRoot.querySelector('.canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
  });
}
const box = (page, sel) => page.locator(sel).boundingBox();

test('bottom mode: notes and sources side by side, slide rescaled above the panel', async ({ page }) => {
  await openDeck(page, MINTED);
  await outline(page);
  await goToSlide(page, 4);
  const full = await canvasBox(page);
  await page.locator('.dcx-bar [data-a="notes"]').click();

  const tray = await box(page, '.dcx-tray');
  const nt = await box(page, '.dcx-tray .nt');
  const src = await box(page, '.dcx-tray .src');
  expect(Math.abs(tray.y + tray.height - page.viewportSize().height)).toBeLessThan(1);
  expect(Math.abs(nt.y - src.y)).toBeLessThan(1); // side by side
  const inner = nt.width + src.width;
  expect(nt.width / inner).toBeGreaterThan(0.64);
  expect(nt.width / inner).toBeLessThan(0.68);

  const c = await canvasBox(page);
  expect(c.bottom).toBeLessThanOrEqual(tray.y + 1); // never under the panel
  expect(c.h).toBeLessThan(full.h);
  expect(Math.abs(c.w / c.h - 16 / 9)).toBeLessThan(0.01); // aspect kept
  await shot(page, 'notes-bottom');

  // Drag the top edge up 200px: the panel grows and the slide shrinks live.
  const g = await box(page, '.dcx-tray .grip');
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
  await page.mouse.down();
  await page.mouse.move(g.x + g.width / 2, g.y - 100, { steps: 4 });
  const mid = await canvasBox(page);
  expect(mid.h).toBeLessThan(c.h);
  await page.mouse.move(g.x + g.width / 2, g.y - 200, { steps: 4 });
  await page.mouse.up();
  const tall = await box(page, '.dcx-tray');
  expect(tall.height).toBeGreaterThan(tray.height + 190);
  const c2 = await canvasBox(page);
  expect(c2.bottom).toBeLessThanOrEqual(tall.y + 1);
  await shot(page, 'notes-bottom-tall');

  // Far past the limit clamps at 75% of the window.
  const g2 = await box(page, '.dcx-tray .grip');
  await page.mouse.move(g2.x + 10, g2.y + 5);
  await page.mouse.down();
  await page.mouse.move(g2.x + 10, 0, { steps: 4 });
  await page.mouse.up();
  expect((await box(page, '.dcx-tray')).height).toBeLessThanOrEqual(page.viewportSize().height * 0.75 + 1);

  // Close gives the space back.
  await page.locator('.dcx-tray [data-a="close"]').click();
  const back = await canvasBox(page);
  expect(Math.abs(back.h - full.h)).toBeLessThan(1);
});

test('side mode: a 20% column, sources behind their own toggle, slide left of it', async ({ page }) => {
  await openDeck(page, MINTED);
  await outline(page);
  await goToSlide(page, 4);
  await page.locator('.dcx-bar [data-a="notes"]').click();
  await expect(page.locator('.dcx-tray [data-a="srcs"]')).toBeHidden();
  await page.locator('.dcx-tray [data-a="side"]').click();
  await expect(page.locator('.dcx-tray [data-a="side"]')).toHaveAttribute('aria-pressed', 'true');

  const col = await box(page, '.dcx-tray');
  expect(Math.abs(col.width - page.viewportSize().width * 0.2)).toBeLessThan(1);
  expect(Math.abs(col.x + col.width - page.viewportSize().width)).toBeLessThan(1);
  expect(col.y).toBeLessThan(1);
  expect(Math.abs(col.height - page.viewportSize().height)).toBeLessThan(1);
  await expect(page.locator('.dcx-tray .src')).toBeHidden();
  const c = await canvasBox(page);
  expect(c.right).toBeLessThanOrEqual(col.x + 1);
  expect(Math.abs(c.w / c.h - 16 / 9)).toBeLessThan(0.01);
  // The bar steps left of the column rather than covering its header.
  const b = await box(page, '.dcx-bar');
  expect(b.x + b.width).toBeLessThanOrEqual(col.x);
  await shot(page, 'notes-side');

  await page.locator('.dcx-tray [data-a="srcs"]').click();
  await expect(page.locator('.dcx-tray .src')).toBeVisible();
  await expect(page.locator('.dcx-tray .src')).toContainText('did not test the recommendation');
  await shot(page, 'notes-side-sources');

  // Editing and Revert still work in the column.
  await page.locator('.dcx-tray textarea').fill('Changed in the column.');
  await expect(page.locator('.dcx-tray .edited')).toBeVisible();
  await page.locator('.dcx-tray [data-a="revert"]').click();
  await expect(page.locator('.dcx-tray textarea')).toHaveValue('Give the base for each figure.');

  // Esc closes and the slide goes back to full width.
  await page.locator('.dcx-tray textarea').press('Escape');
  await expect(page.locator('.dcx-tray')).toBeHidden();
  expect((await canvasBox(page)).right).toBeGreaterThan(col.x + 10);
});

test('the layout is one global record: another deck opens notes the same way', async ({ page }) => {
  await openDeck(page, MINTED);
  await page.locator('.dcx-bar [data-a="notes"]').click();
  await page.locator('.dcx-tray [data-a="side"]').click();
  await page.locator('.dcx-tray [data-a="srcs"]').click();
  const rec = await page.evaluate(() => JSON.parse(localStorage.getItem('deck-notes-layout')));
  expect(rec).toMatchObject({ mode: 'side', src: true });

  await openDeck(page, LEGACY);
  await page.locator('.dcx-bar [data-a="notes"]').click();
  await expect(page.locator('.dcx-tray')).toHaveClass(/\bside\b/);
  await expect(page.locator('.dcx-tray [data-a="srcs"]')).toHaveAttribute('aria-pressed', 'true');
});

test('presenting gives the slide its full size and hides the panel; print hides it', async ({ page }) => {
  await openDeck(page, MINTED);
  const full = await canvasBox(page);
  await page.locator('.dcx-bar [data-a="notes"]').click();
  await page.locator('.dcx-bar [data-a="perform"]').click();
  await expect(page.locator('.dcx-tray')).toBeHidden();
  expect(Math.abs((await canvasBox(page)).h - full.h)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.dcx-tray')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.dcx-tray')).toBeHidden();
});
