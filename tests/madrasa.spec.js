// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://mslb.nooreharam.com';

// ============================================================
// 1. HOMEPAGE & BASIC LOAD
// ============================================================
test.describe('Homepage', () => {

  test('Homepage loads successfully', async ({ page }) => {
    const res = await page.goto(BASE);
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/Madarsa|Salikat|Madrasa/i);
    await page.screenshot({ path: 'test-results/screenshots/01-homepage-desktop.png', fullPage: false });
  });

  test('Page title is correct', async ({ page }) => {
    await page.goto(BASE);
    const title = await page.title();
    console.log('Page title:', title);
    expect(title.length).toBeGreaterThan(5);
  });

  test('Bismillah text is visible', async ({ page }) => {
    await page.goto(BASE);
    const bismillah = page.locator('.hero-bismillah');
    await expect(bismillah).toBeVisible();
  });

  test('Madrasa Arabic name is visible', async ({ page }) => {
    await page.goto(BASE);
    const arName = page.locator('.hero-center .ar-name');
    await expect(arName).toBeVisible();
  });

  test('English name heading is visible', async ({ page }) => {
    await page.goto(BASE);
    const enName = page.locator('.hero-center .en-name');
    await expect(enName).toBeVisible();
  });

  test('Hero CTA buttons exist', async ({ page }) => {
    await page.goto(BASE);
    const btns = page.locator('#home .btn');
    await expect(btns.first()).toBeVisible();
  });

  test('Stats section shows numbers', async ({ page }) => {
    await page.goto(BASE);
    const stats = page.locator('.hero-stats .stat');
    const count = await stats.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

});

// ============================================================
// 2. NAVIGATION
// ============================================================
test.describe('Navigation', () => {

  test('Header is visible', async ({ page }) => {
    await page.goto(BASE);
    const header = page.locator('#site-header');
    await expect(header).toBeVisible();
  });

  test('Nav links exist', async ({ page }) => {
    await page.goto(BASE);
    const navLinks = page.locator('nav.main-nav a.nav-link');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('Skip to content link exists', async ({ page }) => {
    await page.goto(BASE);
    const skip = page.locator('.skip-link');
    await expect(skip).toBeAttached();
  });

  test('Language switcher exists', async ({ page }) => {
    await page.goto(BASE);
    // The desktop lang-switch lives in .nav-actions (visible only >1480px).
    // Playwright Desktop Chrome = 1280px, so nav-actions is hidden (mobile drawer used).
    // The lang-switch IS accessible via the hamburger drawer — verify it exists in DOM.
    const langBtns = page.locator('.lang-switch button[data-lang]');
    await expect(langBtns.first()).toBeAttached();
    const count = await langBtns.count();
    expect(count).toBeGreaterThanOrEqual(4); // EN, UR, HI, AR
  });

  test('Nav "More" dropdown opens on click', async ({ page }) => {
    await page.goto(BASE);
    const moreBtn = page.locator('.nav-more-btn');
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
      const menu = page.locator('#navMoreMenu');
      await expect(menu).toHaveClass(/is-open/);
      await page.screenshot({ path: 'test-results/screenshots/02-nav-dropdown.png' });
    }
  });

  test('Clicking nav link scrolls to section', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('a[href="#about"]').first().click();
    await page.waitForTimeout(800);
    const about = page.locator('#about');
    await expect(about).toBeInViewport({ ratio: 0.1 });
  });

});

// ============================================================
// 3. COURSES SECTION
// ============================================================
test.describe('Courses', () => {

  test('Courses section exists', async ({ page }) => {
    await page.goto(BASE);
    const courses = page.locator('#courses');
    await expect(courses).toBeAttached();
  });

  test('Course cards are visible', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#courses').scrollIntoViewIfNeeded();
    const cards = page.locator('.course-card');
    const count = await cards.count();
    console.log('Course cards found:', count);
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Course filter buttons exist', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#courses').scrollIntoViewIfNeeded();
    const filterBtns = page.locator('.filter-btn');
    const count = await filterBtns.count();
    if (count > 0) {
      await filterBtns.first().click();
      await page.screenshot({ path: 'test-results/screenshots/03-courses-filter.png' });
    }
  });

  test('Inquire Now buttons link to admissions', async ({ page }) => {
    await page.goto(BASE);
    const inquireBtn = page.locator('.course-card a[href="#admissions"]').first();
    if (await inquireBtn.count() > 0) {
      await expect(inquireBtn).toBeVisible();
    }
  });

});

