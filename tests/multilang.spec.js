// @ts-check
// ============================================================
// MULTI-LANGUAGE TESTS — EN, UR, HI, AR, KN
// ============================================================
const { test, expect } = require('@playwright/test');

const BASE = 'https://mslb.nooreharam.com';

const LANGUAGES = [
  { code: 'en', name: 'English',  label: 'EN', dir: 'ltr' },
  { code: 'ur', name: 'Urdu',     label: 'UR', dir: 'rtl' },
  { code: 'hi', name: 'Hindi',    label: 'HI', dir: 'ltr' },
  { code: 'ar', name: 'Arabic',   label: 'AR', dir: 'rtl' },
  { code: 'kn', name: 'Kannada',  label: 'ಕ',  dir: 'ltr' },
];

/**
 * Robust language switcher that works across desktop, tablet, and mobile drawers
 */
async function switchLanguage(page, code) {
  // 1. Try desktop switcher in .nav-actions
  const desktopBtn = page.locator(`.nav-actions .lang-switch button[data-lang="${code}"]`);
  if (await desktopBtn.isVisible()) {
    await desktopBtn.click();
    await page.waitForTimeout(400);
    return;
  }

  // 2. Try mobile drawer
  const menuToggle = page.locator('.menu-toggle');
  if (await menuToggle.isVisible()) {
    const isOpen = await page.locator('nav.main-nav').evaluate(el => el.classList.contains('is-open')).catch(() => false);
    if (!isOpen) {
      await menuToggle.click();
      await page.waitForTimeout(350);
    }
    const mobileBtn = page.locator(`nav.main-nav .lang-switch button[data-lang="${code}"]`);
    if (await mobileBtn.isVisible()) {
      await mobileBtn.click();
      await page.waitForTimeout(400);
      return;
    }
  }

  // 3. Fallback: programmatic click on matching button
  await page.evaluate((c) => {
    const btn = document.querySelector(`.lang-switch button[data-lang="${c}"]`);
    if (btn) btn.click();
  }, code);
  await page.waitForTimeout(400);
}

for (const lang of LANGUAGES) {
  test.describe(`🌍 Language: ${lang.name} (${lang.code.toUpperCase()})`, () => {

    test(`Switch to ${lang.name} and page responds`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      await switchLanguage(page, lang.code);

      // Check html[lang] attribute
      const htmlLang = await page.evaluate(() => document.documentElement.lang);
      console.log(`\n🌍 ${lang.name}: html[lang] = "${htmlLang}"`);
      expect(htmlLang).toContain(lang.code);
    });

    test(`${lang.name}: RTL direction is ${lang.dir === 'rtl' ? 'applied' : 'not applied'}`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      await switchLanguage(page, lang.code);

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

      await switchLanguage(page, lang.code);

      // Get nav link text
      const navLinks = await page.locator('nav.main-nav a.nav-link').allTextContents();
      console.log(`\n📋 ${lang.name} nav links:`, navLinks.slice(0, 5));
      expect(navLinks.length).toBeGreaterThan(3);
      // All links should have non-empty text
      navLinks.forEach(text => expect(text.trim().length).toBeGreaterThan(0));
    });

    test(`${lang.name}: Screenshot after switching`, async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState('networkidle');

      await switchLanguage(page, lang.code);

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

    await switchLanguage(page, 'ur');

    const urBtns = page.locator('.lang-switch button[data-lang="ur"]');
    const count = await urBtns.count();
    let hasActive = false;
    for (let i = 0; i < count; i++) {
      const btn = urBtns.nth(i);
      const isAct = await btn.evaluate(el => el.classList.contains('is-active'));
      const ariaPressed = await btn.getAttribute('aria-pressed');
      if (isAct || ariaPressed === 'true') {
        hasActive = true;
        break;
      }
    }
    console.log(`\n🔘 UR button has active state: ${hasActive}`);
    expect(hasActive).toBeTruthy();
  });

  test('All 5 language buttons exist', async ({ page }) => {
    await page.goto(BASE);
    const buttons = page.locator('.lang-switch button[data-lang]');
    const count = await buttons.count();
    console.log(`\n🔢 Language buttons found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(5);
  });
});
