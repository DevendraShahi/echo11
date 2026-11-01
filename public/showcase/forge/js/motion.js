/* FORGE — motion.js : masked reveals, hero, forging scrub, facility strip (§18–§20)
   Motion has weight. No floaty startup animation. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('anim')) return;

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('anim'); // CDN unavailable → show everything
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- splitting utilities (§19) --------------------------------- */
  document.querySelectorAll('[data-split="words"]').forEach(function (el) {
    var words = (el.textContent || '').trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="word-mask"><span>' + w + '</span></span>';
    }).join(' ');
  });

  document.querySelectorAll('[data-split="chars"]').forEach(function (el) {
    var text = (el.textContent || '').trim();
    el.innerHTML = text.split('').map(function (c) {
      return '<span class="word-mask"><span>' + (c === ' ' ? '&nbsp;' : c) + '</span></span>';
    }).join('');
  });

  var EASE = 'power4.out';           /* ≈ easeOut [.16, 1, .3, 1] */
  var MECH = 'power3.inOut';         /* ≈ mechanical [.76, 0, .24, 1] */

  /* ---------- generic level-1 reveals (§20) ----------------------------- */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- masked line/word reveals (§19) ---------------------------- */
  gsap.utils.toArray('[data-mask-reveal]').forEach(function (group) {
    var targets = group.querySelectorAll('.mask > *, .word-mask > *');
    if (!targets.length) return;
    gsap.to(targets, {
      y: 0,
      duration: 0.8,
      ease: EASE,
      stagger: 0.075,               /* line stagger 60–90ms */
      scrollTrigger: { trigger: group, start: 'top 82%', once: true }
    });
  });

  /* ---------- 00 entry: reveals handled by the generic triggers above ----
     Hero meta/bottom carry data-reveal; the title carries data-mask-reveal,
     so entry choreography fires on load without a separate timeline. ------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    /* the plate zooms out from its resting crop as the hero leaves —
       scale, not translate, so no edge can ever open a gap */
    gsap.fromTo('.hero__media img', { scale: 1.14 }, {
      scale: 1.03,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });

    /* the stack lifts away as the hero exits — shear, not spread,
       so the lines can never drift into the CTA row below */
    gsap.to('.hero__title .mask:nth-child(1)', {
      y: -44,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__title .mask:nth-child(3)', {
      y: -14,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- 01 manifesto: rule draws in ------------------------------ */
  var rule = document.querySelector('.manifesto__rule');
  if (rule) {
    gsap.fromTo(rule, { scaleX: 0 }, {
      scaleX: 1,
      duration: 1.1,
      ease: MECH,
      scrollTrigger: { trigger: rule, start: 'top 85%', once: true }
    });
  }

  /* ---------- desktop cinematic levels: forging + facility (§20, §21) --- */
  var mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', function () {
    /* 02 forging sequence — scrubbed transformation ---------------------- */
    var forging = document.querySelector('.forging');
    var layers = gsap.utils.toArray('.forge-layer');
    var stages = gsap.utils.toArray('.stage');
    var end = document.querySelector('.forging__end');
    var bar = document.querySelector('.forging__progress i');
    var frame = document.querySelector('.forging__frame');

    if (forging && layers.length === 4) {
      gsap.set(layers.slice(1), { opacity: 0 });

      var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

      /* RAW → LOAD */
      tl.to(layers[0], { opacity: 0, duration: 0.55 }, 0.75)
        .to(layers[1], { opacity: 1, duration: 0.55 }, 0.75)
        .fromTo(layers[1], { scale: 1.12 }, { scale: 1, duration: 1.6 }, 0.7)
        /* LOAD → PRESSURE */
        .to(layers[1], { opacity: 0, duration: 0.45 }, 1.9)
        .to(layers[2], { opacity: 1, duration: 0.45 }, 1.9)
        .fromTo(layers[2], { scale: 1.08 }, { scale: 1, duration: 1.4 }, 1.85)
        /* PRESSURE → FORM */
        .to(layers[2], { opacity: 0, duration: 0.55 }, 2.7)
        .to(layers[3], { opacity: 1, duration: 0.55 }, 2.7)
        .fromTo(layers[3], { scale: 1.06 }, { scale: 1, duration: 1.2 }, 2.7)
        /* reveal */
        .to(end, { opacity: 1, duration: 0.5 }, 3.35)
        .fromTo(end.querySelector('.h2'),
          { y: 40 }, { y: 0, duration: 0.6, ease: EASE }, 3.4);

      window.ScrollTrigger.create({
        trigger: forging,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          tl.progress(self.progress);
          if (bar) gsap.set(bar, { scaleX: self.progress });
          var stageIdx = Math.min(3, Math.floor(self.progress * 4));
          stages.forEach(function (s, i) { s.classList.toggle('is-on', i === stageIdx); });
        }
      });
    }

    /* 05 facility film strip — pinned horizontal scrub ------------------- */
    var track = document.querySelector('.facility__track');
    if (track) {
      gsap.to(track, {
        x: function () {
          return -(track.scrollWidth - window.innerWidth + 64);
        },
        ease: 'none',
        scrollTrigger: {
          trigger: '.facility',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }

    return function () {
      /* matchMedia cleanup handled by gsap */
    };
  });

  /* ---------- keep positions honest after images load ------------------- */
  window.addEventListener('load', function () {
    window.ScrollTrigger.refresh();
  });

  /* only reached on a fully successful init — the head timeout uses this
     to un-hide content if this file or the GSAP CDN never runs */
  root.setAttribute('data-motion-ready', '');
})();
