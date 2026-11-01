/* ==========================================================
   LALTIN — main.js
   Nav states, fullscreen menu, booking validation,
   room + journal dialogs (focus-managed).
   ========================================================== */
(function () {
  'use strict';

  var doc = document;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  function focusables(root) {
    return q(FOCUSABLE, root).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === doc.activeElement;
    });
  }

  /* Tab trap shared by menu + dialogs */
  function trapKeys(root, onEscape) {
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      var f = focusables(root);
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ==========================================================
     NAV — scrolled surface + night state (§32)
     ========================================================== */

  var nav = doc.querySelector('[data-nav]');
  var hero = doc.querySelector('.hero');
  var dusk = doc.querySelector('.dusk');
  var darkSections = q('.laltin-night, .journal, .reserve, .footer');
  var navTicking = false;

  function overDark(rect, h) {
    return rect.top <= h && rect.bottom > h;
  }

  function computeNight() {
    var h = nav.offsetHeight;
    var i;
    for (i = 0; i < darkSections.length; i++) {
      if (overDark(darkSections[i].getBoundingClientRect(), h)) return true;
    }
    if (dusk) {
      var d = dusk.getBoundingClientRect();
      if (overDark(d, h)) {
        var progress = (h - d.top) / d.height;
        return progress >= 0.62;
      }
    }
    return false;
  }

  function navUpdate() {
    navTicking = false;
    var y = window.scrollY || 0;
    var pastHero = hero ? hero.offsetHeight - 90 : 60;
    nav.classList.toggle('is-scrolled', y > Math.max(pastHero, 40));
    nav.classList.toggle('is-night', computeNight());
  }

  window.addEventListener('scroll', function () {
    if (!navTicking) {
      navTicking = true;
      window.requestAnimationFrame(navUpdate);
    }
  }, { passive: true });
  window.addEventListener('resize', navUpdate, { passive: true });
  navUpdate();

  /* ==========================================================
     FULLSCREEN MENU (§33)
     ========================================================== */

  var menu = doc.querySelector('[data-menu]');
  var menuOpenBtn = doc.querySelector('[data-menu-open]');
  var menuCloseBtn = doc.querySelector('[data-menu-close]');
  var menuFocusBack = null;

  function setMenuBg(key) {
    q('.menu__bg-img', menu).forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-menu-bg') === key);
    });
  }

  function openMenu() {
    menuFocusBack = doc.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuOpenBtn.setAttribute('aria-expanded', 'true');
    doc.documentElement.style.overflow = 'hidden';
    setMenuBg('stay');
    menuCloseBtn.focus();
  }

  function closeMenu(restoreFocus) {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuOpenBtn.setAttribute('aria-expanded', 'false');
    doc.documentElement.style.overflow = '';
    if (restoreFocus !== false && menuFocusBack && menuFocusBack.focus) {
      menuFocusBack.focus();
    }
    menuFocusBack = null;
  }

  menuOpenBtn.addEventListener('click', openMenu);
  menuCloseBtn.addEventListener('click', function () { closeMenu(true); });
  trapKeys(menu, function () { closeMenu(true); });

  /* cross-dissolve background on link hover/focus */
  q('[data-menu-img]', menu).forEach(function (el) {
    function activate() { setMenuBg(el.getAttribute('data-menu-img')); }
    el.addEventListener('mouseenter', activate);
    el.addEventListener('focus', activate);
  });

  /* link click: close, then move focus to the destination chapter */
  q('[data-menu-link]', menu).forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu(false);
      var href = link.getAttribute('href');
      if (!href || href.length < 2) return;
      var target = doc.querySelector(href);
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', function once() {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', once);
      });
      target.focus({ preventScroll: true });
    });
  });

  /* ==========================================================
     DIALOG PLUMBING (shared)
     ========================================================== */

  function makeDialog(root, closeSelector) {
    var panel = root.querySelector('.dialog__panel');
    var backTo = null;

    function open() {
      backTo = doc.activeElement;
      root.hidden = false;
      doc.documentElement.style.overflow = 'hidden';
      var f = focusables(panel);
      if (f.length) f[0].focus();
    }

    function close() {
      root.hidden = true;
      doc.documentElement.style.overflow = '';
      if (backTo && backTo.focus) backTo.focus();
      backTo = null;
    }

    q(closeSelector, root).forEach(function (el) {
      el.addEventListener('click', close);
    });
    trapKeys(root, close);

    return { open: open, close: close, root: root };
  }

  /* ==========================================================
     ROOM DIALOG (§20) — facts provisional, marked in markup
     ========================================================== */

  var ROOMS = {
    cottage: {
      index: '01 / 04',
      name: 'Forest Cottage',
      desc: 'A single room at the treeline, with its own terrace and the forest close enough to hear.',
      facts: ['2 guests', 'King bed', 'Private terrace'],
      amenities: ['Cottage', 'Terrace', 'Forest side'],
      img: 'assets/img/room-cottage.webp',
      crop: '64% 30%'
    },
    valley: {
      index: '02 / 04',
      name: 'Valley House',
      desc: 'Two rooms under one roof, opening toward the valley and the long view west.',
      facts: ['4 guests', 'Two rooms', 'Valley view'],
      amenities: ['Two rooms', 'Valley view', 'House'],
      img: 'assets/img/room-valley.webp',
      crop: '38% 52%'
    },
    suite: {
      index: '03 / 04',
      name: 'Laltin Suite',
      desc: 'The largest room on the property, with a separate sitting area and a terrace of its own.',
      facts: ['2 guests', 'Separate sitting', 'Terrace'],
      amenities: ['Suite', 'Sitting room', 'Terrace'],
      img: 'assets/img/room-suite.webp',
      crop: '70% 40%'
    },
    family: {
      index: '04 / 04',
      name: 'Family Retreat',
      desc: 'Two bedrooms around a shared lounge, arranged for slow family mornings.',
      facts: ['4–5 guests', 'Two bedrooms', 'Shared lounge'],
      amenities: ['Two bedrooms', 'Shared lounge', 'Family'],
      img: 'assets/img/room-family.webp',
      crop: '34% 44%'
    }
  };

  var roomDialogEl = doc.querySelector('[data-room-dialog]');
  var roomDialog = makeDialog(roomDialogEl, '[data-dialog-close]');

  var rdImg = roomDialogEl.querySelector('[data-room-dialog-img]');
  var rdIndex = roomDialogEl.querySelector('[data-room-dialog-index]');
  var rdTitle = roomDialogEl.querySelector('[data-room-dialog-title]');
  var rdDesc = roomDialogEl.querySelector('[data-room-dialog-desc]');
  var rdPairA = roomDialogEl.querySelector('[data-room-dialog-pair-a]');
  var rdPairB = roomDialogEl.querySelector('[data-room-dialog-pair-b]');
  var rdFacts = roomDialogEl.querySelector('[data-room-dialog-facts]');
  var rdAmenities = roomDialogEl.querySelector('[data-room-dialog-amenities]');

  function fillRoom(key) {
    var r = ROOMS[key];
    if (!r) return false;
    rdImg.src = r.img;
    rdIndex.textContent = r.index;
    rdTitle.textContent = r.name;
    rdDesc.textContent = r.desc;
    rdPairA.src = r.img;
    rdPairB.src = r.img;
    rdPairB.style.objectPosition = r.crop;
    rdFacts.innerHTML = r.facts.map(function (f) { return '<li>' + f + '</li>'; }).join('');
    rdAmenities.innerHTML = r.amenities.map(function (a) { return '<li>' + a + '</li>'; }).join('');
    return true;
  }

  q('[data-room-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (fillRoom(btn.getAttribute('data-room-open'))) roomDialog.open();
    });
  });

  roomDialogEl.querySelector('[data-room-dialog-book]').addEventListener('click', function () {
    roomDialog.close();
    window.setTimeout(function () { window.location.hash = 'reserve'; }, 0);
  });

  /* ==========================================================
     JOURNAL OVERLAY (§56)
     ========================================================== */

  var STORIES = {
    monsoon: { cat: 'Place', title: 'When the monsoon reaches the forest' },
    kitchen: { cat: 'Food', title: 'A morning with our kitchen' },
    path: { cat: 'Walks', title: 'The path beyond Laltin' }
  };

  var storyDialogEl = doc.querySelector('[data-story-dialog]');
  var storyDialog = makeDialog(storyDialogEl, '[data-story-close]');
  var stCat = storyDialogEl.querySelector('[data-story-cat]');
  var stTitle = storyDialogEl.querySelector('[data-story-title]');
  var stOpen = storyDialogEl.querySelector('[data-story-open]');

  q('[data-story]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var s = STORIES[btn.getAttribute('data-story')];
      if (!s) return;
      stCat.textContent = s.cat;
      stTitle.textContent = s.title;
      stOpen.textContent = '[ Opening paragraph — editorial in progress ]';
      storyDialog.open();
    });
  });

  /* ==========================================================
     BOOKING PANEL (§31)
     ========================================================== */

  var form = doc.querySelector('[data-booking]');
  if (form) {
    var arrivalInput = form.querySelector('[data-booking-arrival]');
    var departureInput = form.querySelector('[data-booking-departure]');
    var errorEl = form.querySelector('[data-booking-error]');
    var resultEl = form.querySelector('[data-booking-result]');
    var summaryEl = form.querySelector('[data-booking-summary]');
    var guestsOut = form.querySelector('[data-guests-out]');
    var guests = 2;
    var MAX_GUESTS = 8;

    function isoDate(d) {
      var m = String(d.getMonth() + 1);
      var day = String(d.getDate());
      return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (day.length < 2 ? '0' + day : day);
    }

    function parseISO(value) {
      return new Date(value + 'T00:00:00');
    }

    function nextDay(value) {
      var d = parseISO(value);
      d.setDate(d.getDate() + 1);
      return isoDate(d);
    }

    function label(value) {
      return parseISO(value)
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        .toUpperCase()
        .replace(/\./g, '');
    }

    var today = isoDate(new Date());
    arrivalInput.min = today;
    departureInput.min = nextDay(today);

    arrivalInput.addEventListener('change', function () {
      if (arrivalInput.value) departureInput.min = nextDay(arrivalInput.value);
      errorEl.hidden = true;
    });
    departureInput.addEventListener('change', function () { errorEl.hidden = true; });

    q('[data-guests]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var delta = parseInt(btn.getAttribute('data-guests'), 10);
        guests = Math.min(MAX_GUESTS, Math.max(1, guests + delta));
        guestsOut.textContent = String(guests);
      });
    });

    function showError(message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      resultEl.hidden = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!arrivalInput.value || !departureInput.value) {
        showError('Please choose both arrival and departure dates.');
        return;
      }
      if (arrivalInput.value < today) {
        showError('Arrival cannot be in the past.');
        return;
      }
      if (departureInput.value <= arrivalInput.value) {
        showError('Departure must be after arrival.');
        return;
      }

      errorEl.hidden = true;
      summaryEl.textContent =
        label(arrivalInput.value) + ' → ' + label(departureInput.value) +
        ' · ' + guests + (guests === 1 ? ' guest' : ' guests');
      resultEl.hidden = false;
    });
  }
})();
