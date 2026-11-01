/* FORGE — cursor.js : 8px dot → labeled box (§17). Desktop only. */
(function () {
  if (!document.documentElement.classList.contains('has-cursor')) return;

  var el = document.querySelector('[data-cursor-root]');
  if (!el) return;
  var box = el.querySelector('[data-cursor-label]');
  var dot = el.querySelector('.cursor__dot');

  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var tx = x, ty = y;
  var rot = 0;
  var raf = null;

  function loop() {
    var dx = tx - x, dy = ty - y;
    x += dx * 0.22;
    y += dy * 0.22;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    if (dot) {
      var target = Math.max(-20, Math.min(20, dx * 0.6));
      rot += (target - rot) * 0.15;
      dot.style.setProperty('--cur-rot', rot.toFixed(1) + 'deg');
    }
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    var host = e.target.closest('[data-cursor]');
    if (host) {
      var label = host.getAttribute('data-cursor') || '';
      if (box) box.textContent = label;
      el.classList.toggle('is-label', !!label);
    } else {
      el.classList.remove('is-label');
    }
  });

  document.addEventListener('mouseleave', function () {
    el.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    el.style.opacity = '1';
  });
})();
