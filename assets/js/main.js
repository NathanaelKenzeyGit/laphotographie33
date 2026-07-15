// ======================================================
// 1. CHARGEMENT DES COMPOSANTS AVEC JQUERY
// ======================================================

$(document).ready(function () {
  // Charge un fragment HTML dans un conteneur, seulement s'il est présent sur la page
  function loadFragment(selector, url, onSuccess) {
    const $container = $(selector);
    if ($container.length === 0) return;

    $container.load(url, function (response, status, xhr) {
      if (status === 'error') {
        console.error('Erreur chargement ' + url + ' : ' + xhr.status + ' ' + xhr.statusText);
        return;
      }
      if (onSuccess) onSuccess($container);
    });
  }

  function initNavbarTheme($navbarContainer) {
    if ($navbarContainer.attr('data-theme') === 'light') {
      $navbarContainer.find('#myNavbar').removeClass('nav-theme-dark').addClass('nav-theme-light');
    }

    const navbar = $('.navbar-glass');
    $(window).scroll(function () {
      if ($(window).scrollTop() > 50) {
        navbar.addClass('scrolled');
      } else {
        navbar.removeClass('scrolled');
      }
    });
  }

  function initLayout() {
    loadFragment('#main-navbar', '/pages/navbar.html', initNavbarTheme);
    loadFragment('#main-footer', '/pages/footer.html');
    loadFragment('#buttons-prestations', '/pages/illustration-contact.html');
  }

  initLayout();
});

// ======================================================
// Indicateurs du carrousel hero (accueil)
// ======================================================
// Les indicateurs vivent hors de #hero-carousel pour des raisons de mise en page (le
// carrousel est en position absolute plein cadre en fond de section), donc Bootstrap
// ne les détecte pas tout seul pour gérer la classe .active (il ne regarde que les
// indicateurs situés à l'intérieur de l'élément .carousel). On le fait à la main.
const heroCarousel = document.getElementById('hero-carousel');
if (heroCarousel) {
  heroCarousel.addEventListener('slide.bs.carousel', (event) => {
    document.querySelectorAll('.hero-accueil-indicators button').forEach((btn) => {
      const isActive = Number(btn.dataset.bsSlideTo) === event.to;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  });
}

// ======================================================
// Effets GSAP légers (entrées au scroll / au chargement)
// ======================================================

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Anime un chiffre de 0 à sa valeur cible au scroll, en réutilisant le texte déjà
// présent dans le HTML (valeur + suffixe genre "+"/"%") pour ne dupliquer aucune donnée.
// formatDot: true reformate le séparateur de milliers en "." (ex. "50.000") au lieu
// de l'espace par défaut de toLocaleString('fr-FR'), pour coller au format déjà en
// place sur la page "À propos".
function animateCounters(selector, { formatDot = false } = {}) {
  document.querySelectorAll(selector).forEach((el) => {
    const raw = el.textContent.trim();
    const target = parseInt(raw.replace(/[^\d]/g, ''), 10);
    const suffix = raw.replace(/^[\d.\s]+/, '');
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.8,
      ease: 'power1.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => {
        let formatted = Math.round(counter.value).toLocaleString('fr-FR');
        if (formatDot) formatted = formatted.replace(/\s/g, '.');
        el.textContent = formatted + suffix;
      },
    });
  });
}

