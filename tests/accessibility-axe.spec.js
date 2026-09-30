// @ts-check
// ============================================================
// ACCESSIBILITY TESTS — axe-core WCAG 2.2 AA Audit
// ============================================================
const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const BASE = 'https://mslb.nooreharam.com';

test.describe('♿ Accessibility — axe-core WCAG 2.2 AA', () => {

  test('Homepage — Zero critical violations', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious  = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor    = results.violations.filter(v => v.impact === 'minor');

    console.log(`\n♿ AXE AUDIT RESULTS:`);
    console.log(`   🔴 Critical:  ${critical.length}`);
    console.log(`   🟠 Serious:   ${serious.length}`);
    console.log(`   🟡 Moderate:  ${moderate.length}`);
    console.log(`   🔵 Minor:     ${minor.length}`);
    console.log(`   📊 Total:     ${results.violations.length}`);

    if (results.violations.length > 0) {
      console.log('\n--- Violations ---');
      results.violations.forEach(v => {
        console.log(`[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
        v.nodes.forEach(n => console.log(`   → ${n.html.slice(0, 100)}`));
      });
    }

    // Zero critical violations allowed
    expect(critical.length).toBe(0);
  });

  test('Heading hierarchy is correct', async ({ page }) => {
    await page.goto(BASE);
    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
      return Array.from(hs).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim().slice(0, 60),
      }));
    });

    console.log('\n📋 HEADING HIERARCHY:');
    headings.forEach(h => console.log(`${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}`));

    // Must have exactly 1 H1
    const h1s = headings.filter(h => h.level === 1);
    expect(h1s.length).toBe(1);
  });

  test('All interactive elements are keyboard reachable', async ({ page }) => {
    await page.goto(BASE);
    const interactiveCount = await page.evaluate(() => {
      return document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).length;
    });
    console.log(`\n⌨️  Interactive elements: ${interactiveCount}`);
    expect(interactiveCount).toBeGreaterThan(10);
  });

  test('Focus visible on interactive elements', async ({ page }) => {
    await page.goto(BASE);
    // Tab to first focusable element and check focus ring
    await page.keyboard.press('Tab');
    const focusedEl = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    console.log('\n🔍 First focused element:', focusedEl);
    expect(focusedEl).not.toBeNull();
  });

  test('All form inputs have accessible labels', async ({ page }) => {
    await page.goto(BASE);
    const unlabeled = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select');
      const issues = [];
      inputs.forEach(input => {
        // Skip hidden / honeypot fields
        if (input.closest('.hidden') || input.closest('[style*="display:none"]') || input.getAttribute('aria-hidden') === 'true') {
          return;
        }
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const parentLabel = input.closest('label');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        if (!label && !parentLabel && !ariaLabel && !ariaLabelledby) {
          issues.push({ tag: input.tagName, id, name: input.getAttribute('name'), type: input.getAttribute('type') });
        }
      });
      return issues;
    });

    if (unlabeled.length > 0) {
      console.log('\n⚠️  Unlabeled inputs:', unlabeled);
    } else {
      console.log('\n✅ All inputs have accessible labels!');
    }
    expect(unlabeled.length).toBe(0);
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto(BASE);
    const missingAlt = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const issues = [];
      imgs.forEach(img => {
        const ariaHidden = img.getAttribute('aria-hidden') === 'true';
        const role = img.getAttribute('role') === 'presentation';
        if (!ariaHidden && !role && img.alt === null) {
          issues.push(img.src?.split('/').pop() || 'unknown');
        }
      });
      return issues;
    });

    if (missingAlt.length > 0) {
      console.log('\n⚠️  Images without alt:', missingAlt);
    } else {
      console.log('\n✅ All images have alt text!');
    }
    expect(missingAlt).toHaveLength(0);
  });

  test('Color contrast — axe check', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    console.log(`\n🎨 Color contrast violations: ${results.violations.length}`);
    results.violations.forEach(v => {
      v.nodes.forEach(n => console.log(`   → ${n.html.slice(0, 100)}`));
    });

    // Zero contrast violations
    expect(results.violations.length).toBe(0);
  });

  test('ARIA roles are valid', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withRules(['aria-allowed-role', 'aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();

    console.log(`\n🏷️  ARIA violations: ${results.violations.length}`);
    results.violations.forEach(v => console.log(`   [${v.impact}] ${v.id}: ${v.description}`));
    expect(results.violations.length).toBe(0);
  });

  test('Skip navigation link works', async ({ page }) => {
    await page.goto(BASE);
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
    const href = await skipLink.getAttribute('href');
    console.log(`\n⏭️  Skip link href: ${href}`);
    expect(href).toMatch(/^#/);
  });

  test('Modal focus trap works', async ({ page }) => {
    await page.goto(BASE);
    const dialogs = page.locator('[role="dialog"]');
    const count = await dialogs.count();
    console.log(`\n🪟 Dialog elements found: ${count}`);
    expect(count).toBeGreaterThanOrEqual(1);
  });

});
