// @ts-check
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://mslb.nooreharam.com');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const vw = window.innerWidth;

    // Walk DOM and find elements where offsetLeft + offsetWidth > vw
    // (offsetLeft is relative to offsetParent, not viewport)
    // Better: use scrollLeft/scrollWidth on each ancestor
    const overflowing = [];

    function check(el) {
      // Skip topbar (intentional marquee animation)
      if (el.id === 'topbar' || el.closest?.('#topbar')) return;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'HEAD') return;

      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const rect = el.getBoundingClientRect();

      // Element whose own scrollWidth exceeds its clientWidth
      if (sw > cw + 3 && sw > vw / 2) {
        overflowing.push({
          tag: el.tagName,
          id: el.id || '',
          class: (el.className?.toString() || '').slice(0, 60),
          scrollWidth: sw,
          clientWidth: cw,
          rectRight: Math.round(rect.right),
          rectWidth: Math.round(rect.width),
          overflowX: getComputedStyle(el).overflowX,
        });
      }
    }

    document.querySelectorAll('*').forEach(check);
    overflowing.sort((a, b) => b.scrollWidth - a.scrollWidth);
    return overflowing.slice(0, 20);
  });

  console.log(`\n=== ELEMENTS WITH scrollWidth > clientWidth (excluding topbar) ===\n`);
  result.forEach(el => {
    console.log(`<${el.tag}> #"${el.id}" ."${el.class}"`);
    console.log(`  scrollWidth: ${el.scrollWidth}  clientWidth: ${el.clientWidth}  rectRight: ${el.rectRight}  overflow-x: ${el.overflowX}`);
    console.log('');
  });

  await browser.close();
})();
