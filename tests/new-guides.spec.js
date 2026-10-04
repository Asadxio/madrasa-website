const { test, expect } = require('@playwright/test');

test.describe('Daily Masnoon Duas & Azkar Page', () => {
  test('Daily Duas page loads with correct title and schema', async ({ page }) => {
    await page.goto('/daily-duas.html');
    await expect(page).toHaveTitle(/Daily Masnoon Duas/i);

    // Verify Arabic calligraphy heading
    const arabicHead = page.locator('.hero-arabic');
    await expect(arabicHead).toBeVisible();

    // Verify Dua cards exist
    const cards = page.locator('.dua-card');
    await expect(cards).toHaveCount(6);

    // Verify Digital Tasbeeh Counter works
    const firstTasbeehBtn = page.locator('.tasbeeh-btn').first();
    const countText = firstTasbeehBtn.locator('.tasbeeh-count');
    await expect(countText).toContainText('0 /');
    await firstTasbeehBtn.click();
    await expect(countText).toContainText('1 /');

    // Verify Schema JSON-LD
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('Article');
  });

  test('Filter tabs filter duas correctly', async ({ page }) => {
    await page.goto('/daily-duas.html');
    const morningBtn = page.locator('.tab-btn[onclick*="morning"]');
    await morningBtn.click();
    
    // Check that evening card is hidden
    const eveningCard = page.locator('.dua-card[data-category="evening"]');
    await expect(eveningCard).toBeHidden();
  });
});

test.describe('Interactive Zakat Calculator for Women', () => {
  test('Zakat Calculator page loads and performs real-time calculations', async ({ page }) => {
    await page.goto('/zakat-calculator.html');
    await expect(page).toHaveTitle(/Zakat Calculator for Women/i);

    // Fill in 22K Gold weight (e.g. 100 grams)
    const gold22Input = page.locator('#gold22');
    await gold22Input.fill('100');

    // Check that Net Wealth and Zakat Due are calculated (> 0)
    const zakatDueAmount = page.locator('#zakatDueAmount');
    await expect(zakatDueAmount).not.toHaveText('₹0');
    await expect(zakatDueAmount).not.toHaveText('0');

    // Check Nisab status shows eligible
    const nisabStatus = page.locator('#nisabStatusText');
    await expect(nisabStatus).toContainText('Zakat is FARD');

    // Test Unit Toggle (Tola)
    const tolaBtn = page.locator('#unitTolaBtn');
    await tolaBtn.click();
    await expect(tolaBtn).toHaveClass(/active/);
    const unitLabel = page.locator('.unit-text').first();
    await expect(unitLabel).toHaveText('tola');

    // Verify WebApplication Schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('WebApplication');
    expect(content).toContain('FAQPage');
  });
});

test.describe('Women\'s Shar\'i Hijab & Mahram Guide', () => {
  test('Hijab guide loads with interactive relationship checker', async ({ page }) => {
    await page.goto('/womens-hijab-guide.html');
    await expect(page).toHaveTitle(/Hijab & Mahram Guide/i);

    // Verify relationship cards render
    const relCards = page.locator('.rel-card');
    await expect(relCards.first()).toBeVisible();
    const initialCount = await relCards.count();
    expect(initialCount).toBeGreaterThan(10);

    // Search for "Cousin"
    const searchInput = page.locator('#relSearchInput');
    await searchInput.fill('Cousin');
    const filteredCard = page.locator('.rel-card').first();
    await expect(filteredCard).toContainText('Cousin');
    await expect(filteredCard).toContainText('Non-Mahram');

    // Filter by Non-Mahram button
    const nonMahramBtn = page.locator('.cat-btn[data-cat="nonmahram"]');
    await nonMahramBtn.click();
    await expect(nonMahramBtn).toHaveClass(/active/);

    // Verify Schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('Article');
    expect(content).toContain('FAQPage');
  });
});

test.describe('Women\'s Taharah, Haiz & Ghusl Guide', () => {
  test('Taharah guide loads with Faraidh cards and Sunnah steps', async ({ page }) => {
    await page.goto('/womens-taharah-guide.html');
    await expect(page).toHaveTitle(/Taharah, Haiz & Ghusl/i);

    // Verify 3 Faraidh cards exist
    const fardCards = page.locator('.fard-card');
    await expect(fardCards).toHaveCount(3);

    // Verify Sunnah step items exist
    const steps = page.locator('.step-item');
    await expect(steps).toHaveCount(6);

    // Verify HowTo Schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('HowTo');
    expect(content).toContain('FAQPage');
  });
});

