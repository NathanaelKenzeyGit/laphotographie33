// Bandeau de consentement cookies minimal : ne gère qu'un seul cookie tiers
// non-essentiel (le widget Elfsight des avis Google, présent uniquement sur la home).
// Rien n'est chargé tant que l'utilisateur n'a pas explicitement accepté.

const COOKIE_CONSENT_KEY = 'cookie-consent';
const ELFSIGHT_SCRIPT_SRC = 'https://elfsightcdn.com/platform.js';

function getConsent() {
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function setConsent(value) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

function loadElfsightIfPresent() {
  const container = document.querySelector('.elfsight-app-68481708-4da3-4ad8-9b85-136a69be78ce');
  if (!container) return;

  if (document.querySelector(`script[src="${ELFSIGHT_SCRIPT_SRC}"]`)) return;

  const script = document.createElement('script');
  script.src = ELFSIGHT_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

function showAvisFallback() {
  const container = document.querySelector('.elfsight-app-68481708-4da3-4ad8-9b85-136a69be78ce');
  if (!container) return;

  container.innerHTML = '';
  const fallback = document.createElement('div');
  fallback.className = 'avis-fallback';
  fallback.innerHTML = `
    <p class="mb-0">Activez les cookies pour afficher nos avis Google.</p>
    <button type="button" id="avis-fallback-btn">Gérer mes cookies</button>
  `;
  container.appendChild(fallback);

  document.getElementById('avis-fallback-btn')?.addEventListener('click', () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    showBanner();
  });
}

function applyConsent(value) {
  if (value === 'accepted') {
    loadElfsightIfPresent();
  } else if (value === 'refused') {
    showAvisFallback();
  }
}

function showBanner() {
  if (document.querySelector('.cookie-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p class="cookie-banner__text">
      Ce site utilise un cookie technique pour mémoriser votre choix, ainsi qu'un widget
      d'avis Google (Elfsight) qui peut déposer des cookies — chargé uniquement si vous
      acceptez. Plus de détails dans les
      <a href="/pages/mentions-legales.html#cookies">mentions légales</a>.
    </p>
    <div class="cookie-banner__actions">
      <button type="button" class="cookie-banner__btn" id="cookie-refuse-btn">Refuser</button>
      <button type="button" class="cookie-banner__btn cookie-banner__btn--accept" id="cookie-accept-btn">
        Accepter
      </button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cookie-accept-btn').addEventListener('click', () => {
    setConsent('accepted');
    applyConsent('accepted');
    banner.remove();
  });

  document.getElementById('cookie-refuse-btn').addEventListener('click', () => {
    setConsent('refused');
    applyConsent('refused');
    banner.remove();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const consent = getConsent();
  if (consent) {
    applyConsent(consent);
  } else {
    showBanner();
  }
});
