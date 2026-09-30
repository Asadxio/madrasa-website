// @ts-check
// ============================================================
// PERFORMANCE TESTS — LCP, FCP, Load Time, JS Errors
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://mslb.nooreharam.com';

test.describe('⚡ Performance', () => {

  test('Page loads within 12 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    console.log(`\n⏱️  DOM Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(12000);
  });

  test('Network idle within 18 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;
    console.log(`⏱️  Network idle time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(18000);
  });

  test('No JavaScript console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    if (errors.length > 0) {
      console.log('❌ JS Errors found:', errors);
    } else {
      console.log('✅ No JS errors!');
    }
    expect(errors).toHaveLength(0);
  });

  test('Web Vitals — LCP under 6 seconds', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            lcpValue = entries[entries.length - 1].startTime;
          }
        });
        try {
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch(e) {}
        setTimeout(() => resolve(lcpValue), 3000);
      });
    });

    console.log(`\n🖼️  LCP: ${Math.round(lcp)}ms`);
    if (lcp > 0) {
      expect(lcp).toBeLessThan(6000);
    } else {
      console.log('ℹ️  LCP not measurable in headless mode — skipping');
    }
  });

  test('Web Vitals — FCP under 3 seconds', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByName('first-contentful-paint');
      return entries.length > 0 ? entries[0].startTime : 0;
    });

    console.log(`\n🎨 FCP: ${Math.round(fcp)}ms`);
    if (fcp > 0) {
      expect(fcp).toBeLessThan(3000);
    } else {
      console.log('ℹ️  FCP not measurable in headless — skipping');
    }
  });

  test('No broken images (404)', async ({ page }) => {
    const failedImages = [];
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.status() === 404) {
        failedImages.push(response.url());
      }
    });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    if (failedImages.length > 0) {
      console.log('❌ Broken images:', failedImages);
    } else {
      console.log('✅ All images loaded!');
    }
    expect(failedImages).toHaveLength(0);
  });

  test('No failed network requests', async ({ page }) => {
    const failed = [];
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 400 && !url.includes('analytics') && !url.includes('gtag') && !url.includes('facebook')) {
        failed.push(`${status}: ${url}`);
      }
    });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    if (failed.length > 0) {
      console.log('⚠️  Failed requests:', failed);
    } else {
      console.log('✅ All requests successful!');
    }
    // Allow up to 2 failures (some 3rd party may fail)
    expect(failed.length).toBeLessThanOrEqual(2);
  });

  test('Page size summary', async ({ page }) => {
    let totalBytes = 0;
    let htmlBytes = 0;
    let cssBytes = 0;
    let jsBytes = 0;
    let imageBytes = 0;

    page.on('response', async response => {
      try {
        const body = await response.body();
        const size = body.length;
        totalBytes += size;
        const type = response.request().resourceType();
        if (type === 'document') htmlBytes += size;
        else if (type === 'stylesheet') cssBytes += size;
        else if (type === 'script') jsBytes += size;
        else if (type === 'image') imageBytes += size;
      } catch {}
    });

    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const kb = (b) => (b / 1024).toFixed(1) + ' KB';
    console.log(`\n📦 PAGE SIZE REPORT:`);
    console.log(`   Total:    ${kb(totalBytes)}`);
    console.log(`   HTML:     ${kb(htmlBytes)}`);
    console.log(`   CSS:      ${kb(cssBytes)}`);
    console.log(`   JS:       ${kb(jsBytes)}`);
    console.log(`   Images:   ${kb(imageBytes)}`);

    // Total page should be under 5MB
    expect(totalBytes).toBeLessThan(5 * 1024 * 1024);
  });

});