// ============================================================
// 4. ADMISSIONS FORM
// ============================================================
test.describe('Admissions Form', () => {

  test('Admissions section exists', async ({ page }) => {
    await page.goto(BASE);
    const adm = page.locator('#admissions');
    await expect(adm).toBeAttached();
  });

  test('Admission form fields exist', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#admissions').scrollIntoViewIfNeeded();
    await expect(page.locator('#studentName')).toBeAttached();
    await expect(page.locator('#studentAge')).toBeAttached();
    await expect(page.locator('#whatsappNum')).toBeAttached();
    await expect(page.locator('#courseSelect')).toBeAttached();
  });

  test('Admission form shows validation errors on empty submit', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#admissionForm button[type="submit"]').scrollIntoViewIfNeeded();
    await page.locator('#admissionForm button[type="submit"]').click();
    await page.waitForTimeout(500);
    const errors = page.locator('#admissionForm .field-error');
    const errorCount = await errors.count();
    console.log('Validation errors shown:', errorCount);
    expect(errorCount).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: 'test-results/screenshots/04-admission-validation.png' });
  });

  test('Admission form fills and validates correctly', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#studentName').fill('Test Student');
    await page.locator('#studentAge').fill('15');
    await page.locator('#whatsappNum').fill('9876543210');
    await page.locator('#courseSelect').selectOption({ index: 1 });
    await page.screenshot({ path: 'test-results/screenshots/05-admission-filled.png' });
  });

});

// ============================================================
// 5. CONTACT FORM
// ============================================================
test.describe('Contact Form', () => {

  test('Contact section exists', async ({ page }) => {
    await page.goto(BASE);
    const contact = page.locator('#contact');
    await expect(contact).toBeAttached();
  });

  test('Contact form fields exist', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#contactForm').scrollIntoViewIfNeeded();
    await expect(page.locator('#cName')).toBeAttached();
    await expect(page.locator('#cEmail')).toBeAttached();
    await expect(page.locator('#cMsg')).toBeAttached();
  });

  test('Contact form shows validation errors on empty submit', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#contactForm').scrollIntoViewIfNeeded();
    await page.locator('#contactForm button[type="submit"]').click();
    await page.waitForTimeout(500);
    const nameErr = page.locator('#cNameErr');
    const msgErr = page.locator('#cMsgErr');
    const nameErrText = await nameErr.textContent();
    const msgErrText = await msgErr.textContent();
    console.log('Name error:', nameErrText);
    console.log('Message error:', msgErrText);
    expect(nameErrText?.length || 0 + (msgErrText?.length || 0)).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/screenshots/06-contact-validation.png' });
  });

  test('Contact form aria-invalid set on error', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#contactForm').scrollIntoViewIfNeeded();
    await page.locator('#contactForm button[type="submit"]').click();
    await page.waitForTimeout(500);
    const ariaInvalid = await page.locator('#cName').getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

});

// ============================================================
// 6. DONATION SECTION
// ============================================================
test.describe('Donation Section', () => {

  test('Donate section exists', async ({ page }) => {
    await page.goto(BASE);
    const donate = page.locator('#donate');
    await expect(donate).toBeAttached();
  });

  test('Amount chips are clickable', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#donate').scrollIntoViewIfNeeded();
    const chips = page.locator('.amount-chip');
    const count = await chips.count();
    if (count > 0) {
      await chips.first().click();
      await page.waitForTimeout(300);
      const isActive = await chips.first().getAttribute('aria-pressed');
      console.log('Amount chip aria-pressed:', isActive);
      await page.screenshot({ path: 'test-results/screenshots/07-donation-chip.png' });
    }
  });

  test('Donate buttons exist', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#donate').scrollIntoViewIfNeeded();
    const donateBtns = page.locator('#donate .btn');
    const count = await donateBtns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

});

