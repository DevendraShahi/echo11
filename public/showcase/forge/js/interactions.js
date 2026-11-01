/* FORGE — interactions.js : floating program preview (§07) + coach swap (§13) */
(function () {
  var F = window.FORGE || {};

  /* ---------------- program preview follows the cursor (desktop) ------------- */
  var preview = document.querySelector('[data-preview]');
  var prowWrap = document.querySelector('[data-programs]');

  if (preview && prowWrap && F.fine && F.desktop && !F.reduce) {
    var imgs = preview.querySelectorAll('img');
    var px = 0, py = 0, tx = 0, ty = 0;
    var running = false;
    var active = false;

    var loop = function () {
      px += (tx - px) * 0.14;
      py += (ty - py) * 0.14;
      preview.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
      if (active || Math.abs(tx - px) > 0.5) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    var moveTo = function (e) {
      var w = preview.offsetWidth || 380;
      var h = preview.offsetHeight || 475;
      tx = Math.min(Math.max(e.clientX + 36, 16), window.innerWidth - w - 16);
      ty = Math.min(Math.max(e.clientY - h * 0.5, 16), window.innerHeight - h - 16);
      if (!running) { running = true; requestAnimationFrame(loop); }
    };

    prowWrap.addEventListener('mousemove', moveTo, { passive: true });

    prowWrap.querySelectorAll('[data-preview-target]').forEach(function (row) {
      var key = row.getAttribute('data-preview-target');
      row.addEventListener('mouseenter', function (e) {
        active = true;
        moveTo(e);
        px = tx; py = ty;
        preview.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
        imgs.forEach(function (img) {
          img.classList.toggle('is-active', img.getAttribute('data-key') === key);
        });
        preview.classList.add('is-on');
      });
      row.addEventListener('mouseleave', function () {
        active = false;
        preview.classList.remove('is-on');
      });
    });
  }

  /* ---------------- coach switching — opposite-axis move (§13) --------------- */
  var stage = document.querySelector('[data-coach-stage]');
  if (stage) {
    var slides = Array.prototype.slice.call(stage.querySelectorAll('img'));
    var nameEl = document.querySelector('[data-coach-name]');
    var discEl = document.querySelector('[data-coach-disc]');
    var tagEl = document.querySelector('[data-coach-tag]');
    var nowEl = document.querySelector('[data-coach-now]');
    var prevBtn = document.querySelector('[data-coach-prev]');
    var nextBtn = document.querySelector('[data-coach-next]');
    var index = 0;
    var busy = false;

    var pad = function (n) { return (n + 1 < 10 ? '0' : '') + (n + 1); };

    var paint = function (i) {
      var img = slides[i];
      if (nameEl) nameEl.textContent = img.getAttribute('data-name') || '';
      if (discEl) discEl.textContent = img.getAttribute('data-disc') || '';
      if (tagEl) tagEl.textContent = img.getAttribute('data-tag') || '';
      if (nowEl) nowEl.textContent = pad(i);
    };

    var go = function (next, dir) {
      if (busy || next === index || !slides[next]) return;
      busy = true;
      var cur = slides[index];
      var inc = slides[next];

      /* next: out to the left, in from the right — prev: the mirror (§13) */
      cur.classList.remove('is-active', 'enter-left');
      cur.classList.add(dir > 0 ? 'exit-left' : 'exit-right');

      inc.classList.remove('exit-left', 'exit-right', 'is-active', 'enter-left');
      if (dir < 0) inc.classList.add('enter-left');

      // force reflow, then bring the incoming slide in from the opposite axis
      void inc.offsetWidth;
      inc.classList.remove('enter-left');
      inc.classList.add('is-active');

      paint(next);
      index = next;

      window.setTimeout(function () {
        cur.classList.remove('exit-left', 'exit-right');
        busy = false;
      }, 600);
    };

    if (nextBtn) nextBtn.addEventListener('click', function () {
      go((index + 1) % slides.length, 1);
    });
    if (prevBtn) prevBtn.addEventListener('click', function () {
      go((index - 1 + slides.length) % slides.length, -1);
    });

    paint(0);
  }
})();
