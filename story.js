/* ---------------------------------------------------------------
   Príbeh počítača — 3D scéna riadená scrollom.

   Skript nerobí nič iné, než že do CSS premenných zapisuje čísla.
   Celé vykresľovanie rieši CSS cez transform a opacity, takže
   prehliadač nemusí pri žiadnom snímku prepočítavať rozloženie.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var story = document.getElementById('pribeh');
  if (!story) return;

  /* Kto má v systéme vypnuté animácie, dostane statický výpis krokov. */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    var all = story.querySelectorAll('.story-step');
    for (var a = 0; a < all.length; a++) all[a].classList.add('is-on');
    return;
  }

  var track = story.querySelector('.story-track');
  var stage = story.querySelector('.story-stage');
  var scene = story.querySelector('.story-scene');
  var steps = story.querySelectorAll('.story-step');
  var parts = story.querySelectorAll('.part');

  /* fázy postupu */
  var SCAN_OD = 0.20, SCAN_DO = 0.46;
  var EXPL_OD = 0.46, EXPL_DO = 0.70;
  var SPAT_OD = 0.74, SPAT_DO = 0.88;
  var GLOW_OD = 0.82;

  var ciel = { rx: -12, ry: -26 };   /* kam sa kamera chce dostať */
  var teraz = { rx: -12, ry: -26 };  /* kde reálne je (dobieha plynulo) */
  var mys = { rx: 0, ry: 0 };        /* príspevok kurzora */
  var tah = { rx: 0, ry: 0 };        /* príspevok ťahania myšou */
  var krok = -1;
  var finale = false;
  var bezi = false;
  var tahame = false;
  var zaciatok = { x: 0, y: 0, ry: 0, rx: 0 };

  function medzi(v, min, max) { return v < min ? min : v > max ? max : v; }
  function usek(v, od, do_) { return medzi((v - od) / (do_ - od), 0, 1); }
  function zjemni(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function postup() {
    var r = track.getBoundingClientRect();
    var dlzka = track.offsetHeight - stage.offsetHeight;
    if (dlzka <= 0) return 0;
    return medzi(-r.top / dlzka, 0, 1);
  }

  function snimok() {
    bezi = false;

    var p = postup();
    var sc = usek(p, SCAN_OD, SCAN_DO);

    /* rozobratie ide hore a pri poslednom kroku zase späť */
    var spat = zjemni(usek(p, SPAT_OD, SPAT_DO));
    var ex = zjemni(usek(p, EXPL_OD, EXPL_DO)) * (1 - spat);
    var gl = zjemni(usek(p, GLOW_OD, 1));

    /* plášť sa spriehľadní počas skenu a rozobratia, na konci sa zase zavrie */
    var op = sc * (1 - spat);

    /* kamera sa počas príbehu sama pootočí, kurzor a ťahanie sa pripočítajú */
    ciel.ry = -26 + p * 34 + mys.ry + tah.ry;
    ciel.rx = -12 + Math.sin(p * Math.PI) * -6 + mys.rx + tah.rx;

    teraz.ry += (ciel.ry - teraz.ry) * 0.12;
    teraz.rx += (ciel.rx - teraz.rx) * 0.12;

    var s = story.style;
    s.setProperty('--p', p.toFixed(4));
    s.setProperty('--sc', sc.toFixed(4));
    s.setProperty('--ex', ex.toFixed(4));
    s.setProperty('--gl', gl.toFixed(4));
    s.setProperty('--op', op.toFixed(4));
    s.setProperty('--ry', teraz.ry.toFixed(2) + 'deg');
    s.setProperty('--rx', teraz.rx.toFixed(2) + 'deg');

    /* komponenty sa rozsvecujú tak, ako ich lúč míňa */
    for (var i = 0; i < parts.length; i++) {
      var hotovo = sc > (i + 0.6) / parts.length;
      parts[i].classList.toggle('is-lit', hotovo || ex > 0.05);
      parts[i].style.setProperty('--lit', hotovo ? 1 : 0);
    }

    /* aktívny textový krok */
    var novy = p < SCAN_OD ? 0 : p < EXPL_OD ? 1 : p < SPAT_OD ? 2 : 3;
    if (novy !== krok) {
      krok = novy;
      for (var j = 0; j < steps.length; j++) {
        steps[j].classList.toggle('is-on', j === novy);
      }
    }

    var maByt = p > 0.86;
    if (maByt !== finale) {
      finale = maByt;
      story.classList.toggle('is-final', maByt);
    }

    /* kým kamera dobieha, kreslíme ďalej */
    if (Math.abs(ciel.ry - teraz.ry) > 0.05 || Math.abs(ciel.rx - teraz.rx) > 0.05) ziadaj();
  }

  function ziadaj() {
    if (bezi) return;
    bezi = true;
    window.requestAnimationFrame(snimok);
  }

  /* ---- kurzor nad scénou ---- */

  scene.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' || tahame) return;
    var r = scene.getBoundingClientRect();
    mys.ry = ((e.clientX - r.left) / r.width - 0.5) * 26;
    mys.rx = ((e.clientY - r.top) / r.height - 0.5) * -16;
    ziadaj();
  });

  scene.addEventListener('pointerleave', function () {
    mys.ry = 0;
    mys.rx = 0;
    ziadaj();
  });

  /* ---- ťahanie ---- */

  scene.addEventListener('pointerdown', function (e) {
    tahame = true;
    zaciatok.x = e.clientX;
    zaciatok.y = e.clientY;
    zaciatok.ry = tah.ry;
    zaciatok.rx = tah.rx;
    mys.ry = 0;
    mys.rx = 0;
    try { scene.setPointerCapture(e.pointerId); } catch (err) {}
  });

  scene.addEventListener('pointermove', function (e) {
    if (!tahame) return;
    tah.ry = medzi(zaciatok.ry + (e.clientX - zaciatok.x) * 0.45, -85, 85);
    tah.rx = medzi(zaciatok.rx - (e.clientY - zaciatok.y) * 0.32, -42, 42);
    ziadaj();
  });

  function pusti(e) {
    if (!tahame) return;
    tahame = false;
    try { scene.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  scene.addEventListener('pointerup', pusti);
  scene.addEventListener('pointercancel', pusti);

  /* ---- napojenie na scroll ---- */

  window.addEventListener('scroll', ziadaj, { passive: true });
  window.addEventListener('resize', ziadaj);
  ziadaj();
})();
