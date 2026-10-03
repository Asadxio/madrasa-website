/**
 * Madarsa Tus Salikat Lil Banat - PWA "Add to Home Screen" Mobile Banner & Helper
 * Handles Chrome/Android beforeinstallprompt & Safari/iOS Home Screen guidance.
 */
(function() {
  'use strict';

  // Do not run if already installed / standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    return;
  }

  // Check 7-day dismissal cooldown
  const DISMISS_KEY = 'mslb_pwa_dismissed';
  const lastDismissed = localStorage.getItem(DISMISS_KEY);
  if (lastDismissed && (Date.now() - parseInt(lastDismissed, 10)) < 7 * 24 * 60 * 60 * 1000) {
    return;
  }

  let deferredPrompt = null;
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  // Inject CSS Styles
  const style = document.createElement('style');
  style.id = 'pwa-install-styles';
  style.textContent = `
    .mslb-pwa-banner {
      position: fixed;
      bottom: 20px;
      left: 16px;
      right: 16px;
      max-width: 440px;
      margin: 0 auto;
      background: linear-gradient(135deg, #082B20 0%, #0B3D2E 100%);
      color: #FFFFFF;
      border: 1px solid rgba(201, 162, 75, 0.4);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 14px;
      transform: translateY(120%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      backdrop-filter: blur(8px);
    }
    .mslb-pwa-banner.is-visible {
      transform: translateY(0);
    }
    .mslb-pwa-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 10px;
      background: #082B20;
      border: 1px solid #C9A24B;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mslb-pwa-content {
      flex: 1;
      min-width: 0;
    }
    .mslb-pwa-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mslb-pwa-desc {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.35;
    }
    .mslb-pwa-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .mslb-pwa-install-btn {
      background: #C9A24B;
      color: #082B20;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 8px 14px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(201, 162, 75, 0.3);
      transition: background 0.2s, transform 0.2s;
    }
    .mslb-pwa-install-btn:hover {
      background: #E2C77F;
      transform: scale(1.02);
    }
    .mslb-pwa-close-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 6px;
      line-height: 1;
      border-radius: 50%;
    }
    .mslb-pwa-close-btn:hover {
      color: #FFFFFF;
    }

    /* iOS Modal Guide */
    .mslb-ios-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 100000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .mslb-ios-modal.is-open {
      opacity: 1;
      pointer-events: auto;
    }
    .mslb-ios-sheet {
      background: #FFFFFF;
      color: #1C1C1C;
      border-radius: 20px;
      max-width: 400px;
      width: 100%;
      padding: 24px;
      text-align: center;
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
      border: 1px solid rgba(201, 162, 75, 0.4);
      animation: mslbSlideUp 0.3s ease;
    }
    @keyframes mslbSlideUp {
      from { transform: translateY(30px); }
      to { transform: translateY(0); }
    }
    .mslb-ios-sheet h4 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0B3D2E;
      margin-bottom: 12px;
    }
    .mslb-ios-sheet ol {
      text-align: left;
      font-size: 0.88rem;
      color: #4A4A45;
      padding-left: 20px;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    .mslb-ios-sheet .sheet-close {
      background: #0B3D2E;
      color: #FFFFFF;
      border: none;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 10px 24px;
      border-radius: 20px;
      cursor: pointer;
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  // Build Banner DOM
  const banner = document.createElement('div');
  banner.className = 'mslb-pwa-banner';
  banner.id = 'mslbPwaBanner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Install Madarsa App');
  banner.innerHTML = `
    <div class="mslb-pwa-icon" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="48" fill="#0B3D2E"/>
        <text x="50" y="66" font-size="52" text-anchor="middle" fill="#C9A24B" font-family="'Amiri', serif">س</text>
      </svg>
    </div>
    <div class="mslb-pwa-content">
      <div class="mslb-pwa-title">Install Madarsa App</div>
      <div class="mslb-pwa-desc">Instant access to Duas, Namaz Guides, Zakat Calculator &amp; Courses offline.</div>
    </div>
    <div class="mslb-pwa-actions">
      <button type="button" class="mslb-pwa-install-btn" id="mslbPwaInstallBtn">
        📲 Install
      </button>
      <button type="button" class="mslb-pwa-close-btn" id="mslbPwaCloseBtn" aria-label="Close install prompt">✕</button>
    </div>
  `;

  // Build iOS Sheet DOM
  const iosModal = document.createElement('div');
  iosModal.className = 'mslb-ios-modal';
  iosModal.id = 'mslbIosModal';
  iosModal.innerHTML = `
    <div class="mslb-ios-sheet" role="document">
      <h4>Add to iPhone / iPad Home Screen</h4>
      <ol>
        <li>Tap the <strong>Share</strong> button <span style="font-size:1.2rem;">⎋</span> at the bottom of Safari.</li>
        <li>Scroll down and select <strong>'Add to Home Screen'</strong> <span style="font-size:1.2rem;">⊞</span>.</li>
        <li>Tap <strong>'Add'</strong> in the top-right corner.</li>
      </ol>
      <button type="button" class="sheet-close" id="mslbIosCloseBtn">Got it, thanks!</button>
    </div>
  `;

  document.body.appendChild(banner);
  document.body.appendChild(iosModal);

  function showBanner() {
    banner.classList.add('is-visible');
    if (typeof gtag === 'function') {
      gtag('event', 'pwa_prompt_shown', {
        event_category: 'pwa',
        event_label: 'PWA Banner Displayed'
      });
    }
  }

  function hideBanner() {
    banner.classList.remove('is-visible');
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  // Close handlers
  document.getElementById('mslbPwaCloseBtn').addEventListener('click', () => {
    hideBanner();
    if (typeof gtag === 'function') {
      gtag('event', 'pwa_prompt_dismissed');
    }
  });

  document.getElementById('mslbIosCloseBtn').addEventListener('click', () => {
    iosModal.classList.remove('is-open');
    hideBanner();
  });

  // Install Click Handler
  document.getElementById('mslbPwaInstallBtn').addEventListener('click', () => {
    if (typeof gtag === 'function') {
      gtag('event', 'pwa_install_click', {
        event_category: 'pwa',
        event_label: 'PWA Install Clicked'
      });
    }

    if (deferredPrompt) {
      // Android / Chrome native flow
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          if (typeof gtag === 'function') {
            gtag('event', 'pwa_install_success');
          }
        }
        deferredPrompt = null;
        hideBanner();
      });
    } else if (isIos) {
      // iOS Safari guidance
      iosModal.classList.add('is-open');
    } else {
      // Desktop / Other fallback
      alert("To install this app on your device, open your browser menu (⋮) and click 'Install Madarsa Tus Salikat' or 'Add to Home Screen'.");
      hideBanner();
    }
  });

  // Android / Chromium beforeinstallprompt listener
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Show after 3.5s delay to avoid immediately interrupting the user
    setTimeout(showBanner, 3500);
  });

  // If on mobile iOS Safari, show prompt after 4.5s
  if (isIos) {
    setTimeout(showBanner, 4500);
  }

  // Register service worker if available
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
