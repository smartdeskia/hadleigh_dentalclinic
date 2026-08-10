// Lightweight cookie consent banner — no external library.
(function () {
  const STORAGE_KEY = 'cookieConsent';
  if (localStorage.getItem(STORAGE_KEY)) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <p class="cookie-banner-text">We use cookies to improve your experience on our site. By continuing, you agree to our use of cookies.</p>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-outline btn-sm cookie-banner-reject">Reject</button>
        <button type="button" class="btn btn-primary btn-sm cookie-banner-accept">Accept All</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  document.body.classList.add('cookie-banner-visible');

  function dismiss(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      /* private browsing — still dismiss for this session */
    }
    banner.remove();
    document.body.classList.remove('cookie-banner-visible');
  }

  banner.querySelector('.cookie-banner-accept').addEventListener('click', () => dismiss('accepted'));
  banner.querySelector('.cookie-banner-reject').addEventListener('click', () => dismiss('rejected'));
})();
