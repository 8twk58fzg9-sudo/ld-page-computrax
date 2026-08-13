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
});
