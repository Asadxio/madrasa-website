// @ts-check
const { chromium } = require('@playwright/test');

const PAGES = [
  { path: '/', name: 'Homepage (index.html)' },
  { path: '/tosha-khatam-qadria.html', name: 'Tosha & Khatam Qadria Guide' },
  { path: '/daily-duas.html', name: 'Daily Masnoon Duas' },
  { path: '/zakat-calculator.html', name: 'Zakat Calculator for Women' },
  { path: '/womens-hijab-guide.html', name: 'Women\'s Hijab & Mahram Guide' },
  { path: '/womens-taharah-guide.html', name: 'Women\'s Taharah & Ghusl Guide' },
  { path: '/islamic-quiz.html', name: 'Interactive Islamic Quiz & Sanad' },
  { path: '/womens-namaz-guide.html', name: 'Women\'s Namaz Guide' },
  { path: '/hajj-umrah-guide.html', name: 'Women\'s Umrah & Hajj Guide' },
  { path: '/404.html', name: 'Custom 404 Page' }
];

const VIEWPORTS = [
  { name: 'Desktop (1280x800)', width: 1280, height: 800 },
  { name: 'Mobile (375x667)', width: 375, height: 667 }
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('================================================================');
  console.log('🔍 FULL SITE CSS, RESPONSIVENESS & CONSOLE ERROR AUDIT');
  console.log('================================================================\n');

  let allPassed = true;
  const report = [];

  for (const p of PAGES) {
    const pageUrl = `https://mslb.nooreharam.com${p.path}`;
    const pageIssues = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', req => {
      // Ignore Google Analytics or third party ad blockers if any
      if (!req.url().includes('google-analytics') && !req.url().includes('googletagmanager')) {
        failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`);
      }
    });

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      try {
        const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const status = response ? response.status() : 'No response';

        if (status !== 200) {
          pageIssues.push(`[${vp.name}] HTTP status is ${status} (expected 200)`);
        }

        // Wait brief moment for layout/fonts
        await page.waitForTimeout(500);

        // Check horizontal overflow
        const overflow = await page.evaluate((vw) => {
          const sw = document.documentElement.scrollWidth;
          const bodySw = document.body ? document.body.scrollWidth : 0;
          const maxSw = Math.max(sw, bodySw);
          
          let culprit = null;
          if (maxSw > vw + 2) {
            // Find which element caused overflow
            document.querySelectorAll('*').forEach(el => {
              if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
              if (el.id === 'topbar' || el.closest('#topbar')) return; // Ignore intentional marquee
              const rect = el.getBoundingClientRect();
              if (rect.right > vw + 3) {
                culprit = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className ? '.' + String(el.className).split(' ')[0] : ''} (right: ${Math.round(rect.right)}px)`;
              }
            });
          }

          return {
            hasOverflow: maxSw > vw + 3,
            scrollWidth: maxSw,
            culprit
          };
        }, vp.width);

        if (overflow.hasOverflow) {
          pageIssues.push(`[${vp.name}] Horizontal overflow detected! ScrollWidth: ${overflow.scrollWidth}px vs Viewport: ${vp.width}px. Culprit: ${overflow.culprit || 'Unknown'}`);
        }

        // Check broken images
        const brokenImages = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          return imgs.filter(img => img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')).map(img => img.src);
        });

        if (brokenImages.length > 0) {
          pageIssues.push(`[${vp.name}] Found ${brokenImages.length} broken image(s): ${brokenImages.join(', ')}`);
        }

      } catch (err) {
        pageIssues.push(`[${vp.name}] Error loading page: ${err.message}`);
      }
    }

    const hasErrors = pageIssues.length > 0 || consoleErrors.length > 0 || failedRequests.length > 0;
    if (hasErrors) allPassed = false;

    report.push({
      page: p.name,
      url: pageUrl,
      issues: pageIssues,
      consoleErrors,
      failedRequests,
      status: hasErrors ? '❌ ISSUES FOUND' : '✅ 100% PERFECT'
    });
  }

  // Print Report
  report.forEach(r => {
    console.log(`\n📄 ${r.page} (${r.url})`);
    console.log(`   Status: ${r.status}`);
    if (r.issues.length > 0) {
      console.log('   Layout / CSS Issues:');
      r.issues.forEach(iss => console.log(`     ⚠️  ${iss}`));
    }
    if (r.consoleErrors.length > 0) {
      console.log('   Console Errors:');
      r.consoleErrors.forEach(ce => console.log(`     🔴  ${ce}`));
    }
    if (r.failedRequests.length > 0) {
      console.log('   Failed Asset Requests:');
      r.failedRequests.forEach(fr => console.log(`     ⚠️  ${fr}`));
    }
  });

  console.log('\n================================================================');
  console.log(`SUMMARY: ${allPassed ? 'ALL PAGES PASSED WITH 0 CSS OR LAYOUT ISSUES! 🎉' : 'SOME ISSUES DETECTED - REVIEW DETAILS ABOVE'}`);
  console.log('================================================================\n');

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
