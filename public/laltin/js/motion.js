/* ==========================================================
   LALTIN — motion.js (GSAP + ScrollTrigger)
   All initial states are CSS-gated on html.anim; this file
   only animates TO the final state. Sets data-motion-ready
   last — the head 3s failsafe strips .anim otherwise.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;          /* reduced motion */
  if (!window.gsap || !window.ScrollTrigger) return;     /* CDN failed → failsafe */

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function inDialog(el) {
    return !!(el.closest && (el.closest('[data-room-dialog]') || el.closest('[data-story-dialog]')));
  }

  function visible(list) {
    return list.filter(function (el) { return !inDialog(el); });
  }

  /* ---------- hero arrival (§14 sequence) ---------- */

  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  var heroImg = q('[data-hero-img]')[0];
  if (heroImg) heroTl.from(heroImg, { scale: 1.14, duration: 1.9, ease: 'power2.out' }, 0);

  var heroSpans = visible(q('.hero .line-mask > span'));
  if (heroSpans.length) {
    heroTl.to(heroSpans, { y: '0%', duration: .85, stagger: .09 }, .15);
  }
  heroTl
    .from('[data-hero-descriptor]', { autoAlpha: 0, y: 12, duration: .7 }, .55)
    .from('[data-hero-cue]', { autoAlpha: 0, duration: .6 }, .85);

  /* ---------- line reveals (§39): grouped per heading, stagger .09 ---------- */

  var parents = [];
  visible(q('.line-mask')).forEach(function (mask) {
    var p = mask.parentElement;
    if (p && p !== document.body && parents.indexOf(p) === -1) parents.push(p);
  });

  parents.forEach(function (p) {
    if (p.closest && p.closest('.hero')) return; /* handled by hero timeline */
    var spans = q('.line-mask > span', p).filter(function (s) {
      return s.parentElement.parentElement === p && !inDialog(s);
    });
    if (!spans.length) return;
    gsap.to(spans, {
      y: '0%',
      duration: .8,
      ease: 'power3.out',
      stagger: .09,
      scrollTrigger: { trigger: p, start: 'top 86%', once: true }
    });
  });

  /* ---------- label reveals: opacity + tracking ---------- */

  visible(q('.lbl-reveal')).forEach(function (el) {
    gsap.to(el, {
      autoAlpha: 1,
      letterSpacing: '.08em',
      duration: .7,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  /* ---------- generic fade-ups ---------- */

  visible(q('[data-reveal]')).forEach(function (el) {
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: .75,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ---------- window reveals (§17): image settles out of the mask ---------- */

  visible(q('.win')).forEach(function (frame) {
    var img = frame.querySelector(':scope > img');
    if (!img) return;
    img.style.transition = 'none'; /* CSS hover transition would lag the tween */
    gsap.to(img, {
      scale: 1,
      y: 0,
      duration: 1.3,
      ease: 'power3.out',
      onComplete: function () { img.style.transition = ''; },
      scrollTrigger: { trigger: frame, start: 'top 85%', once: true }
    });
  });

  /* ---------- gentle parallax on flagged media (±3%) ---------- */

  visible(q('[data-parallax]')).forEach(function (frame) {
    var img = frame.querySelector('img');
    if (!img) return;
    gsap.fromTo(img,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: 'none',
        immediateRender: true,
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
      });
  });

  /* ---------- lantern sequence (§29) ---------- */

  visible(q('[data-lantern]')).forEach(function (el) {
    gsap.from(el, {
      autoAlpha: 0,
      scale: .94,
      duration: 1.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
  });

  /* ---------- dusk: body-background scrub (§28) ----------
     Day→dusk progression paper → linen → earth → forest → ink.
     Reads token hex values — no raw hex lives in JS. Normal scroll,
     no pinning. Also carries the dusk eyebrow from muted to linen. */

  function parseColor(value) {
    if (!value) return null;
    value = value.trim();
    if (value.charAt(0) === '#') {
      var hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
      }
      if (hex.length !== 6) return null;
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ];
    }
    var m = value.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/);
    if (m) return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    return null;
  }

  function mix(a, b, t) {
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  /* piecewise mix across n stops at progress t (0..1) */
  function mixStops(stops, t) {
    if (stops.length < 2) return stops[0];
    var scaled = t * (stops.length - 1);
    var i = Math.min(Math.floor(scaled), stops.length - 2);
    return mix(stops[i], stops[i + 1], scaled - i);
  }

  var duskEl = q('.dusk')[0];
  var css = window.getComputedStyle(root);

  if (duskEl) {
    var stops = [
      parseColor(css.getPropertyValue('--laltin-paper')),   /* #F6F3EB day */
      parseColor(css.getPropertyValue('--laltin-linen')),   /* #DDD7C9 */
      parseColor(css.getPropertyValue('--laltin-earth')),   /* #8A6B50 */
      parseColor(css.getPropertyValue('--laltin-forest')),  /* #293329 */
      parseColor(css.getPropertyValue('--laltin-ink'))      /* #171814 night */
    ].filter(Boolean);

    if (stops.length >= 2) {
      var muted = parseColor(css.getPropertyValue('--laltin-muted-text')) || stops[0];
      var linen = parseColor(css.getPropertyValue('--laltin-linen')) || stops[stops.length - 1];
      var eyebrow = duskEl.querySelector('.dusk__head .eyebrow');
      var proxy = { t: 0 };

      gsap.to(proxy, {
        t: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: duskEl,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: .5
        },
        onUpdate: function () {
          document.body.style.backgroundColor = mixStops(stops, proxy.t);
          if (eyebrow) eyebrow.style.color = mix(muted, linen, proxy.t);
        }
      });
    }
  }

  /* signal ready LAST — head failsafe releases .anim if we never get here */
  root.setAttribute('data-motion-ready', '');
  window.ScrollTrigger.refresh();
})();
