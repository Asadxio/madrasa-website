// @ts-check
const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700&family=Amiri:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: radial-gradient(circle at 80% 20%, #0d4a38 0%, #082b20 70%, #051c15 100%);
    color: #F8F4EC;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 80px;
    position: relative;
    overflow: hidden;
    border: 8px solid #C9A24B;
  }
  .bg-ornament {
    position: absolute;
    right: -100px;
    top: -100px;
    width: 600px;
    height: 600px;
    border: 2px solid rgba(201,162,75,0.15);
    border-radius: 50%;
    pointer-events: none;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .seal {
    width: 75px;
    height: 75px;
  }
  .brand-sub {
    font-size: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #E2C77F;
    font-weight: 600;
  }
  .arabic-title {
    font-family: 'Amiri', serif;
    font-size: 58px;
    color: #E2C77F;
    line-height: 1.2;
    margin-top: 15px;
    direction: rtl;
    text-align: right;
  }
  .main-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 54px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.15;
    margin-top: 10px;
  }
  .gold-rule {
    width: 120px;
    height: 3px;
    background: linear-gradient(90deg, #C9A24B, transparent);
    margin: 20px 0;
  }
  .tagline {
    font-size: 22px;
    color: rgba(248, 244, 236, 0.85);
    max-width: 820px;
    line-height: 1.5;
  }
  .badges {
    display: flex;
    gap: 16px;
    margin-top: 25px;
  }
  .badge {
    background: rgba(201, 162, 75, 0.15);
    border: 1px solid #C9A24B;
    color: #E2C77F;
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(201,162,75,0.3);
    padding-top: 20px;
    font-size: 16px;
    color: #E2C77F;
    font-weight: 500;
  }
</style>
</head>
<body>
  <div class="bg-ornament"></div>
  <div>
    <div class="header">
      <svg class="seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" stroke="#C9A24B" stroke-width="2"/>
        <circle cx="50" cy="50" r="38" fill="#0B3D2E" stroke="#C9A24B" stroke-width="1"/>
        <text x="50" y="62" font-family="Amiri, serif" font-size="34" fill="#E2C77F" text-anchor="middle">س</text>
      </svg>
      <div>
        <p class="brand-sub">Worldwide Online Islamic Education for Girls</p>
        <p style="color:#FFFFFF;font-size:20px;font-weight:700;">Maslak Aala Hazrat • Fiqh Hanafi</p>
      </div>
    </div>

    <h1 class="main-title">Madarsa Tus Salikat Lil Banat</h1>
    <div class="arabic-title">مدرسة السالكات للبنات</div>
    <div class="gold-rule"></div>
    <p class="tagline">A Sanctuary of Sacred Islamic Learning, Exclusively Built for Girls and Women. Live & Recorded Global Classes.</p>

    <div class="badges">
      <span class="badge">Aalimah Course (5 Years)</span>
      <span class="badge">Muballigha Course (1 Year)</span>
      <span class="badge">Qirat & Tajweed</span>
      <span class="badge">500+ Students Worldwide</span>
    </div>
  </div>

  <div class="footer">
    <span>🌐 mslb.nooreharam.com</span>
    <span>📞 WhatsApp: +91 63669 19122</span>
    <span>📱 Android App Available on Google Play</span>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const outPath = path.resolve('assets/og-cover.png');
  await page.screenshot({ path: outPath });
  console.log('✅ Generated assets/og-cover.png at:', outPath);
  await browser.close();
})();
