/* =============================================
   BERGHOFF GMBH – HAUPTSKRIPT
   Funktionen: Navigation, Sprache, Zähler, Scroll
   ============================================= */

'use strict';

/* === NAVIGATION === */
(function initNavigation() {
  const header    = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!header) return;

  // Scroll-Klasse für Header-Schatten
  window.addEventListener('scroll', function () {
    header.classList.toggle('header--scrollen', window.scrollY > 20);
  }, { passive: true });

  // Hamburger öffnen/schließen
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const istOffen = hamburger.classList.toggle('offen');
      mobileMenu.classList.toggle('sichtbar', istOffen);
      document.body.style.overflow = istOffen ? 'hidden' : '';
    });

    // Menü schließen beim Klick auf Link
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('offen');
        mobileMenu.classList.remove('sichtbar');
        document.body.style.overflow = '';
      });
    });
  }

  // Aktiven Nav-Link setzen
  const aktuelleSeite = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function (link) {
    const ziel = link.getAttribute('href');
    if (ziel && aktuelleSeite.includes(ziel.replace('.html', ''))) {
      link.classList.add('aktiv');
    }
    // Startseite
    if ((aktuelleSeite === 'index.html' || aktuelleSeite === '') && ziel === 'index.html') {
      link.classList.add('aktiv');
    }
  });
})();

/* === SPRACHUMSCHALTUNG === */
(function initSprache() {
  const gespeicherteSprache = localStorage.getItem('berghoff_sprache') || 'de';
  const html = document.documentElement;

  function setSprache(sprache) {
    if (sprache === 'en') {
      html.classList.add('lang-en');
    } else {
      html.classList.remove('lang-en');
    }
    localStorage.setItem('berghoff_sprache', sprache);

    // Alle Sprach-Buttons aktualisieren (Header + Footer)
    document.querySelectorAll('.sprach-btn').forEach(function (btn) {
      btn.classList.toggle('aktiv', btn.dataset.lang === sprache);
    });
  }

  // Initialisierung
  setSprache(gespeicherteSprache);

  // Klick-Handler für alle Sprachumschalter
  document.addEventListener('click', function (e) {
    if (e.target.matches('.sprach-btn') && e.target.dataset.lang) {
      setSprache(e.target.dataset.lang);
    }
  });
})();

/* === SCROLL-ANIMATION (Intersection Observer) === */
(function initScrollAnimation() {
  const elemente = document.querySelectorAll('.einblenden');
  if (!elemente.length) return;

  const beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (eintrag) {
      if (eintrag.isIntersecting) {
        eintrag.target.classList.add('sichtbar');
        beobachter.unobserve(eintrag.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elemente.forEach(function (el) { beobachter.observe(el); });
})();

/* === KENNZAHLEN-ANIMATION (Zähler) === */
(function initKennzahlen() {
  const zaehlerElemente = document.querySelectorAll('.zaehler');
  if (!zaehlerElemente.length) return;

  function animiereZaehler(el) {
    const ziel      = parseInt(el.dataset.ziel, 10);
    const dauer     = parseInt(el.dataset.dauer || '2000', 10);
    const start     = performance.now();

    function aktualisieren(jetzt) {
      const verstrichene = jetzt - start;
      const fortschritt  = Math.min(verstrichene / dauer, 1);
      // Easing: ease-out cubic
      const wert = Math.floor(easeOutCubic(fortschritt) * ziel);
      el.textContent = wert.toLocaleString('de-DE');
      if (fortschritt < 1) requestAnimationFrame(aktualisieren);
      else el.textContent = ziel.toLocaleString('de-DE');
    }

    requestAnimationFrame(aktualisieren);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  const beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (eintrag) {
      if (eintrag.isIntersecting) {
        animiereZaehler(eintrag.target);
        beobachter.unobserve(eintrag.target);
      }
    });
  }, { threshold: 0.5 });

  zaehlerElemente.forEach(function (el) { beobachter.observe(el); });
})();

/* === COOKIE BANNER === */
(function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // Bereits entschieden?
  if (localStorage.getItem('berghoff_cookies')) {
    banner.classList.add('versteckt');
    return;
  }

  document.getElementById('cookie-akzeptieren')?.addEventListener('click', function () {
    localStorage.setItem('berghoff_cookies', 'akzeptiert');
    banner.classList.add('versteckt');
  });

  document.getElementById('cookie-ablehnen')?.addEventListener('click', function () {
    localStorage.setItem('berghoff_cookies', 'abgelehnt');
    banner.classList.add('versteckt');
  });
})();

/* === KONTAKTFORMULAR === */
(function initKontaktFormular() {
  const formulare = document.querySelectorAll('.kontakt-formular form');
  formulare.forEach(function (formular) {
    formular.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = formular.querySelector('[type="submit"]');
      const istEn = document.documentElement.classList.contains('lang-en');
      if (btn) {
        btn.textContent = istEn ? 'Sending…' : 'Wird gesendet…';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = istEn ? 'Message sent ✓' : 'Nachricht gesendet ✓';
          btn.style.background = '#22c55e';
          formular.reset();
          setTimeout(function () {
            btn.textContent = istEn ? 'Send Message' : 'Nachricht senden';
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        }, 1200);
      }
    });
  });
})();

/* === SMOOTH SCROLL für Anker-Links === */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const ziel = document.querySelector(this.getAttribute('href'));
    if (ziel) {
      e.preventDefault();
      const offset = 80; // Header-Höhe
      const y = ziel.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});
