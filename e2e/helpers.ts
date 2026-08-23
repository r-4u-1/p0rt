import type { Page } from '@playwright/test';

/** GitHub is stubbed so a rate limit can never turn into a failed snapshot. */
export async function stubGitHub(page: Page): Promise<void> {
  await page.route('**/api.github.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 101,
          name: 'local-rag-notes',
          description: 'Retrieval over my own notes, running entirely on Ollama.',
          html_url: 'https://github.com/example/local-rag-notes',
          language: 'Python',
          stargazers_count: 12,
          topics: ['rag', 'ollama', 'local-ai'],
          updated_at: '2026-05-02T10:00:00Z',
          fork: false,
          archived: false,
        },
        {
          id: 102,
          name: 'eval-harness',
          description: 'A small evaluation harness for prompt changes.',
          html_url: 'https://github.com/example/eval-harness',
          language: 'TypeScript',
          stargazers_count: 8,
          topics: ['evals', 'testing'],
          updated_at: '2026-04-11T10:00:00Z',
          fork: false,
          archived: false,
        },
        {
          id: 103,
          name: 'mern-toolbox',
          description: 'A MERN reference app with Playwright coverage.',
          html_url: 'https://github.com/example/mern-toolbox',
          language: 'JavaScript',
          stargazers_count: 5,
          topics: ['mern', 'playwright'],
          updated_at: '2026-02-20T10:00:00Z',
          fork: false,
          archived: false,
        },
      ]),
    });
  });
}

/** Scrolls to a section and waits for its reveal animation to settle. */
export async function scrollToSection(page: Page, id: string): Promise<void> {
  await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
}
