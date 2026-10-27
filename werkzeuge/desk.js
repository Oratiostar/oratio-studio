// Oratio Desk: anpassbare Widgets (Uhr, Notizen, Aufgaben, Pomodoro, Kalender, Rechner, Gewohnheiten, Countdown, Links).
// Alles bleibt in deinem Browser (localStorage). Es wird nichts gesendet. Sicherung als Datei möglich.
(function(){
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FR = () => WZ.lang === "fr";
const T = (de, fr) => FR() ? fr : de;
const loc = () => FR() ? "fr-FR" : "de-DE";
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const KEY = "oratio_desk_v1";
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const heute = () => ymd(new Date());
const uid = () => Math.random().toString(36).slice(2, 9);
function piep(){ try { const A = new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < 3; i++) { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = 880; o.connect(g); g.connect(A.destination); g.gain.setValueAtTime(.25, A.currentTime + i * .35); g.gain.setValueAtTime(0, A.currentTime + i * .35 + .18); o.start(A.currentTime + i * .35); o.stop(A.currentTime + i * .35 + .22); } } catch(e){} try { navigator.vibrate && navigator.vibrate([250, 120, 250]); } catch(e){} }

/* ---------- Speicher ---------- */
const BG = [["himmel", T("Himmel", "Ciel"), "linear-gradient(135deg,#2e86ff,#19c9b8)"], ["royal", T("Königsblau", "Bleu roi"), "linear-gradient(135deg,#1b4fd8,#5aa0ff 70%,#9fd0ff)"], ["abend", T("Abendrot", "Crépuscule"), "linear-gradient(135deg,#ff7ac8,#ff8c1a)"], ["wald", T("Wald", "Forêt"), "linear-gradient(135deg,#145c35,#7fcf8f)"], ["nacht", T("Nacht", "Nuit"), "linear-gradient(135deg,#0e1430,#3b2a73)"], ["grafit", T("Grafit", "Graphite"), "linear-gradient(135deg,#262a33,#566074)"]];
let S = null, edit = false, ticks = [];
const RT = {}; // Laufzeitdaten (z. B. Pomodoro), überleben das Neuzeichnen
let speicherOk = true;
function standard(){ return { v: 1, bg: "royal", w: [{ id: uid(), t: "uhr", s: 1, ti: "", d: {} }, { id: uid(), t: "aufgaben", s: 1, ti: "", d: { items: [] } }, { id: uid(), t: "kalender", s: 1, ti: "", d: { ev: {} } }, { id: uid(), t: "pomodoro", s: 1, ti: "", d: {} }, { id: uid(), t: "notiz", s: 1, ti: "", d: { text: "" } }, { id: uid(), t: "countdown", s: 1, ti: "", d: {} }] }; }
function laden(){ try { const j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j && j.v === 1 && Array.isArray(j.w)) return j; } catch(e){} return null; }
function sichern(){ try { localStorage.setItem(KEY, JSON.stringify(S)); speicherOk = true; } catch(e){ speicherOk = false; const n = $("#dkWarn"); if (n) n.hidden = false; } }
let sT = 0; const spaeter = () => { clearTimeout(sT); sT = setTimeout(sichern, 300); };

/* ---------- Feiertage ---------- */
function ostern(y){ const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
const addTage = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const hcache = {};
function feiertage(y){ const k = y + FR(); if (hcache[k]) return hcache[k]; const o = ostern(y), M = {}; const add = (d, n) => { M[ymd(d)] = n; };
  if (FR()) { add(new Date(y, 0, 1), "Jour de l’An"); add(addTage(o, 1), "Lundi de Pâques"); add(new Date(y, 4, 1), "Fête du Travail"); add(new Date(y, 4, 8), "Victoire 1945"); add(addTage(o, 39), "Ascension"); add(addTage(o, 50), "Lundi de Pentecôte"); add(new Date(y, 6, 14), "Fête nationale"); add(new Date(y, 7, 15), "Assomption"); add(new Date(y, 10, 1), "Toussaint"); add(new Date(y, 10, 11), "Armistice"); add(new Date(y, 11, 25), "Noël"); }
  else { add(new Date(y, 0, 1), "Neujahr"); add(addTage(o, -2), "Karfreitag"); add(addTage(o, 1), "Ostermontag"); add(new Date(y, 4, 1), "Tag der Arbeit"); add(addTage(o, 39), "Christi Himmelfahrt"); add(addTage(o, 50), "Pfingstmontag"); add(new Date(y, 9, 3), "Tag der Deutschen Einheit"); add(new Date(y, 11, 25), "1. Weihnachtstag"); add(new Date(y, 11, 26), "2. Weihnachtstag"); }
  return hcache[k] = M; }
function kw(d){ const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 864e5 + 1) / 7); }
function zweiKlick(b, fn, txt){ let t = 0; const o = b.innerHTML; b.addEventListener("click", e => { e.stopPropagation(); if (t) { clearTimeout(t); fn(); } else { b.textContent = txt || T("Sicher?", "Sûr ?"); b.classList.add("warnb"); t = setTimeout(() => { t = 0; b.innerHTML = o; b.classList.remove("warnb"); }, 2500); } }); }