test.describe('Interactive Islamic Quiz & Certificate Generator', () => {
  test('Islamic Quiz loads questions and completes flow to generate certificate', async ({ page }) => {
    await page.goto('/islamic-quiz.html');
    await expect(page).toHaveTitle(/Islamic Knowledge Quiz/i);

    // Question 1 should be visible
    const qText = page.locator('#qText');
    await expect(qText).toContainText('1.');

    // Select an option on Question 1
    const firstOption = page.locator('.option-btn').first();
    await firstOption.click();

    // Feedback box should appear
    const fbBox = page.locator('#feedbackBox');
    await expect(fbBox).toBeVisible();

    // Next button should appear
    const nextBtn = page.locator('#nextBtn');
    await expect(nextBtn).toBeVisible();

    // Verify Canvas Certificate element exists on the page
    const canvas = page.locator('#certCanvas');
    await expect(canvas).toBeAttached();

    // Verify Schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('WebApplication');
  });
});

test.describe('PWA & Service Worker Integration', () => {
  test('PWA install script and manifest are referenced on homepage', async ({ page }) => {
    await page.goto('/');
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();

    const pwaScript = page.locator('script[src*="pwa-install.js"]');
    await expect(pwaScript).toBeAttached();
  });
});

test.describe('Tosha ki Fatiha & Khatam Gyarween Sharif (Khatam Qadria)', () => {
  test('Tosha guide loads with authentic wazaif, ingredient scaler, and counters', async ({ page }) => {
    await page.goto('/tosha-khatam-qadria.html');
    await expect(page).toHaveTitle(/توشہ کی فاتحہ کا طریقہ و ختم گیارہویں شریف/);

    // Verify 20 Khatam Qadria waza'if exist
    const wazaif = page.locator('.wazifa-item');
    await expect(wazaif).toHaveCount(20);

    // Test digital counter tap interaction
    const firstCounterBtn = page.locator('.counter-btn').first();
    const countVal = firstCounterBtn.locator('.cnt-val');
    await expect(countVal).toHaveText('0 / 111');
    await firstCounterBtn.click();
    await expect(countVal).toHaveText('1 / 111');

    // Test dynamic ingredient scaler (half scale = 2.5kg)
    const halfScaleBtn = page.locator('.scale-pill').nth(1);
    await halfScaleBtn.click();
    await expect(halfScaleBtn).toHaveClass(/active/);
    const firstRowWeight = page.locator('.wazan-table tbody tr td').nth(3);
    await expect(firstRowWeight).toContainText('2.50 کلو');

    // Verify Qasida Ghousia section exists
    const qasidaSection = page.locator('#qasida-ghousia');
    await expect(qasidaSection).toBeVisible();

    // Verify Shajrah Razawiyya section exists
    const shajrahSection = page.locator('#shajrah');
    await expect(shajrahSection).toBeVisible();

    // Verify Rich Schema (Article, HowTo, FAQPage)
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    expect(content).toContain('Article');
    expect(content).toContain('HowTo');
    expect(content).toContain('FAQPage');

    // 🔤 Test Roman Urdu / Hinglish Language Switcher
    const romanPill = page.locator('.lang-pill[data-lang="roman"]');
    await romanPill.click();
    await expect(page.locator('body')).toHaveClass(/lang-roman/);
    await expect(page.locator('#hero-title')).toContainText('Tosha ki Fatiha ka Tarika');
    
    // Verify Phonetic Roman Transliteration is present on waza'if
    const firstTranslit = page.locator('.wazifa-translit').first();
    await expect(firstTranslit).toBeVisible();
    await expect(firstTranslit).toContainText('Allahumma Salli Ala Sayyidina');

    // 🇬🇧 Test English Language Switcher
    const enPill = page.locator('.lang-pill[data-lang="en"]');
    await enPill.click();
    await expect(page.locator('body')).toHaveClass(/lang-en/);
    await expect(page.locator('#hero-title')).toContainText('Method of Tosha ki Fatiha');
  });
});

