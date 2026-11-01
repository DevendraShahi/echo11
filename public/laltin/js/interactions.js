/* ==========================================================
   LALTIN — interactions.js
   Experience row → stage crossfade, room pointer chip.
   Pointer work is guarded to hover-capable devices; touch
   gets the stacked exp__mobile layout instead (CSS).
   ========================================================== */
(function () {
  'use strict';

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------- experience (§22–23) ---------- */

  var rows = q('.exp__row');
  var stageImgs = q('[data-exp-img]');
  var caption = q('[data-exp-caption]');
  var captions = q('.exp__item .exp__mobile p').map(function (p) {
    return p.textContent.replace(/\s+/g, ' ').trim();
  });
  var fadeTimer = null;

  function activate(index) {
    rows.forEach(function (row, i) {
      row.classList.toggle('is-active', i === index);
    });
    stageImgs.forEach(function (img, i) {
      img.classList.toggle('is-active', i === index);
    });

    if (!caption || !captions[index]) return;
    if (caption.textContent.replace(/\s+/g, ' ').trim() === captions[index]) return;

    caption.classList.add('is-fading');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(function () {
      caption.textContent = captions[index];
      caption.classList.remove('is-fading');
    }, 180);
  }

  rows.forEach(function (row, i) {
    row.addEventListener('mouseenter', function () { activate(i); });
    row.addEventListener('focus', function () { activate(i); });
    row.addEventListener('click', function () { activate(i); });
  });

  /* ---------- room media pointer chip (§19) ---------- */

  var chip = q('[data-pointer-chip]')[0];
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (chip && canHover) {
    q('.room__media').forEach(function (media) {
      media.addEventListener('pointerenter', function () {
        chip.classList.add('is-on');
      });
      media.addEventListener('pointerleave', function () {
        chip.classList.remove('is-on');
      });
      media.addEventListener('pointermove', function (e) {
        chip.style.left = e.clientX + 'px';
        chip.style.top = e.clientY + 'px';
      });
    });
  }
})();