/* ---------- Widgets ---------- */
const WT = {};
WT.uhr = { sym: "🕒", name: () => T("Uhr & Datum", "Heure et date"), info: () => T("Uhrzeit, Datum, Kalenderwoche und drei Weltzeiten.", "Heure, date, semaine et trois fuseaux."),
  mount(el, w){ const Z = [["America/New_York", "New York"], ["Asia/Tokyo", "Tokyo"], ["Australia/Sydney", "Sydney"]];
    el.innerHTML = '<div class="uhr"><b id="uT"></b><div id="uD"></div><small id="uK"></small></div><div class="wz3">' + Z.map((z, i) => '<div><small>' + z[1] + '</small><b id="uZ' + i + '"></b></div>').join("") + '</div>';
    const tick = () => { const d = new Date(); $("#uT", el).textContent = d.toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }); $("#uD", el).textContent = d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const tj = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); $("#uK", el).textContent = T("Kalenderwoche ", "Semaine ") + kw(d) + " · " + T("Tag ", "jour ") + tj;
      Z.forEach((z, i) => { try { $("#uZ" + i, el).textContent = d.toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit", timeZone: z[0] }); } catch(e){} }); };
    tick(); ticks.push(tick); } };

WT.notiz = { sym: "📝", name: () => T("Notizen", "Notes"), info: () => T("Ein Notizzettel, der automatisch speichert.", "Un bloc-notes qui enregistre tout seul."),
  mount(el, w){ el.innerHTML = '<textarea class="in nt" placeholder="' + esc(T("Schreib einfach los …", "Écris simplement …")) + '"></textarea><small class="muted"></small>';
    const ta = $("textarea", el), z = $("small", el); ta.value = w.d.text || ""; const info = () => { const t = ta.value.trim(); z.textContent = (t ? t.split(/\s+/).length : 0) + " " + T("Wörter", "mots") + " · " + ta.value.length + " " + T("Zeichen", "caractères"); }; info();
    ta.addEventListener("input", () => { w.d.text = ta.value; info(); spaeter(); }); } };

WT.aufgaben = { sym: "✅", name: () => T("Aufgaben", "Tâches"), info: () => T("Liste zum Abhaken – auch als Einkaufsliste.", "Liste à cocher – aussi liste de courses."),
  mount(el, w){ w.d.items = w.d.items || [];
    el.innerHTML = '<form class="add"><input class="in" placeholder="' + esc(T("Neue Aufgabe …", "Nouvelle tâche …")) + '" maxlength="120" aria-label="' + esc(T("Neue Aufgabe", "Nouvelle tâche")) + '"><button class="btn go" type="submit">＋</button></form><div class="prog2"><i></i></div><ul class="todo"></ul><div class="row"><small class="muted"></small><button class="btn sm" type="button" data-c>' + esc(T("Erledigte löschen", "Supprimer les terminées")) + '</button></div>';
    const ul = $("ul", el);
    function z(){ const n = w.d.items.length, d = w.d.items.filter(x => x.d).length; $(".prog2 i", el).style.width = (n ? d / n * 100 : 0) + "%"; $("small", el).textContent = d + " / " + n + " " + T("erledigt", "terminées"); $("[data-c]", el).hidden = !d;
      ul.innerHTML = w.d.items.map((x, i) => '<li class="' + (x.d ? "done" : "") + '"><label><input type="checkbox" data-i="' + i + '"' + (x.d ? " checked" : "") + '><span>' + esc(x.t) + '</span></label><button class="x" data-x="' + i + '" aria-label="' + esc(T("Löschen", "Supprimer")) + '">✕</button></li>').join("") || '<li class="leer">' + esc(T("Noch nichts da – schreib oben etwas hinein.", "Rien pour l’instant – écris quelque chose ci-dessus.")) + '</li>'; }
    el.addEventListener("change", e => { const i = e.target.dataset.i; if (i != null) { w.d.items[+i].d = e.target.checked; sichern(); z(); } });
    el.addEventListener("click", e => { const x = e.target.closest("[data-x]"); if (x) { w.d.items.splice(+x.dataset.x, 1); sichern(); z(); } });
    $("[data-c]", el).onclick = () => { w.d.items = w.d.items.filter(x => !x.d); sichern(); z(); };
    $("form", el).onsubmit = e => { e.preventDefault(); const i = $("input", el), t = i.value.trim(); if (!t) return; w.d.items.push({ t: t, d: false }); i.value = ""; sichern(); z(); i.focus(); };
    z(); } };

WT.pomodoro = { sym: "🍅", name: () => "Pomodoro", info: () => T("Konzentriert arbeiten: 25 Minuten Fokus, 5 Minuten Pause.", "Travailler concentré : 25 min de focus, 5 min de pause."),
  mount(el, w){ const d = w.d; d.work = d.work || 25; d.brk = d.brk || 5; if (d.day !== heute()) { d.day = heute(); d.n = 0; }
    const r = RT[w.id] = RT[w.id] || { mode: "work", left: d.work * 60, end: 0 };
    el.innerHTML = '<div class="pom"><div class="tabs t2"><button class="btn sm" data-m="work">' + esc(T("Fokus", "Focus")) + '</button><button class="btn sm" data-m="brk">' + esc(T("Pause", "Pause")) + '</button></div><b class="big pt"></b><div class="prog2"><i></i></div><div class="row" style="justify-content:center"><button class="btn go" data-a="go"></button><button class="btn" data-a="rs">' + esc(T("Zurück", "Réinitialiser")) + '</button></div><small class="muted pc"></small><div class="row" style="justify-content:center"><label class="muted">' + esc(T("Fokus", "Focus")) + ' <input class="in mini" data-s="work" type="number" min="1" max="120" value="' + d.work + '"></label><label class="muted">' + esc(T("Pause", "Pause")) + ' <input class="in mini" data-s="brk" type="number" min="1" max="60" value="' + d.brk + '"></label></div></div>';
    const total = () => (r.mode === "work" ? d.work : d.brk) * 60;
    function z(){ const l = r.end ? Math.max(0, Math.ceil((r.end - Date.now()) / 1000)) : r.left; $(".pt", el).textContent = pad(Math.floor(l / 60)) + ":" + pad(l % 60); $(".prog2 i", el).style.width = (100 - l / total() * 100) + "%";
      $$("[data-m]", el).forEach(b => b.classList.toggle("on", b.dataset.m === r.mode)); $("[data-a=go]", el).textContent = r.end ? T("Pause", "Pause") : T("Start", "Démarrer"); $(".pc", el).textContent = "🍅 × " + (d.n || 0) + " " + T("heute", "aujourd’hui");
      if (r.end) document.title = pad(Math.floor(l / 60)) + ":" + pad(l % 60) + " – Oratio Desk"; return l; }
    const tick = () => { if (!r.end) return; if (z() <= 0) { r.end = 0; piep(); if (r.mode === "work") { d.n = (d.n || 0) + 1; sichern(); } r.mode = r.mode === "work" ? "brk" : "work"; r.left = total(); document.title = "Oratio Desk"; z(); } };
    el.addEventListener("click", e => { const m = e.target.closest("[data-m]"), a = e.target.closest("[data-a]");
      if (m) { r.mode = m.dataset.m; r.end = 0; r.left = total(); document.title = "Oratio Desk"; z(); }
      if (a && a.dataset.a === "go") { if (r.end) { r.left = Math.max(0, Math.ceil((r.end - Date.now()) / 1000)); r.end = 0; document.title = "Oratio Desk"; } else r.end = Date.now() + r.left * 1000; z(); }
      if (a && a.dataset.a === "rs") { r.end = 0; r.left = total(); document.title = "Oratio Desk"; z(); } });
    $$("[data-s]", el).forEach(i => i.addEventListener("change", () => { const v = Math.max(1, Math.min(120, parseInt(i.value) || 25)); d[i.dataset.s] = v; i.value = v; sichern(); if (!r.end) { r.left = total(); z(); } }));
    z(); ticks.push(tick); } };

WT.kalender = { sym: "📅", name: () => T("Kalender", "Calendrier"), info: () => T("Monatskalender mit Feiertagen und eigenen Einträgen pro Tag.", "Calendrier du mois avec jours fériés et notes par jour."),
  mount(el, w){ w.d.ev = w.d.ev || {}; const now = new Date(); let y = now.getFullYear(), m = now.getMonth(), sel = heute();
    el.innerHTML = '<div class="cal"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><button class="btn sm" data-n="-1" aria-label="' + esc(T("Voriger Monat", "Mois précédent")) + '">‹</button><b class="cm"></b><button class="btn sm" data-n="1" aria-label="' + esc(T("Nächster Monat", "Mois suivant")) + '">›</button></div><div class="cg"></div><div class="ce"><b></b><input class="in" maxlength="200" placeholder="' + esc(T("Eintrag für diesen Tag …", "Note pour ce jour …")) + '"></div></div>';
    const WD = FR() ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "D", "M", "D", "F", "S", "S"];
    function z(){ const H = feiertage(y), first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
      $(".cm", el).textContent = new Date(y, m, 1).toLocaleDateString(loc(), { month: "long", year: "numeric" });
      let g = WD.map(x => '<i class="wd">' + x + '</i>').join(""); for (let i = 0; i < off; i++) g += '<i></i>';
      for (let d = 1; d <= dim; d++) { const k = y + "-" + pad(m + 1) + "-" + pad(d), dow = (off + d - 1) % 7; g += '<button type="button" class="cd' + (k === heute() ? " today" : "") + (k === sel ? " sel" : "") + (H[k] ? " hol" : "") + (dow > 4 ? " we" : "") + '" data-d="' + k + '" title="' + esc(H[k] || "") + '">' + d + (w.d.ev[k] ? '<u></u>' : '') + '</button>'; }
      $(".cg", el).innerHTML = g; const p = sel.split("-").map(Number), dd = new Date(p[0], p[1] - 1, p[2]);
      $(".ce b", el).textContent = dd.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" }) + (feiertage(p[0])[sel] ? " · " + feiertage(p[0])[sel] : ""); $(".ce input", el).value = w.d.ev[sel] || ""; }
    el.addEventListener("click", e => { const n = e.target.closest("[data-n]"), d = e.target.closest("[data-d]"); if (n) { m += +n.dataset.n; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } z(); } if (d) { sel = d.dataset.d; z(); } });
    $(".ce input", el).addEventListener("input", e => { const t = e.target.value.trim(); if (t) w.d.ev[sel] = t; else delete w.d.ev[sel]; const b = $('[data-d="' + sel + '"]', el); if (b) { const u = $("u", b); if (t && !u) b.insertAdjacentHTML("beforeend", "<u></u>"); if (!t && u) u.remove(); } spaeter(); });
    z(); } };

