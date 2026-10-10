/* A slide with a long conversation: every comment surface caps its height to
   the viewport and scrolls inside itself, so the last reply box is reachable. */
import { test, expect } from '@playwright/test';
import { openDeck, goToSlide, writeComment, shot, MINTED } from './helpers.mjs';

test.use({ viewport: { width: 1366, height: 768 } });

const LONG = 'This follow-up runs long on purpose, so the thread grows taller than the window. '.repeat(3);

/** Seed slide 5 with a slide comment and eight more comments, each answered and each with follow-ups. */
async function seedLongThread(page) {
  await openDeck(page, MINTED);
  await goToSlide(page, 5);
  await page.locator('.dcx-bar [data-a="slide"]').click();
  await writeComment(page, 'Say what the stamp proves.');
  const ats = await page.evaluate((long) => {
    const k = Object.keys(localStorage).find((x) => x.startsWith('deckComments:'));
    const st = JSON.parse(localStorage.getItem(k));
    const base = st.comments[0];
    const thread = (n) => Array.from({ length: n }, (_, i) =>
      ({ by: 'reader', text: `Follow-up ${i + 1}. ${long}`, at: new Date().toISOString() }));
    base.thread = thread(10);
    for (let i = 0; i < 8; i++) {
      st.comments.push({ ...base, cid: `c-long-${i}`, target: 'selection', quote: `Quote ${i}`,
        comment: `Comment ${i + 1}. ${long}`, at: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
        thread: thread(2) });
    }
    localStorage.setItem(k, JSON.stringify(st));
    return st.comments.map((c) => c.at);
  }, LONG);
  const res = JSON.stringify({ resolutions: ats.map((at) => ({ at, status: 'addressed', note: 'Answered.' })) });
  await page.route('**/deck-minted.html', async (route) => {
    const body = (await (await route.fetch()).text()).replace('</head>',
      `<script type="application/json" id="deck-resolutions">${res}</script></head>`);
    await route.fulfill({ body, contentType: 'text/html' });
  });
  await openDeck(page, MINTED);
  await goToSlide(page, 5);
}

/** The surface fits the window, scrolls inside itself, and its last reply box shows once scrolled to. */
async function expectScrollsToLastReply(page, surface, what) {
  const vp = page.viewportSize();
  const box = await surface.boundingBox();
  expect(box.y, `${what} runs off the top`).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height, `${what} runs off the bottom`).toBeLessThanOrEqual(vp.height);
  const scrolls = await surface.evaluate((n) => n.scrollHeight > n.clientHeight + 1);
  expect(scrolls, `${what} should be taller than the window and scroll inside itself`).toBe(true);
  const last = surface.locator('.cthread').last();
  await last.locator('> textarea').scrollIntoViewIfNeeded();
  for (const part of [last.locator('.ctmsg').last(), last.locator('> textarea'), last.locator('.ctsave')]) {
    const b = await part.boundingBox();
    expect(b.y, `${what}: last reply part is above the panel`).toBeGreaterThanOrEqual(box.y - 1);
    expect(b.y + b.height, `${what}: last reply part is below the panel`).toBeLessThanOrEqual(box.y + box.height + 1);
  }
}

test('a long thread scrolls inside the popover and the panel, and the last reply box still saves', async ({ page }) => {
  await seedLongThread(page);

  // The slide comment opens its thread in the popover.
  await page.locator('.dcx-bar [data-a="slide"]').click();
  const pop = page.locator('.dcx-pop');
  await expect(pop.locator('.ctwho')).toHaveCount(12);
  // The reply box takes the keyboard, so focus lands on the newest input.
  await expect(pop.locator('.cthread > textarea')).toBeFocused();
  await expectScrollsToLastReply(page, pop, 'thread popover');
  await shot(page, 'long-thread-popover');
  await pop.locator('.cthread > textarea').fill('One more, sent by keyboard.');
  await pop.locator('.cthread > textarea').press('ControlOrMeta+Enter');
  await expect(page.locator('.dcx-pop .ctwho')).toHaveCount(13);
  await expectScrollsToLastReply(page, page.locator('.dcx-pop'), 'thread popover after a reply');
  await page.locator('.dcx-pop [data-a="cancel"]').click();

  // The comment list carries all nine threads.
  await page.locator('.dcx-bar [data-a="list"]').click();
  const panel = page.locator('.dcx-panel');
  await expect(panel.locator('.cthread')).toHaveCount(9);
  await expectScrollsToLastReply(page, panel, 'comment panel');
  await shot(page, 'long-thread-panel');
  const ta = panel.locator('.cthread').last().locator('> textarea');
  await ta.fill('A reply on the last comment.');
  await ta.press('ControlOrMeta+Enter');
  await expect(panel).toContainText('A reply on the last comment.');
});