if (!prefersReducedMotion) {
  // Cartes "Prestations" (accueil)
  gsap.from('.menu__card', {
    duration: 1,
    opacity: 0,
    y: 60,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.menu__grid', start: 'top 80%' },
  });

  // Hero accueil : entrée au chargement (contenu déjà visible à l'écran).
  // Le <h1> est volontairement exclu : c'est l'élément LCP (Largest Contentful
  // Paint) de la home, et un audit Lighthouse a montré qu'animer son opacity
  // retarde son "paint stable" de plusieurs secondes en throttling (Chrome ne
  // valide un LCP qu'une fois l'élément stabilisé) — un score LCP de 0.27/1 rien
  // qu'à cause de ça. Le titre s'affiche donc immédiatement, sans fade.
  gsap.from('.hero-accueil-subtitle, .hero-accueil-buttons, .hero-accueil-indicators', {
    duration: 0.9,
    opacity: 0,
    y: 30,
    ease: 'power2.out',
    stagger: 0.15,
  });

  // Bio photographe (accueil)
  gsap.from('.bio-photographe__img', {
    duration: 1,
    opacity: 0,
    x: -40,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.bio-photographe', start: 'top 75%' },
  });
  gsap.from('.bio-photographe__label, .bio-photographe__title, .bio-photographe__text', {
    duration: 1,
    opacity: 0,
    x: 40,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.bio-photographe', start: 'top 75%' },
  });

  // Mosaïque de photos (accueil, juste sous le hero)
  gsap.from('.galerie-mosaique-item', {
    duration: 0.8,
    opacity: 0,
    y: 40,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '#galerie-mosaique', start: 'top 80%' },
  });

  // Galerie d'aperçu + CTA Instagram (accueil)
  gsap.from('.galerie-apercu-item', {
    duration: 0.8,
    opacity: 0,
    y: 40,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '#section-galerie', start: 'top 80%' },
  });

  // Avis Google (accueil)
  gsap.from('.avis-section__divider, .avis-section h3', {
    duration: 0.8,
    opacity: 0,
    y: 20,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.avis-section', start: 'top 80%' },
  });

  // Titre principal des pages internes (mariage, portraits, maternité, animalier, corporate)
  gsap.from('h1.mariage-h2', {
    duration: 0.8,
    opacity: 0,
    y: 20,
    ease: 'power2.out',
  });

  // Sous-titres récurrents de ces mêmes pages, un par un au scroll
  document.querySelectorAll('h2.mariage-h2').forEach((el) => {
    gsap.from(el, {
      duration: 0.8,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Titre hero des autres pages (prestations, à propos, contact, FAQ, blog)
  gsap.from(
    '.hero-title, .hero-about__title, .contact-hero-title, .hero-faq__title, .hero__title',
    {
      duration: 0.8,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
    }
  );
  gsap.from('.hero-about__text', {
    duration: 0.8,
    opacity: 0,
    y: 20,
    delay: 0.15,
    ease: 'power2.out',
  });

  // Page "À propos" : intro (photo + texte)
  gsap.from('.about-intro__img', {
    duration: 1,
    opacity: 0,
    x: -40,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.about-intro', start: 'top 75%' },
  });
  gsap.from('.about-intro__title, .about-intro__content', {
    duration: 1,
    opacity: 0,
    x: 40,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.about-intro', start: 'top 75%' },
  });

  // Page "À propos" : les 3 principes (numéros + textes)
  gsap.from('.about-principles__item', {
    duration: 0.8,
    opacity: 0,
    y: 30,
    ease: 'power2.out',
    stagger: 0.15,
    scrollTrigger: { trigger: '.about-principles__box', start: 'top 80%' },
  });

  // Page "À propos" : les chiffres — compteur animé de 0 à la valeur cible
  gsap.from('.about-stats__title, .about-stats__divider', {
    duration: 0.8,
    opacity: 0,
    y: 20,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.about-stats', start: 'top 80%' },
  });
  gsap.from('.about-stats__item', {
    duration: 0.6,
    opacity: 0,
    y: 20,
    ease: 'power2.out',
    stagger: 0.15,
    scrollTrigger: { trigger: '.about-stats', start: 'top 75%' },
  });
  animateCounters('.about-stats__number', { formatDot: true });

  // Page "Contact" : tableau de chiffres ("15+ ans", "500+ séances", "50 000+ photos",
  // "100% passion") — hero déjà couvert par .contact-hero-title plus haut
  gsap.from('.contact-table .table-row', {
    duration: 0.6,
    opacity: 0,
    y: 15,
    ease: 'power2.out',
    stagger: 0.1,
    scrollTrigger: { trigger: '.contact-table', start: 'top 85%' },
  });
  animateCounters('.contact-table__bold');

  // Page "Contact" : logos partenaires
  gsap.from('.contact-logos', {
    duration: 0.6,
    opacity: 0,
    y: 20,
    ease: 'power2.out',
    stagger: 0.08,
    scrollTrigger: { trigger: '.contact-logos', start: 'top 85%' },
  });
}
