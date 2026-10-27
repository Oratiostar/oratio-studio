// Oratio Desk 2: Home-Bildschirm im Browser (Widgets, Apps, Seiten, Dock) – nach dem Vorbild des Oratio Control Centers.
// Kern: Zustand, Raster, Bearbeiten, Fenster ("Apps"), Hintergründe, Sicherung. Die Widgets liegen in desk_*.js.
// Alles bleibt in deinem Browser (localStorage). Es wird nichts gesendet.
(function(){
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const FR = () => WZ.lang === "fr";
const T = (de, fr) => FR() ? fr : de;
const loc = () => FR() ? "fr-FR" : "de-DE";
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const heute = () => ymd(new Date());
const uid = () => Math.random().toString(36).slice(2, 9);
const addTage = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const KEY = "oratio_desk_v2";

/* ---------- Hilfen für die Widgets ---------- */
function piep(n){ try { const A = new (window.AudioContext || window.webkitAudioContext)(); for (let i = 0; i < (n || 3); i++) { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = 880; o.connect(g); g.connect(A.destination); g.gain.setValueAtTime(.25, A.currentTime + i * .35); g.gain.setValueAtTime(0, A.currentTime + i * .35 + .18); o.start(A.currentTime + i * .35); o.stop(A.currentTime + i * .35 + .22); } } catch(e){} try { navigator.vibrate && navigator.vibrate([250, 120, 250]); } catch(e){} }
function ostern(y){ const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
const hc = {};
function feiertage(y){ const k = y + String(FR()); if (hc[k]) return hc[k]; const o = ostern(y), M = {}, add = (d, n) => { M[ymd(d)] = n; };
  if (FR()) { add(new Date(y, 0, 1), "Jour de l’An"); add(addTage(o, 1), "Lundi de Pâques"); add(new Date(y, 4, 1), "Fête du Travail"); add(new Date(y, 4, 8), "Victoire 1945"); add(addTage(o, 39), "Ascension"); add(addTage(o, 50), "Lundi de Pentecôte"); add(new Date(y, 6, 14), "Fête nationale"); add(new Date(y, 7, 15), "Assomption"); add(new Date(y, 10, 1), "Toussaint"); add(new Date(y, 10, 11), "Armistice"); add(new Date(y, 11, 25), "Noël"); }
  else { add(new Date(y, 0, 1), "Neujahr"); add(addTage(o, -2), "Karfreitag"); add(addTage(o, 1), "Ostermontag"); add(new Date(y, 4, 1), "Tag der Arbeit"); add(addTage(o, 39), "Christi Himmelfahrt"); add(addTage(o, 50), "Pfingstmontag"); add(new Date(y, 9, 3), "Tag der Deutschen Einheit"); add(new Date(y, 11, 25), "1. Weihnachtstag"); add(new Date(y, 11, 26), "2. Weihnachtstag"); }
  return hc[k] = M; }
function kw(d){ const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 864e5 + 1) / 7); }
function zweiKlick(b, fn, txt){ let t = 0; const o = b.innerHTML; b.addEventListener("click", e => { e.stopPropagation(); if (t) { clearTimeout(t); t = 0; fn(); } else { b.textContent = txt || T("Sicher?", "Sûr ?"); b.classList.add("warnb"); t = setTimeout(() => { t = 0; b.innerHTML = o; b.classList.remove("warnb"); }, 2500); } }); }

/* ---------- Register: Widgets und Apps ---------- */
const REG = {};          // kind -> Definition
const reg = (k, d) => { d.kind = k; REG[k] = d; };
const SITE = [["datei-werkstatt.html", "🗂️", () => "Datei-Werkstatt", "#2e86ff"], ["icon-werkstatt.html", "🎨", () => "Icon-Werkstatt", "#ee4f7e"], ["alltag.html", "🧰", () => T("Alltags-Helfer", "Assistants du quotidien"), "#ff8c1a"], ["elektro.html", "🔌", () => T("Elektronik-Labor", "Labo d’électronique"), "#12b8a6"], ["index.html#/studio", "🖥️", () => "Tech Studio", "#6a4fd8"], ["weihnachten.html", "🎄", () => T("Weihnachtswelt", "Monde de Noël"), "#c4162b"]];

/* ---------- Zustand ---------- */
const BG = [["himmel", () => T("Himmel", "Ciel"), "linear-gradient(170deg,#8fe3ff 0%,#4aa9ec 55%,#2a6fc0 100%)"], ["royal", () => T("Königsblau", "Bleu roi"), "linear-gradient(160deg,#1b4fd8,#5aa0ff 70%,#a9d6ff)"], ["abend", () => T("Abendrot", "Crépuscule"), "linear-gradient(160deg,#ff7ac8,#ff8c1a)"], ["wald", () => T("Wald", "Forêt"), "linear-gradient(160deg,#145c35,#7fcf8f)"], ["nacht", () => T("Nacht", "Nuit"), "linear-gradient(160deg,#0e1430,#3b2a73)"], ["grafit", () => T("Grafit", "Graphite"), "linear-gradient(160deg,#262a33,#566074)"], ["aurora", () => "Aurora", "radial-gradient(circle at 20% 20%,#7cf0c9 0,transparent 45%),radial-gradient(circle at 80% 30%,#9b7bff 0,transparent 50%),radial-gradient(circle at 50% 90%,#ff8fc3 0,transparent 50%),#1d2a52"]];
let S = null, edit = false, ticks = [], cur = 0, openApp = null;
function std(){
  const I = (k, w, h, x) => Object.assign({ id: uid(), k: k, w: w, h: h }, x || {});
  return { v: 2, bg: "himmel", stil: "glas", photo: "", pages: [
    { items: [I("date", 2, 2), I("aclock", 1, 1), I("tasks", 1, 1), I("app", 1, 1, { a: "calc" }), I("app", 1, 1, { a: "notes" }), I("uhr", 2, 2), I("pomodoro", 2, 2)] },
    { items: [I("calc", 2, 2), I("countdown", 2, 1), I("wasser", 2, 1), I("habits", 2, 2), I("timer", 2, 1), I("alarm", 2, 1), I("stopwatch", 2, 1), I("dice", 1, 1), I("geraet", 2, 1), I("links", 2, 2)] }
  ], dock: ["datei-werkstatt.html", "icon-werkstatt.html", "alltag.html", "elektro.html"], data: {} };
}
function laden(){ try { const j = JSON.parse(localStorage.getItem(KEY) || "null"); if (j && j.v === 2 && Array.isArray(j.pages)) return j; } catch(e){} return null; }
let sOk = true;
function sichern(){ try { localStorage.setItem(KEY, JSON.stringify(S)); sOk = true; } catch(e){ sOk = false; const n = $("#dkWarn"); if (n) n.hidden = false; } }
let sT = 0; const spaeter = () => { clearTimeout(sT); sT = setTimeout(sichern, 250); };
const D = () => S.data;

/* ---------- Mitteilung beim Klingeln (Timer/Wecker/Pomodoro) ---------- */
let ringT = 0;
function ring(title, body){
  let b = $("#dkRing"); if (!b) { b = document.createElement("div"); b.id = "dkRing"; b.className = "dkring"; document.body.appendChild(b); }
  b.innerHTML = '<span class="rb">🔔</span><span><b>' + esc(title) + '</b><small>' + esc(body || "") + '</small></span><button class="btn go">' + esc(T("Stopp", "Stop")) + '</button>'; b.hidden = false;
  clearInterval(ringT); let n = 0; piep(3); ringT = setInterval(() => { if (++n > 25) stop(); else piep(3); }, 1500);
  function stop(){ clearInterval(ringT); b.hidden = true; }
  $("button", b).onclick = stop;
}

/* ---------- Kontext für ein Widget ---------- */
function ctxFor(it, el){ return { item: it, el: el, size: [it.w, it.h], D: D, save: sichern, later: spaeter, T: T, open: (a, o) => openAppWin(a || it.k, o), refresh: () => zeichneItem(it) }; }
const itemEl = id => $('.it[data-id="' + id + '"]');
function zeichneItem(it){ const e = itemEl(it.id); if (!e) return; const t = $(".tl", e); fuelle(it, t); }
function fuelle(it, tl){
  tl.innerHTML = ""; tl.className = "tl"; tl.dataset.w = it.w; tl.dataset.h = it.h;
  if (it.k === "app") { const d = REG[it.a], s = SITE.find(x => x[0] === it.a); const sym = d ? d.sym : s ? s[1] : "?", col = d ? d.col : s ? s[3] : "#888";
    tl.classList.add("ico"); tl.style.setProperty("--ic", col); tl.innerHTML = '<span class="ig">' + sym + '</span>'; if (d && d.badge) { const bd = d.badge(ctxFor(it, tl)); if (bd) tl.insertAdjacentHTML("beforeend", '<i class="bdg">' + esc(bd) + '</i>'); } return; }
  const d = REG[it.k]; if (!d) { tl.textContent = "?"; return; }
  tl.style.removeProperty("--ic"); if (d.tileClass) tl.classList.add(d.tileClass);
  try { d.tile(tl, ctxFor(it, tl)); } catch(e){ tl.textContent = e.message; }
}
function nameOf(it){ if (it.k === "app") { const d = REG[it.a], s = SITE.find(x => x[0] === it.a); return d ? d.name() : s ? s[2]() : "?"; } const d = REG[it.k]; return d ? d.name() : "?"; }

/* ---------- Seiten und Raster ---------- */
function spalten(){ const w = $("#dkStage").clientWidth; return w < 560 ? 4 : w < 900 ? 6 : 8; }
function layoutGroesse(){ const st = $("#dkStage"); if (!st) return; const cols = spalten(), gap = 12, p = 18, w = st.clientWidth - 2 * p; st.style.setProperty("--cols", cols); st.style.setProperty("--cell", Math.floor((w - gap * (cols - 1)) / cols) + "px"); st.style.setProperty("--gap", gap + "px"); }
function render(){
  ticks = []; const st = $("#dkStage"), box = $("#dkPages", st); box.innerHTML = "";
  st.dataset.stil = S.stil; st.classList.toggle("edit", edit);
  const bg = $("#dkBg", st); bg.style.background = S.photo ? "center/cover url(" + S.photo + ")" : (BG.find(b => b[0] === S.bg) || BG[0])[2];
  layoutGroesse();
  S.pages.forEach((pg, pi) => {
    const P = document.createElement("div"); P.className = "pg"; P.dataset.p = pi; const G = document.createElement("div"); G.className = "grid"; P.appendChild(G); box.appendChild(P);
    pg.items.forEach((it, ii) => {
      const el = document.createElement("div"); el.className = "it"; el.dataset.id = it.id; el.style.gridColumn = "span " + Math.min(it.w, spalten()); el.style.gridRow = "span " + it.h; el.draggable = edit;
      el.innerHTML = '<div class="tl"></div><span class="nm">' + esc(nameOf(it)) + '</span>' + (edit ? '<button class="mn" data-a="x" aria-label="' + esc(T("Entfernen", "Retirer")) + '">−</button><span class="ec">' + (it.k !== "app" && REG[it.k] && REG[it.k].sizes.length > 1 ? '<button data-a="s" aria-label="' + esc(T("Größe ändern", "Changer la taille")) + '">⤢</button>' : "") + '<button data-a="l"' + (ii === 0 ? " disabled" : "") + ' aria-label="' + esc(T("Nach vorn", "Avancer")) + '">◀</button><button data-a="r"' + (ii === pg.items.length - 1 ? " disabled" : "") + ' aria-label="' + esc(T("Nach hinten", "Reculer")) + '">▶</button>' + (S.pages.length > 1 ? '<button data-a="p" aria-label="' + esc(T("Auf andere Seite", "Autre page")) + '">⇉</button>' : "") + '</span>' : "");
      G.appendChild(el); fuelle(it, $(".tl", el));
      const d = REG[it.k]; if (d && d.tick) ticks.push(() => { const t = $(".tl", el); if (t && t.isConnected) d.tick(t, ctxFor(it, t)); });
    });
    if (!pg.items.length) G.innerHTML = '<p class="leer" style="grid-column:1/-1">' + esc(T("Leere Seite – tippe auf „＋ Widget“.", "Page vide – touche « ＋ Widget ».")) + '</p>';
  });
  punkte(); if (window.WZ && WZ.selects) WZ.selects();
  requestAnimationFrame(() => { box.scrollLeft = cur * box.clientWidth; });
  dock();
}
function punkte(){ const d = $("#dkDots"); d.innerHTML = S.pages.map((_, i) => '<button class="dt' + (i === cur ? " on" : "") + '" data-i="' + i + '" aria-label="' + esc(T("Seite ", "Page ") + (i + 1)) + '"></button>').join(""); $$(".dt", d).forEach(b => b.onclick = () => { cur = +b.dataset.i; $("#dkPages").scrollTo({ left: cur * $("#dkPages").clientWidth, behavior: "smooth" }); punkte(); }); $("#dkPrev").disabled = cur === 0; $("#dkNext").disabled = cur >= S.pages.length - 1; }
function dock(){ const d = $("#dkDock"); d.innerHTML = S.dock.map(h => { const s = SITE.find(x => x[0] === h); return s ? '<a class="dki" href="' + s[0] + '" style="--ic:' + s[3] + '" title="' + esc(s[2]()) + '"><span class="ig">' + s[1] + '</span></a>' : ""; }).join(""); }

/* ---------- Fenster ("App") ---------- */
function openAppWin(kind, opt){
  const d = REG[kind]; if (!d || !d.app) return; closeApp();
  const o = document.createElement("div"); o.className = "ovl"; o.innerHTML = '<div class="sheet" role="dialog" aria-label="' + esc(d.name()) + '"><div class="sh-head"><span class="wsym">' + d.sym + '</span><b>' + esc((d.app.title || d.name)()) + '</b><span class="sp"></span><button class="sx" aria-label="' + esc(T("Schließen", "Fermer")) + '">✕</button></div><div class="sh-body"></div></div>';
  document.body.appendChild(o); document.body.classList.add("dkopen");
  const body = $(".sh-body", o), c = ctxFor({ id: "app", k: kind, w: 4, h: 4 }, body); c.opt = opt || {};
  try { d.app.mount(body, c); } catch(e){ body.textContent = e.message; }
  openApp = { o: o, d: d, c: c, body: body };
  o.addEventListener("mousedown", e => { if (e.target === o) closeApp(); }); $(".sx", o).onclick = closeApp;
  if (window.WZ && WZ.selects) WZ.selects();
}
function closeApp(){ if (!openApp) return; openApp.o.remove(); document.body.classList.remove("dkopen"); const a = openApp; openApp = null; if (a.d.app.close) try { a.d.app.close(); } catch(e){} S.pages.forEach(p => p.items.forEach(it => { if (it.k === a.d.kind) zeichneItem(it); })); render0(); }
function render0(){ $$(".it").forEach(e => { const it = findItem(e.dataset.id); if (it) fuelle(it, $(".tl", e)); }); }
const findItem = id => { for (const p of S.pages) { const it = p.items.find(i => i.id === id); if (it) return it; } return null; };

/* ---------- Bearbeiten ---------- */
function sheet(titel, html, fn){
  const o = document.createElement("div"); o.className = "ovl sml"; o.innerHTML = '<div class="sheet" role="dialog"><div class="sh-head"><b>' + esc(titel) + '</b><span class="sp"></span><button class="sx" aria-label="' + esc(T("Schließen", "Fermer")) + '">✕</button></div><div class="sh-body">' + html + '</div></div>';
  document.body.appendChild(o); const z = () => o.remove(); o.addEventListener("mousedown", e => { if (e.target === o) z(); }); $(".sx", o).onclick = z; fn && fn($(".sh-body", o), z); if (window.WZ && WZ.selects) WZ.selects(); return z;
}
function widgetSheet(){
  const kinds = Object.keys(REG).filter(k => REG[k].tile).sort((a, b) => (REG[a].order || 99) - (REG[b].order || 99));
  const apps = Object.keys(REG).filter(k => REG[k].app);
  sheet(T("Widget hinzufügen", "Ajouter un widget"), '<div class="gal">' + kinds.map(k => { const d = REG[k]; return '<div class="gi"><span class="gs" style="background:' + d.col + '">' + d.sym + '</span><div><b>' + esc(d.name()) + '</b><small>' + esc(d.info ? d.info() : "") + '</small><span class="szs">' + d.sizes.map(s => '<button class="btn sm" data-k="' + k + '" data-w="' + s[0] + '" data-h="' + s[1] + '">' + s[0] + '×' + s[1] + '</button>').join("") + '</span></div></div>'; }).join("") + '</div><h3>' + esc(T("Apps (Symbole)", "Apps (icônes)")) + '</h3><div class="gal ap">' + apps.map(k => '<button class="gi btn" data-a="' + k + '"><span class="gs" style="background:' + REG[k].col + '">' + REG[k].sym + '</span><b>' + esc(REG[k].name()) + '</b></button>').join("") + SITE.map(s => '<button class="gi btn" data-a="' + s[0] + '"><span class="gs" style="background:' + s[3] + '">' + s[1] + '</span><b>' + esc(s[2]()) + '</b></button>').join("") + '</div>',
    (b, z) => { b.addEventListener("click", e => { const x = e.target.closest("[data-k]"), a = e.target.closest("[data-a]"); let it = null;
      if (x) it = { id: uid(), k: x.dataset.k, w: +x.dataset.w, h: +x.dataset.h }; else if (a) it = { id: uid(), k: "app", w: 1, h: 1, a: a.dataset.a };
      if (it) { S.pages[cur].items.push(it); sichern(); z(); render(); const el = itemEl(it.id); if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }); } }); });
}
function bgSheet(){
  sheet(T("Hintergrund & Stil", "Fond et style"), '<div class="bgs">' + BG.map(b => '<button class="bgb' + (!S.photo && S.bg === b[0] ? " on" : "") + '" data-b="' + b[0] + '" style="background:' + b[2] + '"><span>' + esc(b[1]()) + '</span></button>').join("") + '</div><div class="row" style="margin:12px 0"><label class="btn" style="cursor:pointer">🖼️ ' + esc(T("Eigenes Foto", "Ma photo")) + '<input type="file" id="bgF" accept="image/*" hidden></label>' + (S.photo ? '<button class="btn" id="bgN">' + esc(T("Foto entfernen", "Retirer la photo")) + '</button>' : '') + '</div><h3>' + esc(T("Widget-Stil", "Style des widgets")) + '</h3><div class="row">' + [["glas", T("Glas", "Verre")], ["hell", T("Hell", "Clair")], ["dunkel", T("Dunkel", "Sombre")]].map(s => '<button class="btn' + (S.stil === s[0] ? " on" : "") + '" data-s="' + s[0] + '">' + s[1] + '</button>').join("") + '</div><p class="hint">' + esc(T("Dein Foto wird nur in diesem Browser gespeichert und nicht hochgeladen.", "Ta photo reste uniquement dans ce navigateur, elle n’est pas envoyée.")) + '</p><p class="status" id="bgSt"></p>',
    (b, z) => { b.addEventListener("click", e => { const x = e.target.closest("[data-b]"), s = e.target.closest("[data-s]"); if (x) { S.bg = x.dataset.b; S.photo = ""; sichern(); render(); z(); bgSheet(); } if (s) { S.stil = s.dataset.s; sichern(); render(); z(); bgSheet(); } if (e.target.id === "bgN") { S.photo = ""; sichern(); render(); z(); bgSheet(); } });
      $("#bgF", b).onchange = ev => { const f = ev.target.files[0]; if (!f) return; const img = new Image(), u = URL.createObjectURL(f); img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); S.photo = c.toDataURL("image/jpeg", .72); sichern(); if (!sOk) { S.photo = ""; $("#bgSt", b).className = "status bad"; $("#bgSt", b).textContent = T("Das Foto ist für den Speicher dieses Browsers zu groß.", "La photo est trop lourde pour le stockage du navigateur."); return; } render(); z(); bgSheet(); }; img.onerror = () => { $("#bgSt", b).className = "status bad"; $("#bgSt", b).textContent = T("Dieses Bild kann nicht gelesen werden.", "Impossible de lire cette image."); }; img.src = u; }; });
}
function seitenSheet(){
  sheet(T("Seiten", "Pages"), '<p class="hint" style="margin-top:0">' + esc(T("Du hast ", "Tu as ") + S.pages.length + T(" Seite(n). Nach rechts wischen oder die Punkte unten benutzen.", " page(s). Glisse vers la droite ou utilise les points.")) + '</p><div class="row"><button class="btn go" id="pgA">＋ ' + esc(T("Neue Seite", "Nouvelle page")) + '</button><button class="btn" id="pgD"' + (S.pages.length < 2 ? " disabled" : "") + '>' + esc(T("Aktuelle Seite löschen", "Supprimer la page actuelle")) + '</button></div><p class="hint">' + esc(T("Beim Löschen wandern die Widgets auf die vorige Seite.", "En supprimant, les widgets passent à la page précédente.")) + '</p>',
    (b, z) => { $("#pgA", b).onclick = () => { S.pages.push({ items: [] }); cur = S.pages.length - 1; sichern(); z(); render(); }; $("#pgD", b).onclick = () => { if (S.pages.length < 2) return; const g = S.pages.splice(cur, 1)[0], t = Math.max(0, cur - 1); S.pages[t].items.push(...g.items); cur = t; sichern(); z(); render(); }; });
}
function backupSheet(){
  sheet(T("Sicherung", "Sauvegarde"), '<p class="hint" style="margin-top:0">' + esc(T("Dein Desk (Widgets, Notizen, Aufgaben, Termine …) liegt nur in diesem Browser. Mit einer Sicherung nimmst du ihn auf ein anderes Gerät mit.", "Ton bureau (widgets, notes, tâches, rendez-vous …) est seulement dans ce navigateur. Une sauvegarde te permet de l’emporter sur un autre appareil.")) + '</p><div class="row"><button class="btn go" id="bEx">⬇ ' + esc(T("Sicherung speichern", "Enregistrer")) + '</button><label class="btn" style="cursor:pointer">⬆ ' + esc(T("Sicherung laden", "Charger")) + '<input type="file" id="bIm" accept=".json,application/json" hidden></label><button class="btn" id="bRs">' + esc(T("Alles zurücksetzen", "Tout réinitialiser")) + '</button></div><p class="status" id="bSt"></p>',
    (b, z) => { $("#bEx", b).onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" })); a.download = "oratio-desk-" + heute() + ".json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); };
      $("#bIm", b).onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (!j || j.v !== 2 || !Array.isArray(j.pages)) throw 0; j.pages.forEach(p => { p.items = (p.items || []).filter(i => i && (i.k === "app" || REG[i.k])).map(i => ({ id: String(i.id || uid()), k: i.k, w: +i.w || 1, h: +i.h || 1, a: i.a })); }); j.dock = Array.isArray(j.dock) ? j.dock : std().dock; j.data = j.data && typeof j.data === "object" ? j.data : {}; S = j; cur = 0; sichern(); render(); $("#bSt", b).className = "status"; $("#bSt", b).textContent = "✓ " + T("Sicherung geladen.", "Sauvegarde chargée."); } catch(err) { $("#bSt", b).className = "status bad"; $("#bSt", b).textContent = T("Diese Datei ist keine gültige Desk-Sicherung.", "Ce fichier n’est pas une sauvegarde valide."); } }); };
      zweiKlick($("#bRs", b), () => { S = std(); cur = 0; sichern(); render(); z(); }, T("Wirklich alles löschen?", "Tout effacer vraiment ?")); });
}
function standby(){
  const o = document.createElement("div"); o.className = "standby"; o.tabIndex = -1;
  o.innerHTML = '<div class="sbc"><b id="sbT"></b><div id="sbD"></div><div id="sbC"></div></div><button class="sbx" aria-label="' + esc(T("Schließen", "Fermer")) + '">✕</button><small>' + esc(T("Tippen oder Esc zum Beenden", "Touche ou Échap pour quitter")) + '</small>';
  document.body.appendChild(o); o.focus(); let lock = null;
  const t0 = () => { const d = new Date(); $("#sbT", o).textContent = d.toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" }); $("#sbD", o).textContent = d.toLocaleDateString(loc(), { weekday: "long", day: "numeric", month: "long" });
    const cd = (D().countdown || []).map(x => { const p = x.d.split("-").map(Number); return { x: x, n: Math.ceil((new Date(p[0], p[1] - 1, p[2]) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5) }; }).filter(q => q.n >= 0).sort((a, b) => a.n - b.n)[0];
    $("#sbC", o).textContent = cd ? (cd.n === 0 ? cd.x.n + " – " + T("heute!", "aujourd’hui !") : T("Noch ", "Encore ") + cd.n + T(" Tage bis ", " jours avant ") + cd.x.n) : ""; };
  t0(); const iv = setInterval(t0, 1000);
  const zu = () => { clearInterval(iv); document.removeEventListener("keydown", kd); document.removeEventListener("fullscreenchange", fc); try { lock && lock.release(); } catch(e){} try { if (document.fullscreenElement) document.exitFullscreen(); } catch(e){} o.remove(); };
  const kd = e => { if (e.key === "Escape") zu(); }, fc = () => { if (!document.fullscreenElement && o.isConnected) zu(); };
  document.addEventListener("keydown", kd); o.addEventListener("click", zu);
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(l => { lock = l; }).catch(() => {}); } catch(e){}
  try { if (o.requestFullscreen) o.requestFullscreen().then(() => document.addEventListener("fullscreenchange", fc)).catch(() => {}); } catch(e){}
}

