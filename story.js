/* ---------------------------------------------------------------
   Príbeh počítača — scroll riadi izometrickú scénu z pc-scene.js.

   Tento skript nič nekreslí. Zo scrollu vypočíta postup 0–1,
   pošle ho scéne cez window.setProgress() a prepína textové kroky.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var story = document.getElementById('pribeh');
  if (!story) return;

  var track = story.querySelector('.story-track');
  var stage = story.querySelector('.story-stage');
  var steps = story.querySelectorAll('.story-step');

  /* Kto má v systéme vypnuté animácie, dostane statický výpis krokov.
     Samotná scéna sa v tom režime vykreslí ako hotový počítač. */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    for (var a = 0; a < steps.length; a++) steps[a].classList.add('is-on');
    return;
  }

  var krok = -1;
  var finale = false;
  var bezi = false;
  var posledny = -1;

  function medzi(v, min, max) { return v < min ? min : v > max ? max : v; }

  function postup() {
    var r = track.getBoundingClientRect();
    var dlzka = track.offsetHeight - stage.offsetHeight;
    if (dlzka <= 0) return 0;
    return medzi(-r.top / dlzka, 0, 1);
  }

  function snimok() {
    bezi = false;

    var p = postup();

    /* scéna kreslí len keď sa postup naozaj zmenil */
    if (Math.abs(p - posledny) > 0.0004) {
      posledny = p;
      if (window.setProgress) window.setProgress(p);
    }

    story.style.setProperty('--p', p.toFixed(4));

    /* žiara a nápoveda „potiahnite myšou“ nabiehajú v poslednom kroku */
    story.style.setProperty('--gl', medzi((p - 0.82) / 0.14, 0, 1).toFixed(3));

    /* aktívny textový krok — hranice sedia s fázami scény */
    var novy = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
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
  }

  function ziadaj() {
    if (bezi) return;
    bezi = true;
    window.requestAnimationFrame(snimok);
  }

  window.addEventListener('scroll', ziadaj, { passive: true });
  window.addEventListener('resize', ziadaj);
  ziadaj();
})();
