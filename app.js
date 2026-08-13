/* Jediné miesto, kde sa mení adresa e-shopu. */
var SHOP_URL = 'https://computrax.techsaver.sk';

document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.js-shop');
  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('href', SHOP_URL);
    links[i].setAttribute('rel', 'noopener');
  }
});