WT.rechner = { sym: "🧮", name: () => T("Taschenrechner", "Calculatrice"), info: () => T("Rechner mit Klammern und Prozent – Tasten oder Tastatur.", "Calculatrice avec parenthèses et pourcent – touches ou clavier."),
  mount(el, w){ const K = ["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ",", "%", "="];
    el.innerHTML = '<div class="calc"><input class="in cin" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + esc(T("Rechnung", "Calcul")) + '"><div class="ck">' + K.map(k => '<button type="button" class="btn ' + (/[÷×−+=]/.test(k) ? "go" : "") + '" data-k="' + k + '">' + k + '</button>').join("") + '</div><small class="muted hist"></small></div>';
    const inp = $(".cin", el); let hist = [];
    function rechne(s){ s = s.replace(/×|\*/g, "*").replace(/÷|:|\//g, "/").replace(/−|–/g, "-").replace(/,/g, ".").replace(/\s+/g, ""); let p = 0;
      const peek = () => s[p];
      function zahl(){ const m = /^\d*\.?\d+(?:e[+-]?\d+)?|^\d+\.?/i.exec(s.slice(p)); if (!m) throw 0; p += m[0].length; return parseFloat(m[0]); }
      function fak(){ let v; if (peek() === "-") { p++; v = -fak(); } else if (peek() === "+") { p++; v = fak(); } else if (peek() === "(") { p++; v = ausd(); if (peek() !== ")") throw 0; p++; } else v = zahl(); while (peek() === "%") { p++; v /= 100; } return v; }
      function term(){ let v = fak(); while (peek() === "*" || peek() === "/") { const o = s[p++], r = fak(); if (o === "*") v *= r; else { if (r === 0) throw 1; v /= r; } } return v; }
      function ausd(){ let v = term(); while (peek() === "+" || peek() === "-") { const o = s[p++], r = term(); v = o === "+" ? v + r : v - r; } return v; }
      const v = ausd(); if (p < s.length) throw 0; return v; }
    function gleich(){ const t = inp.value.trim(); if (!t) return; try { const v = rechne(t), txt = String(parseFloat(v.toPrecision(12))).replace(".", FR() || true ? "," : "."); hist.unshift(t + " = " + txt); hist = hist.slice(0, 3); $(".hist", el).innerHTML = hist.map(esc).join("<br>"); inp.value = txt; } catch(e){ inp.classList.add("bad"); setTimeout(() => inp.classList.remove("bad"), 600); $(".hist", el).textContent = e === 1 ? T("Durch 0 teilen geht nicht.", "Division par 0 impossible.") : T("Das ist keine gültige Rechnung.", "Ce n’est pas un calcul valide."); } }
    el.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k; if (k === "C") { inp.value = ""; } else if (k === "=") gleich(); else inp.value += k; inp.focus(); });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); gleich(); } if (e.key === "Escape") inp.value = ""; }); } };

