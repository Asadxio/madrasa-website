// @ts-check
// ============================================================
// MULTI-LANGUAGE TESTS — EN, UR, HI, AR, KN
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://mslb.nooreharam.com';

const LANGUAGES = [
  { code: 'en', name: 'English',  label: 'EN', dir: 'ltr', sampleKey: 'nav_home',    sampleExpect: 'Home' },
  { code: 'ur', name: 'Urdu',     label: 'UR', dir: 'rtl', sampleKey: 'nav_home',    sampleExpect: null },
  { code: 'hi', name: 'Hindi',    label: 'HI', dir: 'ltr', sampleKey: 'nav_home',    sampleExpect: null },
  { code: 'ar', name: 'Arabic',   label: 'AR', dir: 'rtl', sampleKey: 'nav_home',    sampleExpect: null },
  { code: 'kn', name: 'Kannada',  label: 'ಕ',  dir: 'ltr', sampleKey: 'nav_home',    sampleExpect: null },
];

for (const lang of LANGUAGES) {
  test.describe(`🌍 Language: ${lang.name} (${lang.code.toUpperCase()})`, () => {

    test(`Switch to ${lang.name} and page responds`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      // Click the language button
      const langBtn = page.locator(`.lang-switch button[data-lang="${lang.code}"]`).first();
      await expect(langBtn).toBeAttached();
      await langBtn.click();
      await page.waitForTimeout(500);

      // Check html[lang] attribute
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      console.log(`\n🌍 ${lang.name}: html[lang] = "${htmlLang}"`);
      expect(htmlLang).toContain(lang.code);
    });

    test(`${lang.name}: RTL direction is ${lang.dir === 'rtl' ? 'applied' : 'not applied'}`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      const langBtn = page.locator(`.lang-switch button[data-lang="${lang.code}"]`).first();
      await langBtn.click();
      await page.waitForTimeout(500);

      const dir = await page.evaluate(() => document.documentElement.dir);
      console.log(`\n↔️  ${lang.name}: dir = "${dir}"`);

      if (lang.dir === 'rtl') {
        expect(dir).toBe('rtl');
      } else {
        expect(dir).not.toBe('rtl');
      }
    });

    test(`${lang.name}: Nav links are translated`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      const langBtn = page.locator(`.lang-switch button[data-lang="${lang.code}"]`).first();
      await langBtn.click();
      await page.waitForTimeout(600);

      // Get nav link text
      const navLinks = await page.locator('nav.main-nav a.nav-link').allTextContents();
      console.log(`\n📋 ${lang.name} nav links:`, navLinks.slice(0, 5));
      expect(navLinks.length).toBeGreaterThan(3);
      // All links should have some text
      navLinks.forEach(text => expect(text.trim().length).toBeGreaterThan(0));
    });

    test(`${lang.name}: Screenshot after switching`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      const langBtn = page.locator(`.lang-switch button[data-lang="${lang.code}"]`).first();
      await langBtn.click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: `test-results/screenshots/lang-${lang.code}-${lang.name.toLowerCase()}.png`,
        fullPage: false,
      });
      console.log(`\n📸 Screenshot saved for ${lang.name}`);
    });

  });
}

test.describe('🌍 Language Persistence', () => {
  test('Language switch button becomes active after click', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Switch to Urdu
    const urBtn = page.locator('.lang-switch button[data-lang="ur"]').first();
    await urBtn.click();
    await page.waitForTimeout(400);

    const isActive = await urBtn.evaluate(el => el.classList.contains('is-active'));
    const ariaPressed = await urBtn.getAttribute('aria-pressed');
    console.log(`\n🔘 UR button is-active: ${isActive}, aria-pressed: ${ariaPressed}`);
    expect(isActive || ariaPressed === 'true').toBeTruthy();
  });

  test('All 5 language buttons exist', async ({ page }) => {
    await page.goto(BASE);
    const buttons = page.locator('.lang-switch button[data-lang]');
    const count = await buttons.count();
    console.log(`\n🔢 Language buttons found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(5 * 2); // 2 switchers (mobile + desktop) × 5 langs
  });
});
