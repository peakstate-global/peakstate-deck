/* The sources field: provenance the presenter can read in the notes tray and
   never says. It is read only and never travels back as a note edit. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, copyPayload, shot, MINTED } from './helpers.mjs';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('the notes tray shows a slide\'s sources apart from its note, and the payload never carries them', async ({ page }) => {
  await openDeck(page, MINTED);
  await goToSlide(page, 4);
  await page.locator('.dcx-bar [data-a="notes"]').click();

  const src = page.locator('.dcx-tray .src');
  await expect(src).toBeVisible();
  await expect(src).toContainText('Sources');
  await expect(src).toContainText('did not test the recommendation');
  await expect(page.locator('.dcx-tray textarea')).toHaveValue('Give the base for each figure.');
  await shot(page, 'tray-sources');

  await goToSlide(page, 1);
  await expect(src).toBeHidden();

  await goToSlide(page, 4);
  await page.locator('.dcx-tray textarea').fill('Give the base, then pause.');
  await page.locator('.dcx-tray [data-a="close"]').click();
  const p = await copyPayload(page);
  expect(p.noteEdits.map((e) => e.note)).toEqual(['Give the base, then pause.']);
  expect(JSON.stringify(p)).not.toContain('did not test the recommendation');
});
