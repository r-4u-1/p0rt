import { expect, test } from '@playwright/test';
import percySnapshot from '@percy/playwright';
import { scrollToSection, stubGitHub } from './helpers';

/**
 * Percy flows. Each test drives a real user journey and snapshots the state
 * a visitor would actually see, at every width configured in .percy.yml.
 */
test.beforeEach(async ({ page }) => {
  await stubGitHub(page);
});

test('landing view', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForTimeout(1400); // let the entrance sequence finish
  await percySnapshot(page, `Landing — ${testInfo.project.name}`);
});

test('scrolled past the hero, spine engaged', async ({ page }, testInfo) => {
  await page.goto('/');
  await scrollToSection(page, 'about');
  await expect(page.getByRole('heading', { name: /three seats/i })).toBeVisible();
  await percySnapshot(page, `About after scroll — ${testInfo.project.name}`);
});

test('projects load from GitHub', async ({ page }, testInfo) => {
  await page.goto('/');
  await scrollToSection(page, 'projects');
  await expect(page.getByRole('link', { name: /local-rag-notes/i })).toBeVisible();
  await expect(page.getByTestId('projects-status')).toContainText(/public repositories/i);
  await percySnapshot(page, `Projects loaded — ${testInfo.project.name}`);
});

test('timeline entries reveal on scroll', async ({ page }, testInfo) => {
  await page.goto('/');
  await scrollToSection(page, 'journey');
  const items = page.getByTestId('timeline-item');
  await expect(items.first()).toHaveAttribute('data-visible', 'true');
  await percySnapshot(page, `Timeline revealed — ${testInfo.project.name}`);
});

test('contact footer', async ({ page }, testInfo) => {
  await page.goto('/');
  await scrollToSection(page, 'contact');
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await percySnapshot(page, `Contact — ${testInfo.project.name}`);
});

test('mobile menu open', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The panel only exists below 900px.');

  await page.goto('/');
  await page.getByRole('button', { name: /menu/i }).click();
  await expect(page.getByRole('button', { name: /close/i })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.waitForTimeout(600);
  await percySnapshot(page, 'Mobile menu open');
});

test('GitHub unavailable falls back gracefully', async ({ page }, testInfo) => {
  await page.route('**/api.github.com/**', (route) =>
    route.fulfill({ status: 403, contentType: 'application/json', body: '{}' }),
  );

  await page.goto('/');
  await scrollToSection(page, 'projects');
  await expect(page.getByTestId('projects-status')).toContainText(/saved selection/i);
  await percySnapshot(page, `Projects fallback — ${testInfo.project.name}`);
});
