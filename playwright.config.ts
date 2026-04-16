import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'npm run dev:api',
      url: 'http://127.0.0.1:3001/api/v1/me',
      reuseExistingServer: true,
      timeout: 120_000
    },
    {
      command: 'NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api/v1 npm run dev:web',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 120_000
    }
  ]
});
