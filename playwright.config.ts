import { defineConfig, devices } from '@playwright/test';

const isDocker = !!process.env.BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Skip webServer when running against docker (BASE_URL is set)
  ...(!isDocker && {
    webServer: [
      {
        command: 'cd frontend && npm run dev',
        port: 5173,
        reuseExistingServer: true,
      },
      {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: true,
      },
    ],
  }),
});