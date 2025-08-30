import { defineConfig, devices } from '@playwright/test';

/**
 * Production E2E Test Configuration
 * Tests TrueCheckIA.com in production environment
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially for production
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
    ['junit', { outputFile: 'junit.xml' }]
  ],
  
  // Global test settings
  use: {
    // Base URL for production
    baseURL: process.env.TEST_URL || 'https://truecheckia.com',
    
    // Collect trace for debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Auth settings
    ignoreHTTPSErrors: true,
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Test timeout
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile tests
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run web server if testing locally
  webServer: process.env.TEST_URL ? undefined : {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});