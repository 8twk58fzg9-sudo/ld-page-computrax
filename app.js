/* ---------------------------------------------------------------
   Jediné miesto, kde sa mení adresa e-shopu a označenie kampane.
   --------------------------------------------------------------- */

var SHOP_URL = 'https://computrax.techsaver.sk';

/* UTM parametre — vďaka nim uvidíte v štatistikách e-shopu, koľko
   návštev prišlo z tejto stránky a z ktorého tlačidla.
   Nepoužívajú cookies ani skripty, sú to len parametre v odkaze. */
var UTM = {
  utm_source: 'landing',
  utm_medium: 'referral',
  utm_campaign: 'computrax-promo'
};

document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.js-shop');

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var url = SHOP_URL + (SHOP_URL.indexOf('?') === -1 ? '?' : '&');
    var parts = [];

    for (var key in UTM) {
      if (Object.prototype.hasOwnProperty.call(UTM, key)) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(UTM[key]));
      }
    }

    /* utm_content rozlíši, ktoré tlačidlo návštevník klikol */
    var place = link.getAttribute('data-utm');
    if (place) {
      parts.push('utm_content=' + encodeURIComponent(place));
    }

    link.setAttribute('href', url + parts.join('&'));
    link.setAttribute('rel', 'noopener');
  }

  menu();
  odkryvanie();
});

/* ---------------------------------------------------------------
   Mobilné menu — pod 860 px sa navigácia zbalí pod tlačidlo.
   --------------------------------------------------------------- */
function menu() {
  var tlacidlo = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hlavne-menu');
  if (!tlacidlo || !nav) return;

  function prepni(otvorit) {
    var otvorene = otvorit === undefined
      ? tlacidlo.getAttribute('aria-expanded') !== 'true'
      : otvorit;
    tlacidlo.setAttribute('aria-expanded', otvorene ? 'true' : 'false');
    tlacidlo.setAttribute('aria-label', otvorene ? 'Zavrieť menu' : 'Otvoriť menu');
    document.body.classList.toggle('menu-otvorene', otvorene);
  }

  tlacidlo.addEventListener('click', function () { prepni(); });

  /* klik na položku menu ho zavrie */
  var polozky = nav.querySelectorAll('a');
  for (var i = 0; i < polozky.length; i++) {
    polozky[i].addEventListener('click', function () { prepni(false); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') prepni(false);
  });

  /* pri prechode na širokú obrazovku menu zavrieme, nech neostane visieť */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 860) prepni(false);
  });
}

/* ---------------------------------------------------------------
   Odkrývanie sekcií pri scrolle.
   --------------------------------------------------------------- */
function odkryvanie() {
  var ciele = document.querySelectorAll('[data-reveal-skupina] > .wrap > *, [data-reveal]');
  if (!ciele.length) return;

  /* Bez podpory alebo s vypnutými animáciami ukážeme všetko naraz. */
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (var i = 0; i < ciele.length; i++) ciele[i].classList.add('je-videne');
    return;
  }

  var poradie = 0;
  var sledovac = new IntersectionObserver(function (zaznamy) {
    for (var j = 0; j < zaznamy.length; j++) {
      if (!zaznamy[j].isIntersecting) continue;
      var el = zaznamy[j].target;
      el.style.transitionDelay = (Math.min(poradie++, 4) * 70) + 'ms';
      el.classList.add('je-videne');
      sledovac.unobserve(el);
    }
    poradie = 0;
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  for (var k = 0; k < ciele.length; k++) {
    ciele[k].classList.add('na-odkrytie');
    sledovac.observe(ciele[k]);
  }
}