WT.gewohnheiten = { sym: "🔥", name: () => T("Gewohnheiten", "Habitudes"), info: () => T("Tägliche Gewohnheiten abhaken und Serien sammeln.", "Cocher ses habitudes et garder la série."),
  mount(el, w){ w.d.h = w.d.h || []; el.innerHTML = '<form class="add"><input class="in" maxlength="60" placeholder="' + esc(T("Neue Gewohnheit, z. B. Wasser trinken", "Nouvelle habitude, p. ex. boire de l’eau")) + '"><button class="btn go" type="submit">＋</button></form><div class="hab"></div>';
    const WD = FR() ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "D", "M", "D", "F", "S", "S"];
    function serie(h){ let n = 0, d = new Date(); if (!h.days[ymd(d)]) d = addTage(d, -1); while (h.days[ymd(d)]) { n++; d = addTage(d, -1); } return n; }
    function z(){ const tage = []; for (let i = 6; i >= 0; i--) tage.push(addTage(new Date(), -i));
      $(".hab", el).innerHTML = w.d.h.map((h, i) => '<div class="hr"><span class="hn"><b>' + esc(h.n) + '</b><small>🔥 ' + serie(h) + '</small></span><span class="hd">' + tage.map(d => '<button type="button" class="hb' + (h.days[ymd(d)] ? " on" : "") + '" data-i="' + i + '" data-d="' + ymd(d) + '" title="' + esc(d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" })) + '"><small>' + WD[(d.getDay() + 6) % 7] + '</small></button>').join("") + '</span><button class="x" data-x="' + i + '" aria-label="' + esc(T("Löschen", "Supprimer")) + '">✕</button></div>').join("") || '<p class="leer">' + esc(T("Lege deine erste Gewohnheit an.", "Crée ta première habitude.")) + '</p>'; }
    el.addEventListener("click", e => { const b = e.target.closest(".hb"), x = e.target.closest("[data-x]"); if (b) { const h = w.d.h[+b.dataset.i]; if (h.days[b.dataset.d]) delete h.days[b.dataset.d]; else h.days[b.dataset.d] = 1; sichern(); z(); } if (x) { w.d.h.splice(+x.dataset.x, 1); sichern(); z(); } });
    $("form", el).onsubmit = e => { e.preventDefault(); const i = $("input", el), t = i.value.trim(); if (!t) return; w.d.h.push({ n: t, days: {} }); i.value = ""; sichern(); z(); };
    z(); } };

WT.countdown = { sym: "⏳", name: () => "Countdown", info: () => T("Tage bis Weihnachten, Urlaub, Geburtstag und mehr.", "Jours avant Noël, les vacances, un anniversaire …"),
  mount(el, w){ if (!w.d.items) { const n = new Date(), y = n.getMonth() === 11 && n.getDate() > 24 ? n.getFullYear() + 1 : n.getFullYear(); w.d.items = [{ n: T("Weihnachten", "Noël"), d: y + "-12-24" }]; sichern(); }
    el.innerHTML = '<div class="cdl"></div><form class="add"><input class="in" maxlength="50" placeholder="' + esc(T("Name", "Nom")) + '" required><input class="in" type="date" required style="max-width:150px"><button class="btn go" type="submit">＋</button></form>';
    function z(){ const t0 = new Date(); t0.setHours(0, 0, 0, 0); const L = w.d.items.map((x, i) => { const p = x.d.split("-").map(Number), n = Math.round((new Date(p[0], p[1] - 1, p[2]) - t0) / 864e5); return { x: x, i: i, n: n }; }).sort((a, b) => Math.abs(a.n) - Math.abs(b.n) || a.n - b.n);
      $(".cdl", el).innerHTML = L.map(o => '<div class="cd2"><span class="cn">' + (o.n === 0 ? T("Heute!", "Aujourd’hui !") : o.n > 0 ? o.n : T("vor ", "il y a ") + (-o.n)) + '</span><span class="cl"><b>' + esc(o.x.n) + '</b><small>' + (o.n > 0 ? T("Tage", "jours") : o.n < 0 ? T("Tagen", "jours") : "") + ' · ' + new Date(o.x.d + "T12:00").toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" }) + '</small></span><button class="x" data-x="' + o.i + '" aria-label="' + esc(T("Löschen", "Supprimer")) + '">✕</button></div>').join("") || '<p class="leer">' + esc(T("Noch kein Termin.", "Pas encore d’échéance.")) + '</p>'; }
    el.addEventListener("click", e => { const x = e.target.closest("[data-x]"); if (x) { w.d.items.splice(+x.dataset.x, 1); sichern(); z(); } });
    $("form", el).onsubmit = e => { e.preventDefault(); const [a, b] = $$("input", el); if (!a.value.trim() || !b.value) return; w.d.items.push({ n: a.value.trim(), d: b.value }); a.value = ""; b.value = ""; sichern(); z(); };
    z(); } };

WT.links = { sym: "🔖", name: () => T("Lesezeichen", "Favoris"), info: () => T("Deine wichtigsten Seiten mit einem Klick.", "Tes sites préférés en un clic."),
  mount(el, w){ w.d.l = w.d.l || [{ n: "Oratio Place", u: "https://oratioplace.com" }];
    el.innerHTML = '<div class="lk"></div><form class="add"><input class="in" maxlength="40" placeholder="' + esc(T("Name", "Nom")) + '" required><input class="in" maxlength="300" placeholder="https://…" required inputmode="url"><button class="btn go" type="submit">＋</button></form>';
    function z(){ $(".lk", el).innerHTML = w.d.l.map((x, i) => '<div class="lr"><a href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer"><span class="fav">' + esc((x.n[0] || "?").toUpperCase()) + '</span>' + esc(x.n) + '<small>' + esc(x.u.replace(/^https?:\/\//, "").replace(/\/$/, "")) + '</small></a><button class="x" data-x="' + i + '" aria-label="' + esc(T("Löschen", "Supprimer")) + '">✕</button></div>').join(""); }
    el.addEventListener("click", e => { const x = e.target.closest("[data-x]"); if (x) { w.d.l.splice(+x.dataset.x, 1); sichern(); z(); } });
    $("form", el).onsubmit = e => { e.preventDefault(); const [a, b] = $$("input", el); let u = b.value.trim(); if (!/^https?:\/\//i.test(u)) u = "https://" + u; try { new URL(u); } catch(err) { b.setCustomValidity("?"); b.reportValidity(); b.setCustomValidity(""); return; } w.d.l.push({ n: a.value.trim(), u: u }); a.value = ""; b.value = ""; sichern(); z(); };
    z(); } };

WT.wasser = { sym: "💧", name: () => T("Wasser-Tracker", "Suivi d’eau"), info: () => T("Gläser pro Tag zählen – mit Tagesziel.", "Compter les verres par jour – avec objectif."),
  mount(el, w){ const d = w.d; d.ziel = d.ziel || 8; if (d.day !== heute()) { d.day = heute(); d.n = 0; }
    el.innerHTML = '<div class="wat"><div class="glas"></div><div class="row" style="justify-content:center"><button class="btn" data-a="-1">−</button><b class="big wn"></b><button class="btn go" data-a="1">＋</button></div><small class="muted">' + esc(T("Tagesziel", "Objectif")) + ' <input class="in mini" type="number" min="1" max="30" value="' + d.ziel + '"> ' + esc(T("Gläser", "verres")) + '</small></div>';
    function z(){ $(".wn", el).textContent = d.n + " / " + d.ziel; let g = ""; for (let i = 0; i < Math.max(d.ziel, d.n); i++) g += '<i class="' + (i < d.n ? "on" : "") + '">💧</i>'; $(".glas", el).innerHTML = g; }
    el.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (b) { d.n = Math.max(0, d.n + +b.dataset.a); sichern(); z(); } });
    $("input", el).addEventListener("change", e => { d.ziel = Math.max(1, Math.min(30, parseInt(e.target.value) || 8)); e.target.value = d.ziel; sichern(); z(); });
    z(); } };
const SZ = [["🎯", () => T("Fokus", "Focus"), () => T("Pomodoro, Aufgaben und Notizen – nichts lenkt ab.", "Pomodoro, tâches et notes – rien ne distrait."), ["pomodoro", "aufgaben", "notiz"], "grafit"], ["☀️", () => T("Guten Morgen", "Bonjour"), () => T("Uhr, Kalender, Wasser und Countdown.", "Heure, calendrier, eau et compte à rebours."), ["uhr", "kalender", "wasser", "countdown"], "himmel"], ["📚", () => T("Lernen", "Apprendre"), () => T("Pomodoro, Notizen, Aufgaben und Rechner.", "Pomodoro, notes, tâches et calculatrice."), ["pomodoro", "notiz", "aufgaben", "rechner"], "royal"], ["🌙", () => T("Feierabend", "Soirée"), () => T("Uhr, Gewohnheiten, Notizen und Lesezeichen.", "Heure, habitudes, notes et favoris."), ["uhr", "gewohnheiten", "notiz", "links"], "nacht"]];
const REIHE = ["uhr", "aufgaben", "kalender", "pomodoro", "notiz", "countdown", "rechner", "gewohnheiten", "wasser", "links"];

/* ---------- Rahmen ---------- */
function render(){
  ticks = []; const g = $("#dkGrid"); g.innerHTML = "";
  document.querySelector(".deskwrap").style.background = (BG.find(b => b[0] === S.bg) || BG[0])[2];
  $("#dkWrap").classList.toggle("edit", edit);
  S.w.forEach((w, i) => { const def = WT[w.t]; if (!def) return;
    const sec = document.createElement("section"); sec.className = "dw s" + (w.s || 1) + " t-" + w.t; sec.dataset.id = w.id; sec.draggable = edit;
    sec.innerHTML = '<div class="wh"><span class="wsym">' + def.sym + '</span>' + (edit ? '<input class="wti" maxlength="30" value="' + esc(w.ti || "") + '" placeholder="' + esc(def.name()) + '" aria-label="' + esc(T("Titel", "Titre")) + '">' : '<h3>' + esc(w.ti || def.name()) + '</h3>') +
      (edit ? '<span class="wc"><button class="wb" data-a="l" aria-label="' + esc(T("Nach vorn", "Avancer")) + '"' + (i === 0 ? " disabled" : "") + '>◀</button><button class="wb" data-a="r" aria-label="' + esc(T("Nach hinten", "Reculer")) + '"' + (i === S.w.length - 1 ? " disabled" : "") + '>▶</button><button class="wb" data-a="s" aria-label="' + esc(T("Größe", "Taille")) + '">' + (w.s === 2 ? "⇤" : "⇔") + '</button><button class="wb wx" data-a="x" aria-label="' + esc(T("Entfernen", "Retirer")) + '">✕</button></span>' : "") + '</div><div class="wbody"></div>';
    g.appendChild(sec); try { def.mount($(".wbody", sec), w); } catch(e){ $(".wbody", sec).textContent = e.message; }
    if (edit) { const x = $('[data-a="x"]', sec); zweiKlick(x, () => { S.w = S.w.filter(q => q.id !== w.id); delete RT[w.id]; sichern(); render(); }, T("Sicher?", "Sûr ?")); const ti = $(".wti", sec); ti.addEventListener("input", () => { w.ti = ti.value; spaeter(); }); }
  });
  if (!S.w.length) g.innerHTML = '<p class="leer" style="grid-column:1/-1;text-align:center;padding:40px 0">' + esc(T("Dein Desk ist leer. Tippe oben auf „＋ Widget“.", "Ton bureau est vide. Touche « ＋ Widget » en haut.")) + '</p>';
  if (window.WZ && WZ.selects) WZ.selects();
}
function start(){
  S = laden() || standard(); sichern();
  const host = $("#dkHost");
  host.innerHTML = '<div class="deskwrap" id="dkWrap"><div class="dkbar"><button class="btn go" id="dAdd">＋ Widget</button><button class="btn" id="dEdit">✎ ' + esc(T("Anordnen", "Organiser")) + '</button><button class="btn" id="dSz">🎬 ' + esc(T("Szenen", "Scènes")) + '</button><button class="btn" id="dBg">🎨 ' + esc(T("Hintergrund", "Fond")) + '</button><button class="btn" id="dBk">💾 ' + esc(T("Sicherung", "Sauvegarde")) + '</button><button class="btn" id="dSb">🌙 StandBy</button></div><div class="dkpan" id="dPan" hidden></div><p class="warn" id="dkWarn" hidden>' + esc(T("Dein Browser lässt kein Speichern zu (privater Modus?). Änderungen gehen beim Schließen verloren – nutze die Sicherung.", "Ton navigateur n’autorise pas l’enregistrement (mode privé ?). Les changements seront perdus – utilise la sauvegarde.")) + '</p><div class="dkgrid" id="dkGrid"></div></div>';
  const pan = $("#dPan", host); let was = "";
  const zeigePan = (was2) => { was = was === was2 ? "" : was2; pan.hidden = !was; if (!was) return;
    if (was === "add") { pan.innerHTML = '<div class="pgrid2">' + REIHE.map(t => '<button class="padd" data-t="' + t + '"><span>' + WT[t].sym + '</span><b>' + esc(WT[t].name()) + '</b><small>' + esc(WT[t].info()) + '</small></button>').join("") + '</div>'; $$(".padd", pan).forEach(b => b.onclick = () => { const w = { id: uid(), t: b.dataset.t, s: 1, ti: "", d: {} }; S.w.push(w); sichern(); was = ""; pan.hidden = true; render(); const el = $('[data-id="' + w.id + '"]'); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }); }
    if (was === "sz") { pan.innerHTML = '<p class="hint" style="margin-top:0">' + esc(T("Eine Szene stellt deinen Desk mit einem Klick passend zusammen. Widgets, die nicht gebraucht werden, bleiben mit ihren Daten gespeichert und kommen bei Bedarf zurück.", "Une scène organise ton bureau en un clic. Les widgets inutilisés restent enregistrés avec leurs données et reviennent au besoin.")) + '</p><div class="pgrid2">' + SZ.map((z, i) => '<button class="padd" data-z="' + i + '"><span>' + z[0] + '</span><b>' + esc(z[1]()) + '</b><small>' + esc(z[2]()) + '</small></button>').join("") + '</div>';
      $$("[data-z]", pan).forEach(b => b.onclick = () => { const z = SZ[+b.dataset.z], pool = S.w.concat(S.arch || []), neu = []; z[3].forEach(t => { const i = pool.findIndex(w => w.t === t); neu.push(i >= 0 ? pool.splice(i, 1)[0] : { id: uid(), t: t, s: 1, ti: "", d: {} }); }); S.w = neu; S.arch = pool; S.bg = z[4]; sichern(); was = ""; pan.hidden = true; render(); }); }
    if (was === "bg") { pan.innerHTML = '<div class="bgs">' + BG.map(b => '<button class="bgb' + (S.bg === b[0] ? " on" : "") + '" data-b="' + b[0] + '" style="background:' + b[2] + '"><span>' + esc(b[1]) + '</span></button>').join("") + '</div>'; $$(".bgb", pan).forEach(b => b.onclick = () => { S.bg = b.dataset.b; sichern(); render(); zeigePan("bg"); zeigePan("bg"); }); }
    if (was === "bk") { pan.innerHTML = '<p class="hint" style="margin-top:0">' + esc(T("Dein Desk wird nur in diesem Browser gespeichert. Mit einer Sicherung kannst du ihn auf ein anderes Gerät mitnehmen.", "Ton bureau est enregistré uniquement dans ce navigateur. Avec une sauvegarde, tu peux le transférer sur un autre appareil.")) + '</p><div class="row"><button class="btn go" id="bEx">⬇ ' + esc(T("Sicherung speichern", "Enregistrer la sauvegarde")) + '</button><label class="btn" style="cursor:pointer">⬆ ' + esc(T("Sicherung laden", "Charger une sauvegarde")) + '<input type="file" id="bIm" accept=".json,application/json" hidden></label><button class="btn" id="bRs">' + esc(T("Alles zurücksetzen", "Tout réinitialiser")) + '</button></div><p class="status" id="bSt"></p>';
      $("#bEx", pan).onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: "application/json" })); a.download = "oratio-desk-" + heute() + ".json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); };
      $("#bIm", pan).onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (!j || j.v !== 1 || !Array.isArray(j.w)) throw 0; j.w = j.w.filter(w => w && WT[w.t]).map(w => ({ id: String(w.id || uid()), t: w.t, s: w.s === 2 ? 2 : 1, ti: String(w.ti || "").slice(0, 30), d: w.d && typeof w.d === "object" ? w.d : {} })); S = { v: 1, bg: BG.some(b => b[0] === j.bg) ? j.bg : "royal", w: j.w }; sichern(); render(); $("#bSt", pan).textContent = "✓ " + T("Sicherung geladen.", "Sauvegarde chargée."); } catch(err) { $("#bSt", pan).className = "status bad"; $("#bSt", pan).textContent = T("Diese Datei ist keine gültige Desk-Sicherung.", "Ce fichier n’est pas une sauvegarde valide."); } }); };
      zweiKlick($("#bRs", pan), () => { S = standard(); sichern(); render(); zeigePan("bk"); }, T("Wirklich alles löschen?", "Tout effacer vraiment ?")); } };
  $("#dSb", host).onclick = () => standby();
  $("#dSz", host).onclick = () => zeigePan("sz");
  $("#dAdd", host).onclick = () => zeigePan("add"); $("#dBg", host).onclick = () => zeigePan("bg"); $("#dBk", host).onclick = () => zeigePan("bk");
  $("#dEdit", host).onclick = e => { edit = !edit; e.currentTarget.classList.toggle("on", edit); e.currentTarget.innerHTML = edit ? "✔ " + esc(T("Fertig", "Terminé")) : "✎ " + esc(T("Anordnen", "Organiser")); render(); };
  const grid = $("#dkGrid", host);
  grid.addEventListener("click", e => { const b = e.target.closest(".wb"); if (!b || b.dataset.a === "x") return; const id = b.closest(".dw").dataset.id, i = S.w.findIndex(w => w.id === id), w = S.w[i];
    if (b.dataset.a === "l" && i > 0) S.w.splice(i - 1, 0, S.w.splice(i, 1)[0]); if (b.dataset.a === "r" && i < S.w.length - 1) S.w.splice(i + 1, 0, S.w.splice(i, 1)[0]); if (b.dataset.a === "s") w.s = w.s === 2 ? 1 : 2; sichern(); render(); });
  let drag = null;
  grid.addEventListener("dragstart", e => { const s = e.target.closest && e.target.closest(".dw"); if (!s || !edit || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { return; } drag = s.dataset.id; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", drag); } catch(err){} s.classList.add("drag"); });
  grid.addEventListener("dragover", e => { if (drag) { e.preventDefault(); const s = e.target.closest(".dw"); $$(".dw.over", grid).forEach(x => x !== s && x.classList.remove("over")); if (s && s.dataset.id !== drag) s.classList.add("over"); } });
  grid.addEventListener("dragend", () => { drag = null; $$(".dw", grid).forEach(x => x.classList.remove("drag", "over")); });
  grid.addEventListener("drop", e => { if (!drag) return; e.preventDefault(); const s = e.target.closest(".dw"); if (s && s.dataset.id !== drag) { const a = S.w.findIndex(w => w.id === drag), b = S.w.findIndex(w => w.id === s.dataset.id), x = S.w.splice(a, 1)[0]; S.w.splice(b, 0, x); sichern(); } drag = null; render(); });
  setInterval(() => ticks.forEach(f => { try { f(); } catch(e){} }), 500);
  window.addEventListener("pagehide", sichern);
  render();
  document.title = "Oratio Desk – Oratio";
}
function standby(){
  const o = document.createElement("div"); o.className = "standby"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "StandBy"); o.tabIndex = -1;
  o.innerHTML = '<div class="sbc"><b id="sbT"></b><div id="sbD"></div><div id="sbC"></div></div><button class="sbx" aria-label="' + esc(T("Schließen", "Fermer")) + '">✕</button><small>' + esc(T("Tippen oder Esc zum Beenden", "Touche ou Échap pour quitter")) + '</small>';
  document.body.appendChild(o); o.focus(); let lock = null;
  const t0 = () => { const d = new Date(); $("#sbT", o).textContent = d.toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" }); $("#sbD", o).textContent = d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
    const cd = S.w.filter(w => w.t === "countdown").flatMap(w => w.d.items || []).map(x => { const p = x.d.split("-").map(Number), n = Math.ceil((new Date(p[0], p[1] - 1, p[2]) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5); return { x: x, n: n }; }).filter(q => q.n >= 0).sort((a, b) => a.n - b.n)[0];
    $("#sbC", o).textContent = cd ? (cd.n === 0 ? cd.x.n + " – " + T("heute!", "aujourd’hui !") : T("Noch ", "Encore ") + cd.n + T(" Tage bis ", " jours avant ") + cd.x.n) : ""; };
  t0(); const iv = setInterval(t0, 1000);
  const zu = () => { clearInterval(iv); document.removeEventListener("keydown", kd); try { lock && lock.release(); } catch(e){} try { if (document.fullscreenElement) document.exitFullscreen(); } catch(e){} o.remove(); };
  const kd = e => { if (e.key === "Escape") zu(); }; document.addEventListener("keydown", kd); o.addEventListener("click", zu);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(l => { lock = l; }).catch(() => {}); } catch(e){}
  try { if (o.requestFullscreen) o.requestFullscreen().catch(() => {}); } catch(e){}
  o.addEventListener("fullscreenchange", () => {}); document.addEventListener("fullscreenchange", function f(){ if (!document.fullscreenElement) { document.removeEventListener("fullscreenchange", f); if (o.isConnected) zu(); } });
}
window.Desk = { start: start };
})();
