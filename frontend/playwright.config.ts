import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Optimize workers for better performance */
  workers: process.env.CI ? 2 : '50%',
  /* Timeout settings for faster feedback */
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['html'], ['github']] : [['list'], ['html']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Performance optimizations */
    actionTimeout: 10 * 1000, // 10 seconds for actions
    navigationTimeout: 15 * 1000, // 15 seconds for navigation
    
    /* Run tests headless for speed */
    headless: true,
    
    /* Browser context options for faster execution */
    launchOptions: {
      // Disable features that slow down testing
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Main test projects with optimized configurations
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // Optional: Comment out to run only Chromium for faster development
    // Uncomment for full cross-browser testing
    /*
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },
    */

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});