/* ---------- Start ---------- */
function start(){
  S = laden() || std(); sichern();
  const host = $("#dkHost");
  host.innerHTML = '<div class="dsk" id="dkStage"><div class="dsk-bg" id="dkBg"></div><div class="dsk-in"><div class="dsk-top" id="dkTop"></div><p class="warn" id="dkWarn" hidden>' + esc(T("Dein Browser lässt kein Speichern zu (privater Modus?). Änderungen gehen beim Schließen verloren – nutze die Sicherung.", "Ton navigateur ne permet pas d’enregistrer (mode privé ?). Les changements seront perdus – utilise la sauvegarde.")) + '</p><div class="dsk-pages" id="dkPages"></div><div class="dsk-nav"><button class="pn" id="dkPrev" aria-label="' + esc(T("Vorige Seite", "Page précédente")) + '">‹</button><div class="dsk-dots" id="dkDots"></div><button class="pn" id="dkNext" aria-label="' + esc(T("Nächste Seite", "Page suivante")) + '">›</button></div><div class="dsk-dock" id="dkDock"></div></div></div>';
  const top = $("#dkTop"), btn = (id, t, c) => '<button class="gl ' + (c || "") + '" id="' + id + '">' + t + '</button>';
  function topbar(){ top.innerHTML = edit ? btn("tAdd", "＋ " + esc(T("Widget", "Widget"))) + btn("tBg", "🎨 " + esc(T("Hintergrund", "Fond"))) + btn("tPg", "📄 " + esc(T("Seiten", "Pages"))) + '<span class="sp"></span>' + btn("tDone", "✓ " + esc(T("Fertig", "Terminé")), "ok") : btn("tEdit", "✎ " + esc(T("Bearbeiten", "Modifier"))) + btn("tSz", "🎬 " + esc(T("Szenen", "Scènes"))) + '<span class="sp"></span>' + btn("tSb", "🌙 StandBy") + btn("tBk", "💾 " + esc(T("Sicherung", "Sauvegarde")));
    const on = (id, f) => { const e = $("#" + id, top); if (e) e.onclick = f; };
    on("tEdit", () => { edit = true; topbar(); render(); }); on("tDone", () => { edit = false; topbar(); render(); }); on("tAdd", widgetSheet); on("tBg", bgSheet); on("tPg", seitenSheet); on("tSb", standby); on("tBk", backupSheet); on("tSz", szenen); }
  topbar();
  const pages = $("#dkPages");
  pages.addEventListener("scroll", () => { const i = Math.round(pages.scrollLeft / Math.max(1, pages.clientWidth)); if (i !== cur && i >= 0 && i < S.pages.length) { cur = i; punkte(); } });
  $("#dkPrev").onclick = () => { cur = Math.max(0, cur - 1); pages.scrollTo({ left: cur * pages.clientWidth, behavior: "smooth" }); punkte(); };
  $("#dkNext").onclick = () => { cur = Math.min(S.pages.length - 1, cur + 1); pages.scrollTo({ left: cur * pages.clientWidth, behavior: "smooth" }); punkte(); };
  // Antippen, Bearbeiten-Knöpfe, langes Drücken
  pages.addEventListener("click", e => {
    const it0 = e.target.closest(".it"); if (!it0) return; const it = findItem(it0.dataset.id); if (!it) return;
    const b = e.target.closest("[data-a]");
    if (edit) { if (!b) return; const pg = S.pages.find(p => p.items.includes(it)), i = pg.items.indexOf(it), a = b.dataset.a;
      if (a === "x") pg.items.splice(i, 1); if (a === "l" && i > 0) pg.items.splice(i - 1, 0, pg.items.splice(i, 1)[0]); if (a === "r" && i < pg.items.length - 1) pg.items.splice(i + 1, 0, pg.items.splice(i, 1)[0]);
      if (a === "s") { const sz = REG[it.k].sizes, j = sz.findIndex(s => s[0] === it.w && s[1] === it.h); const n = sz[(j + 1) % sz.length]; it.w = n[0]; it.h = n[1]; }
      if (a === "p") { pg.items.splice(i, 1); const t = (S.pages.indexOf(pg) + 1) % S.pages.length; S.pages[t].items.push(it); }
      sichern(); render(); return; }
    if (e.target.closest("button, input, textarea, select, a, label, .sw, .nolink")) return;
    if (it.k === "app") { const d = REG[it.a]; if (d && d.app) openAppWin(it.a); else if (SITE.find(s => s[0] === it.a)) location.href = it.a; return; }
    const d = REG[it.k], kk = d && d.opens || it.k; if (d && REG[kk] && REG[kk].app) openAppWin(kk, d.openOpt ? d.openOpt(it) : null);
  });
  let lp = 0; pages.addEventListener("pointerdown", e => { if (edit || !e.target.closest(".it")) return; clearTimeout(lp); lp = setTimeout(() => { edit = true; topbar(); render(); }, 650); }); ["pointerup", "pointerleave", "pointercancel", "pointermove"].forEach(ev => pages.addEventListener(ev, () => clearTimeout(lp)));
  // Ziehen (Maus) im Bearbeiten-Modus
  let drag = null;
  pages.addEventListener("dragstart", e => { const el = e.target.closest && e.target.closest(".it"); if (!el || !edit) { e.preventDefault(); return; } drag = el.dataset.id; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", drag); } catch(x){} el.classList.add("drag"); });
  pages.addEventListener("dragover", e => { if (drag) { e.preventDefault(); const s = e.target.closest(".it"); $$(".it.over").forEach(x => x !== s && x.classList.remove("over")); if (s && s.dataset.id !== drag) s.classList.add("over"); } });
  pages.addEventListener("dragend", () => { drag = null; $$(".it").forEach(x => x.classList.remove("drag", "over")); });
  pages.addEventListener("drop", e => { if (!drag) return; e.preventDefault(); const s = e.target.closest(".it"); if (s && s.dataset.id !== drag) { const a = findItem(drag), b = findItem(s.dataset.id), pa = S.pages.find(p => p.items.includes(a)), pb = S.pages.find(p => p.items.includes(b)); pa.items.splice(pa.items.indexOf(a), 1); pb.items.splice(pb.items.indexOf(b), 0, a); sichern(); } drag = null; render(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if ($(".ovl:last-of-type")) { const l = $$(".ovl"); const x = l[l.length - 1]; if (x === (openApp && openApp.o)) closeApp(); else x.remove(); } else if (edit) { edit = false; topbar(); render(); } } });
  if (window.ResizeObserver) new ResizeObserver(() => { const c = $("#dkStage").style.getPropertyValue("--cols"); layoutGroesse(); if (c !== $("#dkStage").style.getPropertyValue("--cols")) render(); else $("#dkPages").scrollLeft = cur * $("#dkPages").clientWidth; }).observe($("#dkStage"));
  setInterval(() => ticks.forEach(f => { try { f(); } catch(e){} }), 250); setInterval(() => { if (openApp && openApp.d.app.tick) try { openApp.d.app.tick(openApp.body, openApp.c); } catch(e){} }, 250);
  window.addEventListener("pagehide", sichern);
  render(); document.title = "Oratio Desk – Oratio";
}
/* ---------- Szenen ---------- */
function szenen(){
  const Z = [["🎯", T("Fokus", "Focus"), T("Pomodoro, Aufgaben, Notizen.", "Pomodoro, tâches, notes."), [["pomodoro", 2, 2], ["tasks", 2, 2], ["app:notes"], ["app:calc"]], "grafit"], ["☀️", T("Guten Morgen", "Bonjour"), T("Datum, Uhr, Wasser, Countdown.", "Date, heure, eau, compte à rebours."), [["date", 2, 2], ["aclock", 1, 1], ["tasks", 1, 1], ["wasser", 2, 1], ["countdown", 2, 1]], "himmel"], ["📚", T("Lernen", "Apprendre"), T("Pomodoro, Notizen, Rechner, Aufgaben.", "Pomodoro, notes, calculatrice, tâches."), [["pomodoro", 2, 2], ["calc", 2, 2], ["tasks", 2, 2], ["app:notes"]], "royal"], ["🌙", T("Feierabend", "Soirée"), T("Uhr, Gewohnheiten, Links.", "Heure, habitudes, liens."), [["uhr", 2, 2], ["habits", 2, 2], ["links", 2, 2], ["dice", 1, 1]], "nacht"]];
  sheet(T("Szenen", "Scènes"), '<p class="hint" style="margin-top:0">' + esc(T("Eine Szene baut die aktuelle Seite mit einem Klick neu. Nicht benutzte Widgets bleiben mit ihren Daten gespeichert.", "Une scène recompose la page actuelle en un clic. Les widgets inutilisés gardent leurs données.")) + '</p><div class="gal">' + Z.map((z, i) => '<button class="gi btn" data-z="' + i + '"><span class="gs" style="background:#2e86ff">' + z[0] + '</span><span><b>' + esc(z[1]) + '</b><small>' + esc(z[2]) + '</small></span></button>').join("") + '</div>',
    (b, c) => { b.addEventListener("click", e => { const x = e.target.closest("[data-z]"); if (!x) return; const z = Z[+x.dataset.z]; S.pages[cur].items = z[3].map(s => s[0].startsWith("app:") ? { id: uid(), k: "app", w: 1, h: 1, a: s[0].slice(4) } : { id: uid(), k: s[0], w: s[1], h: s[2] }); S.bg = z[4]; S.photo = ""; sichern(); c(); render(); }); });
}
window.Desk = { reg: reg, start: start, data: D, save: sichern, later: spaeter, ring: ring, open: openAppWin, u: { $: $, $$: $$, T: T, FR: FR, loc: loc, esc: esc, pad: pad, ymd: ymd, heute: heute, uid: uid, addTage: addTage, piep: piep, feiertage: feiertage, kw: kw, zweiKlick: zweiKlick, sheet: sheet } };
})();
