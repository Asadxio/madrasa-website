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
    // ── Desktop Browsers (Core 51 Tests) ───────────────────────────
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/madrasa.spec.js',
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/madrasa.spec.js',
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/madrasa.spec.js',
    },

    // ── Mobile Devices (Core 51 Tests) ─────────────────────────────
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
      testMatch: '**/madrasa.spec.js',
    },
    {
      name: 'Samsung Galaxy S21',
      use: { ...devices['Galaxy S9+'] },
      testMatch: '**/madrasa.spec.js',
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro 11'] },
      testMatch: '**/madrasa.spec.js',
    },

    // ── Dedicated Specialty Test Suites ───────────────────────────
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
    {
      name: 'Visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/visual.spec.js',
    },
    {
      name: 'New Guides',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/new-guides.spec.js',
    },
  ],

  outputDir: 'test-results/artifacts',
});
