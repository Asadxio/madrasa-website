// @ts-check
// ============================================================
// VISUAL REGRESSION — Screenshot Comparison
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://mslb.nooreharam.com';

test.describe('📸 Visual Regression — Sections', () => {

  const sections = [
    { name: 'hero',        selector: '#home' },
    { name: 'about',       selector: '#about' },
    { name: 'courses',     selector: '#courses' },
    { name: 'admissions',  selector: '#admissions' },
    { name: 'donate',      selector: '#donate' },
    { name: 'contact',     selector: '#contact' },
  ];

  for (const section of sections) {
    test(`Section snapshot: ${section.name}`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.locator(section.selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `test-results/screenshots/section-${section.name}.png`,
        clip: await page.locator(section.selector).boundingBox() || undefined,
      });

      console.log(`📸 ${section.name} screenshot saved`);
    });
  }

});

test.describe('📱 Multi-Device Screenshots', () => {

  const devices = [
    { name: 'Desktop-1920',  width: 1920, height: 1080 },
    { name: 'Desktop-1280',  width: 1280, height: 800 },
    { name: 'Tablet-iPad',   width: 768,  height: 1024 },
    { name: 'Mobile-iPhone', width: 390,  height: 844 },
    { name: 'Mobile-Small',  width: 320,  height: 568 },
  ];

  for (const device of devices) {
    test(`${device.name} (${device.width}×${device.height})`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `test-results/screenshots/device-${device.name}.png`,
        fullPage: false,
      });

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      console.log(`📐 ${device.name}: scrollWidth=${scrollWidth} viewport=${viewportWidth}`);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);

      console.log(`✅ ${device.name} screenshot saved!`);
    });
  }

});
