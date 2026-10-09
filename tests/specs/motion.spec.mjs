/* ?motion: the foreground of every presented slide settles by 7 seconds, and
   anything that loops for ever is marked data-ambient on purpose. */
import { test, expect } from '@playwright/test';

test('the motion audit reports when each slide settles and flags late or unmarked motion', async ({ page }) => {
  await page.goto('/deck-motion.html?motion');
  const report = await page.locator('pre#motion-report').textContent({ timeout: 15000 });
  const line = (label) => report.split('\n').find((l) => l.includes(`${label}]`)) || '';

  expect(line('Still')).toMatch(/still/);
  expect(line('Quick')).toMatch(/settles 1\.5s/);
  expect(line('Slow')).toMatch(/LATE settles 8\.0s/);
  expect(line('Loop')).toMatch(/LOOP/);
  expect(line('Loop')).not.toMatch(/still/);
  expect(line('Ambient')).toMatch(/settles 1\.5s/);
  expect(line('Ambient')).toMatch(/1 ambient/);
  expect(line('Ambient')).not.toMatch(/LOOP/);
  expect(report).not.toContain('Hidden]');
  expect(report).toContain('2 PROBLEM(S)');
});
