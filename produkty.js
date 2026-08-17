/* ---------------------------------------------------------------
   ZOZNAM POČÍTAČOV NA STRÁNKE

   Toto je jediné miesto, kde sa pridáva alebo mení počítač.
   HTML sa nikdy upravovať nemusí — karty sa vykreslia samy.

   Ako pridať ďalší počítač:
     1. Skopíruj celý blok { ... } aj s čiarkou.
     2. Prepíš hodnoty.
     3. Fotku ulož do assets/ (na výšku, ideálne 760 px vysokú).

   Políčko "stav" určuje štítok nad fotkou:
     'repas' → modrý štítok „Repasovaný“
     'novy'  → zelený štítok „Nový“

   POZOR pri nových (nerepasovaných) počítačoch:
   texty na zvyšku stránky hovoria o repase — testovanie kus po kuse,
   kozmetické stopy, ekologický prínos. Pri novom tovare tie tvrdenia
   neplatia a nesmú sa naň vzťahovať. Aj záruka sa riadi inak.
   Než pridáš prvý nový počítač, treba doplniť druhú vetvu textov.
   --------------------------------------------------------------- */

var PRODUKTY = [
  {
    stav: 'repas',
    stitok: 'Na hranie',
    nazov: 'Herné počítače',
    obrazok: 'assets/foto-herny.jpg',
    alt: 'Herný repasovaný počítač s presklením a RGB podsvietením',
    sirka: 623,
    vyska: 760,
    popis: 'Vyradené herné a výkonné pracovné zostavy s dedikovanou grafikou. ' +
           'Kontrolujeme teploty aj stabilitu pri plnom zaťažení, nie len to, ' +
           'či nabehne systém.',
    body: [
      'Dedikovaná grafická karta',
      'Testované pri plnom zaťažení',
      'Priestor na neskorší upgrade RAM alebo SSD'
    ],
    odkaz: 'Pozrieť herné PC',
    utm: 'pc-herny'
  },
  {
    stav: 'repas',
    stitok: 'Na prácu a školu',
    nazov: 'Kancelárske počítače',
    obrazok: 'assets/foto-kancelarsky.jpg',
    alt: 'Kancelársky repasovaný počítač Dell OptiPlex',
    sirka: 398,
    vyska: 760,
    popis: 'Vyradené firemné počítače, ktoré spĺňajú požiadavky Windows 11. ' +
           'Tiché, úsporné a pripravené na roky bežnej práce, výučby ' +
           'a kancelárskych programov.',
    body: [
      'Spĺňajú požiadavky Windows 11',
      'SSD a systém pripravený na prvé spustenie',
      'Vhodné aj pre firmy a školy vo väčšom počte'
    ],
    odkaz: 'Pozrieť kancelárske PC',
    utm: 'pc-kancelarsky'
  }
];

/* --------------------------------------------------------------- */

(function () {
  'use strict';

  var mriezka = document.getElementById('pc-grid');
  if (!mriezka || typeof PRODUKTY === 'undefined') return;

  var STAVY = {
    repas: { text: 'Repasovaný', trieda: 'je-repas' },
    novy:  { text: 'Nový',       trieda: 'je-novy'  }
  };

  function text(el, hodnota) { el.textContent = hodnota; return el; }

  function prvok(tag, trieda, rodic) {
    var e = document.createElement(tag);
    if (trieda) e.className = trieda;
    if (rodic) rodic.appendChild(e);
    return e;
  }

  for (var i = 0; i < PRODUKTY.length; i++) {
    var p = PRODUKTY[i];
    var stav = STAVY[p.stav] || STAVY.repas;

    var karta = prvok('article', 'pc-card', mriezka);

    var media = prvok('div', 'pc-media', karta);

    var znacka = prvok('span', 'pc-stav ' + stav.trieda, media);
    text(znacka, stav.text);

    var img = prvok('img', null, media);
    img.src = p.obrazok;
    img.alt = p.alt;
    img.width = p.sirka;
    img.height = p.vyska;
    img.loading = 'lazy';
    img.decoding = 'async';

    var telo = prvok('div', 'pc-body', karta);
    text(prvok('span', 'pc-tag', telo), p.stitok);
    text(prvok('h3', null, telo), p.nazov);
    text(prvok('p', null, telo), p.popis);

    var zoznam = prvok('ul', 'pc-specs', telo);
    for (var j = 0; j < p.body.length; j++) {
      text(prvok('li', null, zoznam), p.body[j]);
    }

    var a = prvok('a', 'pc-link js-shop', telo);
    a.href = '#';
    a.setAttribute('data-utm', p.utm);
    text(a, p.odkaz);
  }
})();
