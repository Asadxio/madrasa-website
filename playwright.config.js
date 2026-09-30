// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45000,
  retries: 1,
  fullyParallel: false,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'https://mslb.nooreharam.com',
    headless: true,
    screenshot: 'on',
    video: 'retain-on-failure',   // 🎬 Video only saved when test fails
    trace: 'retain-on-failure',
  },

  projects: [
    // ── Desktop Browsers ───────────────────────────────────────────
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile Devices ─────────────────────────────────────────────
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Samsung Galaxy S21',
      use: { ...devices['Galaxy S9+'] },
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro 11'] },
    },

    // ── Specific Test Suites (Chrome only for speed) ───────────────
    {
      name: 'Performance',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/performance.spec.js',
    },
    {
      name: 'Accessibility',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/accessibility-axe.spec.js',
    },
    {
      name: 'Multi-Language',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/multilang.spec.js',
    },
  ],

  outputDir: 'test-results/artifacts',
});