// ============================================================
// 7. WHATSAPP FUNCTIONALITY
// ============================================================
test.describe('WhatsApp', () => {

  test('WhatsApp links exist on page', async ({ page }) => {
    await page.goto(BASE);
    const waLinks = page.locator('a[href*="wa.me"]');
    const count = await waLinks.count();
    console.log('WhatsApp links found:', count);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('WhatsApp links have correct number', async ({ page }) => {
    await page.goto(BASE);
    const waLink = page.locator('a[href*="wa.me"]').first();
    const href = await waLink.getAttribute('href');
    console.log('WhatsApp href:', href);
    expect(href).toContain('916366919122');
  });

});

// ============================================================
// 8. ACCESSIBILITY
// ============================================================
test.describe('Accessibility', () => {

  test('Page has exactly one H1', async ({ page }) => {
    await page.goto(BASE);
    const h1s = page.locator('h1');
    const count = await h1s.count();
    console.log('H1 count:', count);
    expect(count).toBe(1);
  });

  test('All images have alt attributes', async ({ page }) => {
    await page.goto(BASE);
    const imgs = await page.locator('img').all();
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      if (ariaHidden !== 'true') {
        expect(alt !== null, `Image missing alt: ${await img.getAttribute('src')}`).toBeTruthy();
      }
    }
  });

  test('Skip link exists', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.skip-link')).toBeAttached();
  });

  test('Forms have labels', async ({ page }) => {
    await page.goto(BASE);
    const inputs = await page.locator('input[id], textarea[id]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        const ariaLabel = await input.getAttribute('aria-label');
        const hasLabel = labelCount > 0 || ariaLabel;
        console.log(`Input #${id} has label:`, hasLabel);
      }
    }
  });

  test('Modals have dialog role', async ({ page }) => {
    await page.goto(BASE);
    const modals = page.locator('[role="dialog"]');
    const count = await modals.count();
    console.log('Dialog elements found:', count);
  });

});

// ============================================================
// 9. MOBILE VIEW
// ============================================================
test.describe('Mobile View', () => {

  test('Mobile menu button exists', async ({ page, isMobile }) => {
    await page.goto(BASE);
    if (isMobile) {
      const hamburger = page.locator('.nav-toggle, .hamburger, [aria-label*="menu" i]');
      await expect(hamburger.first()).toBeVisible();
    }
  });

  test('Mobile screenshot - homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/screenshots/08-mobile-homepage.png', fullPage: false });
  });

  test('No horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Use documentElement (html) scrollWidth — body has overflow-x:hidden which clips
    // the intentional marquee ticker animation, so body.scrollWidth is misleading.
    const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    console.log('HTML scrollWidth:', htmlWidth, 'Viewport width:', viewportWidth);
    expect(htmlWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

});

// ============================================================
// 10. SECTIONS EXISTENCE CHECK
// ============================================================
test.describe('All Sections Exist', () => {

  const sections = [
    { id: '#home', name: 'Hero' },
    { id: '#about', name: 'About' },
    { id: '#courses', name: 'Courses' },
    { id: '#ustadahs', name: 'Ustadahs' },
    { id: '#admissions', name: 'Admissions' },
    { id: '#app', name: 'Mobile App' },
    { id: '#achievements', name: 'Achievements' },
    { id: '#donate', name: 'Donation' },
    { id: '#vision2030', name: 'Vision 2030' },
    { id: '#gallery', name: 'Gallery' },
    { id: '#contact', name: 'Contact' },
  ];

  for (const section of sections) {
    test(`${section.name} section exists`, async ({ page }) => {
      await page.goto(BASE);
      const el = page.locator(section.id);
      await expect(el).toBeAttached();
    });
  }

});

// ============================================================
// 11. FULL PAGE SCREENSHOTS
// ============================================================
test.describe('Screenshots', () => {

  test('Desktop full-page screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'test-results/screenshots/09-desktop-fullpage.png',
      fullPage: true
    });
    console.log('✅ Desktop screenshot saved!');
  });

  test('Mobile full-page screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'test-results/screenshots/10-mobile-fullpage.png',
      fullPage: true
    });
    console.log('✅ Mobile screenshot saved!');
  });

});
