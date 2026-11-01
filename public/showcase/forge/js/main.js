/* FORGE — main.js : boot, environment flags, nav, fullscreen menu */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var desktop = window.matchMedia('(min-width: 1024px)').matches;

  window.FORGE = { reduce: reduce, fine: fine, desktop: desktop };

  if (fine && !reduce) root.classList.add('has-cursor');

  /* ---- nav: transparent → translucent after ~1 viewport (§16) ---- */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- fullscreen menu ---- */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');

  function setMenu(open, restoreFocus) {
    if (!menu) return;
    var wasOpen = menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = menu.querySelector('.menu__row');
      if (first) first.focus({ preventScroll: true });
    } else if (wasOpen && restoreFocus && openBtn) {
      openBtn.focus({ preventScroll: true });
    }
  }

  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false, true); });

  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.menu__row')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false, true);
  });

  /* ---- menu rows reveal footage behind the menu (§16) ---- */
  var menuImgs = menu ? menu.querySelectorAll('.menu__media img') : [];
  var rows = menu ? menu.querySelectorAll('.menu__row') : [];
  rows.forEach(function (row) {
    var idx = parseInt(row.getAttribute('data-media') || '-1', 10);
    var apply = function (on) {
      menuImgs.forEach(function (img, i) {
        img.classList.toggle('is-active', on && i === idx);
      });
    };
    row.addEventListener('mouseenter', function () { apply(true); });
    row.addEventListener('focus', function () { apply(true); });
    row.addEventListener('mouseleave', function () { apply(false); });
    row.addEventListener('blur', function () { apply(false); });
  });
})();
