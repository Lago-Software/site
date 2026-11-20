/* Mini-caisse de la page d'accueil : démonstration locale, aucune donnée n'est envoyée. */
(function () {
  var root = document.querySelector('[data-pos]');
  if (!root) return;
  var T = {};
  try { T = JSON.parse(root.getAttribute('data-i18n') || '{}'); } catch (e) {}
  var lines = [], disc = false, auto = true, timers = [], no = 1042, busy = false;
  var list = root.querySelector('.pl'), totalEl = root.querySelector('.pt-total'), pay = root.querySelector('.pay'), ov = root.querySelector('.ppay'), dbtn = root.querySelector('.pdisc');
  var money = function (c) { var v = (c / 100).toFixed(2); return T.loc === 'en' ? '€' + v : v.replace('.', ',') + ' €'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  function sums() {
    var s = 0, n = 0;
    lines.forEach(function (l) { s += l.p * l.q; n += l.q; });
    var d = disc ? Math.round(s * 0.1) : 0;
    return { sub: s, d: d, total: s - d, n: n };
  }
  function render() {
    var t = sums(), h = '';
    lines.forEach(function (l) {
      h += '<li data-k="' + l.k + '"><span class="ln">' + esc(l.n) + '</span><span class="qc"><button type="button" class="qd" aria-label="' + esc(T.dec) + ': ' + esc(l.n) + '">−</button><i>' + l.q + '</i><button type="button" class="qi" aria-label="' + esc(T.inc) + ': ' + esc(l.n) + '">+</button></span><b>' + money(l.p * l.q) + '</b></li>';
    });
    if (disc && lines.length) h += '<li class="dl"><span class="ln">' + esc(T.discl) + '</span><b>−' + money(t.d) + '</b></li>';
    if (!lines.length) h = '<li class="empty">' + esc(T.empty) + '</li>';
    list.innerHTML = h;
    totalEl.textContent = money(t.total);
    pay.textContent = lines.length ? T.pay + ' ' + money(t.total) : T.pay;
    pay.disabled = !lines.length;
    dbtn.setAttribute('aria-pressed', disc ? 'true' : 'false');
    dbtn.classList.toggle('on', disc);
    root.querySelectorAll('.pt').forEach(function (b) {
      var l = lines.filter(function (x) { return x.k === b.dataset.k; })[0];
      var c = b.querySelector('.q'); if (c) { c.textContent = l ? l.q : ''; c.hidden = !l; }
    });
    list.scrollTop = list.scrollHeight;
  }
  function add(k) {
    var b = root.querySelector('.pt[data-k="' + k + '"]'); if (!b) return;
    var l = lines.filter(function (x) { return x.k === k; })[0];
    if (l) l.q++; else lines.push({ k: k, n: b.dataset.n, p: +b.dataset.p, q: 1 });
    render();
  }
  function step(k, dq) {
    var l = lines.filter(function (x) { return x.k === k; })[0]; if (!l) return;
    l.q += dq; if (l.q <= 0) lines = lines.filter(function (x) { return x !== l; });
    render();
  }
  function tab(cat) {
    root.querySelectorAll('.ct').forEach(function (b) { var on = b.dataset.cat === cat; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    root.querySelectorAll('.pg').forEach(function (g) { g.hidden = g.dataset.cat !== cat; });
  }
  function closeOv() { ov.hidden = true; ov.innerHTML = ''; busy = false; root.classList.remove('paying'); }
  function reset() { lines = []; disc = false; closeOv(); tab('park'); render(); }
  /* paiement */
  var pm = 'card', given = 0;
  function options(total) {
    var o = [total], a = Math.ceil(total / 1000) * 1000, b = Math.ceil(total / 5000) * 5000;
    [a, b].forEach(function (x) { if (x > total && o.indexOf(x) < 0) o.push(x); });
    return o.slice(0, 3);
  }
  function drawPay() {
    var t = sums().total, h = '<div class="pay-h"><b>' + esc(T.paytitle) + '</b><span>' + money(t) + '</span></div>';
    h += '<div class="pm" role="group"><button type="button" data-m="card" class="' + (pm === 'card' ? 'on' : '') + '" aria-pressed="' + (pm === 'card') + '">' + esc(T.card) + '</button><button type="button" data-m="cash" class="' + (pm === 'cash' ? 'on' : '') + '" aria-pressed="' + (pm === 'cash') + '">' + esc(T.cash) + '</button></div>';
    if (pm === 'card') {
      h += '<p class="pbody tapc"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/></svg><span>' + esc(T.tap) + '</span></p>';
    } else {
      if (given < t) given = t;
      h += '<div class="pbody"><small>' + esc(T.received) + '</small><div class="gv">';
      options(t).forEach(function (o, i) { h += '<button type="button" data-g="' + o + '" class="' + (given === o ? 'on' : '') + '">' + (i === 0 ? esc(T.exact) : money(o)) + '</button>'; });
      h += '</div><p class="chg"><span>' + esc(T.change) + '</span><b>' + money(given - t) + '</b></p></div>';
    }
    h += '<div class="pa"><button type="button" class="pback">' + esc(T.back) + '</button><button type="button" class="pv">' + esc(T.valid) + '</button></div>';
    ov.innerHTML = h;
  }
  function openPay() {
    if (!lines.length) return;
    pm = 'card'; given = 0; ov.hidden = false; busy = true; root.classList.add('paying'); drawPay();
  }
  function done() {
    var t = sums().total;
    ov.innerHTML = '<div class="done" role="status"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><b>' + esc(T.paid) + '</b><span>' + money(t) + ' · ' + esc(T.no) + ' ' + (no++) + '</span><button type="button" class="pnew">' + esc(T.again) + '</button></div>';
    later(function () { if (!ov.hidden && ov.querySelector('.done')) reset(); }, 4200);
  }
  /* événements */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
    if (!e.isTrusted) return;
    stop();
    if (t.classList.contains('pt')) { if (!busy) add(t.dataset.k); }
    else if (t.classList.contains('ct')) tab(t.dataset.cat);
    else if (t.classList.contains('qi')) step(t.closest('li').dataset.k, 1);
    else if (t.classList.contains('qd')) step(t.closest('li').dataset.k, -1);
    else if (t === dbtn) { if (!busy) { disc = !disc; render(); } }
    else if (t === pay) openPay();
    else if (t.classList.contains('pclr')) reset();
    else if (t.dataset.m) { pm = t.dataset.m; drawPay(); }
    else if (t.dataset.g) { given = +t.dataset.g; drawPay(); }
    else if (t.classList.contains('pback')) closeOv();
    else if (t.classList.contains('pv')) done();
    else if (t.classList.contains('pnew')) reset();
  });
  function stop() { auto = false; timers.forEach(clearTimeout); timers = []; }
  function later(f, ms) { timers.push(setTimeout(f, ms)); }
  /* lecture automatique, interrompue au premier geste */
  function play(first) {
    if (!auto) return;
    var t = 900, go = function (f, d) { later(function () { if (auto) f(); }, t); t += d; };
    if (!first) {
      reset();
      go(function () { add('s1'); }, 1000);
      go(function () { add('ms'); }, 1000);
      go(function () { add('ch'); }, 700);
      go(function () { add('ch'); }, 1000);
    } else t = 1800;
    go(function () { tab('bar'); }, 900);
    go(function () { add('cf'); }, 1000);
    go(function () { disc = true; render(); }, 1100);
    go(function () { openPay(); }, 1300);
    go(function () { pm = 'cash'; drawPay(); }, 1100);
    go(function () { var o = options(sums().total); given = o[1] || o[0]; drawPay(); }, 1300);
    go(function () { done(); }, 4800);
    go(function () { play(false); }, 0);
  }
  ['s1', 'ms', 'ch', 'ch'].forEach(add);
  render();
  if (!window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); play(true); } }, { threshold: .4 });
      io.observe(root);
    } else play(true);
  }
})();
