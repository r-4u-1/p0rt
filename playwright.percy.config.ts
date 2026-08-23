import { defineConfig, devices } from '@playwright/test';

/**
 * Percy runs against a production build so the snapshots match what ships.
 * Two projects give every flow a desktop and a mobile capture.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.percy.spec.ts',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env['BASE_URL']
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env['CI'],
        timeout: 120_000,
      },
});
