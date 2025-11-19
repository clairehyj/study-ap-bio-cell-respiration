const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: { 
        ...require('@playwright/test').devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: { 
        ...require('@playwright/test').devices['Desktop Safari'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...require('@playwright/test').devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...require('@playwright/test').devices['iPhone 12'],
      },
    },
    {
      name: 'iPad',
      use: {
        ...require('@playwright/test').devices['iPad (gen 7)'],
      },
    },
  ],

  outputDir: 'test-results/',
});