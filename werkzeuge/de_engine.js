// Deutschkurs – Kern: Lektionen darstellen, Übungen prüfen, Fortschritt speichern, Suche, Vokabelkarten, Vorlesen.
// Inhalte stehen in de_a1.js … de_ref.js und rufen DE.add(...) auf. Erklärungen sind Paare [Deutsch, Französisch].
(function(){
"use strict";
var I = WZ.lang === "fr" ? 1 : 0;
var DE = window.DE = { I: I, lessons: [] };
var L = DE.L = function(de, fr){ return I ? fr : de; };
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
function P(x){ return Array.isArray(x) ? x[I] : x; }
function fmt(s){ return esc(P(s)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\{\{(.+?)\}\}/g, "<mark>$1</mark>").replace(/\n/g, "<br>"); }
function plain(s){ return String(P(s) == null ? "" : P(s)).replace(/\*\*|\{\{|\}\}/g, ""); }
function norm(s){ return String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[.,;:!?„“"'’]/g, "").replace(/\s+/g, " ").trim(); }
function fold(s){ return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss"); }
function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

/* ---------- Bausteine für Inhalte ---------- */
DE.p = function(de, fr){ return { t: "p", x: [de, fr] }; };
DE.h = function(de, fr){ return { t: "h", x: [de, fr] }; };
DE.tip = function(de, fr){ return { t: "tip", x: [de, fr] }; };
DE.warn = function(de, fr){ return { t: "warn", x: [de, fr] }; };
DE.ul = function(items){ return { t: "ul", r: items }; };
DE.tb = function(head, rows, note){ return { t: "tb", h: head, r: rows, n: note }; };
DE.ex = function(rows){ return { t: "ex", r: rows }; };
DE.voc = function(title, rows){ return { t: "voc", x: title, r: rows }; };
DE.dlg = function(title, lines){ return { t: "dlg", x: title, r: lines }; };
DE.mc = function(q, o, a, e){ return { k: "mc", q: q, o: o, a: a, e: e }; };
DE.gap = function(s, a, e){ return { k: "gap", s: s, a: [].concat(a), e: e }; };
DE.ord = function(w, a, e){ return { k: "ord", w: w, a: [].concat(a), e: e }; };
DE.mat = function(pairs){ return { k: "mat", p: pairs }; };
DE.xg = function(de, fr, items){ return { t: [de, fr], i: items }; };
DE.add = function(l){ DE.lessons.push(l); };

var LV = DE.LV = [
  ["A1", ["Anfänger", "Débutant"], ["Erste Schritte: Aussprache, Vorstellen, Alltag, einfache Sätze.", "Premiers pas : prononciation, se présenter, vie quotidienne, phrases simples."], "#2f9e44"],
  ["A2", ["Grundlagen", "Élémentaire"], ["Vergangenheit, Dativ, Nebensätze, Reisen und Arbeit.", "Passé, datif, subordonnées, voyages et travail."], "#1c7ed6"],
  ["B1", ["Mittelstufe", "Intermédiaire"], ["Relativsätze, Passiv, Konjunktiv II, Meinungen und Texte.", "Relatives, passif, subjonctif II, opinions et textes."], "#f08c00"],
  ["B2", ["Gute Mittelstufe", "Intermédiaire supérieur"], ["Konnektoren, indirekte Rede, Nominalisierung, Argumentieren.", "Connecteurs, discours indirect, nominalisation, argumentation."], "#e8590c"],
  ["C1", ["Fortgeschritten", "Avancé"], ["Stil, Register, feine Unterschiede, Rechtschreibung, Redewendungen.", "Style, registre, nuances, orthographe, expressions idiomatiques."], "#862e9c"],
  ["R", ["Nachschlagen", "Référence"], ["Tabellen und Listen zum schnellen Nachschlagen – auch für Muttersprachler.", "Tableaux et listes pour consulter rapidement – aussi pour les germanophones."], "#495057"]
];
function lvInfo(k){ return LV.filter(function(x){ return x[0] === k; })[0]; }

/* ---------- Fortschritt ---------- */
var prog = {};
try { prog = JSON.parse(localStorage.getItem("de-prog") || "{}") || {}; } catch(e){ prog = {}; }
function save(){ try { localStorage.setItem("de-prog", JSON.stringify(prog)); } catch(e){} }
function lessonsOf(k){ return DE.lessons.filter(function(l){ return l.lv === k; }); }
function byId(id){ return DE.lessons.filter(function(l){ return l.id === id; })[0]; }

/* ---------- Vorlesen ---------- */
var synth = window.speechSynthesis, voice = null;
function pickVoice(){ if (!synth) return; var v = synth.getVoices().filter(function(x){ return /^de/i.test(x.lang); }); voice = v.filter(function(x){ return /de-DE/i.test(x.lang); })[0] || v[0] || null; }
if (synth) { pickVoice(); if (synth.addEventListener) synth.addEventListener("voiceschanged", pickVoice); }
function say(txt){
  if (!synth) return;
  try { synth.cancel(); var u = new SpeechSynthesisUtterance(plain(txt)); u.lang = "de-DE"; if (voice) u.voice = voice; u.rate = .88; synth.speak(u); } catch(e){}
}
function sayBtn(txt){ return synth ? ' <button type="button" class="say" data-s="' + esc(plain(txt)) + '" aria-label="' + L("Vorlesen", "Écouter") + '">🔊</button>' : ""; }

/* ---------- Lektion darstellen ---------- */
function renderBlock(b){
  switch (b.t) {
    case "p": return '<p>' + fmt(b.x) + '</p>';
    case "h": return '<h3>' + fmt(b.x) + '</h3>';
    case "tip": return '<div class="note tip"><span>💡</span><div>' + fmt(b.x) + '</div></div>';
    case "warn": return '<div class="note warn"><span>⚠️</span><div>' + fmt(b.x) + '</div></div>';
    case "ul": return '<ul class="ul">' + b.r.map(function(x){ return '<li>' + fmt(x) + '</li>'; }).join("") + '</ul>';
    case "tb": return '<div class="tw"><table class="dt"><thead><tr>' + b.h.map(function(c){ return '<th>' + fmt(c) + '</th>'; }).join("") + '</tr></thead><tbody>' + b.r.map(function(r){ return '<tr>' + r.map(function(c, i){ return '<td>' + fmt(c) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>' + (b.n ? '<p class="cap">' + fmt(b.n) + '</p>' : "");
    case "ex": return '<ul class="exl">' + b.r.map(function(r){ return '<li><div><span class="de">' + fmt(r[0]) + '</span>' + sayBtn(r[0]) + (I && r[1] ? '<span class="tr">' + fmt(r[1]) + '</span>' : "") + (r[2] ? '<span class="nt">' + fmt(r[2]) + '</span>' : "") + '</div></li>'; }).join("") + '</ul>';
    case "voc": return (b.x ? '<h4>' + fmt(b.x) + '</h4>' : "") + '<div class="tw"><table class="dt voc"><tbody>' + b.r.map(function(r){ return '<tr><td class="de">' + fmt(r[0]) + sayBtn(r[0]) + '</td>' + (I ? '<td>' + fmt(r[1]) + '</td>' : "") + (r[2] ? '<td class="nt">' + fmt(r[2]) + '</td>' : "") + '</tr>'; }).join("") + '</tbody></table></div>';
    case "dlg": return (b.x ? '<h4>' + fmt(b.x) + '</h4>' : "") + '<div class="dlg">' + b.r.map(function(r, i){ return '<div class="ln ' + (i % 2 ? "b" : "a") + '"><b>' + esc(r[0]) + '</b><div><span class="de">' + fmt(r[1]) + '</span>' + sayBtn(r[1]) + (I && r[2] ? '<span class="tr">' + fmt(r[2]) + '</span>' : "") + '</div></div>'; }).join("") + '</div>';
  }
  return "";
}

function vocOf(l){ var o = []; (l.b || []).forEach(function(b){ if (b.t === "voc") b.r.forEach(function(r){ o.push(r); }); }); return o; }

/* ---------- Übungen ---------- */
function exItem(it, done){
  var el = document.createElement("div"); el.className = "ei"; var fin = false;
  function res(ok, fb){ if (fin) return; fin = true; el.classList.add(ok ? "ok" : "bad"); done(ok); }
  function fbox(ok, extra){ var f = el.querySelector(".fb"); f.className = "fb " + (ok ? "ok" : "bad"); f.innerHTML = (ok ? "✓ " + L("Richtig!", "Correct !") : "✗ " + L("Leider falsch.", "Pas tout à fait.")) + (extra ? " " + extra : "") + (it.e ? '<div class="why">' + fmt(it.e) + '</div>' : ""); }
  if (it.k === "mc") {
    el.innerHTML = '<div class="q">' + fmt(it.q) + '</div><div class="opts">' + it.o.map(function(o, i){ return '<button type="button" class="opt" data-i="' + i + '">' + fmt(o) + '</button>'; }).join("") + '</div><div class="fb"></div>';
    $$(".opt", el).forEach(function(b){ b.onclick = function(){ if (fin) return; var i = +b.getAttribute("data-i"), ok = i === it.a; $$(".opt", el).forEach(function(x, j){ x.disabled = true; if (j === it.a) x.classList.add("right"); }); if (!ok) b.classList.add("wrong"); fbox(ok); res(ok); }; });
  } else if (it.k === "gap") {
    var parts = it.s.split("___"), n = parts.length - 1, h = "";
    parts.forEach(function(p, i){ h += esc(p); if (i < n) h += '<input class="gi" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + L("Lücke", "blanc") + ' ' + (i + 1) + '" size="' + Math.max(5, Math.min(14, (it.a[i] || "").split("|")[0].length + 2)) + '">'; });
    el.innerHTML = '<div class="q gq">' + h + '</div><div class="row"><button type="button" class="btn sm chk">' + L("Prüfen", "Vérifier") + '</button></div><div class="fb"></div>';
    var ins = $$(".gi", el);
    function check(){
      if (fin) return; var all = true;
      ins.forEach(function(inp, i){ var ok = it.a[i].split("|").some(function(a){ return norm(a) === norm(inp.value); }); inp.classList.add(ok ? "ok" : "bad"); if (!ok) { all = false; } inp.readOnly = true; });
      $(".chk", el).disabled = true;
      fbox(all, all ? "" : "<br>" + L("Richtig wäre: ", "Réponse attendue : ") + '<b>' + it.a.map(function(a){ return esc(a.split("|")[0]); }).join(" · ") + '</b>'); res(all);
    }
    $(".chk", el).onclick = check; ins.forEach(function(inp){ inp.onkeydown = function(e){ if (e.key === "Enter") { e.preventDefault(); var k = ins.indexOf(inp); if (k < ins.length - 1) ins[k + 1].focus(); else check(); } }; });
  } else if (it.k === "ord") {
    var words = shuffle(it.w.map(function(w, i){ return { w: w, i: i }; })), line = [];
    el.innerHTML = '<div class="q">' + L("Bilde einen Satz:", "Forme une phrase :") + '</div><div class="ans" aria-live="polite"></div><div class="bank"></div><div class="row"><button type="button" class="btn sm chk">' + L("Prüfen", "Vérifier") + '</button><button type="button" class="btn sm rst">' + L("Zurück", "Effacer") + '</button></div><div class="fb"></div>';
    function draw(){
      $(".ans", el).innerHTML = line.map(function(x, k){ return '<button type="button" class="wd" data-k="' + k + '">' + esc(x.w) + '</button>'; }).join("") || '<span class="muted">' + L("Tippe die Wörter in der richtigen Reihenfolge an.", "Touche les mots dans le bon ordre.") + '</span>';
      $(".bank", el).innerHTML = words.map(function(x, k){ return '<button type="button" class="wd" data-k="' + k + '">' + esc(x.w) + '</button>'; }).join("");
      $$(".ans .wd", el).forEach(function(b){ b.onclick = function(){ if (fin) return; words.push(line.splice(+b.getAttribute("data-k"), 1)[0]); draw(); }; });
      $$(".bank .wd", el).forEach(function(b){ b.onclick = function(){ if (fin) return; line.push(words.splice(+b.getAttribute("data-k"), 1)[0]); draw(); }; });
    }
    draw();
    $(".rst", el).onclick = function(){ if (fin) return; words = words.concat(line); line = []; draw(); };
    $(".chk", el).onclick = function(){ if (fin || !line.length) return; var s = line.map(function(x){ return x.w; }).join(" "), ok = it.a.some(function(a){ return a === s; }); $(".chk", el).disabled = true; $(".rst", el).disabled = true; fbox(ok, ok ? "" : "<br>" + L("Richtig wäre: ", "Réponse attendue : ") + '<b>' + esc(it.a[0]) + '</b>'); res(ok); };
  } else if (it.k === "mat") {
    var Ls = shuffle(it.p.map(function(x, i){ return { t: x[0], i: i }; })), Rs = shuffle(it.p.map(function(x, i){ return { t: P(x[1]), i: i }; })), sel = null, got = 0, miss = 0;
    el.innerHTML = '<div class="q">' + L("Ordne zu:", "Associe :") + '</div><div class="mt"><div class="mc l"></div><div class="mc r"></div></div><div class="fb"></div>';
    Ls.forEach(function(x){ var b = document.createElement("button"); b.type = "button"; b.className = "mi"; b.innerHTML = fmt(x.t); b.setAttribute("data-i", x.i); $(".l", el).appendChild(b); });
    Rs.forEach(function(x){ var b = document.createElement("button"); b.type = "button"; b.className = "mi"; b.innerHTML = fmt(x.t); b.setAttribute("data-i", x.i); $(".r", el).appendChild(b); });
    $$(".mi", el).forEach(function(b){ b.onclick = function(){
      if (b.classList.contains("fix") || fin) return;
      var side = b.parentNode.classList.contains("l") ? "l" : "r";
      if (sel && sel.side === side) { sel.b.classList.remove("sel"); sel = null; }
      if (!sel) { sel = { b: b, side: side }; b.classList.add("sel"); return; }
      var a = sel.b, same = a.getAttribute("data-i") === b.getAttribute("data-i");
      a.classList.remove("sel");
      if (same) { a.classList.add("fix"); b.classList.add("fix"); got++; if (got === it.p.length) { fbox(miss === 0); res(miss === 0); } }
      else { miss++; a.classList.add("shake"); b.classList.add("shake"); setTimeout(function(){ a.classList.remove("shake"); b.classList.remove("shake"); }, 400); }
      sel = null;
    }; });
  }
  return el;
}
function countItems(l){ return (l.x || []).reduce(function(a, g){ return a + g.i.length; }, 0); }

/* ---------- Ansichten ---------- */
var root, cur = null;
function crumb(parts){ return '<div class="crumb"><a href="index.html">Oratio Place</a> › ' + parts.map(function(p){ return p[1] ? '<a href="' + p[1] + '">' + esc(p[0]) + '</a>' : esc(p[0]); }).join(" › ") + '</div>'; }
function badge(k){ var v = lvInfo(k); return '<span class="lvb" style="--lc:' + v[3] + '">' + (k === "R" ? "📚" : k) + '</span>'; }
function pct(k){ var ls = lessonsOf(k); if (!ls.length) return 0; return Math.round(100 * ls.filter(function(l){ return prog[l.id] && prog[l.id].done; }).length / ls.length); }

function home(){
  var tot = DE.lessons.filter(function(l){ return l.lv !== "R"; }).length, dn = DE.lessons.filter(function(l){ return l.lv !== "R" && prog[l.id] && prog[l.id].done; }).length;
  root.innerHTML = crumb([[L("Deutschkurs", "Cours d'allemand")]]) +
    '<section class="dhero"><div class="dh-t"><h1>' + L("Deutschkurs von A1 bis C1", "Cours d'allemand de A1 à C1") + '</h1><p>' + L("Ein kostenloser Kurs zum Lernen und Nachschlagen: Erklärungen, Tabellen, Beispiele zum Anhören und Übungen mit Sofort-Korrektur. Gemacht für Französischsprachige – die höheren Stufen und der Nachschlage-Bereich helfen auch Muttersprachlern.", "Un cours gratuit pour apprendre et consulter : explications, tableaux, exemples à écouter et exercices corrigés tout de suite. Conçu pour les francophones – les niveaux avancés et la section Référence aident aussi les germanophones.") + '</p><div class="dh-s"><span>' + dn + ' / ' + tot + ' ' + L("Lektionen geschafft", "leçons terminées") + '</span></div></div><div class="dh-f" aria-hidden="true"><span>Ä</span><span>ö</span><span>ß</span><span>ü</span></div></section>' +
    '<div class="card srch"><input id="dS" class="in" type="search" placeholder="' + L("Suchen: z. B. Dativ, Konjunktiv, Perfekt, weil, Artikel …", "Chercher : p. ex. datif, subjonctif, parfait, weil, article …") + '" aria-label="' + L("Suchen", "Chercher") + '"><div id="dSR"></div></div>' +
    '<div class="lvgrid">' + LV.map(function(v){ var ls = lessonsOf(v[0]), p = pct(v[0]); return '<a class="lvcard" href="#/' + v[0] + '" style="--lc:' + v[3] + '">' + badge(v[0]) + '<div><h2>' + esc(v[1][I]) + '</h2><p>' + esc(v[2][I]) + '</p><div class="pb"><i style="width:' + p + '%"></i></div><small>' + (ls.length ? ls.length + ' ' + L(v[0] === "R" ? "Seiten" : "Lektionen", v[0] === "R" ? "pages" : "leçons") + (v[0] !== "R" ? ' · ' + p + ' %' : "") : L("Kommt bald", "Bientôt")) + '</small></div></a>'; }).join("") + '</div>' +
    '<div class="card"><h2 style="margin-top:0">' + L("So lernst du am besten", "Comment bien apprendre") + '</h2><ul class="ul"><li>' + L("**Jeden Tag etwas** ist besser als einmal pro Woche viel: 15 bis 20 Minuten reichen.", "**Un peu chaque jour** vaut mieux que beaucoup une fois par semaine : 15 à 20 minutes suffisent.") + '</li><li>' + L("**Laut sprechen**: Drück auf 🔊, hör den Satz und sprich ihn nach.", "**Parler à voix haute** : appuie sur 🔊, écoute la phrase et répète-la.") + '</li><li>' + L("**Nomen immer mit Artikel lernen** – „der Tisch“, nicht nur „Tisch“.", "**Toujours apprendre les noms avec leur article** – « der Tisch », pas seulement « Tisch ».") + '</li><li>' + L("**Fehler sind normal.** Die Übungen zeigen dir sofort die richtige Lösung und den Grund.", "**Les erreurs sont normales.** Les exercices te montrent aussitôt la bonne réponse et la raison.") + '</li><li>' + L("Der Fortschritt wird nur in diesem Browser gespeichert – nichts wird hochgeladen.", "La progression est enregistrée uniquement dans ce navigateur – rien n'est envoyé.") + '</li></ul>' +
    '<div class="row"><a class="btn sm" href="#/k/all">🃏 ' + L("Vokabelkarten (alle)", "Cartes de vocabulaire (toutes)") + '</a><button class="btn sm" id="dRst">' + L("Fortschritt zurücksetzen", "Réinitialiser la progression") + '</button></div></div>';
  root.innerHTML = root.innerHTML.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  $("#dRst").onclick = function(){ if (this.getAttribute("data-s") !== "1") { this.setAttribute("data-s", "1"); this.textContent = L("Wirklich zurücksetzen? Nochmal tippen.", "Vraiment ? Touche encore."); return; } prog = {}; save(); home(); };
  $("#dS").oninput = function(){ search(this.value); };
}
function searchText(l){
  if (l._s) return l._s; var t = [P(l.t), P(l.s || ""), l.k || ""];
  (l.b || []).forEach(function(b){ if (b.x) t.push(plain(b.x)); if (b.r) b.r.forEach(function(r){ t.push(Array.isArray(r) ? r.map(function(c){ return plain(c); }).join(" ") : plain(r)); }); if (b.h) b.h.forEach(function(c){ t.push(plain(c)); }); });
  // beide Sprachen durchsuchbar
  var tt = l.t[0] + " " + l.t[1] + " " + (l.s ? l.s[0] + " " + l.s[1] : "") + " " + t.join(" ");
  return l._s = fold(tt);
}
function search(q){
  var out = $("#dSR"); q = fold(q.trim()); if (q.length < 2) { out.innerHTML = ""; return; }
  var ws = q.split(/\s+/), hits = DE.lessons.filter(function(l){ var s = searchText(l); return ws.every(function(w){ return s.indexOf(w) >= 0; }); });
  hits.sort(function(a, b){ var ta = fold(a.t[0] + a.t[1]).indexOf(ws[0]) >= 0 ? 0 : 1, tb = fold(b.t[0] + b.t[1]).indexOf(ws[0]) >= 0 ? 0 : 1; return ta - tb; });
  out.innerHTML = hits.length ? '<ul class="hits">' + hits.slice(0, 30).map(function(l){ return '<li><a href="#/l/' + l.id + '">' + badge(l.lv) + '<span><b>' + esc(l.t[I]) + '</b><br><small>' + esc(P(l.s || "")) + '</small></span></a></li>'; }).join("") + '</ul>' : '<p class="muted">' + L("Nichts gefunden.", "Rien trouvé.") + '</p>';
}

function level(k){
  var v = lvInfo(k); if (!v) return home();
  var ls = lessonsOf(k);
  root.innerHTML = crumb([[L("Deutschkurs", "Cours d'allemand"), "#/"], [k + " – " + v[1][I]]]) +
    '<section class="lvhead" style="--lc:' + v[3] + '">' + badge(k) + '<div><h1>' + (k === "R" ? "" : k + " – ") + esc(v[1][I]) + '</h1><p>' + esc(v[2][I]) + '</p></div></section>' +
    (ls.length ? '<ol class="llist">' + ls.map(function(l, i){ var d = prog[l.id] || {}; return '<li><a class="lrow' + (d.done ? " done" : "") + '" href="#/l/' + l.id + '"><span class="ln">' + (k === "R" ? "•" : i + 1) + '</span><span class="lt"><b>' + esc(l.t[I]) + '</b><small>' + esc(P(l.s || "")) + '</small></span><span class="ls">' + (d.done ? "✓" + (d.best != null ? " " + d.best + " %" : "") : "") + '</span></a></li>'; }).join("") + '</ol>' : '<div class="card"><p>' + L("Dieser Bereich wird gerade gebaut und kommt bald.", "Cette section est en cours de construction et arrive bientôt.") + '</p></div>') +
    '<p><a class="btn sm" href="#/">← ' + L("Zur Übersicht", "Retour à l'accueil") + '</a></p>';
}

function lesson(id){
  var l = byId(id); if (!l) return home();
  var v = lvInfo(l.lv), ls = lessonsOf(l.lv), ix = ls.indexOf(l), d = prog[l.id] || {}, total = countItems(l), correct = 0, answered = 0, voc = vocOf(l);
  root.innerHTML = crumb([[L("Deutschkurs", "Cours d'allemand"), "#/"], [l.lv === "R" ? v[1][I] : l.lv + " – " + v[1][I], "#/" + l.lv], [l.t[I]]]) +
    '<section class="lvhead" style="--lc:' + v[3] + '">' + badge(l.lv) + '<div><h1>' + (l.lv === "R" ? "" : (ix + 1) + ". ") + esc(l.t[I]) + '</h1><p>' + esc(P(l.s || "")) + '</p></div></section>' +
    '<article class="card les">' + (l.b || []).map(renderBlock).join("") + '</article>' +
    (total ? '<section class="card exs"><h2 style="margin-top:0">✏️ ' + L("Übungen", "Exercices") + '</h2><div id="dEx"></div><div id="dRes" class="res" aria-live="polite"></div></section>' : "") +
    '<div class="row nav">' + (ix > 0 ? '<a class="btn" href="#/l/' + ls[ix - 1].id + '">← ' + esc(ls[ix - 1].t[I]) + '</a>' : '<a class="btn" href="#/' + l.lv + '">← ' + L("Übersicht", "Aperçu") + '</a>') +
    (voc.length && I ? '<a class="btn" href="#/k/' + l.id + '">🃏 ' + L("Vokabelkarten", "Cartes de vocabulaire") + '</a>' : "") +
    (l.lv !== "R" ? '<button class="btn" id="dDone">' + (d.done ? '✓ ' + L("Geschafft", "Terminé") : L("Als geschafft markieren", "Marquer comme terminé")) + '</button>' : "") +
    (ix < ls.length - 1 ? '<a class="btn go" href="#/l/' + ls[ix + 1].id + '">' + esc(ls[ix + 1].t[I]) + ' →</a>' : '<a class="btn go" href="#/' + l.lv + '">' + L("Zur Übersicht", "Retour à l'aperçu") + '</a>') + '</div>';
  var dd = $("#dDone"); if (dd) dd.onclick = function(){ var p = prog[l.id] || (prog[l.id] = {}); p.done = !p.done; save(); this.textContent = p.done ? "✓ " + L("Geschafft", "Terminé") : L("Als geschafft markieren", "Marquer comme terminé"); };
  if (total) {
    var host = $("#dEx");
    l.x.forEach(function(g){
      var sec = document.createElement("div"); sec.className = "xgp"; sec.innerHTML = '<h4>' + fmt(g.t) + '</h4>'; host.appendChild(sec);
      g.i.forEach(function(it){
        sec.appendChild(exItem(it, function(ok){
          answered++; if (ok) correct++;
          if (answered === total) {
            var p = Math.round(100 * correct / total), pr = prog[l.id] || (prog[l.id] = {});
            pr.best = Math.max(pr.best || 0, p); if (p >= 60) pr.done = true; save();
            $("#dRes").innerHTML = '<b>' + L("Ergebnis", "Résultat") + ': ' + correct + ' / ' + total + ' (' + p + ' %)</b> – ' + (p === 100 ? L("Perfekt! 🎉", "Parfait ! 🎉") : p >= 80 ? L("Sehr gut! 👏", "Très bien ! 👏") : p >= 60 ? L("Gut gemacht – ein bisschen Wiederholung hilft noch.", "Bien joué – un peu de révision aidera encore.") : L("Lies die Erklärung noch einmal und versuch es nochmal.", "Relis l'explication et réessaie.")) + ' <button type="button" class="btn sm" id="dAgain">↻ ' + L("Nochmal üben", "Refaire") + '</button>';
            var a = $("#dAgain"); if (a) a.onclick = function(){ lesson(id); window.scrollTo(0, document.body.scrollHeight); };
            var dd2 = $("#dDone"); if (dd2 && pr.done) dd2.textContent = "✓ " + L("Geschafft", "Terminé");
          } else $("#dRes").textContent = answered + " / " + total;
        }));
      });
    });
  }
}

/* ---------- Vokabelkarten ---------- */
function cards(id){
  var src = id === "all" ? DE.lessons : [byId(id)].filter(Boolean), deck = [];
  src.forEach(function(l){ vocOf(l).forEach(function(r){ deck.push({ de: plain(r[0]), fr: plain(r[1]), n: r[2] ? plain(r[2]) : "" }); }); });
  var l0 = byId(id);
  if (!deck.length) { root.innerHTML = '<div class="card"><p>' + L("Keine Vokabeln gefunden.", "Aucun mot trouvé.") + '</p><a class="btn" href="#/">←</a></div>'; return; }
  var q = shuffle(deck), side = 0, known = 0, total = q.length, dirFr = false;
  root.innerHTML = crumb([[L("Deutschkurs", "Cours d'allemand"), "#/"], [L("Vokabelkarten", "Cartes de vocabulaire")]]) + '<h1>🃏 ' + L("Vokabelkarten", "Cartes de vocabulaire") + (l0 ? ' – ' + esc(l0.t[I]) : "") + '</h1><div class="card kc"><div class="kp" id="kP"></div><div class="kcard" id="kC" role="button" tabindex="0"></div><div class="row kb" id="kB"></div><div class="row"><button class="btn sm" id="kD"></button></div></div><p><a class="btn sm" href="' + (l0 ? "#/l/" + l0.id : "#/") + '">← ' + L("Zurück", "Retour") + '</a></p>';
  function draw(){
    $("#kP").textContent = known + " / " + total + " " + L("gewusst", "sues");
    var k = $("#kC"), kb = $("#kB");
    if (!q.length) { k.innerHTML = '<div class="kf"><b>🎉 ' + L("Alle Karten gewusst!", "Toutes les cartes sues !") + '</b></div>'; kb.innerHTML = '<button class="btn go" id="kN">↻ ' + L("Nochmal", "Recommencer") + '</button>'; $("#kN").onclick = function(){ q = shuffle(deck); known = 0; side = 0; draw(); }; return; }
    var c = q[0], front = dirFr ? c.fr : c.de, back = dirFr ? c.de : c.fr;
    k.className = "kcard" + (side ? " flip" : "");
    k.innerHTML = '<div class="kf">' + (side ? '<b>' + esc(back) + '</b>' + (c.n ? '<small>' + esc(c.n) + '</small>' : "") + '<small class="h">' + esc(front) + '</small>' : '<b>' + esc(front) + '</b><small class="h">' + L("Tippen zum Umdrehen", "Touche pour retourner") + '</small>') + '</div>';
    kb.innerHTML = side ? '<button class="btn" id="kBad">↻ ' + L("Noch mal", "À revoir") + '</button><button class="btn go" id="kOk">✓ ' + L("Gewusst", "Je savais") + '</button>' : '<button class="btn" id="kShow">' + L("Umdrehen", "Retourner") + '</button>' + (synth ? '<button class="btn" id="kSay">🔊</button>' : "");
    if (side) { $("#kBad").onclick = function(){ q.push(q.shift()); side = 0; draw(); }; $("#kOk").onclick = function(){ q.shift(); known++; side = 0; draw(); }; }
    else { $("#kShow").onclick = function(){ side = 1; draw(); }; var s = $("#kSay"); if (s) s.onclick = function(){ say(c.de); }; }
    if (side) say(c.de);
  }
  $("#kC").onclick = function(){ if (q.length) { side = side ? 0 : 1; draw(); } };
  $("#kC").onkeydown = function(e){ if (e.key === " " || e.key === "Enter") { e.preventDefault(); this.click(); } };
  var D = $("#kD"); function dl(){ D.textContent = dirFr ? L("Richtung: Französisch → Deutsch", "Sens : français → allemand") : L("Richtung: Deutsch → Französisch", "Sens : allemand → français"); } dl();
  D.onclick = function(){ dirFr = !dirFr; side = 0; dl(); draw(); };
  draw();
}

function route(){
  if (synth) try { synth.cancel(); } catch(e){}
  window.scrollTo(0, 0);
  var h = location.hash.replace(/^#\/?/, ""), m;
  if ((m = h.match(/^l\/([\w-]+)$/))) return lesson(m[1]);
  if ((m = h.match(/^k\/([\w-]+)$/))) return cards(m[1]);
  if ((m = h.match(/^(A1|A2|B1|B2|C1|R)$/))) return level(m[1]);
  home();
}
DE.start = function(){
  root = $("#de");
  root.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest(".say"); if (b) say(b.getAttribute("data-s")); });
  window.addEventListener("hashchange", route);
  route();
};
})();
