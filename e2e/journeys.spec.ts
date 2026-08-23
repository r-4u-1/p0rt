import { expect, test } from '@playwright/test';
import { stubGitHub } from './helpers';

/**
 * Functional end-to-end checks. These assert behaviour; the Percy spec
 * asserts appearance. Run with `npm run e2e`.
 */
test.beforeEach(async ({ page }) => {
  await stubGitHub(page);
  await page.goto('/');
});

test('navigating by menu moves to the right section', async ({ page }) => {
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 900) {
    await page.getByRole('button', { name: /menu/i }).click();
  }

  await page.getByRole('link', { name: /journey/i }).click();
  await expect(page.locator('#journey')).toBeInViewport({ timeout: 5000 });
});

test('the whole page is reachable with a keyboard', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /skip to main content/i })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeVisible();
});

test('the scroll spine advances as the page is read', async ({ page }) => {
  const spine = page.getByTestId('scroll-spine');
  const readProgress = async () =>
    Number(await spine.evaluate((node) => getComputedStyle(node).getPropertyValue('--progress')));

  expect(await readProgress()).toBeLessThan(0.1);

  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  expect(await readProgress()).toBeGreaterThan(0.5);
});

test('project cards link out to GitHub', async ({ page }) => {
  await page.locator('#projects').scrollIntoViewIfNeeded();
  const card = page.getByRole('link', { name: /local-rag-notes/i });
  await expect(card).toHaveAttribute('href', 'https://github.com/example/local-rag-notes');
  await expect(card).toHaveAttribute('target', '_blank');
});
