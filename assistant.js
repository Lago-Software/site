/* Assistant Lago : petite bulle de discussion qui répond aux questions sur Lago (service : LAGO_CLOUD /v1/assistant). */
(function () {
  if (window.__lagoAssistant || !window.fetch) return;
  window.__lagoAssistant = 1;
  var L = { fr: {
    open: 'Une question ? Demandez à l’assistant', title: 'Assistant Lago', hello: 'Bonjour ! Je réponds à vos questions sur Lago : prix, installation, réservation en ligne, conformité…',
    ph: 'Votre question', send: 'Envoyer', close: 'Fermer', err: 'Désolé, je n’arrive pas à répondre. Écrivez-nous à lago.software.contact@gmail.com.', wait: 'Un instant…',
    note: 'Réponses automatiques : vérifiez les points importants sur le site.', sug: ['Combien ça coûte ?', 'Comment installer Lago ?', 'Lago est-il en règle pour la caisse ?'] },
  en: { open: 'Questions? Ask the assistant', title: 'Lago assistant', hello: 'Hello! I answer questions about Lago: pricing, installation, online booking, compliance…',
    ph: 'Your question', send: 'Send', close: 'Close', err: 'Sorry, I can’t answer right now. Email us at lago.software.contact@gmail.com.', wait: 'One moment…',
    note: 'Automatic answers: please check important points on the site.', sug: ['How much does it cost?', 'How do I install Lago?', 'Is Lago compliant for cash registers in France?'] },
  es: { open: '¿Preguntas? Pregunte al asistente', title: 'Asistente Lago', hello: '¡Hola! Respondo preguntas sobre Lago: precios, instalación, reservas en línea, conformidad…',
    ph: 'Su pregunta', send: 'Enviar', close: 'Cerrar', err: 'Lo siento, no puedo responder ahora. Escríbanos a lago.software.contact@gmail.com.', wait: 'Un momento…',
    note: 'Respuestas automáticas: compruebe los puntos importantes en el sitio.', sug: ['¿Cuánto cuesta?', '¿Cómo se instala Lago?', '¿Es Lago conforme como caja en Francia?'] },
  de: { open: 'Fragen? Fragen Sie den Assistenten', title: 'Lago-Assistent', hello: 'Hallo! Ich beantworte Fragen zu Lago: Preise, Installation, Online-Buchung, Konformität…',
    ph: 'Ihre Frage', send: 'Senden', close: 'Schließen', err: 'Leider kann ich gerade nicht antworten. Schreiben Sie uns an lago.software.contact@gmail.com.', wait: 'Einen Moment…',
    note: 'Automatische Antworten: bitte wichtige Punkte auf der Website prüfen.', sug: ['Was kostet es?', 'Wie installiere ich Lago?', 'Ist Lago als Kasse in Frankreich konform?'] },
  it: { open: 'Domande? Chieda all’assistente', title: 'Assistente Lago', hello: 'Buongiorno! Rispondo alle domande su Lago: prezzi, installazione, prenotazione online, conformità…',
    ph: 'La sua domanda', send: 'Invia', close: 'Chiudi', err: 'Spiacenti, non riesco a rispondere ora. Scriveteci a lago.software.contact@gmail.com.', wait: 'Un momento…',
    note: 'Risposte automatiche: verificate i punti importanti sul sito.', sug: ['Quanto costa?', 'Come si installa Lago?', 'Lago è conforme come cassa in Francia?'] } };
  var lang = (document.documentElement.lang || 'fr').slice(0, 2); if (!L[lang]) lang = 'fr';
  var T = L[lang], API = (typeof LAGO_CLOUD === 'string' && LAGO_CLOUD ? LAGO_CLOUD : 'https://lago-cloud.leherice-h.workers.dev').replace(/\/+$/, '') + '/v1/assistant';
  var css = '.lga-btn{position:fixed;right:16px;bottom:16px;z-index:80;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 16px;background:#0A1F4D;color:#fff;font:600 15px/1 inherit;font-family:inherit;box-shadow:0 10px 30px -8px rgba(10,31,77,.55);cursor:pointer}' +
    '.lga-btn:hover{background:#16335F}.lga-btn:focus-visible,.lga-x:focus-visible,.lga-s:focus-visible,.lga-chip:focus-visible{outline:3px solid #F76300;outline-offset:2px}' +
    '.lga-p{position:fixed;right:16px;bottom:16px;z-index:81;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 32px));display:none;flex-direction:column;background:#fff;color:#0A1F4D;border:1px solid #E2E8F2;border-radius:18px;box-shadow:0 30px 70px -20px rgba(10,31,77,.5);overflow:hidden;font-family:inherit}' +
    '.lga-p.on{display:flex}.lga-h{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#0A1F4D;color:#fff;font-weight:700;font-size:16px}' +
    '.lga-x{border:0;background:transparent;color:#fff;font-size:26px;line-height:1;cursor:pointer;padding:0 4px}' +
    '.lga-m{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#F4F7FC}' +
    '.lga-b{max-width:88%;padding:10px 12px;border-radius:14px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.lga-b.a{background:#fff;border:1px solid #E2E8F2;align-self:flex-start}.lga-b.u{background:#206EA8;color:#fff;align-self:flex-end}.lga-b a{color:#206EA8;font-weight:600}.lga-b.u a{color:#fff}' +
    '.lga-sug{display:flex;flex-wrap:wrap;gap:6px}.lga-chip{border:1px solid #206EA8;background:#fff;color:#206EA8;border-radius:999px;padding:6px 10px;font:600 13px/1.2 inherit;font-family:inherit;cursor:pointer}' +
    '.lga-f{display:flex;gap:8px;padding:10px;border-top:1px solid #E2E8F2;background:#fff}.lga-f input{flex:1;min-width:0;border:1.5px solid #CBD5E6;border-radius:10px;padding:10px 12px;font:16px inherit;font-family:inherit;color:#0A1F4D}' +
    '.lga-s{border:0;border-radius:10px;padding:0 14px;background:#F76300;color:#fff;font:700 15px inherit;font-family:inherit;cursor:pointer}.lga-s:disabled{opacity:.55;cursor:default}' +
    '.lga-n{padding:0 12px 10px;background:#fff;color:#42526E;font-size:12px}@media print{.lga-btn,.lga-p{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var btn = el('button', 'lga-btn'); btn.type = 'button'; btn.setAttribute('aria-label', T.open); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/></svg>';
  btn.appendChild(el('span', '', T.title));
  var p = el('div', 'lga-p'); p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', T.title);
  var h = el('div', 'lga-h'); h.appendChild(el('span', '', T.title)); var x = el('button', 'lga-x', '×'); x.type = 'button'; x.setAttribute('aria-label', T.close); h.appendChild(x);
  var m = el('div', 'lga-m'); m.setAttribute('aria-live', 'polite');
  var f = el('form', 'lga-f'); var i = el('input'); i.type = 'text'; i.maxLength = 400; i.placeholder = T.ph; i.setAttribute('aria-label', T.ph); i.autocomplete = 'off';
  var s = el('button', 'lga-s', T.send); s.type = 'submit'; f.appendChild(i); f.appendChild(s);
  p.appendChild(h); p.appendChild(m); p.appendChild(f); p.appendChild(el('div', 'lga-n', T.note));
  document.body.appendChild(btn); document.body.appendChild(p);
  var hist = [], busy = false, started = false;
  function linkify(node, text) {
    var re = /(https:\/\/lago-caisse\.fr[^\s)<>"']*[^\s).,;:!?<>"'])|([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi, last = 0, r;
    while ((r = re.exec(text))) {
      node.appendChild(document.createTextNode(text.slice(last, r.index)));
      var a = el('a', '', r[0]); a.href = r[1] ? r[0] : 'mailto:' + r[0]; if (r[1]) a.rel = 'noopener'; node.appendChild(a); last = r.index + r[0].length;
    }
    node.appendChild(document.createTextNode(text.slice(last)));
  }
  function say(role, text) { var b = el('div', 'lga-b ' + (role === 'user' ? 'u' : 'a')); linkify(b, text); m.appendChild(b); m.scrollTop = m.scrollHeight; return b; }
  function ask(q) {
    q = String(q || '').trim(); if (!q || busy) return; busy = true; s.disabled = true;
    var sg = m.querySelector('.lga-sug'); if (sg) sg.remove();
    say('user', q); hist.push({ role: 'user', content: q }); i.value = '';
    var w = say('assistant', T.wait);
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: lang, messages: hist.slice(-6) }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.answer) throw new Error(j && j.error || 'x'); return j.answer; }); })
      .then(function (a) { w.textContent = ''; linkify(w, a); hist.push({ role: 'assistant', content: a }); })
      .catch(function (e) { w.textContent = ''; linkify(w, (e && e.message && e.message !== 'x' && e.message.length < 200 && !/^(Failed|Load|NetworkError|TypeError)/.test(e.message)) ? e.message : T.err); hist.pop(); })
      .then(function () { busy = false; s.disabled = false; m.scrollTop = m.scrollHeight; i.focus(); });
  }
  function openP() {
    p.classList.add('on'); btn.style.display = 'none'; btn.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; say('assistant', T.hello); var sg = el('div', 'lga-sug'); T.sug.forEach(function (q) { var c = el('button', 'lga-chip', q); c.type = 'button'; c.onclick = function () { ask(q); }; sg.appendChild(c); }); m.appendChild(sg); }
    i.focus();
  }
  function closeP() { p.classList.remove('on'); btn.style.display = ''; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.onclick = openP; x.onclick = closeP;
  p.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeP(); });
  f.addEventListener('submit', function (e) { e.preventDefault(); ask(i.value); });
})();
