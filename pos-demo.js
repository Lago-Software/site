/* Mini-caisse de la page d'accueil : démonstration, aucune donnée envoyée. */
(function () {
  var root = document.querySelector('[data-pos]');
  if (!root) return;
  var lines = [], auto = true, timers = [];
  var list = root.querySelector('.pl'), totalEl = root.querySelector('.pt-total'), pay = root.querySelector('.pay'), ok = root.querySelector('.pok');
  var loc = root.getAttribute('data-loc') || 'fr', empty = root.getAttribute('data-empty'), payTxt = root.getAttribute('data-pay'), paidTxt = root.getAttribute('data-paid');
  var fmt = function (c) { var v = (c / 100).toFixed(2); return loc === 'en' ? '€' + v : v.replace('.', ',') + ' €'; };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  function render() {
    var t = 0, h = '';
    lines.forEach(function (l) { t += l.p * l.q; h += '<li><span>' + esc(l.n) + (l.q > 1 ? ' <em>× ' + l.q + '</em>' : '') + '</span><b>' + fmt(l.p * l.q) + '</b></li>'; });
    if (!lines.length) h = '<li class="empty">' + esc(empty) + '</li>';
    list.innerHTML = h; totalEl.textContent = fmt(t);
    pay.textContent = lines.length ? payTxt + ' ' + fmt(t) : payTxt;
    pay.disabled = !lines.length;
    root.querySelectorAll('.pt').forEach(function (b) {
      var l = lines.filter(function (x) { return x.k === b.dataset.k; })[0];
      var c = b.querySelector('.q'); if (c) { c.textContent = l ? l.q : ''; c.hidden = !l; }
    });
  }
  function tile(k) { return root.querySelector('.pt[data-k="' + k + '"]'); }
  function add(k) {
    var b = tile(k); if (!b) return;
    var l = lines.filter(function (x) { return x.k === k; })[0];
    if (l) l.q++; else lines.push({ k: k, n: b.dataset.n, p: +b.dataset.p, q: 1 });
    render();
  }
  function reset() { lines = []; ok.hidden = true; root.classList.remove('paid'); render(); }
  function stop() { auto = false; timers.forEach(clearTimeout); timers = []; }
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  function validate() {
    if (!lines.length) return;
    var t = lines.reduce(function (a, l) { return a + l.p * l.q; }, 0);
    ok.querySelector('b').textContent = paidTxt + ' · ' + fmt(t);
    ok.hidden = false; root.classList.add('paid');
    later(reset, 2600);
  }
  root.querySelectorAll('.pt').forEach(function (b) {
    b.addEventListener('click', function () { stop(); if (root.classList.contains('paid')) return; add(b.dataset.k); });
  });
  pay.addEventListener('click', function () { stop(); validate(); });
  root.querySelector('.pclr').addEventListener('click', function () { stop(); reset(); });
  var seq = ['s1', 'ms', 'ch', 'ch', 'gb'];
  function play() {
    if (!auto) return;
    reset();
    var t = 900;
    seq.forEach(function (k) { later(function () { if (auto) add(k); }, t); t += 1100; });
    later(function () { if (auto) root.classList.add('hint'); }, t);
    later(function () { if (auto) { root.classList.remove('hint'); validate(); } }, t + 1100);
    later(function () { if (auto) play(); }, t + 4200);
  }
  render();
  if (!window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); play(); } }, { threshold: .4 });
      io.observe(root);
    } else play();
  }
})();
