// Adresse du serveur d'inscription Lago (cloud/LISEZMOI.md)
var LAGO_CLOUD = '';
// Adresse qui reçoit les demandes de démo : la renseigner ici active le formulaire.
var LAGO_CONTACT_EMAIL = 'lago.software.contact@gmail.com';
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a.zoom');
  if (!a || !window.HTMLDialogElement || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  var img = a.querySelector('img');
  var d = document.createElement('dialog');
  d.className = 'lb';
  d.setAttribute('aria-label', img ? img.alt : 'Schermata ingrandita');
  d.innerHTML = '<button type="button" aria-label="Fermer">×</button><img alt=""><p></p>';
  d.querySelector('img').src = a.getAttribute('href');
  d.querySelector('img').alt = img ? img.alt : '';
  d.querySelector('p').textContent = (img ? img.alt + ' · ' : '') + 'Schermata reale, dati dimostrativi';
  d.addEventListener('click', function (ev) { if (ev.target === d || ev.target.tagName === 'BUTTON' || ev.target.tagName === 'IMG') d.close(); });
  d.addEventListener('close', function () { d.remove(); a.focus(); });
  document.body.appendChild(d);
  d.showModal();
});
document.addEventListener('submit', function (e) {
  var f = e.target;
  if (!f.matches('form[data-demo]')) return;
  e.preventDefault();
  var g = function (n) { var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var out = f.querySelector('.msg');
  var say = function (t, ok) { out.textContent = t; out.style.color = ok ? '#166534' : '#9A3412'; };
  if (!g('nom') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('email'))) { say('Indica il tuo nome e un indirizzo e-mail valido.'); return; }
  if (!LAGO_CONTACT_EMAIL) { say('Le richieste online apriranno molto presto. Grazie per l’interesse!'); return; }
  var body = 'Nome: ' + g('nom') + '\nAttività: ' + (g('etablissement') || '-') + '\nE-mail: ' + g('email') +
    '\nTelefono: ' + (g('telephone') || '-') + '\nSettore: ' + g('activite') + '\n\n' + g('message');
  location.href = 'mailto:' + LAGO_CONTACT_EMAIL + '?subject=' + encodeURIComponent('Richiesta di demo Lago') + '&body=' + encodeURIComponent(body);
  say('Il tuo programma di posta si apre con la richiesta già compilata: non resta che inviarla.', true);
});

/* page Télécharger : création immédiate d'un espace Lago prêt à l'emploi */
document.addEventListener('submit', function (e) {
  var f = e.target;
  if (!f.matches || !f.matches('form[data-signup]')) return;
  e.preventDefault();
  var g = function (n) { var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var out = f.querySelector('.msg'), btn = f.querySelector('button[type=submit]');
  var say = function (t, ok) { out.textContent = t; out.style.color = ok ? '#166534' : '#9A3412'; };
  if (!g('nom') || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g('email'))) { say(f.dataset.err); return; }
  var mail = function () {
    if (!LAGO_CONTACT_EMAIL) return;
    var body = 'Nom : ' + g('nom') + '\nE-mail : ' + g('email') + '\nActivité : ' + g('tpl');
    location.href = 'mailto:' + LAGO_CONTACT_EMAIL + '?subject=' + encodeURIComponent(f.dataset.subject) + '&body=' + encodeURIComponent(body);
  };
  if (!LAGO_CLOUD) { say(f.dataset.fallback + '…', true); mail(); return; }
  var t0 = btn.textContent; btn.disabled = true; btn.textContent = f.dataset.busy; say('');
  fetch(LAGO_CLOUD.replace(/\/+$/, '') + '/v1/signup', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: g('nom'), tpl: g('tpl'), email: g('email'), hp: g('hp'), ts: Date.now() }) })
    .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
    .then(function (x) {
      if (!x.ok || !x.j || !/^https:\/\/lago-software\.github\.io\//.test(x.j.link || '')) throw new Error((x.j && x.j.error) || '');
      var ok = f.querySelector('.ok');
      Array.prototype.forEach.call(f.children, function (c) { if (c !== ok) c.style.display = 'none'; });
      ok.hidden = false; ok.setAttribute('tabindex', '-1');
      var a = ok.querySelector('[data-open]'); a.href = x.j.link;
      var cp = ok.querySelector('[data-copy]'), label = cp.textContent;
      cp.addEventListener('click', function () {
        var done = function () { cp.textContent = f.dataset.copied; setTimeout(function () { cp.textContent = label; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(x.j.link).then(done, function () {}); 
      });
      ok.focus();
    })
    .catch(function (er) {
      btn.disabled = false; btn.textContent = t0;
      say(f.dataset.fail + (er && er.message ? ' (' + er.message + ')' : '') + '. ');
      var a = document.createElement('a'); a.href = '#'; a.textContent = f.dataset.fallback;
      a.addEventListener('click', function (ev) { ev.preventDefault(); mail(); }); out.appendChild(a);
    });
});

/* accueil : accès rapide à la caisse de démonstration */
(function () {
  var t = document.getElementById('caisse-demo'), q = document.getElementById('qa');
  if (!t) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-try]');
    if (!a) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: window.innerWidth < 761 ? 'start' : 'center' });
    t.classList.remove('pulse'); void t.offsetWidth; t.classList.add('pulse');
    setTimeout(function () { t.classList.remove('pulse'); }, 1300);
  });
  if (!q || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (en) {
    var r = en[0], gone = !r.isIntersecting && r.boundingClientRect.bottom < 0;
    q.classList.toggle('on', gone); document.body.classList.toggle('qa-on', gone);
    q.setAttribute('aria-hidden', gone ? 'false' : 'true'); q.tabIndex = gone ? 0 : -1;
  }, { threshold: 0 }).observe(t);
})();

/* barre « Télécharger gratuitement » collée en bas sur mobile */
(function () {
  if (/telecharger\.html$/.test(location.pathname)) return;
  var L = { fr: ['Télécharger gratuitement', '/telecharger.html'], en: ['Download for free', '/en/telecharger.html'], es: ['Descargar gratis', '/es/telecharger.html'], de: ['Kostenlos herunterladen', '/de/telecharger.html'], it: ['Scarica gratis', '/it/telecharger.html'] };
  var l = (document.documentElement.lang || 'fr').slice(0, 2), t = L[l] || L.fr;
  var d = document.createElement('div'); d.className = 'stickydl';
  d.innerHTML = '<a class="btn btn-grad" href="' + t[1] + '">' + t[0] + ' →</a>';
  document.body.appendChild(d);
  var tick = false;
  addEventListener('scroll', function () {
    if (tick) return; tick = true;
    requestAnimationFrame(function () { d.classList.toggle('on', scrollY > 420); tick = false; });
  }, { passive: true });
})();
