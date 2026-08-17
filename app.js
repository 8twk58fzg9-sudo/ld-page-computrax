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
